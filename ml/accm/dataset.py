"""
PyTorch Dataset and DataLoader implementations for ACCM.
Constructs multi-modal state tensors (temporal, graph, physics, negotiation context)
paired with multi-horizon consequence targets and sacrifice vectors.
"""
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from .counterfactual import CounterfactualSimulator
from .schemas import CandidateAction, ACTION_INDEX_MAP, HORIZONS_MINUTES, CONSEQUENCE_TARGETS

class ACCMEnergyDataset(Dataset):
    """
    High-performance Dataset yielding multi-modal input tuples and action-conditioned consequence ground truth.
    """
    def __init__(
        self,
        df: pd.DataFrame,
        seq_len: int = 60,
        augment_counterfactual: bool = True
    ):
        self.seq_len = seq_len
        self.augment_counterfactual = augment_counterfactual
        self.sim = CounterfactualSimulator()
        self.actions_list = list(CandidateAction)

        # Pre-extract contiguous numpy arrays for 1000x faster slicing
        self.length = max(1, len(df) - seq_len)
        self.soc = df["soc"].to_numpy(dtype=np.float32)
        self.charging_power_kw = df["charging_power_kw"].to_numpy(dtype=np.float32)
        self.battery_temp_c = df["battery_temp_c"].to_numpy(dtype=np.float32)
        self.station_load_kw = df["station_load_kw"].to_numpy(dtype=np.float32)
        self.grid_load_pct = df["grid_load_pct"].to_numpy(dtype=np.float32)
        self.queue_time_mins = df["queue_time_mins"].to_numpy(dtype=np.float32)
        self.soh = df["soh"].to_numpy(dtype=np.float32)
        self.current_a = df["current_a"].to_numpy(dtype=np.float32)
        self.battery_capacity_kwh = df["battery_capacity_kwh"].to_numpy(dtype=np.float32)
        self.internal_resistance_ohm = df["internal_resistance_ohm"].to_numpy(dtype=np.float32)
        self.voltage_v = df["voltage_v"].to_numpy(dtype=np.float32)
        self.ambient_temp_c = df["ambient_temp_c"].to_numpy(dtype=np.float32)

    def __len__(self):
        return self.length

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        end_idx = idx + self.seq_len
        curr_idx = end_idx - 1

        # Temporal features (16 features per timestep)
        t_soc = self.soc[idx:end_idx] / 100.0
        t_power = self.charging_power_kw[idx:end_idx] / 150.0
        t_temp = (self.battery_temp_c[idx:end_idx] - 25.0) / 25.0
        t_station = self.station_load_kw[idx:end_idx] / 500.0
        t_grid = self.grid_load_pct[idx:end_idx] / 100.0
        t_queue = self.queue_time_mins[idx:end_idx] / 60.0
        t_soh = self.soh[idx:end_idx] / 100.0
        t_current = self.current_a[idx:end_idx] / 375.0

        # Construct 16-channel sequence
        zeros = np.zeros(self.seq_len, dtype=np.float32)
        seq_matrix = np.column_stack([
            t_soc, t_power, t_temp, t_station, t_grid, t_queue, t_soh, t_current,
            zeros, zeros, zeros, zeros, zeros, zeros, zeros, zeros
        ])  # [60, 16]

        # 2. Graph Nodes (6 nodes x 16 features)
        graph_nodes = np.zeros((6, 16), dtype=np.float32)
        graph_nodes[0, 0] = self.soc[curr_idx] / 100.0
        graph_nodes[0, 1] = self.battery_capacity_kwh[curr_idx] / 100.0
        graph_nodes[1, 2] = (self.battery_temp_c[curr_idx] - 25.0) / 25.0
        graph_nodes[1, 3] = self.internal_resistance_ohm[curr_idx] * 10.0
        graph_nodes[2, 4] = self.charging_power_kw[curr_idx] / 150.0
        graph_nodes[3, 5] = self.station_load_kw[curr_idx] / 500.0
        graph_nodes[3, 6] = self.queue_time_mins[curr_idx] / 60.0
        graph_nodes[4, 7] = self.grid_load_pct[curr_idx] / 100.0
        graph_nodes[5, 8] = 0.65  # Renewable ratio estimate

        # 3. Physics features (9 features)
        physics_feat = np.array([
            self.soc[curr_idx],
            self.battery_capacity_kwh[curr_idx],
            self.charging_power_kw[curr_idx],
            self.current_a[curr_idx],
            self.voltage_v[curr_idx],
            self.battery_temp_c[curr_idx],
            self.internal_resistance_ohm[curr_idx],
            self.soh[curr_idx],
            max(0.0, 100.0 - float(self.soh[curr_idx]))
        ], dtype=np.float32)

        # 4. Negotiation context (6 continuous + 1 discrete)
        neg_cont = np.array([
            0.15,   # reciprocity credit
            12.0,   # historical sacrifice min
            1.0,    # recent priority count
            4.0,    # negotiation count
            0.85,   # fairness state
            8.0     # time since last priority min
        ], dtype=np.float32)
        prev_act_idx = 1  # CHARGE_NOW_STANDARD default

        # 5. Pick an action to condition on (counterfactual sampling across batch)
        action_idx = np.random.randint(0, len(self.actions_list))
        selected_action = self.actions_list[action_idx]

        # 6. Generate physical consequences and sacrifice vector ground truth via physics simulator
        state_dict = {
            "soc": float(self.soc[curr_idx]),
            "battery_capacity_kwh": float(self.battery_capacity_kwh[curr_idx]),
            "charging_power_kw": float(self.charging_power_kw[curr_idx]),
            "battery_temp_c": float(self.battery_temp_c[curr_idx]),
            "ambient_temp_c": float(self.ambient_temp_c[curr_idx]),
            "soh": float(self.soh[curr_idx]),
            "station_load_kw": float(self.station_load_kw[curr_idx]),
            "grid_load_pct": float(self.grid_load_pct[curr_idx])
        }
        cf_result = self.sim.simulate_action_trajectory(state_dict, selected_action, HORIZONS_MINUTES)

        # Build target tensor [5 horizons x 11 targets]
        y_targets = np.zeros((len(HORIZONS_MINUTES), len(CONSEQUENCE_TARGETS)), dtype=np.float32)
        for h_idx, h in enumerate(HORIZONS_MINUTES):
            h_data = cf_result["horizons"][f"{h}m"]
            for t_idx, target_name in enumerate(CONSEQUENCE_TARGETS):
                y_targets[h_idx, t_idx] = float(h_data.get(target_name, 0.0))

        # Build target sacrifice vector [8]
        y_sacrifice = np.array([
            cf_result["sacrifice_vector"]["battery"],
            cf_result["sacrifice_vector"]["degradation"],
            cf_result["sacrifice_vector"]["thermal"],
            cf_result["sacrifice_vector"]["grid"],
            cf_result["sacrifice_vector"]["waiting"],
            cf_result["sacrifice_vector"]["energy"],
            cf_result["sacrifice_vector"]["future_availability"],
            cf_result["sacrifice_vector"]["fairness"],
        ], dtype=np.float32)

        return {
            "temporal_seq": torch.tensor(seq_matrix, dtype=torch.float32),
            "graph_nodes": torch.tensor(graph_nodes, dtype=torch.float32),
            "physics_features": torch.tensor(physics_feat, dtype=torch.float32),
            "negotiation_cont": torch.tensor(neg_cont, dtype=torch.float32),
            "prev_action_idx": torch.tensor(prev_act_idx, dtype=torch.long),
            "action_idx": torch.tensor(action_idx, dtype=torch.long),
            "y_targets": torch.tensor(y_targets, dtype=torch.float32),
            "y_sacrifice": torch.tensor(y_sacrifice, dtype=torch.float32),
            "initial_soc": torch.tensor([self.soc[curr_idx]], dtype=torch.float32),
            "battery_capacity": torch.tensor([self.battery_capacity_kwh[curr_idx]], dtype=torch.float32),
            "applied_power": torch.tensor([self.charging_power_kw[curr_idx]], dtype=torch.float32),
            "ambient_temp": torch.tensor([self.ambient_temp_c[curr_idx]], dtype=torch.float32),
        }
