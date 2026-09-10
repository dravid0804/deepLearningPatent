"""
Full Action-Conditioned Consequence Model (ACCM) PyTorch Architecture.
Integrates:
- Temporal SSM (Mamba-inspired) Encoder -> Z_T in R^128
- Relational Graph Encoder -> Z_G in R^128
- Physics-Aware Electro-Thermal Encoder -> Z_P in R^128
- Negotiation Context Encoder -> Z_R in R^128
- Fusion -> Z_shared in R^256
- Action-Conditioned Multi-Horizon Consequence Decoder
- Heteroscedastic Aleatoric Uncertainty
- Action-Specific Sacrifice Vector Head
"""
import torch
import torch.nn as nn
from typing import Dict, List, Tuple, Any

from .config import ACCMModelConfig
from .temporal_encoder import TemporalSSMEncoder
from .graph_encoder import RelationalGraphEncoder
from .physics_encoder import PhysicsAwareEncoder
from .negotiation_encoder import NegotiationContextEncoder
from .action_encoder import ActionEncoder
from .consequence_decoder import StateFusion, ActionConditionedConsequenceDecoder
from .schemas import CandidateAction, ACTION_INDEX_MAP, HORIZONS_MINUTES, SACRIFICE_DIMENSIONS

class ACCM(nn.Module):
    """
    Unified Action-Conditioned Multi-Horizon Consequence and Sacrifice Prediction Network
    for Autonomous EV Energy Negotiation.
    """
    def __init__(self, config: ACCMModelConfig = None):
        super().__init__()
        self.config = config or ACCMModelConfig()

        # 1. Encoders
        self.temporal_encoder = TemporalSSMEncoder(
            d_input=self.config.temporal_d_input,
            d_model=self.config.temporal_d_model,
            d_state=self.config.temporal_d_state,
            num_blocks=self.config.temporal_num_blocks,
            seq_len=self.config.temporal_seq_len,
            dropout=self.config.temporal_dropout
        )

        self.graph_encoder = RelationalGraphEncoder(
            node_feature_dim=16,
            d_model=self.config.graph_d_model,
            num_layers=self.config.graph_num_layers,
            num_heads=self.config.graph_num_heads,
            dropout=self.config.temporal_dropout
        )

        self.physics_encoder = PhysicsAwareEncoder(
            in_dim=self.config.physics_d_input,
            d_model=self.config.physics_d_model,
            dropout=self.config.temporal_dropout
        )

        self.negotiation_encoder = NegotiationContextEncoder(
            in_dim=self.config.negotiation_d_input,
            d_model=self.config.negotiation_d_model,
            num_actions=self.config.num_actions,
            dropout=self.config.temporal_dropout
        )

        # 2. Latent State Fusion
        self.fusion = StateFusion(
            z_t_dim=self.config.temporal_d_model,
            z_g_dim=self.config.graph_d_model,
            z_p_dim=self.config.physics_d_model,
            z_r_dim=self.config.negotiation_d_model,
            fused_dim=self.config.fused_d_model,
            dropout=self.config.fusion_dropout
        )

        # 3. Action Conditioning
        self.action_encoder = ActionEncoder(
            num_actions=self.config.num_actions,
            embedding_dim=self.config.action_embedding_dim
        )

        # 4. Action-Conditioned Consequence & Sacrifice Decoder
        self.decoder = ActionConditionedConsequenceDecoder(
            fused_dim=self.config.fused_d_model,
            action_dim=self.config.action_embedding_dim,
            num_horizons=self.config.num_horizons,
            num_targets=self.config.num_consequence_targets,
            sacrifice_dim=self.config.sacrifice_dim,
            dropout=self.config.temporal_dropout
        )

    def encode_state(
        self,
        temporal_seq: torch.Tensor,      # [batch, 60, 16]
        graph_nodes: torch.Tensor,       # [batch, 6, 16]
        physics_features: torch.Tensor,  # [batch, 9]
        negotiation_cont: torch.Tensor,  # [batch, 6]
        prev_action_idx: torch.Tensor,   # [batch]
        graph_adj: torch.Tensor = None
    ) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
        """
        Runs all four encoders and produces the fused latent representation Z_shared.
        """
        z_t = self.temporal_encoder(temporal_seq)
        z_g = self.graph_encoder(graph_nodes, graph_adj)
        z_p = self.physics_encoder(physics_features)
        z_r = self.negotiation_encoder(negotiation_cont, prev_action_idx)

        z_shared = self.fusion(z_t, z_g, z_p, z_r)
        intermediates = {
            "z_t": z_t,
            "z_g": z_g,
            "z_p": z_p,
            "z_r": z_r,
            "z_shared": z_shared
        }
        return z_shared, intermediates

    def forward_single_action(
        self,
        z_shared: torch.Tensor,
        action_idx: torch.Tensor,
        action_params: torch.Tensor = None
    ):
        """
        Predicts consequences for a single action index per batch item.
        """
        e_a = self.action_encoder(action_idx, action_params)
        means, log_vars, stds, sacrifice = self.decoder(z_shared, e_a)
        return means, log_vars, stds, sacrifice

    def forward_all_actions(
        self,
        z_shared: torch.Tensor,
        action_params: torch.Tensor = None
    ):
        """
        Simultaneously evaluates ALL candidate actions in the vocabulary.
        Returns tensor with shape [batch, num_actions, num_horizons, num_targets].
        """
        batch_size = z_shared.shape[0]
        device = z_shared.device
        all_actions = torch.arange(self.config.num_actions, device=device).unsqueeze(0).expand(batch_size, -1)
        # all_actions: [batch, 7]

        e_a = self.action_encoder(all_actions, action_params)  # [batch, 7, 64]
        means, log_vars, stds, sacrifice = self.decoder(z_shared, e_a)
        return means, log_vars, stds, sacrifice

    def forward(
        self,
        temporal_seq: torch.Tensor,
        graph_nodes: torch.Tensor,
        physics_features: torch.Tensor,
        negotiation_cont: torch.Tensor,
        prev_action_idx: torch.Tensor,
        action_idx: torch.Tensor = None,
        action_params: torch.Tensor = None,
        graph_adj: torch.Tensor = None
    ):
        """
        Full end-to-end forward pass.
        If action_idx is provided, evaluates that specific action.
        If action_idx is None, evaluates ALL 7 candidate actions.
        """
        z_shared, intermediates = self.encode_state(
            temporal_seq, graph_nodes, physics_features, negotiation_cont, prev_action_idx, graph_adj
        )

        if action_idx is not None:
            means, log_vars, stds, sacrifice = self.forward_single_action(z_shared, action_idx, action_params)
        else:
            means, log_vars, stds, sacrifice = self.forward_all_actions(z_shared, action_params)

        return {
            "means": means,
            "log_vars": log_vars,
            "stds": stds,
            "sacrifice": sacrifice,
            "latent": intermediates
        }
