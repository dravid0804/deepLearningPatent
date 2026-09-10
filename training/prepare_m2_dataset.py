"""Create a station-demand training table from the downloaded M2 CSV.

This intentionally retains only station-operation fields and does not invent a
tariff. Join a real tariff schedule on ``timestamp`` before using tariff as a
model feature.
"""

from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "training" / "datasets" / "ev_charging_dataset.csv"
OUTPUT = ROOT / "training" / "datasets" / "m2_station_demand_prepared.csv"


def main() -> None:
    frame = pd.read_csv(SOURCE)
    selected = frame.rename(columns={
        "Date_Time": "timestamp",
        "Vehicle_ID": "vehicle_id",
        "Charging_Station_ID": "station_id",
        "Session_Start_Hour": "hour_of_day",
        "Weekday": "day_of_week",
        "Charging_Load_kW": "station_power_draw_kw",
        "Queue_Time_mins": "queue_time_mins",
        "Station_Capacity_EV": "station_capacity_ev",
        "Charging_Rate_kW": "charging_rate_kw",
        "Energy_Drawn_kWh": "energy_drawn_kwh",
        "Fleet_Size": "fleet_size",
        "Temperature_C": "temperature_c",
    })

    columns = [
        "timestamp", "station_id", "vehicle_id", "hour_of_day", "day_of_week",
        "station_power_draw_kw", "queue_time_mins", "station_capacity_ev",
        "charging_rate_kw", "energy_drawn_kwh", "fleet_size", "temperature_c",
    ]
    missing = [column for column in columns if column not in selected.columns]
    if missing:
        raise ValueError(f"Source file is missing required columns: {missing}")

    result = selected[columns].copy()
    result["timestamp"] = pd.to_datetime(result["timestamp"], errors="coerce")
    result["hour_of_day"] = result["timestamp"].dt.hour
    result["day_of_week"] = result["timestamp"].dt.dayofweek
    result["grid_tariff_usd"] = pd.NA
    result["tariff_source"] = "MISSING__MERGE_REAL_TARIFF_SCHEDULE"
    result = result.dropna(subset=["timestamp", "station_id", "station_power_draw_kw"])
    result = result.sort_values(["station_id", "timestamp"])
    result.to_csv(OUTPUT, index=False)
    print(f"Created {OUTPUT.name}: {len(result):,} rows, {len(result.columns)} columns")
    print("grid_tariff_usd is blank by design; merge an actual tariff schedule before using it.")


if __name__ == "__main__":
    main()
