"""
Action-Conditioned Consequence Decoder for ACCM.
Fuses Z_T, Z_G, Z_P, Z_R into Z_shared (256-dim), conditions on action embedding E_A,
and decodes multi-horizon consequence distributions (5 horizons x 11 targets) + sacrifice vector.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from .uncertainty import HeteroscedasticHead
from .sacrifice import SacrificeVectorHead

class StateFusion(nn.Module):
    """
    Fuses Z_T (128), Z_G (128), Z_P (128), Z_R (128) -> Z_shared (256).
    """
    def __init__(self, z_t_dim: int = 128, z_g_dim: int = 128, z_p_dim: int = 128, z_r_dim: int = 128, fused_dim: int = 256, dropout: float = 0.10):
        super().__init__()
        in_dim = z_t_dim + z_g_dim + z_p_dim + z_r_dim
        self.fusion_net = nn.Sequential(
            nn.Linear(in_dim, fused_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(fused_dim, fused_dim),
            nn.LayerNorm(fused_dim)
        )

    def forward(self, z_t: torch.Tensor, z_g: torch.Tensor, z_p: torch.Tensor, z_r: torch.Tensor) -> torch.Tensor:
        concat = torch.cat([z_t, z_g, z_p, z_r], dim=-1)
        return self.fusion_net(concat)


class HorizonDecoder(nn.Module):
    """
    Dedicated decoder block for a specific time horizon (e.g. 5m, 15m, 30m, 60m).
    """
    def __init__(self, conditioned_dim: int = 320, num_targets: int = 11, dropout: float = 0.10):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(conditioned_dim, 192),
            nn.LayerNorm(192),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(192, 128),
            nn.LayerNorm(128),
            nn.GELU()
        )
        self.head = HeteroscedasticHead(in_features=128, num_targets=num_targets)

    def forward(self, conditioned_feat: torch.Tensor):
        h = self.mlp(conditioned_feat)
        return self.head(h)


class ActionConditionedConsequenceDecoder(nn.Module):
    """
    Decodes multi-horizon consequences and sacrifice vectors conditioned on candidate actions.
    """
    def __init__(
        self,
        fused_dim: int = 256,
        action_dim: int = 64,
        num_horizons: int = 5,
        num_targets: int = 11,
        sacrifice_dim: int = 8,
        dropout: float = 0.10
    ):
        super().__init__()
        self.num_horizons = num_horizons
        self.num_targets = num_targets
        conditioned_dim = fused_dim + action_dim

        # Fusion conditioning adapter
        self.adapter = nn.Sequential(
            nn.Linear(conditioned_dim, conditioned_dim),
            nn.LayerNorm(conditioned_dim),
            nn.GELU()
        )

        # 5 Multi-Horizon Decoders (5m, 10m, 15m, 30m, 60m)
        self.horizon_decoders = nn.ModuleList([
            HorizonDecoder(conditioned_dim, num_targets, dropout=dropout)
            for _ in range(num_horizons)
        ])

        # Action-Specific Sacrifice Vector Head
        self.sacrifice_head = SacrificeVectorHead(conditioned_dim, sacrifice_dim, dropout=dropout)

    def forward(self, z_shared: torch.Tensor, e_a: torch.Tensor):
        """
        Args:
            z_shared: [batch, fused_dim]
            e_a: [batch, action_dim] or [batch, num_actions, action_dim]
        Returns:
            means: [batch, (num_actions,) num_horizons, num_targets]
            log_vars: [batch, (num_actions,) num_horizons, num_targets]
            stds: [batch, (num_actions,) num_horizons, num_targets]
            sacrifice: [batch, (num_actions,) sacrifice_dim]
        """
        # Handle multi-action evaluation (broadcasting z_shared across actions if necessary)
        if e_a.dim() == 3:
            # e_a: [batch, num_actions, action_dim]
            num_actions = e_a.shape[1]
            z_expanded = z_shared.unsqueeze(1).expand(-1, num_actions, -1)
            conditioned = torch.cat([z_expanded, e_a], dim=-1)
        else:
            conditioned = torch.cat([z_shared, e_a], dim=-1)

        conditioned_feat = self.adapter(conditioned)

        means_list = []
        log_vars_list = []
        stds_list = []

        for decoder in self.horizon_decoders:
            mean, log_var, std = decoder(conditioned_feat)
            means_list.append(mean)
            log_vars_list.append(log_var)
            stds_list.append(std)

        # Stack over horizons
        # If multi-action: [batch, num_actions, num_horizons, num_targets]
        # If single action: [batch, num_horizons, num_targets]
        means = torch.stack(means_list, dim=-2)
        log_vars = torch.stack(log_vars_list, dim=-2)
        stds = torch.stack(stds_list, dim=-2)

        sacrifice = self.sacrifice_head(conditioned_feat)
        return means, log_vars, stds, sacrifice
