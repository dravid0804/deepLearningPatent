import React, { useState } from 'react';
import {
  GitBranch, ShieldCheck, Activity, Cpu, Scale, Lock, Zap,
  CheckCircle2, ArrowRight, ArrowDown, ChevronDown, ChevronUp,
  FileCheck, Layers, Award, AlertCircle, FileText, CornerDownLeft
} from 'lucide-react';

interface TechnicalFeature {
  number: string;
  title: string;
  summary: string;
  details: string[];
  patentFocus: string;
  equation?: string;
}

const TECHNICAL_FEATURES: TechnicalFeature[] = [
  {
    number: '01',
    title: 'Unified Multi-Modal State Representation',
    summary: 'Synthesizes time-series battery telemetry, station graph topology, and grid states into one coherent schema without information loss.',
    details: [
      'Ingests a 60-step temporal window (T=60) containing battery SOC, voltage, current, internal resistance, and core cell temperature.',
      'Constructs a 6-node relational graph capturing bay-level competition, transformer capacity limits, and local solar/wind availability.',
      'Replaces fragmented point-prediction pipelines with an integrated multi-modal state matrix.'
    ],
    patentFocus: 'Cross-domain state fusion uniting electrochemical battery dynamics with electrical distribution topology.'
  },
  {
    number: '02',
    title: 'Action-Conditioned Consequence Prediction',
    summary: 'Predicts the future consequences of candidate energy actions rather than just predicting passive system trajectories.',
    details: [
      'Conditions future state estimation on candidate actions a in [CHARGE_NOW_FAST, CHARGE_NOW_STANDARD, COOPERATIVE_DELAY, REDUCE_POWER, V2G_EXPORT].',
      'Enables the station controller to ask "What happens to battery degradation and grid stress if action a is chosen?" before committing.',
      'Learns an action-conditioned consequence operator F_theta(S_t, a) -> Y_{t+H}.'
    ],
    equation: 'Y_{t+H}^{(a)} = F_θ(S_t, a)  ∀ a ∈ A,  H ∈ {5m, 10m, 15m, 30m, 60m}',
    patentFocus: 'Forward simulation of discrete candidate energy actions prior to negotiation commitment.'
  },
  {
    number: '03',
    title: 'Multi-Horizon Future Consequence Modeling',
    summary: 'Forecasts system evolution across five operational time horizons simultaneously.',
    details: [
      'Simultaneously outputs physical states at 5, 10, 15, 30, and 60 minutes into the future.',
      'Short horizons (5m, 15m) capture steep Joule heating and sudden local substation congestion.',
      'Long horizons (30m, 60m) capture cumulative battery capacity degradation and trip departure readiness.'
    ],
    patentFocus: 'Multi-scale temporal consequence modeling providing both transient and cumulative impacts to negotiation.'
  },
  {
    number: '04',
    title: 'Learned Action-Specific Sacrifice Vector',
    summary: 'Synthesizes multi-dimensional physical impacts into a standardized 8-dimensional sacrifice vector consumed by PRISM-ANT.',
    details: [
      'Maps high-dimensional consequences into S_a = [battery, degradation, thermal, grid, waiting, cost, availability, fairness].',
      'Quantifies exactly what an EV driver or the power grid surrenders when selecting action a.',
      'PRISM-ANT reads this vector directly to calculate equitable reciprocity trades without touching raw neural weights.'
    ],
    equation: 'S_a = [S_batt, S_deg, S_therm, S_grid, S_wait, S_cost, S_avail, S_fair]^T ∈ [0, 1]^8',
    patentFocus: 'Standardized multi-attribute sacrifice representation linking predictive deep learning with game-theoretic negotiation.'
  },
  {
    number: '05',
    title: 'Physics-Aware Deep Learning Formulation',
    summary: 'Embeds first-principle electrochemical and electrical conservation laws directly into the neural loss function.',
    details: [
      'Enforces Ampere-hour conservation: SOC(t+1) ≈ SOC(t) + η P Δt / C_batt.',
      'Penalizes thermodynamically impossible cell cooling during 350 kW charging via Joule heating constraints.',
      'Strictly prohibits negative battery degradation via Arrhenius capacity fade loss penalties.'
    ],
    equation: 'L_total = L_NLL + λ_soc L_soc + λ_therm L_thermal + λ_deg L_degradation + λ_grid L_grid',
    patentFocus: 'Loss formulations enforcing electro-thermal battery physics and distribution transformer constraints.'
  },
  {
    number: '06',
    title: 'Heteroscedastic Predictive Uncertainty',
    summary: 'Outputs calibrated input-dependent predictive mean and variance for every continuous physical parameter.',
    details: [
      'Rather than outputting dangerous overconfident point estimates, ACCM models Gaussian probability distributions N(μ, σ²).',
      'During extreme grid transients or rare battery temperatures, high uncertainty flags conservative negotiation policies.',
      'Trained via Gaussian Negative Log-Likelihood (NLL) loss for reliable calibration.'
    ],
    patentFocus: 'State-dependent epistemic and aleatoric uncertainty estimation for autonomous high-voltage power switching.'
  },
  {
    number: '07',
    title: 'Counterfactual Action Trajectory Training',
    summary: 'Simulates unobserved alternative actions from historical state checkpoints to eliminate action selection bias.',
    details: [
      'Historical charging datasets predominantly record fast or standard charging, masking consequences of cooperative delay.',
      'A physics-grounded simulation layer synthesizes counterfactual futures for all 7 candidate actions.',
      'Ensures the model accurately learns consequence differentials between aggressive charging and cooperative concessions.'
    ],
    patentFocus: 'Counterfactual trajectory generation pipeline resolving observational bias in EV charging datasets.'
  },
  {
    number: '08',
    title: 'Independent Negotiation Coupling',
    summary: 'Strict architectural separation: ACCM predicts consequences, while PRISM-ANT independently negotiates.',
    details: [
      'The neural network NEVER determines the final winning action or overrides driver fairness credits.',
      'PRISM-ANT maintains an auditable exponential-decay reciprocity ledger to reward drivers who make concessions.',
      'Prevents the neural network from becoming an uninspectable black box by preserving transparent game-theoretic rules.'
    ],
    patentFocus: 'Decoupled intelligence-to-negotiation feedback loop separating predictive modeling from allocation governance.'
  },
  {
    number: '09',
    title: 'Deterministic Hard Safety & Physics Gate',
    summary: 'A non-bypassable safety barrier that unconditionally verifies and clamps power allocations prior to dispenser actuation.',
    details: [
      'Strict Thermal Guard: If battery temperature T_bat ≥ 42.0°C, fast charging is instantly blocked and throttled to ≤ 22 kW.',
      'Transformer Capacity Guard: The sum of dispenser draws cannot exceed local feeder rating: Σ P_i ≤ P_station,max.',
      'Hardware Fault Isolation: Ground fault and emergency disconnects are triggered independently of AI state.'
    ],
    patentFocus: 'Deterministic physical safety interlocking layer with absolute priority over deep learning and negotiation outputs.'
  },
  {
    number: '10',
    title: 'Closed-Loop Telemetry Feedback & Adaptation',
    summary: 'Continual observation of actual charging execution compared against predictions to track model drift and cell aging.',
    details: [
      'Compares real-time SOC and temperature telemetry against the 5m and 15m predicted consequence vectors.',
      'Calculates on-station prediction residual error to detect cell impedance growth or abnormal ambient weather shifts.',
      'Maintains a tamper-evident audit ledger for regulatory compliance, warranty tracking, and academic defense.'
    ],
    patentFocus: 'Closed-loop residual observation engine for continuous degradation tracking and on-station drift adaptation.'
  }
];

export const PatentCore: React.FC = () => {
  const [expandedFeature, setExpandedFeature] = useState<string | null>('02');
  const [selectedClaimNode, setSelectedClaimNode] = useState<string>('accm');
  const [activeTab, setActiveTab] = useState<'architecture' | 'features' | 'novelty' | 'claims'>('architecture');

  return (
    <div className="focused-page">
      {/* 1. Header Hero */}
      <section className="split-hero">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> PROPOSED PATENT ARCHITECTURE · INVENTIVE SPECIFICATION DISCLOSURE
          </p>
          <h1>Autonomous EV Energy Negotiation with Action-Conditioned Consequence Intelligence</h1>
          <p>
            A unified predictive intelligence layer (ACCM) supplies multi-horizon, action-specific consequence
            and sacrifice information to the independent PRISM-ANT negotiation engine, protected by a deterministic physical safety gate.
          </p>
        </div>
        <div className="split-total">
          <span>Disclosure Status</span>
          <strong>PATENT SPEC</strong>
          <small>10 Inventive Modules · Claims 1–12 Mapped</small>
        </div>
      </section>

      {/* 2. Top Summary Metrics Bar (Aligned with Visual Identity) */}
      <section className="split-summary">
        <div>
          <b>10 Modules</b>
          <span>Candidate inventive technical features</span>
        </div>
        <div>
          <b>5-Stage Pipeline</b>
          <span>Closed-loop decoupled architecture</span>
        </div>
        <div>
          <b>Claims 1–12</b>
          <span>Independent & dependent claims mapped</span>
        </div>
        <div>
          <b>Hard Gate</b>
          <span>Deterministic non-bypassable safety</span>
        </div>
      </section>

      {/* 3. Navigation Sub-Tabs (Clean Segmented Pill Container) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch size={14} /> Closed-Loop Architecture
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'features'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers size={14} /> 10 Technical Features
        </button>
        <button
          onClick={() => setActiveTab('novelty')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'novelty'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale size={14} /> Core Research Contribution
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'claims'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck size={14} /> Patent Claim Explorer
        </button>
      </div>

      {/* 4. Closed-Loop Architecture View */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="allocation-panel">
            <div className="panel-head mb-4">
              <div>
                <p className="eyebrow">DECOUPLED 5-STAGE CLOSED-LOOP PIPELINE</p>
                <h2>Prediction-to-Negotiation Closed-Loop System Architecture</h2>
              </div>
              <span className="safe-pill">
                <ShieldCheck size={14} /> Three Separated Responsibilities
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-6 -mt-2">
              The architecture establishes three non-overlapping layers: (1) Deep-Learning Predictive Forward Simulation (ACCM), 
              (2) Reciprocal Multi-Agent Negotiation (PRISM-ANT), and (3) Inviolable Hardware Physical Protection (Safety Gate).
            </p>

            {/* Perfectly Aligned 5-Stage Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
              {/* Stage 1: Digital Twin */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Stage 1</span>
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 grid place-items-center">
                      <Activity size={13} />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-2">Observation</h4>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">EV & Station Twin</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Collects 60-step temporal telemetry: battery SOC, voltage, current, cell temp, driver deadline, and site load.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-700 font-mono">
                  Output: <b>S_t</b> (Multi-Modal State Tensor)
                </div>
              </div>

              {/* Stage 2: ACCM */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border-2 border-blue-500 flex flex-col justify-between space-y-3 relative shadow-xs">
                <span className="absolute -top-2.5 right-2 bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  ACCM 1.23M
                </span>
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Stage 2</span>
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white grid place-items-center">
                      <Cpu size={13} />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-2">Prediction</h4>
                  <p className="text-[11px] font-semibold text-blue-900 mt-0.5">ACCM Neural Model</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Evaluates 7 actions across 5 horizons. Outputs physical consequences and the 8-dim Sacrifice Vector (S_a).
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-200 text-[10px] text-blue-900 font-mono font-bold">
                  Output: <b>S_a ∈ [0, 1]⁸</b>
                </div>
              </div>

              {/* Stage 3: PRISM-ANT */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Stage 3</span>
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 grid place-items-center">
                      <Scale size={13} />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-2">Negotiation</h4>
                  <p className="text-[11px] font-semibold text-purple-900 mt-0.5">PRISM-ANT Engine</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Reads S_a and balances it against driver credit ledgers. Allocates power based on historical concessions and equity.
                  </p>
                </div>
                <div className="pt-2 border-t border-purple-200 text-[10px] text-purple-900 font-mono">
                  Output: <b>P_proposed</b>
                </div>
              </div>

              {/* Stage 4: Deterministic Safety Gate */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 flex flex-col justify-between space-y-3 relative shadow-xs">
                <span className="absolute -top-2.5 right-2 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  Hard Barrier
                </span>
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Stage 4</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white grid place-items-center">
                      <Lock size={13} />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-2">Protection</h4>
                  <p className="text-[11px] font-semibold text-emerald-900 mt-0.5">Hardware Safety Gate</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Unconditionally clamps power if battery temp ≥ 42.0°C or if site transformer capacity (Σ P_i ≤ P_max) is breached.
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-900 font-mono font-bold">
                  Output: <b>P_safe (kW)</b>
                </div>
              </div>

              {/* Stage 5: Hardware Dispensers */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Stage 5</span>
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 grid place-items-center">
                      <Zap size={13} />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-2">Actuation</h4>
                  <p className="text-[11px] font-semibold text-amber-900 mt-0.5">Bay Dispensers</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Dispensers actuate verified power levels across bays. Actual energy delivered and thermal evolution are recorded.
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-200 text-[10px] text-amber-900 font-mono">
                  Output: <b>Power Delivery</b>
                </div>
              </div>
            </div>

            {/* Closed-Loop Sensory Feedback Channel */}
            <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <CornerDownLeft size={16} className="text-blue-600 flex-none" />
                <span>Closed-Loop Telemetry Return Loop:</span>
              </div>
              <span className="text-slate-600 text-[11px]">
                Actual charging telemetry (ΔSOC, Cell Temp, Grid Draw) feeds back into Stage 1 (Digital Twin) every 15 seconds to eliminate prediction drift.
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                Continuous Closed-Loop
              </span>
            </div>

            {/* Tripartite Separation Matrix */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">
                Tripartite Separation of Responsibilities (Patent Core Principle)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Layer 1 */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                    <Cpu size={14} className="text-blue-600" />
                    <span>Layer 1: ACCM Neural Model</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <p><b className="text-emerald-700">What it DOES:</b> Predicts consequences (SOC, temp, degradation, grid load) and outputs normalized sacrifice vector S_a with calibrated uncertainty.</p>
                    <p><b className="text-rose-700">What it NEVER DOES:</b> Never unilaterally awards power, never overrides fairness credits, never acts as an uninspectable decision black box.</p>
                  </div>
                </div>

                {/* Layer 2 */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                    <Scale size={14} className="text-purple-600" />
                    <span>Layer 2: PRISM-ANT Algorithm</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <p><b className="text-emerald-700">What it DOES:</b> Balances driver utility tokens, historical reciprocity concessions, and contractual fairness using transparent game-theoretic rules.</p>
                    <p><b className="text-rose-700">What it NEVER DOES:</b> Never computes physical electrochemical dynamics directly (relies on ACCM's physics-informed predictions).</p>
                  </div>
                </div>

                {/* Layer 3 */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                    <Lock size={14} className="text-emerald-600" />
                    <span>Layer 3: Deterministic Safety Gate</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <p><b className="text-emerald-700">What it DOES:</b> Intercepts all negotiated power proposals; unconditionally clamps power if T_bat ≥ 42.0°C or transformer capacity is exceeded.</p>
                    <p><b className="text-rose-700">What it NEVER DOES:</b> Cannot be bypassed by machine-learning outputs, optimization algorithms, or driver priority status.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. 10 Technical Features View */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="allocation-panel">
            <div className="panel-head mb-4">
              <div>
                <p className="eyebrow">RESEARCH DISCLOSURE MODULES</p>
                <h2>Ten Candidate Inventive Technical Features</h2>
              </div>
              <span className="safe-pill">
                <FileCheck size={14} /> Full Claim Support
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 -mt-2">
              Click each technical module to view formal mathematical formulations, operational details, and patent examination focus.
            </p>

            <div className="space-y-3">
              {TECHNICAL_FEATURES.map((feat) => {
                const isOpen = expandedFeature === feat.number;
                return (
                  <div key={feat.number} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all">
                    <button
                      onClick={() => setExpandedFeature(isOpen ? null : feat.number)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs grid place-items-center flex-none border border-blue-200">
                          {feat.number}
                        </span>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900">{feat.title}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">{feat.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden sm:inline">
                          Module {feat.number}
                        </span>
                        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-3 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block mb-1.5">Technical Implementation:</span>
                          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                            {feat.details.map((d, idx) => (
                              <li key={idx}>{d}</li>
                            ))}
                          </ul>
                        </div>

                        {feat.equation && (
                          <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-blue-900">
                            <span className="font-sans font-bold text-slate-500 block text-[10px] mb-1 uppercase tracking-wider">
                              Mathematical Formulation:
                            </span>
                            <code>{feat.equation}</code>
                          </div>
                        )}

                        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-blue-950 text-[11px]">
                          <strong className="block font-bold mb-0.5 text-blue-900">Patent Examination Focus:</strong>
                          <span>{feat.patentFocus}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Core Research Contribution View */}
      {activeTab === 'novelty' && (
        <div className="allocation-panel">
          <div className="panel-head mb-4">
            <div>
              <p className="eyebrow">DIFFERENTIATION FROM PRIOR ART</p>
              <h2>The Proposed Core Research & Patent Novelty</h2>
            </div>
            <span className="safe-pill">
              <Award size={14} /> Academic & Patent Novelty
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-5 -mt-2">
            Evaluation of traditional EV charging station management approaches versus the ANT-EV 2.0 tripartite architecture.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Prior Art 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                Prior Art 1: Black-Box RL
              </span>
              <h4 className="font-extrabold text-slate-900 text-xs">Pure Reinforcement Learning</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                A single deep neural network or RL policy directly outputs charging power or bay switching commands.
              </p>
              <div className="pt-2 border-t border-slate-200 text-rose-700 text-[11px] space-y-1">
                <p><b>Fatal Flaw 1:</b> Severe risk of battery thermal runaway during distribution transients.</p>
                <p><b>Fatal Flaw 2:</b> Zero explainability for contractual fleet agreements or warranty audits.</p>
              </div>
            </div>

            {/* Prior Art 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                Prior Art 2: Heuristic Queues
              </span>
              <h4 className="font-extrabold text-slate-900 text-xs">Static FIFO / Deadline Queues</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Deterministic rule-based scheduling based strictly on arrival time or earliest deadline first.
              </p>
              <div className="pt-2 border-t border-slate-200 text-amber-800 text-[11px] space-y-1">
                <p><b>Fatal Flaw 1:</b> Ignores multi-horizon physical battery wear and Joule heating consequences.</p>
                <p><b>Fatal Flaw 2:</b> Causes extreme transformer peak demand surcharges and grid stress.</p>
              </div>
            </div>

            {/* Inventive ANT-EV 2.0 */}
            <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/70 space-y-2 shadow-xs">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase">
                Inventive Solution
              </span>
              <h4 className="font-extrabold text-slate-900 text-xs">ANT-EV 2.0 Tripartite System</h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Decouples predictive forward simulation (ACCM) from game-theoretic reciprocity (PRISM-ANT), guarded by a deterministic physics gate.
              </p>
              <div className="pt-2 border-t border-blue-200 text-blue-950 text-[11px] space-y-1 font-medium">
                <p><b>Inventive Step 1:</b> Standardized Action Sacrifice Vector S_a bridges physics with game theory.</p>
                <p><b>Inventive Step 2:</b> Deterministic non-bypassable 42.0°C thermal barrier guarantees safety.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs">Statutory Patent Examination Defense (35 U.S.C. 101 / 102 / 103):</h4>
            <p>
              The invention does not claim an abstract mathematical formula or mere generic data sorting.
              Rather, it claims a specific, practical physical apparatus and method wherein physical sensor measurements
              are forward-simulated across multi-scale horizons to quantify hardware sacrifice, governing physical high-voltage power
              dispensers through an inviolable hardware interlock.
            </p>
          </div>
        </div>
      )}

      {/* 7. Patent Claim Explorer View */}
      {activeTab === 'claims' && (
        <div className="allocation-panel">
          <div className="panel-head mb-4">
            <div>
              <p className="eyebrow">CLAIMS 1–12 HIERARCHICAL MAPPING</p>
              <h2>Interactive Patent Claim Specification Explorer</h2>
            </div>
            <span className="safe-pill">
              <FileCheck size={14} /> Formatted Patent Claim Language
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4 -mt-2">
            Select an architectural component to inspect its formal patent claim mapping, input-output interfaces, and legal drafting text.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Component Selector List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Claim Architecture Tree
              </span>
              {[
                { id: 'accm', label: '01. ACCM Unified Model', claim: 'Independent Claim 1 & Claim 12' },
                { id: 'action', label: '02. Action Conditioning Layer', claim: 'Independent Claim 1 & Claim 5' },
                { id: 'consequence', label: '03. Multi-Horizon Decoder', claim: 'Dependent Claim 12' },
                { id: 'sacrifice', label: '04. Sacrifice Vector S_a', claim: 'Dependent Claims 2 & 4' },
                { id: 'prism', label: '05. PRISM-ANT Coupling', claim: 'Independent Claim 1, Claims 4 & 7' },
                { id: 'safety', label: '06. Deterministic Safety Gate', claim: 'Independent Claim 1, Claims 6 & 9' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedClaimNode(item.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedClaimNode === item.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedClaimNode === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.claim}
                  </div>
                </button>
              ))}
            </div>

            {/* Structured Details Inspector */}
            <div className="md:col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-4">
              {selectedClaimNode === 'accm' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Independent Claim 1 & Dependent Claim 12
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">1.23M Trained Parameters</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">Unified Action-Conditioned Consequence Model (ACCM)</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Input Signature:</b>
                      <p className="text-slate-600">60-step temporal telemetry window (T=60), 6-node station topology graph, electro-thermal sensor telemetry.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Neural Engine:</b>
                      <p className="text-slate-600">4 Selective State Space (SSM/Mamba) blocks, 2 Graph Attention (GAT) layers, physics-informed cross terms.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Output Signature:</b>
                      <p className="text-slate-600">5-horizon physical consequence forecasts and the 8-dim Action Sacrifice Vector S_a ∈ [0, 1]⁸.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Inventive Purpose:</b>
                      <p className="text-slate-600">Replaces 6 fragmented point-prediction models with a unified neural architecture, preventing conflicting recommendations.</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg font-mono text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-sans font-bold text-slate-500 block mb-1 uppercase tracking-wider">Formal Claim Language Draft:</span>
                    "1. A system for autonomous electric vehicle energy negotiation, comprising: a digital twin observer configured to obtain multi-modal time-series telemetry; a single deep neural network processor configured to forward-simulate candidate energy actions to produce a standardized action sacrifice vector; an independent negotiation engine configured to allocate energy based on historical reciprocity; and a hardware safety gate configured to unconditionally clamp actuation upon thermal breach."
                  </div>
                </div>
              )}

              {selectedClaimNode === 'action' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Independent Claim 1 & Dependent Claim 5
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Action Embedding Dim: 64</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">Action Conditioning Layer</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Input Signature:</b>
                      <p className="text-slate-600">Fused 256-dimensional latent state Z_shared and discrete candidate action index a ∈ [0..6].</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Neural Engine:</b>
                      <p className="text-slate-600">64-dimensional learnable action embedding table projected and concatenated with shared latent space.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Output Signature:</b>
                      <p className="text-slate-600">Action-conditioned latent representation feeding multi-horizon decoders.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Inventive Purpose:</b>
                      <p className="text-slate-600">Forward-simulates counterfactual 'what if' futures for candidate energy levels prior to negotiation commitment.</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg font-mono text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-sans font-bold text-slate-500 block mb-1 uppercase tracking-wider">Formal Claim Language Draft:</span>
                    "5. The system of claim 1, wherein the neural processor comprises an action-conditioning layer configured to forward-simulate counterfactual trajectories for unexecuted energy commands from historical checkpoints."
                  </div>
                </div>
              )}

              {selectedClaimNode === 'consequence' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Dependent Claim 12
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Horizons: 5m, 10m, 15m, 30m, 60m</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">Multi-Horizon Consequence Decoder</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Input Signature:</b>
                      <p className="text-slate-600">Conditioned latent vector Z_conditioned = [Z_shared; e_a].</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Neural Engine:</b>
                      <p className="text-slate-600">Horizon-specific multi-layer perceptron heads outputting Gaussian predictive mean and variance.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Output Signature:</b>
                      <p className="text-slate-600">11 physical state predictions with heteroscedastic uncertainty across 5 temporal scales.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Inventive Purpose:</b>
                      <p className="text-slate-600">Bridges short-term thermal safety (5m) with long-term cell cycle life preservation (60m).</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg font-mono text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-sans font-bold text-slate-500 block mb-1 uppercase tracking-wider">Formal Claim Language Draft:</span>
                    "12. The system of claim 1, wherein the consequence model simultaneously outputs physical state distributions across multiple discrete future horizons, capturing both transient thermal spikes and cumulative capacity degradation."
                  </div>
                </div>
              )}

              {selectedClaimNode === 'sacrifice' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Dependent Claims 2 & 4
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Dimension: 8 (Bounded [0, 1])</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">Action Sacrifice Vector Representation</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Input Signature:</b>
                      <p className="text-slate-600">Multi-horizon decoded physical consequence tensor Y_(t+H).</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Neural Engine:</b>
                      <p className="text-slate-600">Physics-grounded linear projection and normalization layer bounding impacts into [0, 1].</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Output Signature:</b>
                      <p className="text-slate-600">S_a = [battery, degradation, thermal, grid, waiting, cost, availability, fairness] ∈ [0, 1]⁸.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Inventive Purpose:</b>
                      <p className="text-slate-600">Translates complex electrochemical variables into a clean, game-theoretic currency consumed by negotiation.</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg font-mono text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-sans font-bold text-slate-500 block mb-1 uppercase tracking-wider">Formal Claim Language Draft:</span>
                    "4. The system of claim 1, wherein the action sacrifice vector standardizes electrochemical cell degradation, Joule thermal strain, and grid congestion into an 8-dimensional normalized trade-off representation."
                  </div>
                </div>
              )}

              {selectedClaimNode === 'prism' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Independent Claim 1, Claims 4 & 7
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Reciprocity Ledger</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">PRISM-ANT Reciprocity Negotiation Engine</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Input Signature:</b>
                      <p className="text-slate-600">Action Sacrifice Vector S_a, driver privacy utility tokens, and historical credit ledger.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Algorithmic Engine:</b>
                      <p className="text-slate-600">Game-theoretic concession evaluation, exponential credit decay, and Gini fairness equilibrium.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Output Signature:</b>
                      <p className="text-slate-600">Negotiated power command proposals for each charging bay.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Inventive Purpose:</b>
                      <p className="text-slate-600">Guarantees transparent, verifiable, and non-gameable multi-driver resource allocation.</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg font-mono text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-sans font-bold text-slate-500 block mb-1 uppercase tracking-wider">Formal Claim Language Draft:</span>
                    "7. The system of claim 1, wherein the negotiation engine maintains an auditable exponential-decay ledger rewarding cooperative energy concessions independently of neural weights."
                  </div>
                </div>
              )}

              {selectedClaimNode === 'safety' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Independent Claim 1, Claims 6 & 9
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Cutoff: 42.0°C / Feeder Cap</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">Deterministic Hard Safety & Physics Gate</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Input Signature:</b>
                      <p className="text-slate-600">Negotiated power command P_proposed and real-time physical sensor telemetry.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Safety Logic:</b>
                      <p className="text-slate-600">Non-bypassable hardware comparator: IF T_bat ≥ 42.0°C OR Σ P_i &gt; P_station,max THEN CLAMP.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Output Signature:</b>
                      <p className="text-slate-600">Verified safe actuation directive sent to charging bay hardware.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <b className="text-slate-800 block text-[10px] uppercase text-blue-600">Inventive Purpose:</b>
                      <p className="text-slate-600">Guarantees that machine-learning errors or driver priority requests cannot breach physical safety limits.</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg font-mono text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-sans font-bold text-slate-500 block mb-1 uppercase tracking-wider">Formal Claim Language Draft:</span>
                    "6. The system of claim 1, wherein the deterministic safety gate unconditionally throttles charging power to a safe maintenance level upon detecting battery cell temperature exceeding a predetermined threshold of 42.0°C."
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
