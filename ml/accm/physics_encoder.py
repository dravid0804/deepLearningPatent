"""
Physics-Aware Electro-Thermal Encoder for ACCM.
Encodes electrochemical, thermal, and electrical telemetry:
SOC, capacity, power, current, voltage, battery temperature, internal resistance, SOH, degradation state.
Produces Z_P in R^128 using physics-informed residual blocks.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class PhysicsAwareEncoder(nn.Module):
    """
    Encodes electro-thermal states into Z_P in R^128.
    Applies non-linear transformations with residual connections and physics cross-terms:
    (Power = V * I, Joule heating = I^2 * R, Thermal delta = T_bat - T_amb).
    """
    def __init__(self, in_dim: int = 9, d_model: int = 128, dropout: float = 0.10):
        super().__init__()
        self.in_dim = in_dim
        self.d_model = d_model

        # Base input projection
        # Input features: [soc, capacity, power, current, voltage, temp, resistance, soh, degradation]
        # Cross features computed explicitly: [V*I, I^2*R, P/Capacity, Temp - 25.0]
        self.cross_dim = 4
        total_dim = in_dim + self.cross_dim

        self.input_layer = nn.Linear(total_dim, d_model)
        self.res_block1 = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, d_model)
        )
        self.norm1 = nn.LayerNorm(d_model)

        self.res_block2 = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, d_model)
        )
        self.norm2 = nn.LayerNorm(d_model)
        self.final_proj = nn.Linear(d_model, d_model)
        self.final_norm = nn.LayerNorm(d_model)

    def forward(self, physics_features: torch.Tensor) -> torch.Tensor:
        """
        Args:
            physics_features: [batch, 9]
                0: soc (%)
                1: battery_capacity_kwh
                2: charging_power_kw
                3: current_a
                4: voltage_v
                5: battery_temp_c
                6: internal_resistance_ohm
                7: soh (%)
                8: degradation_pct
        Returns:
            z_p: [batch, d_model] (Z_P in R^128)
        """
        # Compute explicit electro-thermal cross-terms
        current = physics_features[:, 3:4]
        voltage = physics_features[:, 4:5]
        resistance = physics_features[:, 6:7]
        power = physics_features[:, 2:3]
        capacity = torch.clamp(physics_features[:, 1:2], min=1.0)
        temp = physics_features[:, 5:6]

        vi_power = (voltage * current) / 1000.0          # kW from V*I
        joule_heat = (current ** 2 * resistance) / 1000.0 # kW Joule loss
        c_rate = power / capacity                        # C-rate approximation
        thermal_excess = F.relu(temp - 25.0)             # Excess above ambient ref

        augmented = torch.cat([physics_features, vi_power, joule_heat, c_rate, thermal_excess], dim=-1)

        h = F.gelu(self.input_layer(augmented))
        h = self.norm1(h + self.res_block1(h))
        h = self.norm2(h + self.res_block2(h))
        z_p = self.final_norm(self.final_proj(h))
        return z_p
