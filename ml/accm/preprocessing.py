"""
Dataset preprocessing, schema normalization, and metadata manifests for ACCM.
Enforces strict prevention of data leakage: all scalers fit ONLY on the training split.
"""
import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, List, Any

MANIFEST_METADATA = {
    "ev_charging_dataset": {
        "dataset_name": "Kaggle Electric Vehicle Charging and Dynamics",
        "source": "ev_charging_dataset.csv",
        "version": "2.4.0",
        "units": {
            "battery_capacity": "kWh",
            "soc": "% (0 - 100)",
            "charging_rate": "kW",
            "temperature": "°C",
            "distance": "km",
            "queue_time": "min",
            "energy_drawn": "kWh"
        },
        "sampling_frequency": "Per session / dynamic telemetry",
        "preprocessing_version": "ACCM-PREPROC-1.0",
        "split": {"train": 0.70, "val": 0.15, "test": 0.15}
    },
    "nasa_battery_aging": {
        "dataset_name": "NASA Ames Prognostics Center of Excellence Li-ion Battery Aging",
        "source": "cleaned_dataset",
        "version": "1.0.0",
        "units": {
            "capacity": "Ah",
            "ambient_temp": "°C",
            "impedance_re": "Ohm",
            "impedance_rct": "Ohm"
        },
        "sampling_frequency": "Cycle-by-cycle run-to-failure",
        "preprocessing_version": "ACCM-PREPROC-1.0",
        "split": {"train": 0.70, "val": 0.15, "test": 0.15}
    }
}

class StandardFeatureScaler:
    """
    Zero-mean, unit-variance scaler with clipping and persistent serializability.
    Fit strictly on the training partition to prevent data leakage.
    """
    def __init__(self):
        self.means = {}
        self.stds = {}
        self.mins = {}
        self.maxs = {}

    def fit(self, df: pd.DataFrame, columns: List[str]):
        for col in columns:
            series = pd.to_numeric(df[col], errors="coerce").dropna()
            self.means[col] = float(series.mean())
            std_val = float(series.std())
            self.stds[col] = std_val if std_val > 1e-6 else 1.0
            self.mins[col] = float(series.min())
            self.maxs[col] = float(series.max())

    def transform(self, df: pd.DataFrame, columns: List[str]) -> np.ndarray:
        arrays = []
        for col in columns:
            val = pd.to_numeric(df[col], errors="coerce").fillna(self.means.get(col, 0.0)).to_numpy(dtype=float)
            scaled = (val - self.means.get(col, 0.0)) / self.stds.get(col, 1.0)
            arrays.append(np.clip(scaled, -5.0, 5.0))
        return np.column_stack(arrays)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "means": self.means,
            "stds": self.stds,
            "mins": self.mins,
            "maxs": self.maxs
        }

    def from_dict(self, data: Dict[str, Any]):
        self.means = data.get("means", {})
        self.stds = data.get("stds", {})
        self.mins = data.get("mins", {})
        self.maxs = data.get("maxs", {})


def load_and_preprocess_datasets(base_dir: Path) -> Tuple[pd.DataFrame, StandardFeatureScaler, Dict[str, Any]]:
    """
    Loads raw CSVs, harmonizes units, applies train/val/test splits,
    and returns preprocessed records and fitted scalers.
    """
    dataset_path = base_dir / "datasets" / "ev_charging_dataset.csv"
    if not dataset_path.exists():
        dataset_path = base_dir / "training" / "datasets" / "ev_charging_dataset.csv"
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

    df = pd.read_csv(dataset_path)

    # Standardize column mappings
    rename_dict = {
        "State_of_Charge_%": "soc",
        "Battery_Capacity_kWh": "battery_capacity_kwh",
        "Charging_Rate_kW": "charging_power_kw",
        "Charging_Load_kW": "station_load_kw",
        "Queue_Time_mins": "queue_time_mins",
        "Temperature_C": "ambient_temp_c",
        "Energy_Drawn_kWh": "energy_drawn_kwh",
        "Station_Capacity_EV": "station_capacity_ev",
        "Fleet_Size": "fleet_size"
    }
    df = df.rename(columns=rename_dict)

    # Synthesize battery temperature and electro-thermal parameters from physics formulas
    # Battery temp rises proportionally with ambient temp and Joule heating (I^2 * R)
    df["voltage_v"] = 400.0  # standard 400V architecture
    df["current_a"] = (df["charging_power_kw"] * 1000.0) / df["voltage_v"]
    df["internal_resistance_ohm"] = 0.045 + np.random.normal(0, 0.003, len(df))
    df["battery_temp_c"] = df["ambient_temp_c"] + (df["charging_power_kw"] * 0.09) + np.random.normal(0, 0.8, len(df))
    df["soh"] = np.clip(100.0 - (df["soc"] * 0.03 + np.random.normal(2.0, 0.5, len(df))), 75.0, 100.0)
    df["grid_load_pct"] = np.clip((df["station_load_kw"] / 500.0) * 100.0 + np.random.normal(0, 3.0, len(df)), 10.0, 98.0)

    # Train/Validation/Test split (70% / 15% / 15%)
    n = len(df)
    train_idx = int(0.70 * n)
    val_idx = int(0.85 * n)

    train_df = df.iloc[:train_idx]
    val_df = df.iloc[train_idx:val_idx]
    test_df = df.iloc[val_idx:]

    scaler = StandardFeatureScaler()
    feature_cols = [
        "soc", "battery_capacity_kwh", "charging_power_kw", "voltage_v", "current_a",
        "battery_temp_c", "ambient_temp_c", "internal_resistance_ohm", "soh",
        "station_load_kw", "queue_time_mins", "grid_load_pct"
    ]
    # FIT ONLY ON TRAIN
    scaler.fit(train_df, feature_cols)

    metadata = {
        "manifest": MANIFEST_METADATA,
        "total_rows": n,
        "train_rows": len(train_df),
        "val_rows": len(val_df),
        "test_rows": len(test_df),
        "feature_cols": feature_cols
    }

    return df, scaler, metadata
