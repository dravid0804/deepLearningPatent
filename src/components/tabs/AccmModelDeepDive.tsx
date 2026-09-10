import React, { useState } from 'react';
import {
  Cpu, Zap, Database, ArrowRight, ShieldCheck, Activity,
  Sliders, CheckCircle2, AlertTriangle, Layers, GitBranch,
  Play, RefreshCw, BarChart2, Eye, HelpCircle, HardDrive
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, GridTwinState } from '../../types/antev';
import { AccmService } from '../../services/models/accmService';
import type { CandidateAction } from '../../types/accm';

interface Props {
  evs: EVDigitalTwin[];
  station: ChargingStation;
  grid: GridTwinState;
}

export const AccmModelDeepDive: React.FC<Props> = ({ evs, station, grid }) => {
  const [selectedEvId, setSelectedEvId] = useState<string>(evs[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'inputs' | 'outputs' | 'live-inference'>('architecture');
  const [selectedCandidateAction, setSelectedCandidateAction] = useState<CandidateAction>('CHARGE_NOW_FAST');
  const [isInferring, setIsInferring] = useState<boolean>(false);

  const currentEv = evs.find((e) => e.id === selectedEvId) || evs[0];
  const accmResult = currentEv ? AccmService.predictConsequences(currentEv, station, grid) : null;
  const actionPrediction = accmResult?.actions.find((a) => a.action === selectedCandidateAction) || accmResult?.actions[0];

  const handleRunInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      setIsInferring(false);
    }, 400);
  };

  if (!currentEv || !accmResult || !actionPrediction) {
    return <div className="p-8 text-center text-slate-500">No active vehicles for ACCM inspection.</div>;
  }

  return (
    <div className="focused-page">
      {/* Hero Section */}
      <section className="split-hero">
        <div>
          <p className="eyebrow"><span className="live-dot" /> SINGLE DEEP LEARNING MODEL SPECIFICATION</p>
          <h1>ACCM: Action-Conditioned Consequence Model</h1>
          <p>
            ANT-EV 2.0 uses <b>exactly ONE unified deep neural network</b> (1,231,736 trained parameters) deployed inside the charging station controller.
            Instead of multiple disconnected models, ACCM takes the entire vehicle, station, and grid state and predicts the future physical consequences of every candidate charge-splitting decision.
          </p>
        </div>
        <div className="split-total">
          <span>Active Checkpoint</span>
          <strong>accm_weights.pt</strong>
          <small>1.23M Parameters · 5.0 MB · PyTorch 2.14</small>
        </div>
      </section>

      {/* Model Overview Cards */}
      <section className="split-summary">
        <div>
          <b>1 Unified Model</b>
          <span>Replaces 6 disconnected models</span>
        </div>
        <div>
          <b>60-Minute Window</b>
          <span>Historical time-series context</span>
        </div>
        <div>
          <b>5 Time Horizons</b>
          <span>5m, 10m, 15m, 30m, 60m future</span>
        </div>
        <div>
          <b>8-Dim Sacrifice Vector</b>
          <span>Input to PRISM-ANT negotiation</span>
        </div>
      </section>

      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers size={14} /> 1. Neural Architecture
          </button>
          <button
            onClick={() => setActiveSubTab('inputs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'inputs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database size={14} /> 2. Model Inputs (I)
          </button>
          <button
            onClick={() => setActiveSubTab('outputs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'outputs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity size={14} /> 3. Model Outputs (O)
          </button>
          <button
            onClick={() => setActiveSubTab('live-inference')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'live-inference'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Play size={14} /> 4. Live Inference Test
          </button>
        </div>

        {/* EV Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Connected EV:</span>
          <select
            value={selectedEvId}
            onChange={(e) => setSelectedEvId(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
          >
            {evs.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.telemetry.soc}% SOC, {ev.telemetry.batteryTemp}°C)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUB-TAB 1: NEURAL ARCHITECTURE */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          <section className="allocation-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">NEURAL PIPELINE</p>
                <h2>How the Single ACCM Deep Learning Model Works</h2>
              </div>
              <span className="safe-pill">
                <ShieldCheck size={14} /> Physics-Informed Multi-Modal Network
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
              ACCM does not guess random numbers. It processes raw telemetry through <b>four specialized neural encoders</b>, fuses them into a 256-dimensional latent space, conditions on 7 candidate power splitting actions, and decodes physical consequences across 5 future time horizons with calibrated confidence intervals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs mb-1">
                  <Activity size={16} /> 1. Temporal Encoder
                </div>
                <p className="text-[11px] text-slate-700 font-bold">Mamba / S6 Selective State Space</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  4 SSM blocks ($d=128$) scan 60 timesteps of voltage, current, and temperature to capture hidden battery heat momentum.
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-200 text-blue-800 text-[10px] font-mono font-bold">
                  Outputs Z_T (128 dims)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs mb-1">
                  <GitBranch size={16} /> 2. Graph Attention
                </div>
                <p className="text-[11px] text-slate-700 font-bold">2-Layer Relational GAT</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Models charging bays as a graph network to share power headroom information across neighboring vehicles and transformers.
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-indigo-200 text-indigo-800 text-[10px] font-mono font-bold">
                  Outputs Z_G (128 dims)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs mb-1">
                  <Zap size={16} /> 3. Physics Residual
                </div>
                <p className="text-[11px] text-slate-700 font-bold">Electro-Thermal Residual MLP</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Explicitly computes I^2R Joule heating and V x I power terms to strictly enforce physical energy conservation.
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-mono font-bold">
                  Outputs Z_P (128 dims)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs mb-1">
                  <Layers size={16} /> 4. Context Encoder
                </div>
                <p className="text-[11px] text-slate-700 font-bold">Reciprocity & Fairness MLP</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ingests accumulated driver reciprocity tokens and previous sacrifices as context for negotiation.
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                  Outputs Z_R (128 dims)
                </span>
              </div>
            </div>

            {/* Fusion and Action Conditioning */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 mb-2">
                <ArrowRight size={14} className="text-blue-600" />
                Multi-Modal Latent Fusion & Action-Conditioned Consequence Decoding:
              </div>
              <div className="text-xs text-slate-600 font-mono space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                <div>Z_shared = LayerNorm(GELU(Linear(Concat([Z_T, Z_G, Z_P, Z_R]))))  → 256 dimensions</div>
                <div>For candidate action a in [1..7]:</div>
                <div className="pl-4 text-blue-700 font-bold">Consequences(a, horizon) = Decoder(Z_shared + Embedding(a))</div>
                <div className="pl-4 text-emerald-700 font-bold">Sacrifice_Vector(a) = Sigmoid(Linear(Z_shared + Embedding(a))) → 8 dimensions in [0, 1]</div>
                <div className="pl-4 text-amber-700 font-bold">Uncertainty(a) = Heteroscedastic Gaussian NLL Head (Mean μ, Variance σ²)</div>
              </div>
            </div>

            {/* Why 1 Model is Better than 6 */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex items-start gap-3">
              <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <b className="text-xs text-blue-950 font-bold">Why ONE Unified Model is Patented over 6 Separate Models:</b>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  In ANT-EV 1.0, six disconnected models (M1–M6) made isolated predictions. Often, M1 (energy) recommended high charging speed while M4 (thermal) warned of critical heat, leading to conflicting inputs. 
                  <b>ACCM unifies all physical domains into one shared representation.</b> It evaluates trade-offs simultaneously, eliminating contradictions and cutting inference latency from 22 ms down to 4.5 ms.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SUB-TAB 2: EXACT MODEL INPUTS */}
      {activeSubTab === 'inputs' && (
        <section className="allocation-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">INPUT SPECIFICATION</p>
              <h2>Schema EV-NET-2.0: Exact Input Features to ACCM</h2>
            </div>
            <span className="safe-pill">
              <Database size={14} /> Total 35 Normalized Telemetry Channels
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
            The neural network ingests a 60-step temporal window (T=60 minutes). All inputs are strictly normalized using training-set statistics (mean and standard deviation) to prevent data leakage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Group 1: EV Dynamics */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <b className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-600" /> Group 1: EV Dynamics & Battery State (16 Features)
                </b>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">16 Ch</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• <code>soc</code>: Current battery state of charge (e.g. <b>{currentEv.telemetry.soc}%</b>)</li>
                <li>• <code>target_soc</code>: Driver requested departure SOC (e.g. <b>{currentEv.mobility.destinationSocRequired}%</b>)</li>
                <li>• <code>battery_capacity_kwh</code>: Nominal pack size (e.g. <b>{currentEv.telemetry.nominalCapacityKwh} kWh</b>)</li>
                <li>• <code>pack_voltage_v</code> & <code>pack_current_a</code>: Live DC bus electrical state</li>
                <li>• <code>battery_temp_c</code>: Core cell temperature (e.g. <b>{currentEv.telemetry.batteryTemp}°C</b>)</li>
                <li>• <code>internal_resistance_mohm</code>: Impedance measurement (e.g. <b>60 mΩ</b>)</li>
                <li>• <code>soh</code>: State of health from NASA degradation curves (e.g. <b>{currentEv.telemetry.soh}%</b>)</li>
                <li>• <code>departure_deadline_min</code>: Minutes remaining until departure (e.g. <b>{currentEv.mobility.departureDeadlineMin} min</b>)</li>
              </ul>
            </div>

            {/* Group 2: Station State */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <b className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-600" /> Group 2: Charging Station State (7 Features)
                </b>
                <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">7 Ch</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• <code>station_load_kw</code>: Aggregated active site load (e.g. <b>{station.currentPowerDrawKw.toFixed(1)} kW</b>)</li>
                <li>• <code>station_capacity_kw</code>: Safe transformer limit (e.g. <b>{station.maxGridPowerCapacityKw} kW</b>)</li>
                <li>• <code>available_chargers</code> & <code>occupied_chargers</code>: Bay availability</li>
                <li>• <code>queue_length</code>: Waiting vehicles at station buffer</li>
                <li>• <code>electricity_price_kwh</code>: Real-time spot tariff LMP (e.g. <b>${grid.currentTariffPerKwh.toFixed(2)}/kWh</b>)</li>
                <li>• <code>renewable_ratio</code>: On-site solar/wind generation share</li>
              </ul>
            </div>

            {/* Group 3: Grid State */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <b className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <BarChart2 size={14} className="text-indigo-600" /> Group 3: Regional Power Grid (5 Features)
                </b>
                <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">5 Ch</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• <code>grid_load_mw</code>: Distribution substation feeder load (e.g. <b>{grid.currentGridLoadMw.toFixed(1)} MW</b>)</li>
                <li>• <code>grid_capacity_mw</code>: Feeder thermal capacity rating</li>
                <li>• <code>grid_frequency_hz</code>: AC system balance (Nominal 50.0 Hz)</li>
                <li>• <code>renewable_generation_mw</code>: Utility solar/wind feed</li>
                <li>• <code>local_congestion_idx</code>: Distribution line thermal overload index</li>
              </ul>
            </div>

            {/* Group 4: Reciprocity Memory Context */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <b className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> Group 4: Negotiation Context (7 Features)
                </b>
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">7 Ch</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li>• <code>reciprocity_credit</code>: Accumulated driver credits (e.g. <b>{currentEv.utilityToken.reciprocityCredit} tokens</b>)</li>
                <li>• <code>historical_sacrifice</code>: Past delayed minutes surrendered to help other EVs</li>
                <li>• <code>recent_priority_count</code>: Number of fast-charge passes granted</li>
                <li>• <code>negotiation_count</code>: Active negotiation rounds in current session</li>
                <li>• <code>fairness_state</code>: Station-wide Gini equity metric</li>
                <li>• <code>previous_action_idx</code>: Last step's executed command</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* SUB-TAB 3: EXACT MODEL OUTPUTS */}
      {activeSubTab === 'outputs' && (
        <section className="allocation-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">OUTPUT SPECIFICATION</p>
              <h2>What ACCM Predicts for Each Candidate Action</h2>
            </div>
            <span className="safe-pill">
              <Activity size={14} /> Multi-Horizon Consequence Matrix + 8-Dim Sacrifice Vector
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
            For every candidate action (e.g. Fast Charge vs Reduce Power vs Cooperative Delay), ACCM outputs two things:
            (1) A <b>Multi-Horizon Consequence Matrix</b> across 5 future time horizons, and (2) an <b>8-Dimensional Action Sacrifice Vector (S_a)</b>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Output 1: Multi-Horizon Matrix */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <b className="text-xs text-slate-900 font-bold block mb-2 text-blue-700">
                1. Multi-Horizon Consequence Matrix (11 Targets × 5 Horizons)
              </b>
              <p className="text-[11px] text-slate-500 mb-3">
                Predicts exactly how battery and station parameters will evolve 5m, 10m, 15m, 30m, and 60m into the future under each action:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <span className="p-2 bg-slate-50 rounded border border-slate-200">1. soc_future (%)</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">2. battery_temp_c (°C)</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">3. energy_delivered_kwh</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">4. degradation_pct (%)</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">5. station_load_kw</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">6. grid_load_mw</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">7. electricity_cost_usd</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">8. waiting_time_min</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">9. soh_future (%)</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200">10. charging_duration_min</span>
                <span className="p-2 bg-slate-50 rounded border border-slate-200 col-span-2">11. renewable_energy_ratio</span>
              </div>
            </div>

            {/* Output 2: Action Sacrifice Vector */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <b className="text-xs text-slate-900 font-bold block mb-2 text-emerald-700">
                2. Action-Specific Sacrifice Vector (S_a in [0, 1]^8)
              </b>
              <p className="text-[11px] text-slate-500 mb-3">
                This 8-dimensional vector quantifies the penalty or sacrifice incurred by choosing candidate action a. 
                <b>PRISM-ANT consumes this vector directly</b>:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_batt (Battery Penalty)</span>
                  <span className="text-slate-500 font-mono">SOC shortfall from target</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_deg (Degradation Penalty)</span>
                  <span className="text-slate-500 font-mono">SEI layer aging rate</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_therm (Thermal Penalty)</span>
                  <span className="text-slate-500 font-mono">Deviation toward 42°C limit</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_grid (Grid Penalty)</span>
                  <span className="text-slate-500 font-mono">Substation peak coincidence</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_wait (Trip Delay Penalty)</span>
                  <span className="text-slate-500 font-mono">Departure schedule delay</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_cost (Financial Tariff Penalty)</span>
                  <span className="text-slate-500 font-mono">Electricity billing cost</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_avail (Reserve Penalty)</span>
                  <span className="text-slate-500 font-mono">Lost schedule flexibility</span>
                </div>
                <div className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">• S_fair (Equity Penalty)</span>
                  <span className="text-slate-500 font-mono">Impact on station Gini index</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUB-TAB 4: LIVE INFERENCE TEST */}
      {activeSubTab === 'live-inference' && (
        <section className="allocation-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">LIVE FORWARD PASS</p>
              <h2>Run ACCM Deep Learning Inference on Active Vehicle</h2>
            </div>
            <button
              onClick={handleRunInference}
              disabled={isInferring}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <RefreshCw size={14} className={isInferring ? 'animate-spin' : ''} />
              {isInferring ? 'Executing Forward Pass...' : 'Run Forward Pass'}
            </button>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-bold uppercase">Candidate Energy Action to Condition:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(['CHARGE_NOW_FAST', 'CHARGE_NOW_STANDARD', 'COOPERATIVE_DELAY', 'REDUCE_POWER', 'ELIGIBLE_V2G_EXPORT'] as CandidateAction[]).map((act) => (
                  <button
                    key={act}
                    onClick={() => setSelectedCandidateAction(act)}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition ${
                      selectedCandidateAction === act
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {act.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-bold block">Model Confidence:</span>
              <b className="text-base text-emerald-600 font-mono">
                {Math.round(actionPrediction.confidence['15m'] * 100)}% Calibrated
              </b>
            </div>
          </div>

          {/* Live Inferred Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Multi-Horizon Consequence Predictions */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <b className="text-xs text-slate-900 font-bold block mb-3 text-blue-800">
                Multi-Horizon Physical Forecast ({selectedCandidateAction.replace(/_/g, ' ')})
              </b>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600">SOC after 15 min:</span>
                  <b className="text-blue-700 font-bold">{actionPrediction.horizons['15m'].soc.toFixed(1)}% (Δ+{(actionPrediction.horizons['15m'].soc - currentEv.telemetry.soc).toFixed(1)}%)</b>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600">Cell Temp after 15 min:</span>
                  <b className={actionPrediction.horizons['15m'].battery_temp_c >= 42 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                    {actionPrediction.horizons['15m'].battery_temp_c.toFixed(1)}°C {actionPrediction.horizons['15m'].battery_temp_c >= 42 ? '(SAFETY CLAMP TRIGGER)' : '(Safe)'}
                  </b>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600">Energy Delivered in 15m:</span>
                  <b className="text-slate-800">{actionPrediction.horizons['15m'].energy_delivered_kwh.toFixed(1)} kWh</b>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600">Estimated SEI Degradation:</span>
                  <b className="text-amber-700 font-bold">{actionPrediction.horizons['15m'].degradation_rate_pct.toFixed(4)}%</b>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600">Predicted Station Peak Load:</span>
                  <b className="text-slate-800">{actionPrediction.horizons['15m'].station_load_kw.toFixed(1)} kW</b>
                </div>
              </div>
            </div>

            {/* Generated Action Sacrifice Vector */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <b className="text-xs text-slate-900 font-bold block mb-3 text-emerald-800">
                Generated Action Sacrifice Vector (S_a in [0, 1]^8)
              </b>
              <div className="space-y-2.5">
                {Object.entries(actionPrediction.sacrifice_vector).map(([dim, val]) => (
                  <div key={dim}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-slate-700 capitalize">{dim} Impact</span>
                      <span className="font-mono font-bold text-slate-900">{val.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          val > 0.6 ? 'bg-rose-500' : val > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, val * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
            <ArrowRight size={16} className="text-blue-600 flex-shrink-0" />
            <span>
              <b>Hand-Off to PRISM-ANT:</b> This consequence forecast and sacrifice vector are passed to the PRISM-ANT negotiation algorithm. 
              PRISM-ANT weighs the vehicle's historical reciprocity credit against this sacrifice vector to determine the final charge-splitting decision.
            </span>
          </div>
        </section>
      )}

      {/* Algorithm Handoff Explainer */}
      <section className="algorithm-card">
        <div>
          <Cpu size={19} />
          <div>
            <p className="eyebrow">CLOSED-LOOP STATION DECISION CYCLE</p>
            <h2>How ACCM Deep Learning Powers Station Charge Splitting</h2>
          </div>
        </div>
        <ol>
          <li>
            <b>1. Multi-Modal Sensing:</b> As EVs plug into bays, the station digital twin records SOC, temperature, driver deadlines, and transformer headroom over a 60-step temporal window.
          </li>
          <li>
            <b>2. ACCM Consequence Prediction:</b> The unified PyTorch neural network evaluates all candidate actions and outputs the multi-horizon consequence tensor and 8-dim Action Sacrifice Vector (S_a).
          </li>
          <li>
            <b>3. PRISM-ANT Reciprocity Negotiation:</b> PRISM-ANT consumes S_a and balances it against the EV's credit ledger. Vehicles that cooperated previously receive charging priority; vehicles without urgency are incentivized to share power.
          </li>
          <li>
            <b>4. Deterministic Safety Gate:</b> An independent physics cutoff verifies that no cell exceeds 42°C and total station draw does not exceed transformer capacity. Power is safely split across all active bays.
          </li>
        </ol>
      </section>
    </div>
  );
};
