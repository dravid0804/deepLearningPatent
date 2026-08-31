// Patent Claims & 11 Real-World Patent Features (F1-F11) for ANT-EV 2.0
// Technical framing for patent publishing, academic defense, and evaluation

export interface PatentFeature {
  id: string; // F1 to F11
  name: string;
  simpleDefinition: string;
  operationalOutput: string;
  technicalNovelty: string;
  mathematicalBasis: string;
  usedModels: string[];
  claimReference: string;
}

export const PATENT_FEATURES: PatentFeature[] = [
  {
    id: "F1",
    name: "Predictive Energy Need Estimation",
    simpleDefinition: "Predicts how much energy the EV will actually need before the next departure/destination point rather than blindly honoring raw user input.",
    operationalOutput: "Predicted energy (kWh), duration (min), and departure-readiness probability curve.",
    technicalNovelty: "Decouples the raw operator charging request from the learned actual mobility deficit, eliminating over-allocation and unnecessary peak grid draw.",
    mathematicalBasis: "E_{req} = \\max(0, \\frac{\\text{SOC}_{dest} - \\text{SOC}_t}{100} \\cdot C_{nom} + d_{trip} \\cdot \\eta_{km} + \\Delta_{buf})",
    usedModels: ["M1 (ACN-Data Predictor)", "M5 (Mamba Sequence)"],
    claimReference: "Claim 1 & Claim 3"
  },
  {
    id: "F2",
    name: "Battery Lifetime Valuation Currency",
    simpleDefinition: "Converts the estimated battery-life degradation impact of a fast-charging choice into a comparable financial/penalty decision cost.",
    operationalOutput: "Battery lifetime cost ($/session) and dynamic safe power envelope (kW).",
    technicalNovelty: "Integrates electrochemical degradation (SEI layer growth, Arrhenius thermal stress) directly into the multi-agent objective function.",
    mathematicalBasis: "C_{deg} = C_{pack} \\cdot \\left(\\alpha \\cdot (I_{chg}/C_{nom})^{\\gamma} + \\beta \\cdot e^{\\frac{T_{bat} - T_{ref}}{\\kappa}}\\right) \\cdot \\Delta \\text{SOC}",
    usedModels: ["M3 (NASA SOH/RUL)", "M4 (Charging Stress Cost)"],
    claimReference: "Claim 1 & Claim 2"
  },
  {
    id: "F3",
    name: "Reciprocity Credit & Sacrifice Aging Ledger",
    simpleDefinition: "Rewards EVs that previously accepted cooperative charging delays and prevents indefinite priority hoarding through mathematical decay.",
    operationalOutput: "Fairness/reciprocity ledger balance with anti-monopoly half-life aging.",
    technicalNovelty: "Maintains game-theoretic cooperative equilibrium among autonomous agents without relying on central currency or exposing private travel schedules.",
    mathematicalBasis: "R_i(t+1) = R_i(t) \\cdot e^{-\\lambda \\Delta t} + \\gamma \\cdot \\Delta t_{sacrifice} - \\omega \\cdot \\text{PriorityUsage}",
    usedModels: ["PRISM-ANT Memory Engine", "M6 (RL Policy)"],
    claimReference: "Claim 1 & Claim 4"
  },
  {
    id: "F4",
    name: "Energy Reservation Window",
    simpleDefinition: "Reserves a future quantity and time window of energy rather than locking only a physical connector.",
    operationalOutput: "Flexible energy commitment deliverable dynamically across the dwell window.",
    technicalNovelty: "Enables stations to shuffle charge delivery across connected vehicles during renewable surges without violating driver departure deadlines.",
    mathematicalBasis: "\\int_{t_{arr}}^{t_{dep}} P_i(t) \\, dt = E_{target}, \\quad 0 \\le P_i(t) \\le P_{max}(T_{bat}(t))",
    usedModels: ["M1 (Session Predictor)", "M2 (Demand Forecast)"],
    claimReference: "Claim 5"
  },
  {
    id: "F5",
    name: "Grid Emergency Negotiation & V2G Curtailment",
    simpleDefinition: "During grid stress or transformer overload, coordinates the least-disruptive combination of delay, power throttling, and eligible V2G export.",
    operationalOutput: "Substation peak shaving and grid-safe coordinated load response.",
    technicalNovelty: "Replaces crude rolling blackouts with distributed multi-agent load modulation and bi-directional V2G energy injection.",
    mathematicalBasis: "\\sum_{i \\in S} P_{chg, i}(t) - \\sum_{j \\in V2G} P_{exp, j}(t) \\le P_{grid, limit}(t)",
    usedModels: ["M2 (Demand Forecast)", "M4 (Battery Stress)", "M6 (RL Policy)"],
    claimReference: "Claim 6 & Claim 7"
  },
  {
    id: "F6",
    name: "Multi-Agent Digital Twin Negotiation",
    simpleDefinition: "EV, station, battery, grid, and fleet digital twins exchange decision-relevant utility tokens and negotiate resource allocation.",
    operationalOutput: "Pareto-optimal coordinated charging assignments across all actors.",
    technicalNovelty: "Eliminates centralized single-point-of-failure optimization in favor of asynchronous digital-twin message exchange.",
    mathematicalBasis: "\\max \\sum_{i} U_{EV,i}(A_i) + U_{Station}(A) + U_{Grid}(A) \\quad \\text{s.t. Hard Constraints}",
    usedModels: ["M5 (Mamba State)", "M6 (Policy Network)"],
    claimReference: "Claim 1"
  },
  {
    id: "F7",
    name: "Cross-Network Resource Routing",
    simpleDefinition: "Evaluates eligible charging resources across multiple stations, workplace depots, and authorized private networks.",
    operationalOutput: "Optimal network-wide resource assignment rather than nearest queue only.",
    technicalNovelty: "Balances city-wide energy load by rerouting flexible EVs with travel-time compensation and guaranteed arrival reservation.",
    mathematicalBasis: "\\Delta U_{reroute} = \\text{WaitSaved}(S_2) - \\text{TravelTime}(S_1 \\to S_2) - \\text{CostDelta}",
    usedModels: ["M1 (Predictor)", "M2 (Demand Forecast)"],
    claimReference: "Claim 8"
  },
  {
    id: "F8",
    name: "Route-Aware Energy Negotiation (No-Charge Decision)",
    simpleDefinition: "Checks predicted trip energy and destination SOC to legitimately conclude when charging is unnecessary.",
    operationalOutput: "Formal 'NO_CHARGE_NEEDED' resolution saving queue slot and battery cycles.",
    technicalNovelty: "Autonomous agent possesses authority to decline charging when destination reachability is already mathematically guaranteed.",
    mathematicalBasis: "\\text{If } \\text{SOC}_t \\ge \\frac{E_{trip}(Route) \\cdot 1.25}{C_{nom}} \\cdot 100 \\implies \\text{Action} = \\text{NO\\_CHARGE}",
    usedModels: ["M1 (Energy Predictor)", "M3 (Battery SOH)"],
    claimReference: "Claim 3"
  },
  {
    id: "F9",
    name: "Contextual Emergency Priority",
    simpleDefinition: "Prioritizes emergency and critical service vehicles based on live operational mission needs rather than static unconditional flags.",
    operationalOutput: "Time-critical preemption with automated reciprocity compensation to yielded EVs.",
    technicalNovelty: "Enforces emergency preemption without exposing mission details or patient PII, strictly bounded by battery thermal physics.",
    mathematicalBasis: "\\text{Priority}_{EMERG} = \\omega_{crit} \\cdot \\frac{E_{deficit}}{\\text{TimeToScene}}, \\quad \\text{TempCheck} \\le 45^\\circ\\text{C}",
    usedModels: ["M6 (RL Policy)", "Safety Constraint Gate"],
    claimReference: "Claim 9"
  },
  {
    id: "F10",
    name: "Fleet Coordinated Dwell Negotiation",
    simpleDefinition: "Optimizes a commercial EV fleet as a coordinated group with depot-level readiness targets while respecting single-vehicle constraints.",
    operationalOutput: "Fleet readiness schedule satisfying 100% departure deadlines.",
    technicalNovelty: "Solves aggregate fleet mission readiness without uniform charging, staging power to match solar generation curves.",
    mathematicalBasis: "\\min \\sum_{k \\in Fleet} C_{deg,k} + \\text{PeakTariffPenalty} \\quad \\text{s.t. } \\text{Ready}(t=06:00) \\ge N_{target}",
    usedModels: ["M1", "M2", "M5", "M6"],
    claimReference: "Claim 10"
  },
  {
    id: "F11",
    name: "Continuous Closed-Loop Learning Feedback",
    simpleDefinition: "Compares predicted vs observed energy, duration, and battery metrics, logging residual errors for continuous model retraining.",
    operationalOutput: "Model drift detection, error monitoring logs, and self-improving prediction accuracy.",
    technicalNovelty: "Forms a closed-loop verification pipeline where real charging telemetry continuously refines neural state estimators.",
    mathematicalBasis: "\\epsilon_{MAE} = \\frac{1}{N} \\sum_{i=1}^N |y_{observed, i} - \\hat{y}_{predicted, i}| \\to \\text{Trigger Retrain if } \\epsilon > \\theta",
    usedModels: ["All Models M1–M6"],
    claimReference: "Claim 11 & Claim 12"
  }
];

export interface PatentClaim {
  claimNumber: number;
  type: 'INDEPENDENT' | 'DEPENDENT';
  dependsOn?: number;
  title: string;
  claimText: string;
  correspondingFeature: string;
}

export const PATENT_CLAIMS: PatentClaim[] = [
  {
    claimNumber: 1,
    type: 'INDEPENDENT',
    title: "System for Autonomous Multi-Agent EV Energy Negotiation with Deep-Learning State Predictions",
    claimText: "A computer-implemented system for autonomous electric vehicle (EV) charging negotiation, comprising: a digital-twin management subsystem configured to maintain real-time digital-twin states of a plurality of EVs, charging stations, battery packs, and power distribution grids; a deep-learning intelligence layer comprising a plurality of neural network models configured to generate predictive operating vectors including predicted energy requirements, future charging demand, battery state-of-health degradation, and battery lifetime cost indices; a multi-agent negotiation engine configured to receive privacy-preserving utility tokens and evaluate candidate charging actions across said digital-twin states; and a deterministic safety constraint subsystem configured to enforce hard battery thermal, electrical power envelope, and grid transformer capacity limits, wherein said multi-agent negotiation engine selects an explainable charging action strictly from candidates satisfying said hard limits.",
    correspondingFeature: "F1, F2, F6"
  },
  {
    claimNumber: 2,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Battery Lifetime Cost Valuation and Safe Power Enveloping",
    claimText: "The system of claim 1, wherein said deep-learning intelligence layer converts an estimated electrochemical degradation impact and temperature rise of a proposed fast-charging profile into a quantified battery lifetime cost index utilizing run-to-failure prognostics models, and dynamically restricts charging power within a safe power envelope when battery temperature exceeds a predefined thermal threshold.",
    correspondingFeature: "F2"
  },
  {
    claimNumber: 3,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Route-Aware Predictive Energy Need and No-Charge Determination",
    claimText: "The system of claim 1, wherein said deep-learning intelligence layer predicts actual destination energy consumption from trip distance and arrival state-of-charge, and wherein said multi-agent negotiation engine determines a 'no charge needed' action when current vehicle energy is sufficient for destination reachability, thereby eliminating unnecessary queue delay and grid draw.",
    correspondingFeature: "F1, F8"
  },
  {
    claimNumber: 4,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Privacy-Preserving Reciprocity Indexed Sacrifice Memory (PRISM)",
    claimText: "The system of claim 1, wherein said multi-agent negotiation engine maintains a reciprocity credit ledger that accumulates credits for electric vehicles accepting cooperative charging delays during high station congestion, and applies an exponential aging decay factor to prevent indefinite priority accumulation.",
    correspondingFeature: "F3"
  },
  {
    claimNumber: 5,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Flexible Energy Window Reservation",
    claimText: "The system of claim 1, wherein charging resources are reserved as a discrete quantity of energy within a temporal window spanning arrival to departure deadline, enabling dynamic power modulation across co-located vehicles without violating departure commitments.",
    correspondingFeature: "F4"
  },
  {
    claimNumber: 6,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Distributed Grid Emergency Negotiation and Load Shedding",
    claimText: "The system of claim 1, wherein upon detection of a grid high-load condition or substation constraint, the system autonomously coordinates power reduction and cooperative delays across non-critical connected vehicles while preserving mobility requirements for high-urgency vehicles.",
    correspondingFeature: "F5"
  },
  {
    claimNumber: 7,
    type: 'DEPENDENT',
    dependsOn: 6,
    title: "Eligible Vehicle-to-Grid (V2G) Energy Export and Credit Compensation",
    claimText: "The system of claim 6, wherein electric vehicles having state-of-charge above an export threshold are selected to deliver bi-directional energy to the grid, receiving elevated reciprocity credits and financial tariff rebates.",
    correspondingFeature: "F5"
  },
  {
    claimNumber: 8,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Cross-Network Multi-Station Rerouting",
    claimText: "The system of claim 1, wherein the negotiation engine evaluates alternative charging stations within driver travel tolerance, comparing forecasted queue delay against travel overhead to recommend cross-network station redirection.",
    correspondingFeature: "F7"
  },
  {
    claimNumber: 9,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Contextual Emergency Priority Overrides with Thermal Bounding",
    claimText: "The system of claim 1, wherein emergency service vehicles are granted contextual operational priority over standard queues, subject to hard battery thermal runaway limits, while yielding vehicles are automatically credited in the fairness ledger.",
    correspondingFeature: "F9"
  },
  {
    claimNumber: 10,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Fleet-Level Target Optimization with Individual Constraints",
    claimText: "The system of claim 1, wherein a fleet of commercial electric vehicles is coordinated against a fleet-level target departure deadline and aggregate energy deficit, scheduling vehicle charging to minimize peak power tariffs while satisfying 100% of individual delivery windows.",
    correspondingFeature: "F10"
  },
  {
    claimNumber: 11,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Closed-Loop Error Verification and Model Monitoring",
    claimText: "The system of claim 1, further comprising a closed-loop learning feedback subsystem that records observed charging energy, session duration, and battery states, computes residual errors against predictions, and triggers model retraining when drift exceeds threshold limits.",
    correspondingFeature: "F11"
  },
  {
    claimNumber: 12,
    type: 'DEPENDENT',
    dependsOn: 1,
    title: "Selective State-Space Sequence Modeling (Mamba) for Multi-Horizon Forecasting",
    claimText: "The system of claim 1, wherein temporal vehicle telemetry and station load sequences are modeled via a selective state-space neural sequence architecture to project multi-step future state trajectories and uncertainty intervals.",
    correspondingFeature: "F1, F6"
  }
];
