"""Train M2 from prepared hourly station-load data without inventing tariffs."""
from pathlib import Path
import json
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "training" / "datasets" / "m2_station_demand_prepared.csv"
OUTPUT = ROOT / "models" / "demand_model" / "model_artifact.json"

def fit_ridge(x, y):
    return np.linalg.solve(x.T @ x + np.eye(x.shape[1]), x.T @ y)

def train_m2_demand_model():
    if not DATASET.exists(): raise FileNotFoundError(f"Prepared M2 dataset not found: {DATASET}")
    frame = pd.read_csv(DATASET); frame["timestamp"] = pd.to_datetime(frame.timestamp, errors="coerce")
    numeric = ["queue_time_mins","station_capacity_ev","charging_rate_kw","fleet_size","temperature_c","station_power_draw_kw"]
    for column in numeric: frame[column] = pd.to_numeric(frame[column], errors="coerce")
    frame = frame.dropna(subset=["timestamp","station_id","station_power_draw_kw"]).sort_values(["station_id","timestamp"])
    frame[numeric[:-1]] = frame[numeric[:-1]].fillna(frame[numeric[:-1]].median())
    for horizon in (1,2,4): frame[f"target_{horizon}h_kw"] = frame.groupby("station_id").station_power_draw_kw.shift(-horizon)
    frame = frame.dropna(subset=["target_1h_kw","target_2h_kw","target_4h_kw"])
    hour, weekday = frame.timestamp.dt.hour.to_numpy(), frame.timestamp.dt.dayofweek.to_numpy(); station = pd.factorize(frame.station_id.astype(str))[0]
    x = np.column_stack([np.ones(len(frame)),np.sin(2*np.pi*hour/24),np.cos(2*np.pi*hour/24),np.sin(2*np.pi*weekday/7),np.cos(2*np.pi*weekday/7),station,frame[["queue_time_mins","station_capacity_ev","charging_rate_kw","fleet_size","temperature_c"]].to_numpy(float)])
    split = max(2,int(len(frame)*.8)); weights, metrics = {}, {"train_rows":split,"test_rows":len(frame)-split}
    for horizon in (1,2,4):
        y = frame[f"target_{horizon}h_kw"].to_numpy(float); model = fit_ridge(x[:split],y[:split]); prediction=x[split:]@model; weights[f"{horizon}h"]=model.tolist(); metrics[f"{horizon}h_mae_kw"]=round(float(np.mean(abs(y[split:]-prediction))),3); metrics[f"{horizon}h_rmse_kw"]=round(float(np.sqrt(np.mean((y[split:]-prediction)**2))),3)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps({"model_id":"M2_STATION_DEMAND_BASELINE","version":"3.0.0","model_type":"multi_horizon_ridge_regression_baseline","input_features":["hour_sin","hour_cos","weekday_sin","weekday_cos","station_code","queue_time_mins","station_capacity_ev","charging_rate_kw","fleet_size","temperature_c"],"targets":["station_power_draw_kw_t_plus_1h","station_power_draw_kw_t_plus_2h","station_power_draw_kw_t_plus_4h"],"weights":weights,"metrics":metrics,"dataset":str(DATASET.relative_to(ROOT)),"limitations":"Hourly source data and no real tariff; outputs are 1/2/4-hour forecasts, not 15/30/60-minute forecasts.","status":"TRAINED_BASELINE_REQUIRES_VALIDATION"},indent=2),encoding="utf-8")
    print(f"M2 trained from {len(frame):,} hourly rows. {metrics}")

if __name__ == "__main__": train_m2_demand_model()
