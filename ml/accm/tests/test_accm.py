"""
Comprehensive Unit Tests for ACCM Architecture and Physics Constraints.
"""
import unittest
import torch

from ml.accm.config import ACCMModelConfig, ACCMTrainingConfig
from ml.accm.model import ACCM
from ml.accm.temporal_encoder import TemporalSSMEncoder
from ml.accm.graph_encoder import RelationalGraphEncoder
from ml.accm.physics_encoder import PhysicsAwareEncoder
from ml.accm.negotiation_encoder import NegotiationContextEncoder
from ml.accm.action_encoder import ActionEncoder
from ml.accm.losses import ACCMCompositeLoss
from ml.accm.counterfactual import CounterfactualSimulator
from ml.accm.schemas import CandidateAction

class TestACCMArchitecture(unittest.TestCase):
    def setUp(self):
        self.batch_size = 4
        self.seq_len = 60
        self.model_cfg = ACCMModelConfig()
        self.model = ACCM(self.model_cfg)

        self.temporal_seq = torch.randn(self.batch_size, self.seq_len, 16)
        self.graph_nodes = torch.randn(self.batch_size, 6, 16)
        self.physics_feat = torch.tensor([
            [45.0, 75.0, 120.0, 300.0, 400.0, 32.0, 0.05, 94.0, 6.0],
            [20.0, 60.0, 50.0, 125.0, 400.0, 26.0, 0.04, 98.0, 2.0],
            [85.0, 100.0, 150.0, 375.0, 400.0, 44.0, 0.07, 88.0, 12.0],
            [10.0, 80.0, 0.0, 0.0, 400.0, 24.0, 0.05, 96.0, 4.0],
        ], dtype=torch.float32)
        self.neg_cont = torch.randn(self.batch_size, 6)
        self.prev_act = torch.tensor([0, 1, 2, 3], dtype=torch.long)

    def test_temporal_ssm_encoder_shape(self):
        encoder = TemporalSSMEncoder(d_input=16, d_model=128, d_state=16, num_blocks=4)
        z_t = encoder(self.temporal_seq)
        self.assertEqual(z_t.shape, (self.batch_size, 128))

    def test_graph_encoder_shape(self):
        encoder = RelationalGraphEncoder(node_feature_dim=16, d_model=128)
        z_g = encoder(self.graph_nodes)
        self.assertEqual(z_g.shape, (self.batch_size, 128))

    def test_physics_encoder_shape(self):
        encoder = PhysicsAwareEncoder(in_dim=9, d_model=128)
        z_p = encoder(self.physics_feat)
        self.assertEqual(z_p.shape, (self.batch_size, 128))

    def test_negotiation_encoder_shape(self):
        encoder = NegotiationContextEncoder(in_dim=7, d_model=128)
        z_r = encoder(self.neg_cont, self.prev_act)
        self.assertEqual(z_r.shape, (self.batch_size, 128))

    def test_end_to_end_single_action(self):
        act_idx = torch.tensor([0, 1, 2, 3], dtype=torch.long)
        out = self.model(
            temporal_seq=self.temporal_seq,
            graph_nodes=self.graph_nodes,
            physics_features=self.physics_feat,
            negotiation_cont=self.neg_cont,
            prev_action_idx=self.prev_act,
            action_idx=act_idx
        )
        # Expected shapes:
        # means: [batch, 5 horizons, 11 targets]
        # stds: [batch, 5 horizons, 11 targets]
        # sacrifice: [batch, 8 dims]
        self.assertEqual(out["means"].shape, (self.batch_size, 5, 11))
        self.assertEqual(out["stds"].shape, (self.batch_size, 5, 11))
        self.assertEqual(out["sacrifice"].shape, (self.batch_size, 8))

        # Sacrifice vector strictly bounded [0, 1]
        self.assertTrue(torch.all(out["sacrifice"] >= 0.0))
        self.assertTrue(torch.all(out["sacrifice"] <= 1.0))

        # Standard deviations strictly positive
        self.assertTrue(torch.all(out["stds"] > 0.0))

    def test_end_to_end_all_actions(self):
        out = self.model(
            temporal_seq=self.temporal_seq,
            graph_nodes=self.graph_nodes,
            physics_features=self.physics_feat,
            negotiation_cont=self.neg_cont,
            prev_action_idx=self.prev_act,
            action_idx=None
        )
        # All 7 actions simultaneously evaluated:
        # means: [batch, 7 actions, 5 horizons, 11 targets]
        self.assertEqual(out["means"].shape, (self.batch_size, 7, 5, 11))
        self.assertEqual(out["stds"].shape, (self.batch_size, 7, 5, 11))
        self.assertEqual(out["sacrifice"].shape, (self.batch_size, 7, 8))

    def test_composite_loss_calculation(self):
        loss_fn = ACCMCompositeLoss()
        act_idx = torch.tensor([0, 1, 2, 3], dtype=torch.long)
        out = self.model(
            temporal_seq=self.temporal_seq,
            graph_nodes=self.graph_nodes,
            physics_features=self.physics_feat,
            negotiation_cont=self.neg_cont,
            prev_action_idx=self.prev_act,
            action_idx=act_idx
        )
        y_targets = torch.randn(self.batch_size, 5, 11)
        y_sacrifice = torch.rand(self.batch_size, 8)
        initial_soc = self.physics_feat[:, 0:1]
        battery_capacity = self.physics_feat[:, 1:2]
        applied_power = self.physics_feat[:, 2:3]
        ambient_temp = torch.tensor([[25.0], [22.0], [30.0], [20.0]])

        loss_dict = loss_fn(
            pred_means=out["means"],
            pred_log_vars=out["log_vars"],
            y_targets=y_targets,
            pred_sacrifice=out["sacrifice"],
            y_sacrifice=y_sacrifice,
            initial_soc=initial_soc,
            battery_capacity=battery_capacity,
            applied_power=applied_power,
            ambient_temp=ambient_temp
        )
        self.assertIn("loss", loss_dict)
        self.assertTrue(torch.isfinite(loss_dict["loss"]))
        self.assertTrue(loss_dict["loss"].item() > 0)

    def test_counterfactual_simulator(self):
        sim = CounterfactualSimulator()
        state = {
            "soc": 40.0,
            "target_soc": 80.0,
            "battery_capacity_kwh": 75.0,
            "charging_power_kw": 120.0,
            "battery_temp_c": 30.0,
            "ambient_temp_c": 25.0,
            "soh": 96.0,
            "station_load_kw": 200.0,
            "grid_load_pct": 60.0
        }
        res_fast = sim.simulate_action_trajectory(state, CandidateAction.CHARGE_NOW_FAST)
        res_delay = sim.simulate_action_trajectory(state, CandidateAction.COOPERATIVE_DELAY)

        # Fast charging should produce higher thermal rise and higher energy than delay
        self.assertGreater(res_fast["horizons"]["15m"]["battery_temp_c"], res_delay["horizons"]["15m"]["battery_temp_c"])
        self.assertGreater(res_fast["horizons"]["15m"]["energy_delivered_kwh"], res_delay["horizons"]["15m"]["energy_delivered_kwh"])
        # Delay should produce higher waiting sacrifice
        self.assertGreater(res_delay["sacrifice_vector"]["waiting"], res_fast["sacrifice_vector"]["waiting"])

if __name__ == "__main__":
    unittest.main()
