# ANT-EV 2.0 Dataset Specification & Data Dictionary

This directory contains exclusively the empirical datasets used for training, calibrating, and validating the **Action-Conditioned Consequence Model (ACCM)** and the **PRISM-ANT Reciprocity Negotiation Engine**.

---

## 1. Datasets Summary

| File Name | Size | Records | Source & Scope | Role in Project |
| :--- | :---: | :---: | :--- | :--- |
| [`ev_charging_dataset.csv`](file:///e:/EVSTATION_DEEP/datasets/ev_charging_dataset.csv) | 21.9 MB | 64,945 rows | Kaggle EV Charging & Fleet Dynamics Series | **Primary Training Corpus**: Ingested by ACCM's Selective State Space (SSM/Mamba) and Graph Attention Network (GAT) to forecast 5 operational time horizons. |
| [`nasa_battery_aging_metadata.csv`](file:///e:/EVSTATION_DEEP/datasets/nasa_battery_aging_metadata.csv) | 849 KB | 7,565 cycles | NASA Ames Prognostics Center of Excellence (PCoE) | **Electrochemical Calibration**: Run-to-failure battery impedance ($R_e, R_{ct}$) and capacity fade curves used to ground Arrhenius degradation and the 42.0°C thermal barrier. |

---

## 2. Logical Data Dictionary for `ev_charging_dataset.csv`

The 28 columns are grouped logically into 5 physical domains:

### Group A: Vehicle & Electrochemical Battery Dynamics
1. **`Battery_Capacity_kWh`** (Float, kWh):
   - *Meaning*: Total nameplate energy capacity of the EV battery pack (40.0 kWh – 100.0 kWh).
   - *Model Usage*: Normalizes energy deltas into percentage state-of-charge ($\Delta SOC$) and computes charging C-rate ($C = P / C_{batt}$).
2. **`State_of_Charge_%`** (Float, 0.0% – 100.0%):
   - *Meaning*: Current electrochemical charge level of the pack.
   - *Model Usage*: Primary continuous state variable. Dictates constant-current vs. constant-voltage charge acceptance envelope.
3. **`Charging_Rate_kW`** (Float, kW):
   - *Meaning*: Instantaneous active electrical power drawn by the vehicle from the dispenser (e.g. 7 kW to 150 kW).
   - *Model Usage*: Represents the observed physical action $a$. ACCM learns consequence differentials across discrete candidate power levels relative to this rate.
4. **`Energy_Drawn_kWh`** (Float, kWh):
   - *Meaning*: Total electrical energy transferred during the charging session.
   - *Model Usage*: Enforces physical Ampere-hour conservation: $\Delta SOC \approx \eta \cdot \frac{E_{drawn}}{C_{batt}}$.
5. **`Time_Spent_Charging_mins`** (Float, minutes):
   - *Meaning*: Cumulative connection duration of the active session.
   - *Model Usage*: Captures continuous thermodynamic heat accumulation ($Q = I^2 R \Delta t$) inside the battery pack.

### Group B: Station Topology & Feeder Grid Load
6. **`Charging_Station_ID`** (Integer ID):
   - *Meaning*: Unique identifier for the local charging facility.
   - *Model Usage*: Maps local transformer capacity and feeder configuration.
7. **`Station_Capacity_EV`** (Integer, count):
   - *Meaning*: Total number of physical charging bays installed at the station.
   - *Model Usage*: Defines node count in ACCM's Graph Attention Network (GAT) for inter-bay power competition.
8. **`Charging_Load_kW`** (Float, kW):
   - *Meaning*: Aggregated electrical power drawn by all bays from the local substation transformer.
   - *Model Usage*: Key physical constraint. Evaluates grid headroom: $P_{headroom} = P_{station,max} - \sum P_i$.
9. **`Queue_Time_mins`** (Float, minutes):
   - *Meaning*: Time incoming vehicles waited before plug-in.
   - *Model Usage*: Directly maps to the waiting penalty component in the Action Sacrifice Vector: $S_{wait} \in [0, 1]$.

### Group C: Mobility, Destination Urgency & Energy Guarantee
10. **`Distance_to_Destination_km`** (Float, km):
    - *Meaning*: Remaining route distance the EV must travel after unplugging.
    - *Model Usage*: PRISM-ANT verifies that negotiated power guarantees sufficient energy to reach the destination without stranding: $E_{min} = d \times \text{consumption\_rate}$.
11. **`Energy_Consumption_Rate_kWh/km`** (Float, kWh/km):
    - *Meaning*: Real-world driving energy efficiency of the specific vehicle model (0.10 – 0.30 kWh/km).
    - *Model Usage*: Converts remaining distance into required kilowatt-hours.
12. **`Current_Latitude` / `Current_Longitude`** (Float, degrees):
    - *Meaning*: Geographic coordinates of the charging plaza.
    - *Model Usage*: Locates the station within the regional electrical grid node and local weather cell.
13. **`Destination_Latitude` / `Destination_Longitude`** (Float, degrees):
    - *Meaning*: Geographic destination of the vehicle trip.
    - *Model Usage*: Validates routing corridor constraints and emergency dispatch verification.
14. **`Traffic_Data`** (Categorical 1–3):
    - *Meaning*: Real-time traffic congestion on downstream routes (1 = Free, 2 = Moderate, 3 = Heavy).
    - *Model Usage*: Heavy traffic increases aux air-conditioning load and travel time, affecting driver flexibility tokens.
15. **`Road_Conditions`** (Categorical: Good, Average, Poor):
    - *Meaning*: Pavement and surface resistance quality.
    - *Model Usage*: Adjusts destination reserve margins.

### Group D: Environmental & Thermodynamic Variables
16. **`Temperature_C`** (Float, °C):
    - *Meaning*: Ambient atmospheric temperature at the charging site.
    - *Model Usage*: Baseline heat sink temperature. High ambient temperature combined with 350 kW charging accelerates core cell temperature toward the **42.0°C safety cutoff**.
17. **`Wind_Speed_m/s`** (Float, m/s):
    - *Meaning*: Convective wind speed across outdoor dispenser enclosures.
    - *Model Usage*: Influences ambient convective cooling dissipation rate from battery pack casings.
18. **`Precipitation_mm`** (Float, mm):
    - *Meaning*: Rainfall or moisture level.
    - *Model Usage*: Factors into driver waiting tolerance and tire rolling resistance.
19. **`Weather_Conditions`** (Categorical: Clear, Cloudy, Rainy):
    - *Meaning*: General sky conditions.
    - *Model Usage*: Correlates with local behind-the-meter solar PV generation at the microgrid.

### Group E: Driver Context & Fleet Prioritization
20. **`Date_Time`** (Timestamp, YYYY-MM-DD HH:MM:SS):
    - *Meaning*: Exact temporal record timestamp.
    - *Model Usage*: Establishes continuous temporal sequence for the 60-step sliding window ($T=60$).
21. **`Session_Start_Hour`** (Integer, 0–23):
    - *Meaning*: Hour of day when charging commenced.
    - *Model Usage*: Aligns with grid Time-of-Use (TOU) tariff peak surcharge pricing tiers.
22. **`Weekday`** (Integer, 0–6):
    - *Meaning*: Day of week (0 = Sunday ... 6 = Saturday).
    - *Model Usage*: Captures commuter patterns versus weekend travel surges.
23. **`Fleet_Size`** (Integer, count):
    - *Meaning*: Number of commercial fleet vehicles registered to the fleet account.
    - *Model Usage*: Differentiates commercial logistics vehicles from private commuters.
24. **`Fleet_Schedule`** (Binary 0/1):
    - *Meaning*: Flag indicating if vehicle is operating under fixed dispatch deadlines.
    - *Model Usage*: Weighting factor inside PRISM-ANT's utility token.
25. **`Charging_Preferences`** (Binary 0/1):
    - *Meaning*: Driver preference (0 = Preservation & Low Cost, 1 = Urgent Departure Speed).
    - *Model Usage*: Prunes the candidate action exploration space.
26. **`Vehicle_ID`** (Integer ID):
    - *Meaning*: Anonymized vehicle identifier.
    - *Model Usage*: Links sequential charging sessions across multiple days.

---

## 3. First-Principle Synthesized Features

During preprocessing in [`ml/accm/preprocessing.py`](file:///e:/EVSTATION_DEEP/ml/accm/preprocessing.py), raw telemetry is augmented using verified physical equations:

| Feature Name | Formula | Physical Meaning |
| :--- | :--- | :--- |
| `voltage_v` | $400.0\text{ V}$ | Nominal DC bus voltage standard. |
| `current_a` | $\frac{P_{charging} \times 1000}{V}$ | DC charging current in Amperes. |
| `internal_resistance_ohm` | $0.045 + \mathcal{N}(0, 0.003)\ \Omega$ | Ohmic impedance of cell stack. |
| `battery_temp_c` | $T_{amb} + (P \times 0.09) + \text{residual}$ | Battery core temperature (°C) modeling Joule heating. |
| `soh` | $100 - (SOC \times 0.03 + \mathcal{N}(2.0, 0.5))$ | State of Health (% capacity retention). |
| `grid_load_pct` | $\text{clip}\left(\frac{P_{station}}{P_{transformer}} \times 100, 10, 98\right)$ | Local distribution feeder loading percentage. |

---

## 4. Train / Validation / Test Splitting (Zero Data Leakage)

All continuous variables are standardized via zero-mean unit-variance scaling:
* **Training Partition**: $70\%$ (45,461 sequential windows) — *all scalers are fit strictly here*.
* **Validation Partition**: $15\%$ (9,742 windows) — *for hyperparameter tuning and loss monitoring*.
* **Test Partition**: $15\%$ (9,742 windows) — *held-out empirical evaluation*.
