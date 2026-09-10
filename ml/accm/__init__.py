"""
Action-Conditioned Consequence Model (ACCM) Package.
Unified Multi-Horizon Consequence and Sacrifice Prediction Network for Autonomous EV Energy Negotiation.
"""
from .config import ACCMModelConfig, ACCMTrainingConfig
from .schemas import CandidateAction, ACTION_INDEX_MAP, ACTION_DESCRIPTIONS, HORIZONS_MINUTES, SACRIFICE_DIMENSIONS
from .model import ACCM
from .inference import ACCMInferenceEngine

__all__ = [
    "ACCM",
    "ACCMModelConfig",
    "ACCMTrainingConfig",
    "CandidateAction",
    "ACTION_INDEX_MAP",
    "ACTION_DESCRIPTIONS",
    "HORIZONS_MINUTES",
    "SACRIFICE_DIMENSIONS",
    "ACCMInferenceEngine",
]
