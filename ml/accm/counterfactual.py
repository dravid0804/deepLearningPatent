"""
Counterfactual Action Trajectory Simulator for ACCM.
Generates physically grounded counterfactual action-consequence branches
for all 7 candidate actions from a given state S_t.
Enables learning F_theta(S_t, action) rather than only observational F_theta(S_t).
"""
import copy
import numpy as np
import torch
from typing import Dict, List, Any
from .schemas import CandidateAction, ACTION_INDEX_MAP, HORIZONS_MINUTES

class CounterfactualSimulator:
    """
    Simulates multi-horizon physics-grounded trajectories for candidate actions:
    Applies Arrhenius electro-thermal equations, SOC transfer, grid draw, and dwell calculations.
    """
    def __init__(
        self,
        ambient_temp_ref: float = 25.0,
        thermal_resistance: float = 0.08,   # °C / kW
        thermal_capacitance: float = 450.0, # s
        degradation_factor: float = 0.00015
    ):
        self.ambient_temp_ref = ambient_temp_ref
        self.r_th = thermal_resistance
        self.c_th = thermal_capacitance
        self.deg_factor = degradation_factor

    def simulate_action_trajectory(
        self,
        initial_state: Dict[str, float],
        action: CandidateAction,
        horizons_minutes: List[int] = None
    ) -> Dict[str, Any]:
        """
        Simulates the trajectory across horizons for a given action.
        """
        horizons = horizons_minutes or HORIZONS_MINUTES
        soc0 = float(initial_state.get("soc", 40.0))
        target_soc = float(initial_state.get("target_soc", 80.0))
        cap_kwh = float(initial_state.get("battery_capacity_kwh", 75.0))
        temp0 = float(initial_state.get("battery_temp_c", 28.0))
        ambient = float(initial_state.get("ambient_temp_c", 22.0))
        soh0 = float(initial_state.get("soh", 95.0))
        max_power = float(initial_state.get("charging_power_kw", 150.0))
        base_station_load = float(initial_state.get("station_load_kw", 220.0))
        base_grid_pct = float(initial_state.get("grid_load_pct", 65.0))
        tariff_usd = float(initial_state.get("electricity_price_kwh", 0.28))

        # Map candidate action to power profile and behavioral factors
        if action == CandidateAction.CHARGE_NOW_FAST:
            power_factor = 1.0
            wait_increment = 0.0
            reciprocity_impact = -0.2
        elif action == CandidateAction.CHARGE_NOW_STANDARD:
            power_factor = 0.50
            wait_increment = 2.0
            reciprocity_impact = 0.0
        elif action == CandidateAction.COOPERATIVE_DELAY:
            power_factor = 0.0
            wait_increment = 15.0
            reciprocity_impact = +0.5
        elif action == CandidateAction.REDUCE_POWER:
            power_factor = 0.30
            wait_increment = 5.0
            reciprocity_impact = +0.15
        elif action == CandidateAction.ENERGY_RESERVATION:
            power_factor = 0.10
            wait_increment = 10.0
            reciprocity_impact = +0.25
        elif action == CandidateAction.REDIRECT_STATION:
            power_factor = 0.0
            wait_increment = 20.0
            reciprocity_impact = +0.40
        elif action == CandidateAction.ELIGIBLE_V2G_EXPORT:
            power_factor = -0.25  # Discharging to grid
            wait_increment = 10.0
            reciprocity_impact = +0.80
        else:
            power_factor = 0.5
            wait_increment = 0.0
            reciprocity_impact = 0.0

        actual_power = max_power * power_factor
        results = {}

        cur_soc = soc0
        cur_temp = temp0
        cur_soh = soh0
        cum_energy = 0.0

        for h in horizons:
            dt_hours = h / 60.0
            # Energy transferred up to this horizon
            delta_e = actual_power * dt_hours
            cum_energy = max(0.0, cum_energy + delta_e)

            # SOC update (bounded 0 to 100%)
            delta_soc = (delta_e * 0.92 / max(1.0, cap_kwh)) * 100.0
            cur_soc = max(5.0, min(100.0, soc0 + delta_soc))

            # Thermal update: dT = (P_loss * R_th - (T - T_amb)) * dt / tau
            p_loss = abs(actual_power) * 0.08  # ~8% thermal dissipation
            equilibrium_temp = ambient + p_loss * self.r_th * 10.0
            cur_temp = cur_temp + (equilibrium_temp - cur_temp) * (1.0 - np.exp(-dt_hours * 2.0))

            # Arrhenius degradation calculation
            c_rate = abs(actual_power) / max(1.0, cap_kwh)
            temp_stress = np.exp(max(0.0, cur_temp - 25.0) / 10.0)
            deg_increment = self.deg_factor * (c_rate ** 1.3) * temp_stress * dt_hours * 0.1
            cur_soh = max(70.0, soh0 - deg_increment)

            # Station & Grid consequences
            sim_station_load = max(0.0, base_station_load + actual_power)
            sim_grid_load = max(0.0, min(100.0, base_grid_pct + (actual_power / 500.0) * 100.0))
            cost_usd = max(0.0, cum_energy * tariff_usd)

            horizon_key = f"{h}m"
            results[horizon_key] = {
                "soc": round(float(cur_soc), 2),
                "energy_delivered_kwh": round(float(cum_energy), 2),
                "battery_temp_c": round(float(cur_temp), 2),
                "soh": round(float(cur_soh), 3),
                "degradation_rate_pct": round(float(deg_increment), 4),
                "charging_duration_min": float(h),
                "station_load_kw": round(float(sim_station_load), 1),
                "grid_load_pct": round(float(sim_grid_load), 1),
                "electricity_cost_usd": round(float(cost_usd), 2),
                "waiting_time_min": float(wait_increment),
                "renewable_utilization": round(float(min(1.0, 0.45 + (0.2 if power_factor < 0.5 else -0.1))), 2)
            }

        # Calculate Action-Specific Sacrifice Vector [0, 1]^8
        norm_power = max(0.0, power_factor)
        thermal_risk = min(1.0, max(0.0, (cur_temp - 25.0) / 25.0))
        deg_risk = min(1.0, deg_increment * 100.0)
        grid_impact = min(1.0, max(0.0, (sim_grid_load - 50.0) / 50.0))
        wait_impact = min(1.0, wait_increment / 30.0)
        energy_cost_impact = min(1.0, (cost_usd) / 25.0)
        future_avail_impact = min(1.0, norm_power * 0.7)
        fairness_impact = min(1.0, max(0.0, 0.5 - reciprocity_impact * 0.5))

        sacrifice_vector = {
            "battery": round(float(norm_power * 0.6 + deg_risk * 0.4), 3),
            "degradation": round(float(deg_risk), 3),
            "thermal": round(float(thermal_risk), 3),
            "grid": round(float(grid_impact), 3),
            "waiting": round(float(wait_impact), 3),
            "energy": round(float(energy_cost_impact), 3),
            "future_availability": round(float(future_avail_impact), 3),
            "fairness": round(float(fairness_impact), 3),
        }

        return {
            "action": action,
            "horizons": results,
            "sacrifice_vector": sacrifice_vector
        }
