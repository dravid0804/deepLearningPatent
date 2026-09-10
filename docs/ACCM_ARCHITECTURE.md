# Action-Conditioned Consequence Model (ACCM) — Architecture Specification

## 1. Executive Overview

The **Action-Conditioned Consequence Model (ACCM)** is a unified multi-modal, multi-task, action-conditioned deep neural network designed to assist autonomous electric vehicle (EV) energy negotiation at charging stations.

Rather than running six disconnected regression/heuristic models (M1–M6), ACCM integrates sequence dynamics, station graph topology, electro-thermal physics, and negotiation context into a single joint latent representation ($Z_{\text{shared}} \in \mathbb{R}^{256}$). It then conditions on discrete and parameterized candidate actions $a \in \mathcal{A}$ to decode multi-horizon physical and economic consequences accompanied by heteroscedastic uncertainty ($\mu, \sigma$) and an 8-dimensional action sacrifice vector ($\vec{S}_a \in [0, 1]^8$).

```text
EV State Telemetry (t-59 .. t) ────┐
Station & Charger Graph Topology ──┼──> [ACCM State Encoders] ──> Z_shared (256-dim)
Electro-Thermal Physics State ─────┤                                   │
Negotiation & Fairness Context ────┘                                   │
                                                                       v
Candidate Action a ∈ A ───────────────────────────────────────────> [Conditioning]
                                                                       │
                                                                       v
                                                      [Multi-Horizon Consequence Decoder]
                                                                       │
                                      ┌────────────────────────────────┴──────────────────────────────┐
                                      v                                                               v
                      Consequence Matrix (5 horizons x 11 targets)                   Action Sacrifice Vector S_a
                      [SOC, Temp, SOH, Energy, Grid Load, Wait, ...]                 [bat, deg, th, grid, wait, eng, ...]
```

---

## 2. Encoder Modules

### 2.1 Temporal SSM Encoder ($Z_T \in \mathbb{R}^{128}$)
- **Architecture**: Selective State Space (S6 / Mamba-inspired).
- **Input**: Window of 60 historical discrete time steps $\times$ 16 telemetry channels (SOC, intake power, pack temperature, station draw, grid load, queue dwell, SOH, current, voltage).
- **Processing**:
  1. Linear projection $\mathbb{R}^{16} \to \mathbb{R}^{128}$ followed by LayerNorm.
  2. 4 stacked Selective State Space blocks with input-dependent parameter discretization ($\Delta, B, C$) and diagonal state matrix $A$ ($d_{\text{state}} = 16$).
  3. Depthwise 1D sequence convolutions with SiLU gating.
  4. Attention-weighted temporal pooling over the 60-step horizon.
- **Complexity**: $\mathcal{O}(L)$ linear time in sequence length $L$, compared to quadratic $\mathcal{O}(L^2)$ in standard Transformers, enabling 3.4ms on-station execution.

### 2.2 Relational Graph Encoder ($Z_G \in \mathbb{R}^{128}$)
- **Architecture**: 2-layer Relational Multi-Head Graph Attention Network (GAT).
- **Node Types (6)**: EV, Battery Pack, Charger Dispenser, Station Bus, Electrical Grid Feeder, Local Renewable (Solar/BESS).
- **Edge Types**: Energy flow, physical coupling, feeder competition, and renewable routing.
- **Processing**:
  1. Learnable node type embeddings fused with continuous node features ($d = 16$).
  2. 2 stacked Multi-Head Graph Attention layers ($H = 4$ heads) with LeakyReLU attention logits masked by physical topology.
  3. Global attention pooling across graph nodes yielding $Z_G \in \mathbb{R}^{128}$.

### 2.3 Physics-Aware Electro-Thermal Encoder ($Z_P \in \mathbb{R}^{128}$)
- **Input**: 9 physical state variables (SOC, capacity $C_{\text{nom}}$, power $P$, current $I$, voltage $V$, temperature $T_{\text{bat}}$, internal resistance $R_{\text{int}}$, SOH, degradation state).
- **Explicit Cross-Terms**:
  - Electrical power consistency: $P_{\text{VI}} = V \cdot I$
  - Joule heating dissipation: $P_{\text{Joule}} = I^2 \cdot R_{\text{int}}$
  - Effective C-rate: $C_{\text{rate}} = P / C_{\text{nom}}$
  - Thermal excess above reference: $\Delta T = \max(0, T_{\text{bat}} - 25.0^\circ\text{C})$
- **Processing**: 2-stage MLP with residual highway connections and LayerNorm producing $Z_P \in \mathbb{R}^{128}$.

### 2.4 Negotiation Context Encoder ($Z_R \in \mathbb{R}^{128}$)
- **Purpose**: Provides historical fairness and reciprocity context *without* executing negotiation logic.
- **Input**: Reciprocity credit balance, historical sacrifice minutes, priority count, interaction count, fairness state, previous discrete action embedding ($d = 16$).
- **Output**: $Z_R \in \mathbb{R}^{128}$.

---

## 3. Latent Fusion & Action Conditioning

The four encoder representations are concatenated and projected into a shared 256-dimensional latent space:
$$Z_{\text{shared}} = \text{LayerNorm}\left(\text{Linear}_{512 \to 256}([Z_T; Z_G; Z_P; Z_R])\right)$$

### Action Vocabulary ($\mathcal{A}$, 7 Actions):
1. `CHARGE_NOW_FAST`: Immediate maximum dispenser power.
2. `CHARGE_NOW_STANDARD`: Moderate power preserving cell health and feeder headroom.
3. `COOPERATIVE_DELAY`: Concession of 15m dwell to accommodate high-urgency vehicles.
4. `REDUCE_POWER`: Throttled intake avoiding station transformer surcharges.
5. `ENERGY_RESERVATION`: Guaranteed delivery window reserved for departure deadline.
6. `REDIRECT_STATION`: Automated cross-station referral with incentive balance.
7. `ELIGIBLE_V2G_EXPORT`: Vehicle-to-grid power export compensating grid peak stress.

Action embedding $E_A \in \mathbb{R}^{64}$ is concatenated with $Z_{\text{shared}}$ ($320\text{-dim}$) to condition the consequence decoders.

---

## 4. Multi-Horizon Consequence Decoder

Decodes future consequences across 5 synchronized horizons: **5 min, 10 min, 15 min, 30 min, and 60 min**.

Each horizon outputs 11 physical & economic consequence metrics:
1. `soc`: State of charge (%)
2. `energy_delivered_kwh`: Cumulative energy transfer (kWh)
3. `battery_temp_c`: Cell core temperature (°C)
4. `soh`: State of health (%)
5. `degradation_rate_pct`: Incremental capacity degradation (%)
6. `charging_duration_min`: Elapsed active duration (min)
7. `station_load_kw`: Total aggregate station power draw (kW)
8. `grid_load_pct`: Feeder transformer capacity utilization (%)
9. `electricity_cost_usd`: Cumulative tariff cost ($)
10. `waiting_time_min`: Driver dwell delay (min)
11. `renewable_utilization`: Solar/clean energy fraction (0 - 1)

---

## 5. Heteroscedastic Uncertainty & Sacrifice Vector

- **Aleatoric Uncertainty**: Each consequence metric outputs mean $\mu$ and log-variance $s = \log(\sigma^2)$.
- **Confidence Calibration**:
  $$\text{Confidence} = \text{clamp}\left( \frac{100}{1 + 0.18 \cdot \sigma_{\text{mean}}}, 10\%, 99\% \right)$$
- **Action Sacrifice Vector ($\vec{S}_a \in [0, 1]^8$)**:
  $$\vec{S}_a = [s_{\text{bat}}, s_{\text{deg}}, s_{\text{th}}, s_{\text{grid}}, s_{\text{wait}}, s_{\text{eng}}, s_{\text{avail}}, s_{\text{fair}}]^T$$
  Bounded by sigmoid activation, this vector acts as the exact currency consumed by PRISM-ANT for fair energy distribution.
