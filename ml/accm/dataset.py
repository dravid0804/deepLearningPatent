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
    Dataset yielding multi-modal input tuples and action-conditioned consequence ground truth.
    """
    def __init__(
        self,
        df: pd.DataFrame,
        seq_len: int = 60,
        augment_counterfactual: bool = True
    ):
        self.df = df.reset_index(drop=True)
        self.seq_len = seq_len
        self.augment_counterfactual = augment_counterfactual
        self.sim = CounterfactualSimulator()
        self.actions_list = list(CandidateAction)

    def __len__(self):
        return max(1, len(self.df) - self.seq_len)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        # 1. Temporal sequence window (60 steps)
        # We extract a window from idx to idx + seq_len
        window = self.df.iloc[idx : idx + self.seq_len]
        curr_row = window.iloc[-1]

        # Temporal features (16 features per timestep)
        t_soc = window["soc"].to_numpy(dtype=np.float32) / 100.0
        t_power = window["charging_power_kw"].to_numpy(dtype=np.float32) / 150.0
        t_temp = (window["battery_temp_c"].to_numpy(dtype=np.float32) - 25.0) / 25.0
        t_station = window["station_load_kw"].to_numpy(dtype=np.float32) / 500.0
        t_grid = window["grid_load_pct"].to_numpy(dtype=np.float32) / 100.0
        t_queue = window["queue_time_mins"].to_numpy(dtype=np.float32) / 60.0
        t_soh = window["soh"].to_numpy(dtype=np.float32) / 100.0
        t_current = window["current_a"].to_numpy(dtype=np.float32) / 375.0

        # Construct 16-channel sequence
        zeros = np.zeros(self.seq_len, dtype=np.float32)
        seq_matrix = np.column_stack([
            t_soc, t_power, t_temp, t_station, t_grid, t_queue, t_soh, t_current,
            zeros, zeros, zeros, zeros, zeros, zeros, zeros, zeros
        ])  # [60, 16]

        # 2. Graph Nodes (6 nodes x 16 features)
        # 0: EV, 1: Battery, 2: Charger, 3: Station, 4: Grid, 5: Renewable
        graph_nodes = np.zeros((6, 16), dtype=np.float32)
        graph_nodes[0, 0] = curr_row["soc"] / 100.0
        graph_nodes[0, 1] = curr_row["battery_capacity_kwh"] / 100.0
        graph_nodes[1, 2] = (curr_row["battery_temp_c"] - 25.0) / 25.0
        graph_nodes[1, 3] = curr_row["internal_resistance_ohm"] * 10.0
        graph_nodes[2, 4] = curr_row["charging_power_kw"] / 150.0
        graph_nodes[3, 5] = curr_row["station_load_kw"] / 500.0
        graph_nodes[3, 6] = curr_row["queue_time_mins"] / 60.0
        graph_nodes[4, 7] = curr_row["grid_load_pct"] / 100.0
        graph_nodes[5, 8] = 0.65  # Renewable ratio estimate

        # 3. Physics features (9 features)
        physics_feat = np.array([
            curr_row["soc"],
            curr_row["battery_capacity_kwh"],
            curr_row["charging_power_kw"],
            curr_row["current_a"],
            curr_row["voltage_v"],
            curr_row["battery_temp_c"],
            curr_row["internal_resistance_ohm"],
            curr_row["soh"],
            max(0.0, 100.0 - curr_row["soh"])
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
            "soc": curr_row["soc"],
            "battery_capacity_kwh": curr_row["battery_capacity_kwh"],
            "charging_power_kw": curr_row["charging_power_kw"],
            "battery_temp_c": curr_row["battery_temp_c"],
            "ambient_temp_c": curr_row["ambient_temp_c"],
            "soh": curr_row["soh"],
            "station_load_kw": curr_row["station_load_kw"],
            "grid_load_pct": curr_row["grid_load_pct"]
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
            "initial_soc": torch.tensor([curr_row["soc"]], dtype=torch.float32),
            "battery_capacity": torch.tensor([curr_row["battery_capacity_kwh"]], dtype=torch.float32),
            "applied_power": torch.tensor([curr_row["charging_power_kw"]], dtype=torch.float32),
            "ambient_temp": torch.tensor([curr_row["ambient_temp_c"]], dtype=torch.float32),
        }
