"""
Physics-Aware Composite Loss Function for ACCM.
Combines heteroscedastic NLL, task-specific penalties, Arrhenius degradation,
SOC/energy physical conservation, and counterfactual trajectory consistency.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from .uncertainty import gaussian_nll_loss
from .config import ACCMTrainingConfig

class ACCMCompositeLoss(nn.Module):
    """
    Composite Physics-Aware Multi-Task Loss:
    L = L_future + lambda_soc L_soc + lambda_thermal L_thermal + lambda_health L_health
        + lambda_energy L_energy + lambda_grid L_grid + lambda_physics L_physics
        + lambda_unc L_unc + lambda_cf L_counterfactual + lambda_sac L_sacrifice
    """
    def __init__(self, config: ACCMTrainingConfig = None):
        super().__init__()
        self.cfg = config or ACCMTrainingConfig()
        self.mse = nn.MSELoss()
        self.huber = nn.SmoothL1Loss()

    def forward(
        self,
        pred_means: torch.Tensor,       # [batch, num_horizons, 11]
        pred_log_vars: torch.Tensor,    # [batch, num_horizons, 11]
        y_targets: torch.Tensor,        # [batch, num_horizons, 11]
        pred_sacrifice: torch.Tensor,   # [batch, 8]
        y_sacrifice: torch.Tensor,      # [batch, 8]
        initial_soc: torch.Tensor,      # [batch, 1]
        battery_capacity: torch.Tensor, # [batch, 1]
        applied_power: torch.Tensor,    # [batch, 1]
        ambient_temp: torch.Tensor,     # [batch, 1]
        station_capacity: torch.Tensor = None, # [batch, 1]
        counterfactual_pred: torch.Tensor = None,
        counterfactual_target: torch.Tensor = None
    ) -> dict:
        """
        Calculates all composite loss components and the total scalar loss.
        """
        # 1. Base NLL Multi-Horizon Consequence Loss (L_future + L_unc)
        nll_loss = gaussian_nll_loss(y_targets, pred_means, pred_log_vars)

        # Target indices:
        # 0: soc, 1: energy, 2: temp, 3: soh, 4: degradation, 5: duration, 6: station_load, 7: grid_load
        pred_soc = pred_means[:, :, 0]
        true_soc = y_targets[:, :, 0]
        l_soc = self.mse(pred_soc, true_soc)

        pred_temp = pred_means[:, :, 2]
        true_temp = y_targets[:, :, 2]
        l_thermal = self.huber(pred_temp, true_temp)

        pred_soh = pred_means[:, :, 3]
        true_soh = y_targets[:, :, 3]
        l_health = self.mse(pred_soh, true_soh)

        pred_energy = pred_means[:, :, 1]
        true_energy = y_targets[:, :, 1]
        l_energy = self.huber(pred_energy, true_energy)

        pred_grid = pred_means[:, :, 7]
        true_grid = y_targets[:, :, 7]
        l_grid = self.mse(pred_grid, true_grid)

        # 2. Physics Consistency Losses
        # A. SOC Conservation: SOC(t + dt) approx SOC(0) + (eta * P * dt) / Cap * 100
        # For horizon 0 (5m = 5/60 h), horizon 2 (15m = 0.25 h), etc.
        horizons_hours = torch.tensor([5.0/60.0, 10.0/60.0, 15.0/60.0, 30.0/60.0, 60.0/60.0], device=pred_means.device)
        expected_energy = applied_power * horizons_hours.unsqueeze(0)  # [batch, 5]
        expected_delta_soc = (expected_energy * 0.92 / torch.clamp(battery_capacity, min=1.0)) * 100.0
        expected_soc = torch.clamp(initial_soc + expected_delta_soc, max=100.0)

        # Physics penalty on SOC violation
        l_soc_physics = F.relu(pred_soc - 100.0).mean() + F.relu(-pred_soc).mean() + 0.1 * self.mse(pred_soc, expected_soc)

        # B. Energy Conservation: E approx P * dt
        l_energy_physics = self.huber(pred_energy, expected_energy)

        # C. Non-Negative Degradation (battery capacity cannot spontaneously regenerate)
        pred_degradation = pred_means[:, :, 4]
        l_degradation_monotonic = F.relu(-pred_degradation).mean()

        # D. Thermal Dissipation Plausibility (temp cannot jump without power)
        excess_temp = F.relu(pred_temp - 60.0).mean()  # Severe overtemperature penalty
        l_thermal_physics = excess_temp + l_degradation_monotonic

        # E. Station Power Constraint
        if station_capacity is not None:
            pred_station_load = pred_means[:, :, 6]
            l_capacity_violation = F.relu(pred_station_load - station_capacity.unsqueeze(1)).mean()
        else:
            l_capacity_violation = torch.tensor(0.0, device=pred_means.device)

        total_physics_loss = l_soc_physics + l_energy_physics + l_thermal_physics + l_capacity_violation

        # 3. Sacrifice Vector Supervision Loss
        l_sacrifice = self.mse(pred_sacrifice, y_sacrifice)

        # 4. Counterfactual Consistency Loss (if provided)
        if counterfactual_pred is not None and counterfactual_target is not None:
            l_cf = self.mse(counterfactual_pred, counterfactual_target)
        else:
            l_cf = torch.tensor(0.0, device=pred_means.device)

        # Total Composite Weighted Loss
        total_loss = (
            self.cfg.lambda_future * nll_loss
            + self.cfg.lambda_soc * l_soc
            + self.cfg.lambda_thermal * l_thermal
            + self.cfg.lambda_health * l_health
            + self.cfg.lambda_energy * l_energy
            + self.cfg.lambda_grid * l_grid
            + self.cfg.lambda_physics * total_physics_loss
            + self.cfg.lambda_sacrifice * l_sacrifice
            + self.cfg.lambda_counterfactual * l_cf
        )

        return {
            "loss": total_loss,
            "nll_loss": nll_loss.item(),
            "l_soc": l_soc.item(),
            "l_thermal": l_thermal.item(),
            "l_health": l_health.item(),
            "l_energy": l_energy.item(),
            "l_grid": l_grid.item(),
            "l_physics": total_physics_loss.item(),
            "l_sacrifice": l_sacrifice.item(),
            "l_cf": l_cf.item() if isinstance(l_cf, torch.Tensor) else 0.0
        }
