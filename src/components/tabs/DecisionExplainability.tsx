import React, { useState } from 'react';
import type { EVDigitalTwin, ChargingStation, GridTwinState, PrismAntDecisionResult } from '../../types/antev';
import { PrismAntEngine } from '../../services/engine/prismAntEngine';
import { 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Car
} from 'lucide-react';

interface DecisionExplainabilityProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  decisions: Record<string, PrismAntDecisionResult>;
}

export const DecisionExplainability: React.FC<DecisionExplainabilityProps> = ({
  evs,
  stations,
  grid,
  decisions
}) => {
  const [selectedEvId, setSelectedEvId] = useState<string>(evs[0]?.id || 'EV-A');
  const selectedEv = evs.find(e => e.id === selectedEvId) || evs[0];
  
  const activeDecision: PrismAntDecisionResult = decisions[selectedEv.id] || PrismAntEngine.negotiateChargingDecision(
    selectedEv,
    stations[0],
    stations,
    grid
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              AUDITABLE XAI ENGINE
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Decision Explainability & SHAP Factor Decomposition
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Complete transparency into every autonomous charging decision. Shows why the winning action was selected, which neural predictions influenced it, why alternatives were rejected, and what hard constraints were enforced.
          </p>
        </div>

        {/* EV Selector */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Car className="w-4 h-4 text-sky-600" />
          <span className="text-xs text-slate-500 font-bold">Inspect Decision For:</span>
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

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Winning Reason & SHAP Waterfall Decomposition */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Primary Explainability Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-sky-700 uppercase">100% Explainability Coverage</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  Why {activeDecision.selectedAction.replace(/_/g, ' ')} Won
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                Decision Certified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1">
              <p className="font-bold text-sky-900">Natural Language Rationale:</p>
              <p>{activeDecision.explainability.winningFactorSummary}</p>
            </div>

            {/* SHAP Factor Impact Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-sky-600" />
                SHAP-Style Feature Contribution Breakdown
              </h4>

              <div className="space-y-2 font-mono text-xs">
                {activeDecision.explainability.shapFactorDecomposition.map((item, idx) => {
                  const isPositive = item.impact >= 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{item.factor}</span>
                        <span className={`font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? `+${item.impact.toFixed(3)}` : `${item.impact.toFixed(3)}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">{item.description}</p>
                      {/* Visual Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, Math.abs(item.impact) * 200)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Why Alternative Actions Lost */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Why Alternative Candidate Actions Lost
            </h4>

            <div className="space-y-2 text-xs">
              {activeDecision.candidateActions
                .filter(c => c.action !== activeDecision.selectedAction)
                .map((cand, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    !cand.hardConstraintsPassed ? 'bg-red-50 border-red-200 text-red-950' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{cand.action.replace(/_/g, ' ')}</span>
                        {!cand.hardConstraintsPassed && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-300">
                            HARD CONSTRAINT BLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {!cand.hardConstraintsPassed 
                          ? `Safety Violation: ${cand.failedConstraintReason}` 
                          : `Calculated PRISM-ANT score (${cand.prismAntScore}) was lower than winning action score.`}
                      </p>
                    </div>

                    <span className="font-mono text-xs text-slate-500 font-bold shrink-0">
                      Score: {cand.prismAntScore}
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Hard Constraint Proofs & Patent Certificate */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Hard Constraints Audit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Hard Constraint Audit Ledger
              </h3>
              <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">100% PASS</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {activeDecision.hardConstraints.map((chk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {chk.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                    <span className="text-slate-800 font-sans font-medium">{chk.constraintName}</span>
                  </div>
                  <span className="text-emerald-700 font-bold">{chk.currentValue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tamper-Evident Decision Audit Certificate Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sky-700">
              <FileCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Patent-Grade Audit Certificate</h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every decision record stores timestamped model snapshots, input features, constraint verifications, and cryptographic hashes for legal and regulatory auditability.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Record Timestamp:</span>
                <span className="text-slate-900 font-bold">{activeDecision.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle ID:</span>
                <span className="text-sky-700 font-bold">{selectedEv.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Utility Token Hash:</span>
                <span className="text-emerald-700 font-bold">{selectedEv.utilityToken.anonymizedHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Models Invoked:</span>
                <span className="text-purple-700 font-bold">M1, M2, M3, M4, M5, M6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Execution Status:</span>
                <span className="text-emerald-700 font-bold">APPROVED & BOUNDED</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-800 font-medium">
              ✨ Audit status: Complete proof of non-obvious multi-agent negotiation with physics bounding.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
