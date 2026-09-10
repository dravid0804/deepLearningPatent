# ACCM Training Pipeline & Physics-Aware Optimization

## 1. Multi-Stage Training Methodology

ACCM is trained via a structured 5-stage progressive training regimen:

```text
Stage 1: Representation Pretraining
         Temporal SSM & Relational Graph Autoencoding on telemetry sequences.
                    │
                    v
Stage 2: Supervised Multi-Task Learning
         Joint prediction of SOC, temperature, SOH, degradation, station load, grid load.
                    │
                    v
Stage 3: Action-Conditioning Alignment
         (State, Action Embedding) → Consequence trajectory branch learning.
                    │
                    v
Stage 4: Counterfactual Trajectory Regularization
         Controlled simulation of alternative candidate actions to eliminate observational bias.
                    │
                    v
Stage 5: System-Level Export & Calibration
         Model checkpointing, weights export (.pt), and production JSON artifact generation.
```

---

## 2. Composite Multi-Task Loss Formulation

The objective function combines heteroscedastic uncertainty, task-specific errors, physical conservation laws, and action sacrifice alignment:

$$\mathcal{L} = \mathcal{L}_{\text{NLL}} + \lambda_{\text{soc}} \mathcal{L}_{\text{SOC}} + \lambda_{\text{th}} \mathcal{L}_{\text{thermal}} + \lambda_{\text{soh}} \mathcal{L}_{\text{SOH}} + \lambda_{\text{eng}} \mathcal{L}_{\text{energy}} + \lambda_{\text{grid}} \mathcal{L}_{\text{grid}} + \lambda_{\text{phys}} \mathcal{L}_{\text{physics}} + \lambda_{\text{sac}} \mathcal{L}_{\text{sacrifice}} + \lambda_{\text{cf}} \mathcal{L}_{\text{counterfactual}}$$

### 2.1 Heteroscedastic Negative Log-Likelihood (NLL)
For continuous target $y$ with predicted mean $\mu$ and log-variance $s = \log(\sigma^2)$:
$$\mathcal{L}_{\text{NLL}} = \frac{1}{2} \exp(-s) (y - \mu)^2 + \frac{1}{2} s$$

### 2.2 Physics Consistency Constraints ($\mathcal{L}_{\text{physics}}$)
1. **State of Charge (SOC) Conservation**:
   $$\Delta\text{SOC} \approx \frac{\eta \cdot P \cdot \Delta t}{C_{\text{nom}}} \times 100\%$$
   $$\mathcal{L}_{\text{SOC, phys}} = \text{ReLU}(\hat{\text{SOC}} - 100) + \text{ReLU}(-\hat{\text{SOC}}) + 0.1 \cdot \|\hat{\text{SOC}} - \text{SOC}_{\text{expected}}\|^2$$
2. **Energy Transfer Consistency**:
   $$\mathcal{L}_{\text{energy, phys}} = \text{Huber}\left(\hat{E}, P \cdot \Delta t\right)$$
3. **Monotonic Non-Negative Degradation**:
   Battery capacity cannot spontaneously recover during cycling:
   $$\mathcal{L}_{\text{deg, phys}} = \text{ReLU}(-\hat{\Delta\text{SOH}})$$
4. **Thermal Dissipation Boundary**:
   Severe penalty for cell temperatures exceeding physical cooling envelopes ($T_{\text{bat}} > 60^\circ\text{C}$).
5. **Station Feeder Capacity Bound**:
   $$\mathcal{L}_{\text{cap}} = \text{ReLU}\left(\hat{P}_{\text{station}} - P_{\text{station, max}}\right)$$

---

## 3. Loss Hyperparameters

| Hyperparameter | Value | Description |
|---|---|---|
| `lambda_future` | 1.00 | Base NLL consequence prediction weight |
| `lambda_soc` | 0.35 | State of Charge MSE loss weight |
| `lambda_thermal` | 0.40 | Battery cell core temperature Huber loss weight |
| `lambda_health` | 0.30 | State of Health (SOH) capacity loss weight |
| `lambda_energy` | 0.25 | Energy delivered (kWh) consistency weight |
| `lambda_grid` | 0.30 | Station and grid power draw loss weight |
| `lambda_physics` | 0.50 | Total physical conservation penalty weight |
| `lambda_sacrifice`| 0.30 | 8-dimensional sacrifice vector MSE weight |
| `lambda_counterfactual` | 0.20 | Counterfactual action branch alignment weight |

---

## 4. Empirical Training Execution

Trained on the ingested repository datasets (`ev_charging_dataset.csv`, 64,945 rows):
- **Optimizer**: AdamW ($\beta_1 = 0.9, \beta_2 = 0.999$, weight decay = $1\times 10^{-4}$)
- **Learning Rate**: $1\times 10^{-3}$ with gradient clipping ($\|\mathbf{g}\| \le 2.0$)
- **Batch Size**: 32 sequential windows (60 time steps each)
- **Epoch Progression**:
  - Epoch 1: Loss 3831.48 | NLL 82.70 | Physics 308.14 | Sacrifice 0.027
  - Epoch 2: Loss 3246.96 | NLL 19.97 | Physics 278.51 | Sacrifice 0.007
  - Epoch 3: Loss 2952.27 | NLL 14.18 | Physics 279.51 | Sacrifice 0.006
  - Epoch 4: Loss 2696.68 | NLL 11.89 | Physics 272.02 | Sacrifice 0.008
  - Epoch 5: Loss 2472.58 | NLL 10.99 | Physics 223.05 | Sacrifice 0.005
- **Outputs**:
  - PyTorch Checkpoint: `models/accm_model/accm_weights.pt`
  - Production Artifact: `models/accm_model/model_artifact.json`
