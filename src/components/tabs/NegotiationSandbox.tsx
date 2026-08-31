import React, { useState } from 'react';
import type { EVDigitalTwin, ChargingStation, GridTwinState, PrismAntDecisionResult } from '../../types/antev';
import { PrismAntEngine } from '../../services/engine/prismAntEngine';
import { 
  Sliders, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Coins,
  Thermometer,
  Zap,
  Clock,
  Car
} from 'lucide-react';

interface NegotiationSandboxProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  onUpdateEv: (updatedEv: EVDigitalTwin) => void;
}

export const NegotiationSandbox: React.FC<NegotiationSandboxProps> = ({
  evs,
  stations,
  grid,
  onUpdateEv
}) => {
  const [selectedEvId, setSelectedEvId] = useState<string>(evs[0]?.id || 'EV-A');
  const activeEv = evs.find(e => e.id === selectedEvId) || evs[0];

  // Local interactive slider state for live experimentation
  const [batteryTemp, setBatteryTemp] = useState<number>(activeEv.telemetry.batteryTemp);
  const [urgencyScore, setUrgencyScore] = useState<number>(activeEv.utilityToken.urgencyScore);
  const [deadlineMin, setDeadlineMin] = useState<number>(activeEv.mobility.departureDeadlineMin);
  const [reciprocityCredits, setReciprocityCredits] = useState<number>(activeEv.utilityToken.reciprocityCredit);
  const [gridStatus, setGridStatus] = useState<GridTwinState['gridStatus']>(grid.gridStatus);

  // Sync state when EV changes
  const handleEvChange = (id: string) => {
    setSelectedEvId(id);
    const target = evs.find(e => e.id === id);
    if (target) {
      setBatteryTemp(target.telemetry.batteryTemp);
      setUrgencyScore(target.utilityToken.urgencyScore);
      setDeadlineMin(target.mobility.departureDeadlineMin);
      setReciprocityCredits(target.utilityToken.reciprocityCredit);
    }
  };

  // Build live sandbox EV instance
  const sandboxEv: EVDigitalTwin = {
    ...activeEv,
    telemetry: {
      ...activeEv.telemetry,
      batteryTemp: batteryTemp
    },
    mobility: {
      ...activeEv.mobility,
      departureDeadlineMin: deadlineMin
    },
    utilityToken: {
      ...activeEv.utilityToken,
      urgencyScore: urgencyScore,
      reciprocityCredit: reciprocityCredits
    }
  };

  const sandboxGrid: GridTwinState = {
    ...grid,
    gridStatus: gridStatus
  };

  // Run PRISM-ANT Negotiation live
  const decisionResult: PrismAntDecisionResult = PrismAntEngine.negotiateChargingDecision(
    sandboxEv,
    stations[0],
    stations,
    sandboxGrid
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              INTERACTIVE PATENT SOLVER
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              PRISM-ANT 2.0 Negotiation Sandbox & Live Parameter Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Test any car and manipulate battery temperature, driver urgency, and grid conditions in real-time. Observe how the 4-stage pipeline enforces deterministic physics gates and dynamically recalculates PRISM-ANT action scores.
          </p>
        </div>

        {/* EV Car Selector */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Car className="w-4 h-4 text-sky-600" />
          <span className="text-xs text-slate-500 font-bold">Select EV Car:</span>
          <select
            value={selectedEvId}
            onChange={(e) => handleEvChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {evs.map(e => (
              <option key={e.id} value={e.id} className="bg-white text-slate-800">
                {e.id}: {e.model} ({e.name.split(' (')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Columns: Live Sliders */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              Live Telemetry & Preference Sliders
            </h3>

            {/* Slider 1: Battery Temperature */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  Battery Temperature (°C)
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  batteryTemp >= 42 ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-slate-200 text-slate-800'
                }`}>
                  {batteryTemp.toFixed(1)}°C {batteryTemp >= 42 ? '⚠️ THERMAL GUARD' : ''}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="0.5"
                value={batteryTemp}
                onChange={(e) => setBatteryTemp(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <p className="text-[11px] text-slate-500">
                Notice: Exceeding 42.0°C strictly blocks 150 kW fast charge and forces power throttling (≤ 25 kW) to prevent battery degradation.
              </p>
            </div>

            {/* Slider 2: Driver Urgency Score */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-600" />
                  Driver Urgency Score ($u_i$)
                </span>
                <span className="text-xs font-mono font-bold text-sky-800 px-2 py-0.5 rounded-md bg-sky-100 border border-sky-200">
                  {urgencyScore.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={urgencyScore}
                onChange={(e) => setUrgencyScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <p className="text-[11px] text-slate-500">
                Normalized utility urgency token extracted from driver route commitments.
              </p>
            </div>

            {/* Slider 3: Departure Deadline */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Departure Deadline Window
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200">
                  {deadlineMin} min
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="240"
                step="5"
                value={deadlineMin}
                onChange={(e) => setDeadlineMin(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500">
                Larger window (&gt;60m) enables cooperative delay and renewable solar alignment.
              </p>
            </div>

            {/* Slider 4: Reciprocity Credits */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Reciprocity Credits ($R_i$)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200">
                  {reciprocityCredits} Credits
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reciprocityCredits}
                onChange={(e) => setReciprocityCredits(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500">
                Accumulated from past cooperative sacrifices (F3). High credits provide fair priority boost.
              </p>
            </div>

            {/* Grid Load Status */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700">Grid Substation Load Level:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['OPTIMAL', 'HIGH_LOAD', 'CRITICAL_EMERGENCY'] as GridTwinState['gridStatus'][]).map(status => (
                  <button
                    key={status}
                    onClick={() => setGridStatus(status)}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition ${
                      gridStatus === status 
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right 7 Columns: Winning Action & Constraints */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Winning Action Showcase Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 font-mono">
                  PRISM-ANT 2.0 Winning Action
                </span>
                <h3 className="text-2xl font-black mt-0.5 tech-font flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-sky-200" />
                  {decisionResult.selectedAction.replace(/_/g, ' ')}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-sky-200 font-mono">Power Allocated</span>
                <p className="text-xl font-bold font-mono">
                  {decisionResult.assignedPowerKw > 0 ? `${decisionResult.assignedPowerKw} kW` : decisionResult.assignedPowerKw < 0 ? `${decisionResult.assignedPowerKw} kW (V2G)` : '0 kW (Hold)'}
                </p>
              </div>
            </div>

            <p className="text-xs text-sky-50 p-3.5 rounded-xl bg-white/10 backdrop-blur-md leading-relaxed border border-white/10">
              {decisionResult.explainability.winningFactorSummary}
            </p>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
              <div className="p-2.5 rounded-xl bg-black/20 text-center">
                <span className="text-sky-200 text-[10px]">Target SOC</span>
                <p className="font-bold text-sm">{decisionResult.targetSocPercent}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/20 text-center">
                <span className="text-sky-200 text-[10px]">Target Energy</span>
                <p className="font-bold text-sm">{decisionResult.targetEnergyKwh} kWh</p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/20 text-center">
                <span className="text-sky-200 text-[10px]">Reciprocity Δ</span>
                <p className="font-bold text-sm">
                  {decisionResult.reciprocityCreditDelta > 0 ? `+${decisionResult.reciprocityCreditDelta}` : `${decisionResult.reciprocityCreditDelta}`} cr
                </p>
              </div>
            </div>
          </div>

          {/* Hard Constraints Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Hard Safety & Physics Constraints Gate (Zero Violations)
              </h3>
              <span className="text-[11px] font-mono font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                Deterministic
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {decisionResult.hardConstraints.map((check, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  check.passed ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold font-sans text-slate-900">{check.constraintName}</p>
                      <p className="text-[11px] text-slate-500 font-sans">{check.reason}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400">Limit: {check.limitValue}</span>
                    <p className={`font-bold ${check.passed ? 'text-emerald-700' : 'text-red-700'}`}>{check.currentValue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Action Ranking Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Candidate Actions Evaluation Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px]">
                  <tr>
                    <th className="py-2.5 px-3">Candidate Action</th>
                    <th className="py-2.5 px-2">Safety Gate</th>
                    <th className="py-2.5 px-2">PRISM Score</th>
                    <th className="py-2.5 px-2">RL Q-Val</th>
                    <th className="py-2.5 px-2">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decisionResult.candidateActions.map((cand, idx) => {
                    const isWinning = cand.action === decisionResult.selectedAction;
                    return (
                      <tr key={idx} className={isWinning ? 'bg-sky-50 font-bold' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 text-slate-900 flex items-center gap-1.5">
                          {isWinning && <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                          <span>{cand.action.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          {cand.hardConstraintsPassed ? (
                            <span className="text-emerald-700 text-[10px] font-bold">PASSED</span>
                          ) : (
                            <span className="text-red-600 text-[10px] font-bold">BLOCKED</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-sky-700 font-bold">
                          {cand.prismAntScore}
                        </td>
                        <td className="py-2.5 px-2 text-purple-700">
                          {cand.rlPolicyQValue.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2">
                          {isWinning ? (
                            <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-bold">
                              WINNER
                            </span>
                          ) : !cand.hardConstraintsPassed ? (
                            <span className="text-slate-400 text-[10px]">Unsafe</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Sub-optimal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
