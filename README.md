# ANT-EV 2.0: Deep-Learning-Enhanced Autonomous EV Energy Negotiation Network

**Patent Demonstration & Academic Defense Platform (Frontend Client-Side Application)**

---

## ⚡ Overview
**ANT-EV 2.0** is an autonomous electric vehicle charging coordination system designed for patent publishing, academic defense, and technical evaluation. It bridges:
1. **PRISM-ANT™ Core Engine** (Privacy-Preserving Reciprocity Indexed Sacrifice Memory for Autonomous Negotiation Twins)
2. **Deep Learning Intelligence Layer** (M1–M6 Predictive Models trained on Caltech ACN-Data and NASA Li-ion Prognostics)
3. **11 Real-World Operating Inventions** (Features F1 through F11)
4. **Deterministic Hard Safety & Physics Constraints Gate** (Guarantees zero battery thermal, electrical, or grid capacity violations)
5. **Auditable Decision Explainability (XAI)** (SHAP-style factor importance & tamper-evident decision logs)

---

## 🚀 How to Run

### Option 1: Development Server (Recommended)
```bash
npm install
npm run dev
```
Open the provided URL (e.g. `http://localhost:5173`) in any modern web browser.

### Option 2: Pre-Built Production Build
```bash
npm run build
npm run preview
```

### Option 3: Python Built-In HTTP Server (from `dist/` directory)
```bash
python -m http.server 8080 --directory dist
```
Navigate to `http://localhost:8080`.

---

## 🧭 Navigating the 8 Key Views
1. **Master Dashboard (`/dashboard`)**: Live city energy grid topology map with animated energy flows, active EV digital twin queue, grid load gauges, and real-time decision tickers.
2. **Digital Twin Graph (`/twins`)**: Multi-agent network showing EV Twins, Battery Twins, Station Twins, Grid Twin, and Fleet Twin with the Unified State Inspector and Privacy-Preserving Utility Token decoder.
3. **AI Prediction Center (`/ai-models`)**: Deep-dive laboratory for models M1 (Energy Predictor), M2 (Demand Forecaster), M3 (Battery Health/RUL), M4 (Degradation Cost), M5 (Mamba Sequence State), and M6 (RL Policy) with NASA & Caltech dataset provenance.
4. **PRISM-ANT Sandbox (`/negotiation`)**: 8-stage interactive decision pipeline with live parameter tuning sliders (Urgency, Battery Temp, Grid Load, Reciprocity Credits).
5. **11 Patent Features (`/patent-features`)**: Dedicated interactive showcases and mathematical formulations for Features F1 through F11.
6. **Scenario Lab (`/scenario-lab`)**: Step-by-step interactive player for the Section 16 Reference Benchmark (3 EVs at congested station with rising grid load).
7. **Explainability & XAI (`/explainability`)**: "Why This Action Won", SHAP waterfall feature contribution graphs, and patent audit certificate ledger.
8. **Analytics & Claims Matrix (`/analytics`)**: Benchmark comparison (FIFO vs PRISM-ANT 1.0 vs ANT-EV 2.0) and full legal Claims 1–12 matrix.

---

## 📜 Patent Framing
- **Classification**: G06Q 50/06, H02J 3/32, B60L 53/63
- **Primary Novelty**: Closed-loop interaction between predictive deep learning models, privacy-preserving digital-twin tokens, battery lifetime valuation, and deterministic physics safety gating.
