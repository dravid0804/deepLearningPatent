import React, { useState } from 'react';
import {
  ShieldCheck, Cpu, ArrowRight, Activity, GitBranch, Layers, Scale,
  Flame, BatteryCharging, Clock, AlertTriangle, ChevronDown, ChevronUp,
  FileCheck, HelpCircle, CheckCircle2, Lock, Zap
} from 'lucide-react';

interface FeatureCardProps {
  number: string;
  title: string;
  summary: string;
  details: string[];
  equation?: string;
  patentFocus: string;
}

const TECHNICAL_FEATURES: FeatureCardProps[] = [
  {
    number: '01',
    title: 'Unified Multi-Modal State Representation',
    summary: 'Replaces six isolated heuristic models with a joint embedding space capturing temporal dynamics, spatial topology, and physics.',
    details: [
      'Ingests continuous 60-minute historical telemetry sequence, station-grid graph topology, and electro-thermal state.',
      'Prevents information fragmentation across separate regressors and unifies EV, battery, station, and grid features.',
      'Produces a 256-dimensional shared latent state vector Z_shared preserving relational provenance.'
    ],
    patentFocus: 'Single multi-modal state embedding eliminating error propagation between disparate predictors.'
  },
  {
    number: '02',
    title: 'Action-Conditioned Consequence Prediction',
    summary: 'Evaluates candidate actions individually to answer "What happens if action A is chosen?" rather than predicting a single passive trajectory.',
    details: [
      'Projects 7 discrete candidate actions (FAST, STANDARD, DELAY, REDUCE, RESERVE, REDIRECT, V2G) into learnable embedding space E_A.',
      'Fuses Z_shared with E_A before decoding to calculate counterfactual future branches.',
      'Enables active decision exploration without committing hardware or risking physical station overload.'
    ],
    equation: 'F_θ(S_t, a_k) → { Y_{t+h}(a_k), \vec{S}(a_k), \vec{\sigma}(a_k) }',
    patentFocus: 'Action-conditioned branching prediction coupling discrete negotiation proposals with physical response manifolds.'
  },
  {
    number: '03',
    title: 'Multi-Horizon Future Consequence Modeling',
    summary: 'Predicts consequence trajectories across five synchronized temporal horizons (5m, 10m, 15m, 30m, 60m).',
    details: [
      'Decodes 11 simultaneous physical and economic variables at each horizon.',
      'Enables PRISM-ANT to anticipate downstream congestion 30 to 60 minutes before queue saturation occurs.',
      'Allows cooperative delay actions to be scheduled during low-tariff, high-renewable solar windows.'
    ],
    patentFocus: 'Multi-step synchronous trajectory forecasting covering immediate thermal shocks and long-term grid peaks.'
  },
  {
    number: '04',
    title: 'Learned Action-Specific Sacrifice Representation',
    summary: 'Maps complex multi-dimensional physical stress into a normalized 8-attribute sacrifice vector consumed by negotiation logic.',
    details: [
      'Predicts components: [battery, degradation, thermal, grid, waiting, energy, future_availability, fairness].',
      'Transforms raw physical telemetry into an economic and utility exchange currency.',
      'Enables peer-to-peer cooperative trade-offs without revealing raw driver telemetry or battery specs.'
    ],
    equation: '\\vec{S}_a = [s_{\\text{bat}}, s_{\\text{deg}}, s_{\\text{th}}, s_{\\text{grid}}, s_{\\text{wait}}, s_{\\text{eng}}, s_{\\text{avail}}, s_{\\text{fair}}]^T \\in [0, 1]^8',
    patentFocus: 'Vectorized action sacrifice currency bridging deep-learning consequence models with game-theoretic negotiation.'
  },
  {
    number: '05',
    title: 'Physics-Aware Deep Learning Constraints',
    summary: 'Hardwires physical conservation laws and Arrhenius thermal degradation directly into the neural loss function.',
    details: [
      'Enforces state-of-charge conservation: ΔSOC ≈ (η · P · Δt) / C_pack during all training epochs.',
      'Penalizes physically implausible spontaneous thermal drops and negative battery degradation.',
      'Constrains transformer power allocations to maximum feeder capacity limits.'
    ],
    equation: '\\mathcal{L}_{\\text{physics}} = \\lambda_{\\text{soc}} \\mathcal{L}_{\\text{SOC}} + \\lambda_{\\text{th}} \\mathcal{L}_{\\text{thermal}} + \\lambda_{\\text{deg}} \\mathcal{L}_{\\text{deg}}',
    patentFocus: 'Electro-thermal and energy conservation penalty terms preventing physically impossible model hallucinations.'
  },
  {
    number: '06',
    title: 'Heteroscedastic Predictive Uncertainty',
    summary: 'Outputs predictive distribution parameters (mean μ and log-variance log σ²) to quantify risk for every candidate action.',
    details: [
      'Trained via Gaussian Negative Log-Likelihood (NLL) to capture data noise and model confidence.',
      'Computes calibrated confidence percentage scores (e.g. 94% confidence at 5m, 81% at 60m).',
      'Allows PRISM-ANT to apply risk-averse allocation margins when high uncertainty is detected.'
    ],
    equation: '\\mathcal{L}_{\\text{NLL}} = \\frac{1}{2} \\exp(-s) (y - \\mu)^2 + \\frac{1}{2} s, \\quad s = \\log(\\sigma^2)',
    patentFocus: 'Aleatoric uncertainty estimation enabling confidence-weighted priority scoring during negotiation.'
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
    patentFocus: 'Counterfactual trajectory generation pipeline resolving observational bias in observational EV datasets.'
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
      'Strict Thermal Guard: If battery temperature T_bat ≥ 42.0°C, fast charging is instantly blocked and throttled to ≤ 25 kW.',
      'Transformer Capacity Guard: The sum of dispenser draws cannot exceed local feeder rating: Σ P_i ≤ P_station,max.',
      'Hardware Fault Isolation: Ground fault and OCPP disconnect immediately isolated independently of AI state.'
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
  const [activeTab, setActiveTab] = useState<'architecture' | 'features' | 'claims' | 'novelty'>('architecture');

  return (
    <div className="focused-page">
      {/* Hero Section */}
      <section className="split-hero">
        <div>
          <p className="eyebrow"><span className="live-dot" /> PROPOSED PATENT ARCHITECTURE · CANDIDATE INVENTIVE CORE</p>
          <h1>Autonomous EV Energy Negotiation with Action-Conditioned Consequence Intelligence</h1>
          <p>
            A unified predictive intelligence layer (ACCM) supplies multi-horizon, action-specific consequence
            and sacrifice information to the independent PRISM-ANT negotiation engine, protected by a deterministic physical safety gate.
          </p>
        </div>
        <div className="split-total">
          <span>System Status</span>
          <strong>PATENT CORE</strong>
          <small>10 Technical Features · Claims 1–12 Mapped</small>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'architecture' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
        >
          <GitBranch className="inline-block mr-1.5 w-3.5 h-3.5" /> Closed-Loop Architecture
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'features' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
        >
          <Layers className="inline-block mr-1.5 w-3.5 h-3.5" /> 10 Technical Features
        </button>
        <button
          onClick={() => setActiveTab('novelty')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'novelty' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
        >
          <Scale className="inline-block mr-1.5 w-3.5 h-3.5" /> Core Research Contribution
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'claims' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
        >
          <FileCheck className="inline-block mr-1.5 w-3.5 h-3.5" /> Patent Claim Explorer
        </button>
      </div>

      {/* 1. Closed-Loop Architecture Visual */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="algorithm-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="eyebrow">INTERACTIVE SYSTEM FLOW</p>
                <h2 className="text-xl font-extrabold text-slate-900">Decoupled Prediction-to-Negotiation Feedback Architecture</h2>
              </div>
              <span className="safe-pill"><ShieldCheck size={16} /> Three Separated Responsibilities</span>
            </div>

            {/* Interactive Architecture Flowchart */}
            <div className="py-6 px-2 overflow-x-auto">
              <div className="min-w-[850px] grid grid-cols-5 gap-3 items-center">
                {/* Stage 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-blue-100 text-blue-600 grid place-items-center mb-2">
                    <Activity size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Step 1 · Observation</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-1">EV Digital Twin</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Telemetry, SOC, Temp, SOH, Queue Dwell, Route</p>
                </div>

                <div className="text-center text-slate-400 font-bold">
                  <ArrowRight className="mx-auto" size={20} />
                  <span className="text-[9px] uppercase tracking-wider block mt-1">State Vector S_t</span>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-500 text-center relative shadow-sm">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    UNIFIED AI
                  </span>
                  <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 text-white grid place-items-center mb-2 shadow">
                    <Cpu size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Step 2 · Prediction</span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">ACCM Model</h4>
                  <p className="text-[11px] text-slate-600 mt-1">Temporal SSM + Graph + Physics + Action Conditioning</p>
                </div>

                <div className="text-center text-slate-400 font-bold">
                  <ArrowRight className="mx-auto" size={20} />
                  <span className="text-[9px] uppercase tracking-wider block mt-1">Consequence & \vec{`{S}`}_a</span>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-purple-100 text-purple-700 grid place-items-center mb-2">
                    <Scale size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Step 3 · Negotiation</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-1">PRISM-ANT Engine</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Reciprocity Memory Ledger + Priority Water-Filling</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-5 gap-3 items-center">
                <div className="col-start-3 text-center text-slate-400 font-bold">
                  <ArrowRight className="mx-auto rotate-90" size={20} />
                  <span className="text-[9px] uppercase tracking-wider block mt-1">Negotiated Action Proposal</span>
                </div>
              </div>

              <div className="min-w-[850px] grid grid-cols-5 gap-3 items-center">
                <div className="col-start-2 col-span-3 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-center relative shadow-sm">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    NON-BYPASSABLE
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white grid place-items-center shadow">
                      <Lock size={18} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-900 text-sm">Deterministic Hard Safety & Physics Gate</h4>
                      <p className="text-[11px] text-slate-600">
                        Thermal Guard (T_bat &lt; 42.0°C) · Transformer Cap (Σ P_i ≤ P_max) · Feeder Overload Protection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-slate-400 font-bold">
                  <ArrowRight className="mx-auto" size={20} />
                  <span className="text-[9px] uppercase tracking-wider block mt-1">Safe Power Command</span>
                </div>

                {/* Stage 5 */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-amber-100 text-amber-700 grid place-items-center mb-2">
                    <Zap size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Step 4 · Actuation</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-1">Dispenser Hardware</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Power delivery to vehicle; feedback loops to Step 1.</p>
                </div>
              </div>
            </div>

            {/* Core Architectural Rule Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs leading-relaxed mt-4">
              <strong className="text-blue-900 block font-bold mb-1">Mandatory Architectural Principle:</strong>
              <p>
                The neural network (ACCM) does <strong>not</strong> decide the charging rate or select the winning EV.
                Instead, ACCM predicts the consequences and sacrifice for each candidate action.
                The independent algorithm (PRISM-ANT) evaluates these sacrifices using reciprocity memory to determine fairness.
                Finally, a deterministic safety gate ensures that no machine-learning error or negotiation proposal can violate physical battery or grid bounds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 10 Technical Features Section */}
      {activeTab === 'features' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm mb-4">
            <p className="eyebrow">RESEARCH DISCLOSURE MODULES</p>
            <h2 className="text-xl font-extrabold text-slate-900">Ten Candidate Inventive Technical Modules</h2>
            <p className="text-xs text-slate-500 mt-1">Click on each module to view mathematical formulations, technical details, and patent focus.</p>
          </div>

          <div className="space-y-3">
            {TECHNICAL_FEATURES.map((feat) => {
              const isOpen = expandedFeature === feat.number;
              return (
                <div key={feat.number} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={() => setExpandedFeature(isOpen ? null : feat.number)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm grid place-items-center flex-none border border-blue-200">
                        {feat.number}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{feat.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{feat.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Module {feat.number}</span>
                      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1.5">Technical Implementation:</span>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                          {feat.details.map((d, idx) => (
                            <li key={idx}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      {feat.equation && (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-blue-900">
                          <span className="font-sans font-bold text-slate-500 block text-[10px] mb-1">Mathematical Formulation:</span>
                          <code>{feat.equation}</code>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-lg text-blue-900">
                        <strong className="block font-bold mb-0.5">Patent Examination Focus:</strong>
                        <span>{feat.patentFocus}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Core Research Contribution Section */}
      {activeTab === 'novelty' && (
        <div className="space-y-6">
          <div className="algorithm-card">
            <p className="eyebrow">DIFFERENTIATION FROM PRIOR ART</p>
            <h2 className="text-xl font-extrabold text-slate-900 mb-3">The Proposed Core Research Contribution</h2>
            
            <div className="prose text-xs text-slate-600 leading-relaxed space-y-3">
              <p>
                Traditional EV energy management systems attempt one of two extremes:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>
                  <strong>Direct Reinforcement Learning / End-to-End Black Box:</strong> A neural network directly outputs charging power or dispenser assignment. 
                  This suffers from fatal drawbacks: lack of explainability, catastrophic failure during battery thermal runaway, and complete inability to guarantee fairness or contractual driver agreements.
                </li>
                <li>
                  <strong>Static Heuristic Priority Queues (FIFO / Earliest Deadline First):</strong> Rule-based systems that ignore multi-horizon consequence dynamics, 
                  leading to severe battery thermal degradation, transformer peak surcharge spikes, and driver dissatisfaction.
                </li>
              </ol>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 my-4 text-slate-800">
                <h4 className="font-extrabold text-blue-950 text-sm mb-1">The ANT-EV 2.0 Architectural Breakthrough:</h4>
                <p>
                  The proposed architecture cleanly separates <strong>consequence prediction</strong> from <strong>negotiation governance</strong>.
                  ACCM predicts what <em>would happen</em> under all candidate actions across multiple horizons (5m, 10m, 15m, 30m, 60m), 
                  including electrochemical battery wear and grid stress with calibrated uncertainty.
                  PRISM-ANT independently takes these predicted consequence vectors and determines the fair, reciprocity-based allocation.
                  Finally, a non-bypassable deterministic safety gate guarantees strict physical safety.
                </p>
              </div>

              <p>
                This tripartite separation (Prediction Intelligence → Game-Theoretic Negotiation → Deterministic Physics Barrier) 
                is the precise technical relationship highlighted for publication and patent disclosure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Patent Claim Explorer */}
      {activeTab === 'claims' && (
        <div className="algorithm-card">
          <p className="eyebrow">CLAIMS 1–12 HIERARCHICAL MAPPING</p>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Interactive Patent Claim Explorer</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Component Tree */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">System Components</span>
              {[
                { id: 'accm', label: '01. ACCM Unified Model', claim: 'Claim 1 & Claim 12' },
                { id: 'action', label: '02. Action Conditioning', claim: 'Claim 1 & Claim 5' },
                { id: 'consequence', label: '03. Multi-Horizon Consequence', claim: 'Claim 12' },
                { id: 'sacrifice', label: '04. Sacrifice Vector', claim: 'Claim 2 & Claim 4' },
                { id: 'prism', label: '05. PRISM-ANT Coupling', claim: 'Claim 1, 4 & 7' },
                { id: 'safety', label: '06. Deterministic Safety Gate', claim: 'Claim 1, 6 & 9' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedClaimNode(item.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
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

            {/* Details Inspector */}
            <div className="md:col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              {selectedClaimNode === 'accm' && (
                <div>
                  <span className="badge-cyan px-2 py-0.5 rounded text-[10px] font-bold">Independent Claim 1 & Dependent Claim 12</span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">Unified Action-Conditioned Consequence Model (ACCM)</h3>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <p><strong>Input:</strong> Multi-modal temporal sequence (60 steps), station graph topology, electro-thermal telemetry, negotiation context.</p>
                    <p><strong>Processing:</strong> 4-block Selective State Space (SSM / Mamba), 2-layer Graph Attention Network (GAT), physics-informed cross-terms.</p>
                    <p><strong>Output:</strong> 256-dimensional shared latent state representation Z_shared.</p>
                    <p><strong>Research Significance:</strong> Unifies 6 isolated models into a single coherent deep-learning backbone with linear-time sequence complexity.</p>
                  </div>
                </div>
              )}

              {selectedClaimNode === 'action' && (
                <div>
                  <span className="badge-purple px-2 py-0.5 rounded text-[10px] font-bold">Dependent Claim 1 & Claim 5</span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">Candidate Action Conditioning Mechanism</h3>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <p><strong>Input:</strong> Candidate action vocabulary: FAST, STANDARD, DELAY, REDUCE, RESERVE, REDIRECT, V2G.</p>
                    <p><strong>Processing:</strong> Action embedding layer projecting discrete choices to R^64, fused with Z_shared.</p>
                    <p><strong>Output:</strong> Conditioned latent vector feeding multi-horizon consequence decoders.</p>
                    <p><strong>Research Significance:</strong> Shifts ML role from passive forecasting to active counterfactual action evaluation.</p>
                  </div>
                </div>
              )}

              {selectedClaimNode === 'consequence' && (
                <div>
                  <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-bold">Dependent Claim 12</span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">Multi-Horizon Consequence & Uncertainty Prediction</h3>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <p><strong>Input:</strong> Conditioned latent representations.</p>
                    <p><strong>Processing:</strong> 5 synchronized multi-horizon decoders for 5m, 10m, 15m, 30m, 60m with heteroscedastic heads.</p>
                    <p><strong>Output:</strong> 11 continuous physical & economic targets with mean μ and variance σ² for each horizon.</p>
                    <p><strong>Research Significance:</strong> Provides proactive foresight to prevent transformer overload before it happens.</p>
                  </div>
                </div>
              )}

              {selectedClaimNode === 'sacrifice' && (
                <div>
                  <span className="badge-amber px-2 py-0.5 rounded text-[10px] font-bold">Dependent Claim 2 & Claim 4</span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">Learned Action-Specific Sacrifice Vector</h3>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <p><strong>Input:</strong> Action-conditioned consequence distribution.</p>
                    <p><strong>Processing:</strong> Multi-attribute cost transformation normalized across battery, degradation, thermal, grid, waiting, and fairness.</p>
                    <p><strong>Output:</strong> 8-dimensional normalized vector \vec{`{S}`}_a ∈ [0, 1]^8.</p>
                    <p><strong>Research Significance:</strong> Translates complex non-linear electrochemistry into an auditable game-theoretic currency.</p>
                  </div>
                </div>
              )}

              {selectedClaimNode === 'prism' && (
                <div>
                  <span className="badge-cyan px-2 py-0.5 rounded text-[10px] font-bold">Independent Claim 1 & Dependent Claim 4</span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">PRISM-ANT Reciprocity Negotiation Coupling</h3>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <p><strong>Input:</strong> Driver utility token, historical reciprocity ledger, and ACCM sacrifice vector \vec{`{S}`}_a.</p>
                    <p><strong>Processing:</strong> Exponential-decay reciprocity aging equation and capped water-filling readiness reserve.</p>
                    <p><strong>Output:</strong> Transparent, negotiated charging action and power allocation.</p>
                    <p><strong>Research Significance:</strong> Ensures game-theoretic fairness, privacy preservation, and decentralized coordination.</p>
                  </div>
                </div>
              )}

              {selectedClaimNode === 'safety' && (
                <div>
                  <span className="badge-crimson px-2 py-0.5 rounded text-[10px] font-bold">Dependent Claim 1, 6 & Claim 9</span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">Deterministic Hard Safety & Physics Constraints Gate</h3>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <p><strong>Input:</strong> Proposed negotiated power allocation and live physical sensor telemetry.</p>
                    <p><strong>Processing:</strong> Thermal guard (T_bat ≥ 42.0°C), feeder capacity limit (Σ P_i ≤ P_max), and OCPP fault detection.</p>
                    <p><strong>Output:</strong> Physically guaranteed safe power dispatch command to dispenser.</p>
                    <p><strong>Research Significance:</strong> Guaranteed zero battery thermal runaway events and zero transformer breaker trips.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Professional Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-[11px] text-slate-600 leading-relaxed flex items-start gap-3">
        <HelpCircle size={18} className="text-slate-400 flex-none mt-0.5" />
        <div>
          <strong className="text-slate-800 block mb-0.5">Professional Academic & Patent Framing Note:</strong>
          Patent Core presents the proposed technical architecture and candidate inventive concepts for research,
          academic defense, and patent-development purposes. Legal novelty, patentability, and formal claim scope require
          formal prior-art analysis and professional patent examination by licensed patent authorities.
        </div>
      </div>
    </div>
  );
};
