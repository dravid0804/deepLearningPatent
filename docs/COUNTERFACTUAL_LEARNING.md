# Counterfactual Action Learning in ACCM

## 1. The Observational Bias Dilemma in EV Charging Logs

Standard machine learning models trained on empirical EV charging records (such as Caltech ACN or utility telemetry) suffer from severe **observational selection bias**:

$$\mathcal{D}_{\text{obs}} = \left\{ \left(S_t^{(i)}, a_{\text{obs}}^{(i)}, Y_{t+H}^{(i)}\right) \right\}_{i=1}^N$$

In real charging station operations, historical logs exclusively record the action that *actually occurred* (predominantly `CHARGE_NOW_STANDARD` or `CHARGE_NOW_FAST`). 

### The Fundamental Problem
A naive model trained only on $\mathcal{D}_{\text{obs}}$ learns the observational joint distribution $P(Y \mid S, A)$, but cannot answer the core causal question demanded by autonomous energy negotiation:

> *"Given the current state $S_t$, what **would happen** to battery degradation, grid congestion, and trip delay if the EV instead agreed to `COOPERATIVE_DELAY` or `ELIGIBLE_V2G_EXPORT`?"*

Because historical drivers almost never voluntarily select cooperative delays without incentive, empirical logs contain virtually zero counterfactual trajectories for unselected actions.

---

## 2. Structural Causal Formulation

ACCM models the forward dynamics as an intervention distribution using Pearl's $do$-calculus:

$$P\left(Y_{t+H} \;\middle|\; S_t, \, do(A = a)\right) \quad \forall a \in \mathcal{A}$$

Where candidate action set $\mathcal{A}$ comprises:
1. `CHARGE_NOW_FAST` ($350\,\text{kW}$)
2. `CHARGE_NOW_STANDARD` ($75\,\text{kW}$)
3. `COOPERATIVE_DELAY` ($0\,\text{kW}$)
4. `REDUCE_POWER` ($25\,\text{kW}$)
5. `ENERGY_RESERVATION` (Scheduled slot)
6. `REDIRECT_STATION` (Alternate node)
7. `ELIGIBLE_V2G_EXPORT` ($-25\,\text{kW}$)

---

## 3. The Counterfactual Simulation Engine (`ml/accm/counterfactual.py`)

To supervise ACCM across all candidate actions without violating thermodynamics, ANT-EV 2.0 incorporates an electro-thermal physics simulation layer. 

Given an observational tuple $(S_t, a_{\text{obs}}, Y_{\text{obs}})$, the engine generates counterfactual trajectories $\tilde{Y}_{t+H}^{(a)}$ for all alternative actions $a \in \mathcal{A} \setminus \{a_{\text{obs}}\}$:

### 3.1 SOC Counterfactual Evolution
$$\Delta \text{SOC}_a(\Delta t) = \frac{\eta_c(P_a) \cdot P_a \cdot \Delta t}{C_{\text{batt}} \cdot 3600}$$
Where:
- $\eta_c(P) = 0.94$ for charging, $\eta_d(P) = 0.92$ for V2G discharge ($P < 0$).
- For `COOPERATIVE_DELAY`, $P_a = 0 \implies \Delta \text{SOC} = 0$.

### 3.2 Thermal Dissipation & Lumped-Capacitance Dynamics
$$\frac{dT_{\text{cell}}}{dt} = \frac{I_a^2 R_{\text{int}} - h_{\text{cool}} A (T_{\text{cell}} - T_{\text{amb}})}{m_{\text{pack}} c_p}$$
- High-power fast charging creates steep $I^2 R$ heat generation.
- Power reduction or cooperative delay triggers exponential Newton cooling toward $T_{\text{amb}}$.

### 3.3 Arrhenius Battery Degradation Dynamics
$$\Delta \text{Deg}_a(\Delta t) = A \cdot \exp\left(-\frac{E_a}{R T_{\text{cell}}}\right) \cdot \left(\frac{|I_a|}{C_{\text{nominal}}}\right)^z \cdot \Delta t$$
- Fast charging induces accelerated Solid Electrolyte Interphase (SEI) growth due to elevated temperature and high C-rate.
- V2G export introduces minor cycling fatigue, but mitigates grid stress.

---

## 4. Counterfactual Consistency Training

The ACCM network is trained with a multi-branch counterfactual loss:

$$\mathcal{L}_{\text{counterfactual}} = \frac{1}{|\mathcal{A}|} \sum_{a \in \mathcal{A}} \mathcal{L}_{\text{NLL}}\left( \hat{Y}^{(a)}, \tilde{Y}^{(a)} \right) + \lambda_{\text{mono}} \mathcal{L}_{\text{monotonicity}}$$

### Monotonicity Constraint
Physical laws require monotonicity across power actions for identical states:
$$P_a > P_b \implies \mathbb{E}[\text{SOC}_a] \ge \mathbb{E}[\text{SOC}_b] \quad \text{and} \quad \mathbb{E}[T_{\text{cell}, a}] \ge \mathbb{E}[T_{\text{cell}, b}]$$
Any violation of monotonicity triggers a quadratic penalty in $\mathcal{L}_{\text{mono}}$, guaranteeing that ACCM never predicts counter-intuitive thermodynamic outcomes during PRISM-ANT negotiation.
