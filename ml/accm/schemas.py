"""
Schema definitions for ACCM inputs, candidate action vocabulary,
consequence prediction vectors, sacrifice vectors, and telemetry contracts.
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Any, Optional

class CandidateAction(str, Enum):
    CHARGE_NOW_FAST = "CHARGE_NOW_FAST"
    CHARGE_NOW_STANDARD = "CHARGE_NOW_STANDARD"
    COOPERATIVE_DELAY = "COOPERATIVE_DELAY"
    REDUCE_POWER = "REDUCE_POWER"
    ENERGY_RESERVATION = "ENERGY_RESERVATION"
    REDIRECT_STATION = "REDIRECT_STATION"
    ELIGIBLE_V2G_EXPORT = "ELIGIBLE_V2G_EXPORT"

ACTION_INDEX_MAP: Dict[CandidateAction, int] = {
    CandidateAction.CHARGE_NOW_FAST: 0,
    CandidateAction.CHARGE_NOW_STANDARD: 1,
    CandidateAction.COOPERATIVE_DELAY: 2,
    CandidateAction.REDUCE_POWER: 3,
    CandidateAction.ENERGY_RESERVATION: 4,
    CandidateAction.REDIRECT_STATION: 5,
    CandidateAction.ELIGIBLE_V2G_EXPORT: 6,
}

ACTION_DESCRIPTIONS: Dict[CandidateAction, str] = {
    CandidateAction.CHARGE_NOW_FAST: "Deliver maximum safe dispenser power immediately.",
    CandidateAction.CHARGE_NOW_STANDARD: "Deliver moderate power to limit battery thermal and grid stress.",
    CandidateAction.COOPERATIVE_DELAY: "Temporarily pause power delivery to accommodate high-urgency vehicles.",
    CandidateAction.REDUCE_POWER: "Throttle power to remain within station/feeder safety limits.",
    CandidateAction.ENERGY_RESERVATION: "Reserve a guaranteed future delivery energy window.",
    CandidateAction.REDIRECT_STATION: "Suggest redirecting to adjacent station with incentive balance.",
    CandidateAction.ELIGIBLE_V2G_EXPORT: "Discharge power back to the grid for reciprocity/tariff compensation.",
}

# 11 Target Consequence Dimension Names
CONSEQUENCE_TARGETS: List[str] = [
    "soc",                     # % (0 - 100)
    "energy_delivered_kwh",    # kWh
    "battery_temp_c",          # °C
    "soh",                     # % (0 - 100)
    "degradation_rate_pct",    # % capacity fade
    "charging_duration_min",   # minutes
    "station_load_kw",         # kW total draw
    "grid_load_pct",           # % transformer load
    "electricity_cost_usd",    # $ session cost
    "waiting_time_min",        # minutes wait
    "renewable_utilization",   # ratio (0 - 1)
]

# 8 Action-Specific Sacrifice Vector Dimensions
SACRIFICE_DIMENSIONS: List[str] = [
    "battery",                 # Battery cycling stress
    "degradation",             # Direct economic pack degradation
    "thermal",                 # Elevated cell temperature risk
    "grid",                    # Contribution to grid peak/congestion
    "waiting",                 # Driver delay / dwell penalty
    "energy",                  # Tariff/energy cost impact
    "future_availability",     # Reduction in station flexibility
    "fairness",                # Reciprocity / queue deviation
]

HORIZONS_MINUTES: List[int] = [5, 10, 15, 30, 60]

@dataclass
class EVStateFeatures:
    soc: float
    target_soc: float
    battery_capacity_kwh: float
    charging_power_kw: float
    voltage_v: float
    current_a: float
    battery_temp_c: float
    ambient_temp_c: float
    internal_resistance_ohm: float
    soh: float
    energy_delivered_kwh: float
    session_duration_min: float
    waiting_time_min: float
    queue_position: int
    vehicle_type: str = "passenger_sedan"
    charger_type: str = "dc_fast"

@dataclass
class StationStateFeatures:
    station_load_kw: float
    station_capacity_kw: float
    available_chargers: int
    occupied_chargers: int
    queue_length: int
    electricity_price_kwh: float
    renewable_ratio: float

@dataclass
class GridStateFeatures:
    grid_load_pct: float
    grid_capacity_kw: float
    grid_frequency_hz: float
    renewable_generation_kw: float
    local_congestion_index: float

@dataclass
class EnvironmentFeatures:
    traffic_density: float
    weather_condition: str
    hour_of_day: int
    day_of_week: int
    charging_demand_index: float

@dataclass
class NegotiationContextFeatures:
    reciprocity_credit: float
    historical_sacrifice_min: float
    recent_priority_count: int
    negotiation_count: int
    fairness_state: float
    previous_action: str
    time_since_previous_priority_min: float

@dataclass
class ActionConsequencePrediction:
    action: CandidateAction
    horizons: Dict[str, Dict[str, float]]  # "5m", "10m", etc. -> metric -> mean value
    uncertainty: Dict[str, Dict[str, float]]  # "5m", etc. -> metric -> std_dev
    confidence: Dict[str, float]  # "5m" -> confidence score (0 - 100%)
    sacrifice_vector: Dict[str, float]  # 8 dimensions

@dataclass
class ACCMInferenceOutput:
    timestamp: str
    model_version: str
    schema_version: str
    is_demo: bool
    candidate_actions: List[ActionConsequencePrediction]
    feature_importances: Dict[str, float]
    station_state: Dict[str, Any]
