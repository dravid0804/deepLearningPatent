# ANT-EV 2.0 System Architecture Specification

## 1. High-Level Architectural Flowchart

ANT-EV 2.0 implements a continuous, closed-loop autonomous energy negotiation architecture:

```
                      +------------------------------------------+
                      |         EV Microgrid Hardware            |
                      |   (Bays, Inverters, Battery Cells, Grid) |
                      +------------------------------------------+
                                           |
                              Sensory Telemetry (1 Hz)
                                           v
                      +------------------------------------------+
                      |             EV Digital Twin              |
                      |   - State Estimation & Kalman Filter     |
                      |   - 60-step Temporal Window Buffer       |
                      |   - Topological Relational Graph Builder |
                      +------------------------------------------+
                                           |
                                  Schema EV-NET-2.0
                                           v
+-----------------------------------------------------------------------------------------+
|                  Action-Conditioned Consequence Model (ACCM)                            |
|                                                                                         |
|  +--------------------+  +--------------------+  +------------------+  +-------------+  |
|  |  Temporal Encoder  |  |   Graph Encoder    |  | Physics Residual |  | Negotiation |  |
|  |  (Mamba / S6 SSM)  |  |  (Relational GAT)  |  | (Electro-Thermal)|  | Context Enc |  |
|  |   Z_T in R^128     |  |    Z_G in R^128    |  |   Z_P in R^128   |  | Z_R in R^128|  |
|  +--------------------+  +--------------------+  +------------------+  +-------------+  |
|            \                       |                      |                  /          |
|             \                      |                      |                 /           |
|              +---------------------+----------------------+----------------+            |
|                                            |                                            |
|                                     Multi-Modal Fusion                                  |
|                                 Z_shared in R^256 (GELU/LN)                             |
|                                            |                                            |
|                 +--------------------------+--------------------------+                 |
|                 |                          |                          |                 |
|       Action Conditioning        Multi-Horizon Decoder      Sacrifice Vector Head       |
|       (7 Discrete Actions)       (5m, 10m, 15m, 30m, 60m)     (8-dim S_a in [0, 1]^8)   |
|                 |                          |                          |                 |
|                 +--------------------------+--------------------------+                 |
|                                            |                                            |
|                       Heteroscedastic Uncertainty Estimator                             |
|                               (Mean mu, Variance sigma^2)                               |
+-----------------------------------------------------------------------------------------+
                                             |
                         Consequence Matrix + Sacrifice Vector
                                             v
                      +------------------------------------------+
                      |                PRISM-ANT                 |
                      |    Reciprocity & Multi-Agent Negotiation  |
                      |                                          |
                      |   - Ledger: Historical Credits / Debits  |
                      |   - Game-Theoretic Concession Evaluator  |
                      |   - Gini Equity Balance Resolver         |
                      +------------------------------------------+
                                             |
                                  Candidate Action
                                             v
                      +------------------------------------------+
                      |        Deterministic Safety Gate         |
                      |   - Thermal interlock (T >= 42°C)        |
                      |   - Feeder rating clamp (Sum P <= P_max) |
                      |   - Overcharge / reverse flow interlock  |
                      +------------------------------------------+
                                             |
                                  Safe Actuation Directive
                                             v
                      +------------------------------------------+
                      |         EV Microgrid Hardware            |
                      |   (Bays, Inverters, Battery Cells, Grid) |
                      +------------------------------------------+
```

---

## 2. Directory Structure & Module Responsibilities

```text
EVSTATION_DEEP/
├── data/
│   ├── raw/                       # Original telemetry logs
│   ├── processed/                 # Cleaned, standardized tabular arrays
│   └── manifests/                 # JSON schema, units, split metadata
├── docs/                          # Academic and patent documentation
│   ├── ACCM_ARCHITECTURE.md       # Neural architecture deep dive
│   ├── ACCM_TRAINING.md           # Multi-stage training methodology
│   ├── DATA_SCHEMA.md             # Standardized feature schema
│   ├── COUNTERFACTUAL_LEARNING.md # Counterfactual simulation theory
│   ├── PRISM_ANT_INTEGRATION.md   # Coupling between ACCM & PRISM-ANT
│   ├── PATENT_CORE.md             # Patent claims and technical core
│   ├── EVALUATION.md              # Benchmarks, ablations, system tests
│   └── SYSTEM_ARCHITECTURE.md     # This document
├── ml/
│   └── accm/                      # Production PyTorch package
│       ├── __init__.py
│       ├── config.py              # Model and loss hyperparameters
│       ├── schemas.py             # Dataclass schemas for states and outputs
│       ├── temporal_encoder.py    # Selective State-Space (S6/Mamba)
│       ├── graph_encoder.py       # 2-layer Relational GAT
│       ├── physics_encoder.py     # Electro-thermal residual network
│       ├── negotiation_encoder.py # Reciprocity context encoder
│       ├── action_encoder.py      # Action embedding table
│       ├── consequence_decoder.py # Multi-horizon consequence predictor
│       ├── uncertainty.py         # Heteroscedastic Gaussian NLL head
│       ├── sacrifice.py           # 8-dim Action Sacrifice Vector generator
│       ├── losses.py              # Composite physics-aware multi-task loss
│       ├── counterfactual.py      # Counterfactual trajectory generator
│       ├── preprocessing.py       # Zero-leakage normalizer
│       ├── dataset.py             # PyTorch Dataset and DataLoader
│       ├── model.py               # Complete end-to-end ACCM network
│       ├── train.py               # Multi-stage training runner
│       ├── evaluate.py            # Comparative evaluation suite
│       └── tests/                 # Unit test suite
├── models/
│   └── accm_model/                # Model weights, artifacts, benchmarks
│       ├── accm_weights.pt        # Trained PyTorch state dict
│       ├── model_artifact.json    # Normalization stats & metadata
│       └── evaluation_results.json# Empirical benchmark records
├── src/
│   ├── components/                # React UI components
│   │   ├── tabs/
│   │   │   ├── PatentCore.tsx     # Patent core interactive explorer
│   │   │   ├── LiveConsequenceMatrix.tsx # Live candidate action matrix
│   │   │   ├── ResearchEvaluation.tsx    # Empirical research lab
│   │   │   └── ...
│   │   ├── FocusedWorkspace.tsx   # Live ACCM encoder telemetry banner
│   │   └── Navbar.tsx             # Modern research navigation bar
│   ├── services/
│   │   ├── models/
│   │   │   └── accmService.ts     # Client inference & evaluation adapter
│   │   └── engine/
│   │       └── accmPrismAdapter.ts# PRISM-ANT & safety gate coupling
│   └── types/
│       └── accm.ts                # TypeScript type definitions
└── README.md                      # Academic repository presentation
```

---

## 3. Technology Stack

### Deep Learning & Machine Learning
- **Framework**: PyTorch 2.14.0 (Python 3.13)
- **Mathematical Stack**: NumPy, SciPy, Pandas, Scikit-Learn
- **Core Neural Modules**: Selective State-Space (S6/Mamba), Relational Graph Attention Networks (GAT), Residual MLPs, Heteroscedastic Gaussian NLL

### Web Application & User Interface
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailored Modern Theme with Glassmorphism, Dark Mode, and CSS Transitions
- **Charts & Visualization**: Lucide React Icons, SVG Interactive Microgrid Topologies, Canvas-accelerated Matrix Rendering
