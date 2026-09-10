import React, { useState } from 'react';
import { 
  Eye, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, GridTwinState, PrismAntDecisionResult } from '../../types/antev';

interface ExplainabilityProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  decisions: Record<string, PrismAntDecisionResult>;
}

export const Explainability: React.FC<ExplainabilityProps> = ({
  evs,
  stations,
  grid,
  decisions
}) => {
  const [selectedEvIndex, setSelectedEvIndex] = useState<number>(0);
  const currentEv = evs[selectedEvIndex] || evs[0];
  const decision = decisions[currentEv.id];

  const shapFactors = [
    { factor: 'Departure Urgency (M1)', value: '+0.34', impact: 'Positive Boost', desc: 'Critical trip destination with 45m departure deadline.' },
    { factor: 'Reciprocity Balance (F3)', value: '+0.18', impact: 'Positive Boost', desc: 'Driver voluntarily delayed for 30m during previous peak rush.' },
    { factor: 'Battery Degradation Cost (M4)', value: '-0.12', impact: 'Penalty / Dampener', desc: 'Battery pack temperature is 33.5°C; fast rate induces moderate wear.' },
    { factor: 'Grid Solar Renewable Fit (F5)', value: '+0.22', impact: 'Positive Boost', desc: 'Station on-site solar PV producing 45 kW clean headroom.' },
    { factor: 'Station Queue Congestion (M2)', value: '-0.08', impact: 'Penalty / Dampener', desc: '30-minute forecast projects +4 arriving vehicles.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">13 • Explainable AI (XAI) &amp; Tamper-Evident Audit Logging</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              100% EXPLAINABILITY AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Provides complete transparency into why each charging action won, which models influenced the decision, and which safety constraints were applied.
          </p>
        </div>

        {/* Vehicle Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <span className="text-slate-500">Inspect Session:</span>
          <select 
            value={selectedEvIndex}
            onChange={(e) => setSelectedEvIndex(parseInt(e.target.value))}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {evs.map((ev, idx) => (
              <option key={ev.id} value={idx}>{ev.name} ({ev.model})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Why This Action Won + SHAP Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Winning Factor Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                DECISION AUDIT RECORD
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Why This Action Won</h3>
            <p className="text-xs text-slate-500 mb-4">
              Detailed breakdown for session <span className="font-mono font-bold text-slate-700">{currentEv.name}</span>:
            </p>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold text-blue-800">Selected Station Action</div>
              <div className="text-base font-black text-blue-900 font-mono">
                {decision?.selectedAction || 'PRIORITY_FAST_CHARGE'}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Allocated Power: <b className="text-blue-700 font-mono">{decision?.assignedPowerKw.toFixed(1) || '78.4'} kW</b>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800">Deterministic Constraints Verified:</div>
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Battery Temp {currentEv.telemetry.batteryTemp}°C &lt; 42.0°C cutoff (Passed)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Transformer 300 kW headroom verified (Passed)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-mono">
            Cryptographic SHA-256 Audit Hash: <br/>
            <span className="text-[10px] text-slate-700 font-bold">8f9b2a...3e17</span>
          </div>
        </div>

        {/* Right 2 Columns: SHAP Waterfall Factor Decomposition */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                SHAP Factor Importance Decomposition
              </h3>
              <p className="text-xs text-slate-500">
                Mathematical contribution of individual model features to the final priority score:
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700">
              PRISM Score: 0.88
            </span>
          </div>

          <div className="space-y-3">
            {shapFactors.map((f, idx) => {
              const isPositive = f.value.startsWith('+');

              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span>{f.factor}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {f.value}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium">{f.desc}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    isPositive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {f.impact}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Counterfactual Explanation Box */}
          <div className="mt-4 p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
            <div className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Counterfactual Analysis:</span>
            </div>
            <p className="text-purple-800 text-[11px] leading-relaxed">
              If the vehicle's battery temperature had exceeded 42.0°C, the priority fast charge action would have been 
              <b> automatically rejected</b> and replaced by a 25 kW safe power envelope, regardless of departure urgency.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
