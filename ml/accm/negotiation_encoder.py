"""
Negotiation Context Encoder for ACCM.
Encodes historical fairness state, reciprocity balance, prior concessions, and priority counts.
Produces Z_R in R^128 as context ONLY.
The neural network does not replace PRISM-ANT negotiation logic.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class NegotiationContextEncoder(nn.Module):
    """
    Context encoder providing historical negotiation state to ACCM.
    Features:
        0: reciprocity_credit (positive = gave concessions, negative = consumed priority)
        1: historical_sacrifice_min (cumulative minutes sacrificed for peers)
        2: recent_priority_count (number of recent emergency / fast allocations)
        3: negotiation_count (lifetime interactions at this network)
        4: fairness_state (normalized index from 0 to 1)
        5: previous_action_index (discrete embedding)
        6: time_since_previous_priority_min (cooldown timer)
    """
    def __init__(self, in_dim: int = 7, d_model: int = 128, num_actions: int = 7, dropout: float = 0.10):
        super().__init__()
        self.d_model = d_model
        self.action_embed = nn.Embedding(num_actions, 16)

        # 6 continuous features + 16 action embedding dim = 22
        continuous_dim = in_dim - 1
        total_dim = continuous_dim + 16

        self.net = nn.Sequential(
            nn.Linear(total_dim, d_model),
            nn.LayerNorm(d_model),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, d_model),
            nn.LayerNorm(d_model),
            nn.GELU(),
            nn.Linear(d_model, d_model)
        )
        self.norm = nn.LayerNorm(d_model)

    def forward(self, continuous_features: torch.Tensor, prev_action_idx: torch.Tensor) -> torch.Tensor:
        """
        Args:
            continuous_features: [batch, 6]
            prev_action_idx: [batch] (int indices 0..6)
        Returns:
            z_r: [batch, d_model] (Z_R in R^128)
        """
        act_emb = self.action_embed(prev_action_idx)  # [batch, 16]
        x = torch.cat([continuous_features, act_emb], dim=-1)
        z_r = self.norm(self.net(x))
        return z_r
