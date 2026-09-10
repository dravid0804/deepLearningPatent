"""
Configuration module for the Action-Conditioned Consequence Model (ACCM).
Defines model dimensions, training hyperparameters, loss weights, and prediction horizons.
"""
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class ACCMModelConfig:
    # Temporal SSM Encoder (Mamba-inspired)
    temporal_d_input: int = 16
    temporal_d_model: int = 128
    temporal_d_state: int = 16
    temporal_num_blocks: int = 4
    temporal_seq_len: int = 60
    temporal_dropout: float = 0.10

    # Graph Encoder
    graph_num_node_types: int = 6  # EV, Battery, Charger, Station, Grid, Renewable
    graph_node_dim: int = 32
    graph_d_model: int = 128
    graph_num_layers: int = 2
    graph_num_heads: int = 4

    # Physics-Aware Encoder
    physics_d_input: int = 9  # SOC, capacity, power, current, voltage, temp, resistance, SOH, degradation
    physics_d_model: int = 128

    # Negotiation Context Encoder
    negotiation_d_input: int = 7  # reciprocity, sacrifice_hist, priority_cnt, neg_cnt, fairness, prev_action, time_since_priority
    negotiation_d_model: int = 128

    # Fusion Layer
    fused_d_model: int = 256
    fusion_dropout: float = 0.10

    # Action Conditioning
    num_actions: int = 7
    action_embedding_dim: int = 64

    # Multi-Horizon Target Setup
    horizons_minutes: List[int] = field(default_factory=lambda: [5, 10, 15, 30, 60])
    num_horizons: int = 5
    num_consequence_targets: int = 11  # SOC, energy, temp, SOH, degradation, duration, station_load, grid_load, cost, wait_time, renewable_share

    # Sacrifice Vector Dimension
    sacrifice_dim: int = 8  # battery, degradation, thermal, grid, waiting, energy, future_avail, fairness

@dataclass
class ACCMTrainingConfig:
    seed: int = 42
    batch_size: int = 32
    learning_rate: float = 1e-3
    weight_decay: float = 1e-4
    max_epochs: int = 15
    patience: int = 5
    device: str = "cpu"

    # Composite Loss Weights (configurable, no hardcoding)
    lambda_future: float = 1.0
    lambda_soc: float = 0.35
    lambda_thermal: float = 0.40
    lambda_health: float = 0.30
    lambda_energy: float = 0.25
    lambda_grid: float = 0.30
    lambda_physics: float = 0.50
    lambda_uncertainty: float = 0.15
    lambda_counterfactual: float = 0.20
    lambda_sacrifice: float = 0.30

    # Physics Constants
    nominal_voltage: float = 400.0  # V
    ambient_temp_ref: float = 25.0  # °C
    thermal_cutoff_c: float = 42.0  # °C
    degradation_c_rate_alpha: float = 0.0015
    degradation_arrhenius_kappa: float = 10.0
