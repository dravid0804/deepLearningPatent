"""
Action-Specific Sacrifice Vector module for ACCM.
Predicts the 8-dimensional multi-attribute cost/sacrifice for a candidate energy action:
[battery, degradation, thermal, grid, waiting, energy, future_availability, fairness]
All components normalized in [0, 1].
"""
import torch
import torch.nn as nn
from .schemas import SACRIFICE_DIMENSIONS

class SacrificeVectorHead(nn.Module):
    """
    Learned head predicting the 8-dimensional sacrifice vector S_a in [0, 1]^8
    conditioned on the fused latent state and candidate action embedding.
    """
    def __init__(self, in_features: int, sacrifice_dim: int = 8, dropout: float = 0.10):
        super().__init__()
        self.sacrifice_dim = sacrifice_dim

        self.net = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.LayerNorm(128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, 64),
            nn.GELU(),
            nn.Linear(64, sacrifice_dim),
            nn.Sigmoid()  # Bound outputs strictly to [0, 1]
        )

    def forward(self, conditioned_features: torch.Tensor) -> torch.Tensor:
        """
        Args:
            conditioned_features: [..., in_features] (e.g. Z_shared + E_A)
        Returns:
            sacrifice_vector: [..., 8] normalized sacrifice vector
        """
        return self.net(conditioned_features)
