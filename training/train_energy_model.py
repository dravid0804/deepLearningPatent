"""Train M1 from prepared historical session data without inventing SOC fields."""
from pathlib import Path
import json
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "training" / "datasets" / "m1_sessions_prepared.csv"
OUTPUT = ROOT / "models" / "energy_model" / "model_artifact.json"

def fit_ridge(x, y):
    return np.linalg.solve(x.T @ x + np.eye(x.shape[1]), x.T @ y)

def train_m1_energy_model():
    if not DATASET.exists(): raise FileNotFoundError(f"Prepared M1 dataset not found: {DATASET}")
    frame = pd.read_csv(DATASET)
    frame["connection_time"] = pd.to_datetime(frame["connection_time"], errors="coerce")
    frame = frame.dropna(subset=["connection_time", "kwh_delivered", "charging_duration_hours"])
    frame = frame[(frame.kwh_delivered >= 0) & (frame.charging_duration_hours >= 0)].sort_values("connection_time")
    hour, weekday = frame.connection_time.dt.hour.to_numpy(), frame.connection_time.dt.dayofweek.to_numpy()
    site = pd.factorize(frame.site_id.astype(str))[0]; station = pd.factorize(frame.station_id.astype(str))[0]
    x = np.column_stack([np.ones(len(frame)), np.sin(2*np.pi*hour/24), np.cos(2*np.pi*hour/24), np.sin(2*np.pi*weekday/7), np.cos(2*np.pi*weekday/7), site, station]).astype(float)
    energy, duration, split = frame.kwh_delivered.to_numpy(float), frame.charging_duration_hours.to_numpy(float), max(2, int(len(frame)*.8))
    energy_w, duration_w = fit_ridge(x[:split], energy[:split]), fit_ridge(x[:split], duration[:split])
    pred_energy, pred_duration = x[split:] @ energy_w, x[split:] @ duration_w
    metrics = {"energy_mae_kwh": round(float(np.mean(abs(energy[split:]-pred_energy))),3), "energy_rmse_kwh": round(float(np.sqrt(np.mean((energy[split:]-pred_energy)**2))),3), "duration_mae_hours": round(float(np.mean(abs(duration[split:]-pred_duration))),3), "train_rows":split, "test_rows":len(frame)-split}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"model_id":"M1_ENERGY_SESSION_BASELINE","version":"3.0.0","model_type":"ridge_regression_baseline","input_features":["arrival_hour_sin","arrival_hour_cos","weekday_sin","weekday_cos","site_code","station_code"],"targets":["kwh_delivered","charging_duration_hours"],"energy_weights":energy_w.tolist(),"duration_weights":duration_w.tolist(),"metrics":metrics,"dataset":str(DATASET.relative_to(ROOT)),"limitations":"Dataset has no vehicle SOC, target SOC, pack capacity, or temperature.","status":"TRAINED_BASELINE_REQUIRES_VALIDATION"},indent=2),encoding="utf-8")
    print(f"M1 trained from {len(frame):,} sessions. {metrics}")

if __name__ == "__main__": train_m1_energy_model()
