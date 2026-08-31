import React, { useState } from 'react';
import type { EVDigitalTwin, ChargingStation, GridTwinState } from '../../types/antev';
import { DeepLearningIntelligenceLayer } from '../../services/models/deepLearningLayer';
import { NASA_B0005_AGING_CURVE, CALTECH_ACN_HOURLY_PROFILE } from '../../services/data/datasetRegistry';
import { 
  Cpu, 
  Database, 
  Activity, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Sliders, 
  Car,
  TrendingUp
} from 'lucide-react';

interface AiPredictionCenterProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
}

export const AiPredictionCenter: React.FC<AiPredictionCenterProps> = ({
  evs,
  stations,
  grid
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('M1');
  const [selectedEvId, setSelectedEvId] = useState<string>(evs[0]?.id || 'EV-A');
  const selectedEv = evs.find(e => e.id === selectedEvId) || evs[0];

  const predictions = DeepLearningIntelligenceLayer.runFullInferencePackage(selectedEv, stations[0], grid, 50);

  const modelsList = [
    { id: 'M1', name: 'M1: Energy & Session Predictor', tag: 'Caltech ACN', role: 'Next-Session Energy, Duration & Readiness' },
    { id: 'M2', name: 'M2: Demand Forecast Model', tag: 'ACN Time-Series', role: '15/30/60m Congestion & Station Occupancy' },
    { id: 'M3', name: 'M3: Battery Health & RUL', tag: 'NASA Li-ion Aging', role: 'SOH Fade, Impedance & Remaining Useful Life' },
    { id: 'M4', name: 'M4: Battery Stress & Cost', tag: 'NASA Prognostics', role: 'Lifetime Degradation Cost ($) & Safe Power Envelope' },
    { id: 'M5', name: 'M5: Mamba Sequence State', tag: 'Selective SSM', role: 'Temporal Multi-Horizon State Trajectory' },
    { id: 'M6', name: 'M6: RL Policy Network', tag: 'ACN Sim + Twin', role: 'Long-term Multi-Agent Action Ranking' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              SECTION 4 SPECIFICATION
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Deep Learning Intelligence Layer (Models M1–M6)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Modular neural predictors trained on real public benchmarks (Caltech ACN & NASA PCoE). Predictive models do NOT switch chargers directly; they generate quantified future physical states consumed by PRISM-ANT under strict deterministic safety limits.
          </p>
        </div>

        {/* EV Selector for Testing Inferences */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Car className="w-4 h-4 text-sky-600" />
          <span className="text-xs text-slate-500 font-bold">Inspect Inferences For:</span>
          <select
            value={selectedEvId}
            onChange={(e) => setSelectedEvId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {evs.map(e => (
              <option key={e.id} value={e.id} className="bg-white text-slate-800">
                {e.id}: {e.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {modelsList.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedModelId(m.id)}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
              selectedModelId === m.id
                ? 'bg-sky-50 border-sky-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                selectedModelId === m.id ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {m.tag}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2 truncate">{m.name.split(': ')[1]}</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{m.role}</p>
          </button>
        ))}
      </div>

      {/* Model Details Showcase & Real Dataset Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Active Model Output Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* Model M1 View */}
            {selectedModelId === 'M1' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-sky-600" />
                      M1: EV Energy & Dwell Session Predictor
                    </h3>
                    <p className="text-xs text-slate-500">Trained on Caltech ACN-Data (31,420 sessions)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    Confidence: {Math.round(predictions.m1EnergySession.confidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Predicted Energy Needed</span>
                    <p className="text-xl font-black text-sky-700 font-mono mt-0.5">
                      {predictions.m1EnergySession.predictedEnergyKwh} kWh
                    </p>
                    <span className="text-[10px] text-slate-500">Uncertainty: ±{predictions.m1EnergySession.uncertaintyKwh} kWh</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated Charging Duration</span>
                    <p className="text-xl font-black text-blue-700 font-mono mt-0.5">
                      {predictions.m1EnergySession.predictedDurationMin} min
                    </p>
                    <span className="text-[10px] text-slate-500">Available: {selectedEv.mobility.departureDeadlineMin} min</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Departure Readiness</span>
                    <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                      {Math.round(predictions.m1EnergySession.departureReadinessProbability * 100)}%
                    </p>
                    <span className="text-[10px] text-slate-500">Target SOC: {predictions.m1EnergySession.targetSocPercent}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-sky-800">Operational Role in Patent Architecture:</p>
                  <p className="text-slate-600 leading-relaxed">
                    Prevents over-charging by estimating actual route mobility consumption. Feeds directly into Feature F1 (Predictive Need) and Feature F8 (Route-Aware No-Charge determination).
                  </p>
                </div>
              </div>
            )}

            {/* Model M2 View */}
            {selectedModelId === 'M2' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-sky-600" />
                      M2: Charging Demand & Station Congestion Forecaster
                    </h3>
                    <p className="text-xs text-slate-500">ACN Station Time-Series Multi-Step Forecaster</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                    Risk: {predictions.m2DemandForecast.congestionRisk}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">+15m Demand Forecast</span>
                    <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                      {predictions.m2DemandForecast.forecast15mKw} kW
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">+30m Demand Forecast</span>
                    <p className="text-xl font-black text-amber-700 font-mono mt-0.5">
                      {predictions.m2DemandForecast.forecast30mKw} kW
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">+60m Demand Forecast</span>
                    <p className="text-xl font-black text-red-700 font-mono mt-0.5">
                      {predictions.m2DemandForecast.forecast60mKw} kW
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-sky-800">Operational Role in Patent Architecture:</p>
                  <p className="text-slate-600 leading-relaxed">
                    Forecasts queue surges before they form, allowing PRISM-ANT to redirect arriving vehicles (F7) and reserve energy windows (F4) smoothly.
                  </p>
                </div>
              </div>
            )}

            {/* Model M3 View */}
            {selectedModelId === 'M3' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      M3: Battery State of Health (SOH) & RUL Prognostics
                    </h3>
                    <p className="text-xs text-slate-500">NASA Ames Li-ion Aging Dataset (B0005/B0006/B0018)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    Confidence: 94.2%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated SOH</span>
                    <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                      {predictions.m3BatteryHealthRul.predictedSohPercent}%
                    </p>
                    <span className="text-[10px] text-slate-500">Cycle: {selectedEv.batteryTwin.cycleCount}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Fade Rate / Cycle</span>
                    <p className="text-xl font-black text-sky-700 font-mono mt-0.5">
                      {predictions.m3BatteryHealthRul.degradationRatePerCycle}%
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated RUL Cycles</span>
                    <p className="text-xl font-black text-purple-700 font-mono mt-0.5">
                      {predictions.m3BatteryHealthRul.estimatedRulRemainingCycles}
                    </p>
                    <span className="text-[10px] text-slate-500">To 70% EOL Threshold</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-emerald-800">NASA Electrochemical Aging Basis:</p>
                  <p className="text-slate-600 leading-relaxed">
                    Maps internal impedance growth (Re, Rct) and capacity loss to predict remaining useful life cycles with high confidence.
                  </p>
                </div>
              </div>
            )}

            {/* Model M4 View */}
            {selectedModelId === 'M4' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-amber-500" />
                      M4: Battery Charging-Cost & Thermal Stress Model
                    </h3>
                    <p className="text-xs text-slate-500">Degradation Cost Index ($) & Safe Power Envelope (F2)</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    predictions.m4BatteryCostStress.highPowerRiskWarning ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {predictions.m4BatteryCostStress.highPowerRiskWarning ? 'THERMAL RISK' : 'NOMINAL SAFE'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Degradation Cost</span>
                    <p className="text-xl font-black text-amber-700 font-mono mt-0.5">
                      ${predictions.m4BatteryCostStress.lifetimeDegradationCostUsd}
                    </p>
                    <span className="text-[10px] text-slate-500">Per Charging Session</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Thermal Stress Index</span>
                    <p className={`text-xl font-black font-mono mt-0.5 ${
                      predictions.m4BatteryCostStress.thermalStressIndex > 0.6 ? 'text-red-700' : 'text-slate-900'
                    }`}>
                      {predictions.m4BatteryCostStress.thermalStressIndex.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-500">Battery: {selectedEv.telemetry.batteryTemp}°C</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Safe Power Envelope</span>
                    <p className="text-xl font-black text-sky-700 font-mono mt-0.5">
                      ≤ {predictions.m4BatteryCostStress.recommendedPowerEnvelopeKw} kW
                    </p>
                    <span className="text-[10px] text-slate-500">Max Allowed Intake</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-amber-800">Patent Core Feature (F2 Currency):</p>
                  <p className="text-slate-600 leading-relaxed">
                    Directly converts high-power charging wear into a monetary penalty so the negotiation algorithm balances speed against battery degradation.
                  </p>
                </div>
              </div>
            )}

            {/* Model M5 View */}
            {selectedModelId === 'M5' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-600" />
                      M5: Mamba Selective State-Space Sequence Model
                    </h3>
                    <p className="text-xs text-slate-500">Multi-Step Temporal State Trajectory Projection</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-mono font-bold">
                    SSM Horizon: 60 min
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Predicted Future State Vector (15m, 30m, 45m, 60m):</span>
                  <div className="grid grid-cols-4 gap-2">
                    {predictions.m5MambaState.trajectorySocHorizon.map((soc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                        <span className="text-slate-400 text-[10px]">t+{(idx + 1) * 15}m</span>
                        <p className="text-sky-700 font-bold text-sm">SOC: {soc}%</p>
                        <p className="text-amber-700 text-[11px]">{predictions.m5MambaState.trajectoryTempHorizon[idx]}°C</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    State Space Representation: {predictions.m5MambaState.predictedFutureStateVector}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-purple-800">Selective State Space Advantage:</p>
                  <p className="text-slate-600 leading-relaxed">
                    Unlike heavy Transformers with quadratic complexity, Mamba provides linear real-time sequence modeling on embedded station hardware.
                  </p>
                </div>
              </div>
            )}

            {/* Model M6 View */}
            {selectedModelId === 'M6' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-sky-600" />
                      M6: Reinforcement Learning Policy Model
                    </h3>
                    <p className="text-xs text-slate-500">ACN-Sim Trained Actor-Critic Action Ranking</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-mono font-bold">
                    Reward: +{predictions.m6RlPolicy.systemRewardExpected}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Action Q-Value Matrix (Expected Long-Term Return):</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(predictions.m6RlPolicy.qValues).map(([action, qVal]) => (
                      <div key={action} className={`p-2.5 rounded-lg border flex justify-between items-center ${
                        action === predictions.m6RlPolicy.recommendedAction 
                          ? 'bg-sky-100 border-sky-400 text-sky-900 font-bold' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <span className="text-[10px] truncate">{action.replace(/_/g, ' ')}</span>
                        <span>{qVal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-sky-800">Design Rule (Section 4):</p>
                  <p className="text-slate-600 leading-relaxed">
                    M6 acts only as an action ranking policy over feasible options. It can NEVER bypass hard constraints or PRISM-ANT fairness checks.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right 5 Columns: Dataset Provenance Tables */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* NASA Battery Aging Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                NASA B0005 Run-to-Failure Capacity Fade Curve
              </h3>
              <a
                href="https://data.nasa.gov/dataset/li-ion-battery-aging-datasets"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-0.5 font-bold"
              >
                <span>NASA PCoE</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-[11px] text-slate-500">
              Capacity fade (Ah) and internal impedance resistance growth from NASA Ames Li-ion prognostics benchmark.
            </p>

            <div className="overflow-x-auto max-h-[190px] overflow-y-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] sticky top-0">
                  <tr>
                    <th className="py-1.5 px-2">Cycle</th>
                    <th className="py-1.5 px-2">Capacity</th>
                    <th className="py-1.5 px-2">SOH %</th>
                    <th className="py-1.5 px-2">R_int (Ω)</th>
                    <th className="py-1.5 px-2">Max Temp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {NASA_B0005_AGING_CURVE.map((row) => (
                    <tr key={row.cycle} className="hover:bg-slate-50">
                      <td className="py-1 px-2 font-bold text-sky-700">#{row.cycle}</td>
                      <td className="py-1 px-2">{row.capacityAh}</td>
                      <td className="py-1 px-2 text-emerald-700 font-bold">{row.sohPercent}%</td>
                      <td className="py-1 px-2">{row.internalResistanceOhms}</td>
                      <td className="py-1 px-2 text-amber-700">{row.tempMaxC}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Caltech ACN Profile Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                Caltech ACN-Data 24-Hour Profile
              </h3>
              <a
                href="https://ev.caltech.edu/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-0.5 font-bold"
              >
                <span>Caltech EV</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="overflow-x-auto max-h-[190px] overflow-y-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] sticky top-0">
                  <tr>
                    <th className="py-1.5 px-2">Time</th>
                    <th className="py-1.5 px-2">Demand</th>
                    <th className="py-1.5 px-2">Avg kWh</th>
                    <th className="py-1.5 px-2">Sessions</th>
                    <th className="py-1.5 px-2">Solar Gen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CALTECH_ACN_HOURLY_PROFILE.map((row) => (
                    <tr key={row.hour} className="hover:bg-slate-50">
                      <td className="py-1 px-2 font-bold text-slate-900">{row.hour}</td>
                      <td className="py-1 px-2 text-amber-700">{row.avgDemandKw} kW</td>
                      <td className="py-1 px-2">{row.avgEnergyReqKwh}</td>
                      <td className="py-1 px-2">{row.sessionCount}</td>
                      <td className="py-1 px-2 text-emerald-700 font-bold">{row.solarGenerationKw} kW</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
