"""
Action Encoder for ACCM.
Embeds candidate discrete negotiation actions and continuous parameter modifiers
into action representations E_A in R^64.
"""
import torch
import torch.nn as nn
from .schemas import CandidateAction, ACTION_INDEX_MAP

class ActionEncoder(nn.Module):
    """
    Action embedding module for the 7 candidate negotiation actions.
    Supports discrete action indexing as well as continuous action scaling (e.g. power limits).
    """
    def __init__(self, num_actions: int = 7, embedding_dim: int = 64):
        super().__init__()
        self.num_actions = num_actions
        self.embedding_dim = embedding_dim

        self.action_embeddings = nn.Embedding(num_actions, embedding_dim)
        # Parameter modifier: [power_fraction, duration_requested_fraction] -> 16
        self.param_proj = nn.Sequential(
            nn.Linear(2, 16),
            nn.GELU(),
            nn.Linear(16, embedding_dim)
        )
        self.out_norm = nn.LayerNorm(embedding_dim)

    def forward(self, action_indices: torch.Tensor, action_params: torch.Tensor = None) -> torch.Tensor:
        """
        Args:
            action_indices: [batch] or [batch, num_candidate_actions]
            action_params: Optional [..., 2] (power ratio, time ratio)
        Returns:
            e_a: [..., embedding_dim] (E_A in R^64)
        """
        emb = self.action_embeddings(action_indices)
        if action_params is not None:
            param_emb = self.param_proj(action_params)
            emb = emb + param_emb
        return self.out_norm(emb)
