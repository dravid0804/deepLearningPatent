# ANT-EV 2.0 Data Schema & Provenance Specification

## 1. Overview
The **Action-Conditioned Consequence Model (ACCM)** ingests multi-domain physical and network telemetry across an observational temporal window of $T=60$ timesteps (1-minute resolution, total 60-minute historical context). To prevent feature misalignment and unit pollution, all feature vectors adhere to an immutable schema specification (`Schema EV-NET-2.0`).

---

## 2. Feature Groups & Definitions

### 2.1 EV Battery & Vehicle Dynamics ($X_{\text{EV}} \in \mathbb{R}^{16}$)
| Feature Key | Description | Engineering Units | Min / Max Bounds | Normalization Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `soc` | State of Charge | Ratio $[0.0, 1.0]$ | $0.05 - 1.00$ | Identity clip $[0, 1]$ |
| `target_soc` | User-Requested Target SOC | Ratio $[0.0, 1.0]$ | $0.20 - 1.00$ | Identity clip $[0, 1]$ |
| `battery_capacity_kwh` | Nominal Pack Capacity | Kilowatt-hours (kWh) | $20.0 - 150.0$ | Min-Max $[0, 150]$ |
| `charging_power_kw` | Instantaneous Active Power | Kilowatts (kW) | $0.0 - 350.0$ | Standard Z-score |
| `pack_voltage_v` | Terminal DC Voltage | Volts (V) | $280.0 - 920.0$ | Min-Max $[250, 1000]$ |
| `pack_current_a` | Pack Charging/Discharging Current | Amperes (A) | $-100.0 - 500.0$ | Standard Z-score |
| `battery_temp_c` | Core Cell Temperature | Celsius ($^\circ$C) | $-10.0 - 65.0$ | Standard Z-score |
| `ambient_temp_c` | Ambient Weather Temperature | Celsius ($^\circ$C) | $-20.0 - 50.0$ | Standard Z-score |
| `internal_resistance_mohm` | High-Frequency Cell Impedance | Milliohms ($m\Omega$) | $15.0 - 85.0$ | Min-Max $[10, 100]$ |
| `soh` | State of Health | Ratio $[0.0, 1.0]$ | $0.65 - 1.00$ | Min-Max $[0.6, 1.0]$ |
| `previous_energy_kwh` | Cumulative Delivered Session Energy | kWh | $0.0 - 120.0$ | Standard Z-score |
| `session_duration_min` | Duration Since Plug-In | Minutes | $0.0 - 480.0$ | Min-Max $[0, 480]$ |
| `waiting_time_min` | Queue Waiting Time Before Bay Entry | Minutes | $0.0 - 180.0$ | Min-Max $[0, 180]$ |
| `queue_position` | Integer Position in Station Bay Buffer | Count | $0 - 20$ | Min-Max $[0, 20]$ |
| `vehicle_type_idx` | Encoded Vehicle Category (Sedan, SUV, Truck, Fleet) | Integer index | $0 - 3$ | One-hot 4-dim |
| `charger_type_idx` | Protocol (AC Level 2, CCS DC, CHAdeMO, HPC 350kW) | Integer index | $0 - 3$ | One-hot 4-dim |

### 2.2 Charging Station Infrastructure ($X_{\text{Station}} \in \mathbb{R}^{7}$)
| Feature Key | Description | Engineering Units | Operational Bounds | Normalization Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `station_load_kw` | Aggregated Station Power Demand | kW | $0.0 - 1200.0$ | Ratio to transformer limit |
| `station_capacity_kw` | Transformer Grid Interconnection Rating | kW | $250.0 - 2000.0$ | Constant scalar scaling |
| `available_chargers` | Unoccupied Functional Plugs | Count | $0 - 24$ | Ratio to total bays |
| `occupied_chargers` | Actively Charging Plugs | Count | $0 - 24$ | Ratio to total bays |
| `queue_length` | Total EVs Queued at Station Boundary | Count | $0 - 30$ | Min-Max $[0, 30]$ |
| `electricity_price_kwh` | Locational Marginal Price (LMP) | USD / kWh | $0.05 - 0.95$ | Min-Max $[0, 1.0]$ |
| `renewable_ratio` | Local On-Site Solar/Wind Share | Ratio $[0.0, 1.0]$ | $0.00 - 1.00$ | Identity clip $[0, 1]$ |

### 2.3 Regional Power Grid State ($X_{\text{Grid}} \in \mathbb{R}^{5}$)
| Feature Key | Description | Engineering Units | Nominal Standard | Normalization Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `grid_load_mw` | Substation Feeder Load | Megawatts (MW) | $5.0 - 50.0$ | Standard Z-score |
| `grid_capacity_mw` | Feeder Thermal Transformer Rating | Megawatts (MW) | $10.0 - 60.0$ | Standard Z-score |
| `grid_frequency_hz` | AC System Interconnection Frequency | Hertz (Hz) | $49.7 - 50.3$ (or $59.7-60.3$) | Deviation $\Delta f = f - f_0$ |
| `renewable_generation_mw` | Utility Wind/Solar Output | Megawatts (MW) | $0.0 - 35.0$ | Ratio to capacity |
| `local_congestion_idx` | Distribution Line Thermal Overload Index | Ratio $[0.0, 1.0]$ | $0.00 - 1.00$ | Identity clip $[0, 1]$ |

### 2.4 Negotiation Memory & Reciprocity Context ($X_{\text{Neg}} \in \mathbb{R}^{7}$)
> **Architectural Guardrail**: These features serve strictly as environmental context to ACCM. ACCM does *not* formulate negotiation counter-offers or concessions.
| Feature Key | Description | Engineering Units | Range |
| :--- | :--- | :--- | :--- |
| `reciprocity_credit` | PRISM-ANT Accumulated Reciprocity Balance | Dimensionless Credit Score | $[-10.0, +25.0]$ |
| `historical_sacrifice` | Cumulative Power/Delay Concessions Granted | Normalized Index | $[0.0, 1.0]$ |
| `recent_priority_count` | Number of Fast Passes Granted in Last 10 Sessions | Count | $0 - 10$ |
| `negotiation_count` | Number of Active Negotiation Rounds for Session | Count | $0 - 15$ |
| `fairness_state` | Gini-Coefficient Station Fairness Metric | Ratio $[0.0, 1.0]$ | $[0.0, 1.0]$ |
| `previous_action_idx` | Categorical Index of Last Step's Executed Action | Categorical index | $0 - 6$ |
| `time_since_priority_hr` | Elapsed Operational Hours Since Last Priority Event | Hours | $0.0 - 720.0$ |

---

## 3. Candidate Actions Vocabulary ($\mathcal{A}$)
ACCM conditions its multi-horizon forward simulation on 7 discrete candidate actions:
1. `CHARGE_NOW_FAST` ($P_{\text{req}} = 150-350\,\text{kW}$, high thermal stress, zero delay)
2. `CHARGE_NOW_STANDARD` ($P_{\text{req}} = 50-75\,\text{kW}$, nominal operating curve)
3. `COOPERATIVE_DELAY` ($P_{\text{req}} = 0\,\text{kW}$, delay queueing concessions for reciprocity)
4. `REDUCE_POWER` ($P_{\text{req}} = 20-35\,\text{kW}$, thermal relaxation & grid valley shaving)
5. `ENERGY_RESERVATION` (Guaranteed reserve slot at scheduled target departure window)
6. `REDIRECT_STATION` (Station load shedding to alternate geographical microgrid node)
7. `ELIGIBLE_V2G_EXPORT` ($P_{\text{req}} = -25\,\text{kW}$, bidirectional grid support export)

---

## 4. Multi-Horizon Consequence Targets ($\mathcal{Y}_h$)
Predicted at 5 discrete future horizons: $H \in \{5\,\text{min}, 10\,\text{min}, 15\,\text{min}, 30\,\text{min}, 60\,\text{min}\}$:
1. `soc_future`: Forecasted battery state-of-charge ($[0.0, 1.0]$)
2. `energy_delivered_kwh`: Cumulative active energy delivered (kWh)
3. `battery_temp_c`: Projected internal core temperature ($^\circ$C)
4. `soh_future`: Remaining State of Health ($[0.0, 1.0]$)
5. `degradation_pct`: Incremental SEI layer aging & capacity loss ($\%$)
6. `charging_duration_min`: Projected time remaining until target SOC (min)
7. `station_load_kw`: Aggregated station demand under candidate action (kW)
8. `grid_load_mw`: Substation feeder level under candidate action (MW)
9. `electricity_cost_usd`: Incremental billing cost under spot tariff (USD)
10. `waiting_time_min`: Estimated departure queue wait under action (min)
11. `renewable_energy_ratio`: Proportion of delivered energy sourced from clean generation ($[0.0, 1.0]$)

---

## 5. Action-Specific Sacrifice Vector ($\vec{S}_a \in [0, 1]^8$)
Computed from the decoded future trajectory for candidate action $a$:
$$\vec{S}_a = \left[ S_{\text{batt}}, S_{\text{deg}}, S_{\text{therm}}, S_{\text{grid}}, S_{\text{wait}}, S_{\text{cost}}, S_{\text{avail}}, S_{\text{fair}} \right]^T$$
- $S_{\text{batt}}$: Negative SOC deviation from target curve
- $S_{\text{deg}}$: Accelerated cell aging penalty
- $S_{\text{therm}}$: Thermal deviation toward $42^\circ\text{C}$ critical boundary
- $S_{\text{grid}}$: Substation peak coincident demand penalty
- $S_{\text{wait}}$: Additional trip delay penalty
- $S_{\text{cost}}$: Financial tariff expenditure penalty
- $S_{\text{avail}}$: Diminished reserve flexibility
- $S_{\text{fair}}$: Station-wide equity degradation

---

## 6. Zero Data Leakage Split & Normalization Protocol
1. **Partition Strategy**: 70% Train ($N=45,461$), 15% Validation ($N=9,742$), 15% Test ($N=9,742$).
2. **Strict Time-Series Order**: Partitioned chronologically across session IDs to ensure future charging sessions are never observed during historical training.
3. **Training-Only Statistics**: Mean ($\mu_{\text{train}}$) and standard deviation ($\sigma_{\text{train}}$) parameters are strictly calculated from the 70% training subset and exported to `models/accm_model/model_artifact.json`. Validation and test splits are transformed solely using these saved parameters.
