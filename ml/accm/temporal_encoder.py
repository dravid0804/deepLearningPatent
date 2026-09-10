"""
Mamba/Selective-State-Space inspired temporal sequence encoder for ACCM.
Processes continuous historical telemetry windows (60 time steps) to produce Z_T in R^128.
"""
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class SelectiveStateSpaceBlock(nn.Module):
    """
    Selective State Space (S6/SSM) Block.
    Implements input-dependent parameter discretization (Delta, B, C)
    over a latent state dimension d_state, enabling linear-time sequence modeling.
    """
    def __init__(self, d_model: int = 128, d_state: int = 16, dt_rank: int = 8, dropout: float = 0.10):
        super().__init__()
        self.d_model = d_model
        self.d_state = d_state
        self.dt_rank = dt_rank

        # In-projection expanding hidden dimension
        self.in_proj = nn.Linear(d_model, 2 * d_model)
        self.conv1d = nn.Conv1d(
            in_channels=d_model,
            out_channels=d_model,
            kernel_size=3,
            padding=1,
            groups=d_model
        )

        # Selective projection for Delta, B, C
        self.x_proj = nn.Linear(d_model, dt_rank + 2 * d_state)
        self.dt_proj = nn.Linear(dt_rank, d_model)

        # Continuous state matrix A initialized as diagonal log-decay
        A = torch.arange(1, d_state + 1, dtype=torch.float32).repeat(d_model, 1)
        self.A_log = nn.Parameter(torch.log(A))
        self.D = nn.Parameter(torch.ones(d_model))

        # Out projection
        self.out_proj = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)
        self.norm = nn.LayerNorm(d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        Args:
            x: [batch, seq_len, d_model]
        Returns:
            out: [batch, seq_len, d_model]
        """
        residual = x
        batch, seq_len, _ = x.shape

        # Dual branch projection with gating
        projected = self.in_proj(x)  # [batch, seq_len, 2 * d_model]
        u, gate = projected.chunk(2, dim=-1)

        # Depthwise 1D convolution over sequence
        u_conv = self.conv1d(u.transpose(1, 2)).transpose(1, 2)
        u_act = F.silu(u_conv)

        # Selective parameter calculation
        ssm_params = self.x_proj(u_act)  # [batch, seq_len, dt_rank + 2 * d_state]
        dt = ssm_params[:, :, :self.dt_rank]
        B = ssm_params[:, :, self.dt_rank:self.dt_rank + self.d_state]
        C = ssm_params[:, :, self.dt_rank + self.d_state:]

        # Discretize continuous Delta
        delta = F.softplus(self.dt_proj(dt))  # [batch, seq_len, d_model]
        A = -torch.exp(self.A_log)             # [d_model, d_state]

        # Recurrent scan over sequence length
        # h_t = exp(A * delta_t) * h_{t-1} + (delta_t * B_t) * u_t
        h = torch.zeros(batch, self.d_model, self.d_state, device=x.device, dtype=x.dtype)
        y_list = []

        for t in range(seq_len):
            delta_t = delta[:, t, :].unsqueeze(-1)  # [batch, d_model, 1]
            B_t = B[:, t, :].unsqueeze(1)           # [batch, 1, d_state]
            C_t = C[:, t, :].unsqueeze(1)           # [batch, 1, d_state]
            u_t = u_act[:, t, :].unsqueeze(-1)      # [batch, d_model, 1]

            dA = torch.exp(A.unsqueeze(0) * delta_t)  # [batch, d_model, d_state]
            dB = delta_t * B_t                         # [batch, d_model, d_state]

            h = dA * h + dB * u_t
            y_t = torch.sum(h * C_t, dim=-1) + self.D.unsqueeze(0) * u_act[:, t, :]  # [batch, d_model]
            y_list.append(y_t)

        y = torch.stack(y_list, dim=1)  # [batch, seq_len, d_model]
        y_gated = y * F.silu(gate)
        out = self.out_proj(y_gated)
        out = self.dropout(out)
        return self.norm(out + residual)


class TemporalSSMEncoder(nn.Module):
    """
    ACCM Temporal Encoder.
    Applies linear projection, LayerNorm, 4 SSM Blocks, and temporal pooling to produce Z_T.
    """
    def __init__(
        self,
        d_input: int = 16,
        d_model: int = 128,
        d_state: int = 16,
        num_blocks: int = 4,
        seq_len: int = 60,
        dropout: float = 0.10
    ):
        super().__init__()
        self.d_model = d_model
        self.seq_len = seq_len

        # Linear input projection -> 128
        self.input_proj = nn.Linear(d_input, d_model)
        self.input_norm = nn.LayerNorm(d_model)

        # Stack of 4 SSM Blocks
        self.blocks = nn.ModuleList([
            SelectiveStateSpaceBlock(
                d_model=d_model,
                d_state=d_state,
                dt_rank=8,
                dropout=dropout
            )
            for _ in range(num_blocks)
        ])

        # Temporal attention pooling to produce Z_T in R^128
        self.pooling_attn = nn.Linear(d_model, 1)
        self.final_norm = nn.LayerNorm(d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: [batch, seq_len, d_input]
        Returns:
            z_t: [batch, d_model] (Z_T in R^128)
        """
        h = self.input_norm(self.input_proj(x))
        for block in self.blocks:
            h = block(h)

        # Attention-weighted temporal pooling over sequence length
        attn_weights = F.softmax(self.pooling_attn(h), dim=1)  # [batch, seq_len, 1]
        z_t = torch.sum(h * attn_weights, dim=1)               # [batch, d_model]
        return self.final_norm(z_t)
