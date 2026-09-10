# PRISM-ANT & ACCM Integration Architecture

## 1. Architectural Separation Principle

A cardinal rule of the ANT-EV 2.0 system is the **strict separation of concerns** between predictive consequence modeling, multi-agent negotiation, and physical safety enforcement:

```
+-------------------------------------------------------------+
|                     EV Digital Twin                         |
|   (Cell Telemetry, Station Buffer, Grid Substation State)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                         ACCM                                |
|   Action-Conditioned Consequence & Sacrifice Model          |
|                                                             |
|   - Temporal S6 / Mamba State-Space Encoder (Z_T)           |
|   - Relational Graph Attention Network (Z_G)                |
|   - Electro-Thermal Physics Residual Encoder (Z_P)          |
|   - Action Conditioning & Heteroscedastic Uncertainty       |
|   - 8-Dimensional Action Sacrifice Vector Generator         |
+-------------------------------------------------------------+
                              |
        Multi-Horizon Consequence Matrix + Sacrifice Vector
                              |
                              v
+-------------------------------------------------------------+
|                       PRISM-ANT                             |
|   Autonomous Multi-Agent Reciprocity Negotiation Engine     |
|                                                             |
|   - Reciprocity Memory & Credit Ledger                      |
|   - Historical Sacrifice Tracking                           |
|   - Multi-Objective Utility Maximization                    |
|   - Gini Fairness Equilibrium Resolver                      |
+-------------------------------------------------------------+
                              |
                     Candidate Negotiated Action
                              |
                              v
+-------------------------------------------------------------+
|                 Deterministic Safety Gate                   |
|   - Hard Thermal Cutoff (T_cell >= 42°C -> Reduce Power)    |
|   - Transformer Feeder Capacity Clamp (Sum(P) <= P_limit)   |
|   - Battery Overcharge Interlock (SOC >= 1.0 -> Zero Power) |
+-------------------------------------------------------------+
                              |
                     Safe Executed Action
                              |
                              v
                  EV Microgrid Hardware Actuators
```

---

## 2. Why PRISM-ANT Must Remain Independent of Neural Networks

1. **Strategic Transparency & Auditability**: Deep neural networks are black-box function approximators. Legal agreements, billing tariffs, and multi-user resource allocations require deterministic game-theoretic guarantees. PRISM-ANT provides provable reciprocity equilibrium.
2. **Prevention of Hallucinatory Collusion**: An end-to-end reinforcement learning model can learn undesirable shortcuts (e.g., starving specific vehicle classes to optimize aggregate throughput). PRISM-ANT enforces explicit fairness policies via its credit ledger.
3. **Role Specialization**:
   - **ACCM**: *"What physical and network consequences will happen if action $a$ is selected?"* (Epistemic question)
   - **PRISM-ANT**: *"Given these predicted consequences, which action is equitable and honors historical reciprocity?"* (Normative game-theoretic question)

---

## 3. Data Interface Contract

### 3.1 Inference Request: `ACCM.predict_consequences`
```python
def predict_consequences(
    state: Dict[str, Any],
    candidate_actions: List[str]
) -> ACCMInferenceResponse:
    ...
```

### 3.2 Response Payload
```json
{
  "state_timestamp": "2026-09-10T22:58:00Z",
  "model_version": "ACCM-v2.0-Prod",
  "schema_version": "EV-NET-2.0",
  "mode": "pytorch_inference",
  "actions": [
    {
      "action": "CHARGE_NOW_FAST",
      "horizons": {
        "5m": { "soc": 0.52, "battery_temp_c": 38.2, "energy_delivered_kwh": 14.5, "degradation_pct": 0.008, "grid_load_mw": 26.4 },
        "15m": { "soc": 0.68, "battery_temp_c": 41.5, "energy_delivered_kwh": 38.2, "degradation_pct": 0.021, "grid_load_mw": 27.1 },
        "60m": { "soc": 0.94, "battery_temp_c": 44.8, "energy_delivered_kwh": 76.0, "degradation_pct": 0.052, "grid_load_mw": 25.8 }
      },
      "sacrifice_vector": {
        "battery": 0.08,
        "degradation": 0.82,
        "thermal": 0.89,
        "grid": 0.74,
        "waiting": 0.05,
        "energy": 0.78,
        "future_availability": 0.22,
        "fairness": 0.65
      },
      "uncertainty": {
        "mean_variance": 0.038,
        "confidence_score": 0.912
      }
    }
  ]
}
```

---

## 4. PRISM-ANT Decision Formulation

PRISM-ANT scores each candidate action using a multi-criteria utility function weighted by the EV's accumulated reciprocity balance $\mathcal{R}_i$:

$$U_i(a) = w_{\text{utility}} \cdot \Delta \text{SOC}_a - \sum_{k=1}^8 \omega_k \cdot S_{a, k} + \beta \cdot \mathcal{R}_i \cdot \mathbb{I}(S_{a, \text{wait}} > 0)$$

- If vehicle $i$ has high accumulated credit ($\mathcal{R}_i > 0$), PRISM-ANT assigns high priority to `CHARGE_NOW_FAST` or `CHARGE_NOW_STANDARD`.
- If vehicle $i$ has negative credit or during severe grid stress ($S_{\text{grid}} > 0.7$), PRISM-ANT negotiates `COOPERATIVE_DELAY` or `REDUCE_POWER`, awarding positive reciprocity tokens for future priority.

---

## 5. The Deterministic Safety Gate

Even if ACCM predicts a favorable outcome and PRISM-ANT negotiates a high-power charge, the **Deterministic Safety Gate** executes hard physical checks prior to hardware actuation:

```typescript
// Deterministic Safety Verification
if (predictedTemp >= 42.0 || currentTemp >= 41.0) {
  if (negotiatedAction === "CHARGE_NOW_FAST") {
    action = "REDUCE_POWER";
    safetyOverridden = true;
    overrideReason = "THERMAL_CLAMP_42C_EXCEEDED";
  }
}

if (totalStationPower + candidatePower > stationTransformerLimit) {
  action = "COOPERATIVE_DELAY";
  safetyOverridden = true;
  overrideReason = "TRANSFORMER_OVERLOAD_PREVENTED";
}
```
This multi-layered defense guarantees absolute electrical and thermal safety.
