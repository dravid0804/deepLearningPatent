import React, { useState } from 'react';
import { 
  Award, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import type { EVDigitalTwin, PrismAntDecisionResult } from '../../types/antev';

interface FairnessMemoryProps {
  evs: EVDigitalTwin[];
  decisions: Record<string, PrismAntDecisionResult>;
}

export const FairnessMemory: React.FC<FairnessMemoryProps> = ({
  evs,
  decisions
}) => {
  const [testSacrificeMin, setTestSacrificeMin] = useState<number>(30);
  const [testElapsedDays, setTestElapsedDays] = useState<number>(3);
  const [testUsageCount, setTestUsageCount] = useState<number>(1);

  // Reciprocity Equation: R_i(t+1) = R_i(t) * exp(-lambda * delta_t) + gamma * delta_t_sac - omega * usage
  const lambda = 0.0495; // 14-day half-life decay
  const gamma = 0.05;    // 0.05 credits per minute delayed
  const omega = 0.8;     // 0.8 credits deducted on fast priority usage
  const initialCredit = 2.0;

  const decayedInitial = initialCredit * Math.exp(-lambda * testElapsedDays);
  const earnedCredit = gamma * testSacrificeMin;
  const deductedCredit = omega * testUsageCount;
  const netCreditScore = Number(Math.max(0, decayedInitial + earnedCredit - deductedCredit).toFixed(2));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">10 • PRISM-ANT Fairness &amp; Reciprocity Memory Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              PATENT FEATURE F3 ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Eliminates blind FIFO queues by fairly rewarding drivers who accept cooperative charging delays during rush hours.
          </p>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          Decay Half-Life: 14 Days (exp(-λ·Δt))
        </div>
      </div>

      {/* Grid: Live Ledger Table + Equation Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Station Reciprocity Memory Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">Active Driver Fairness Ledger</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Anonymous Session Hash</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3">Driver Hash</th>
                  <th className="py-3 px-3">Historical Delays</th>
                  <th className="py-3 px-3">Reciprocity Balance</th>
                  <th className="py-3 px-3">Priority Modifier</th>
                  <th className="py-3 px-3">Current Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {evs.slice(0, 6).map((ev) => {
                  const credit = ev.utilityToken.reciprocityCredit;
                  const delayMin = ev.utilityToken.sacrificeMinutesHistory;
                  const modifier = (credit * 0.12).toFixed(2);

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-sans font-bold text-slate-800">
                        {ev.utilityToken.anonymizedHash || ev.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{delayMin} minutes delayed</td>
                      <td className="py-3 px-3 font-bold text-amber-700">{credit.toFixed(1)} Credits</td>
                      <td className="py-3 px-3 font-bold text-blue-700">+{modifier} Priority</td>
                      <td className="py-3 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          credit > 2.0 
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {credit > 2.0 ? 'Priority Redeemed' : 'Standard Earn'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Interactive Reciprocity Equation Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                EQUATION SIMULATOR
              </span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Reciprocity Formula</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono text-[11px]">
              R_i(t+1) = R_i(t) · exp(-λ·Δt) + γ·Δt_sac - ω·U
            </p>

            {/* Delay Slider */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Voluntary Delay Accepted:</span>
                <span className="font-mono text-amber-700 font-bold">{testSacrificeMin} min</span>
              </div>
              <input 
                type="range"
                min="0"
                max="90"
                step="5"
                value={testSacrificeMin}
                onChange={(e) => setTestSacrificeMin(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Days Elapsed Slider */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Time Elapsed (Decay):</span>
                <span className="font-mono text-slate-700 font-bold">{testElapsedDays} days</span>
              </div>
              <input 
                type="range"
                min="0"
                max="30"
                step="1"
                value={testElapsedDays}
                onChange={(e) => setTestElapsedDays(parseInt(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>

            {/* Priority Usage Slider */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Fast Priority Redeemed:</span>
                <span className="font-mono text-blue-700 font-bold">{testUsageCount} sessions</span>
              </div>
              <input 
                type="range"
                min="0"
                max="3"
                step="1"
                value={testUsageCount}
                onChange={(e) => setTestUsageCount(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Result Card */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-[10px] uppercase font-bold text-amber-800">Calculated Reciprocity Score</div>
              <div className="text-2xl font-black text-amber-900 mt-1 font-mono">
                {netCreditScore} <span className="text-xs font-normal text-amber-700">Credits</span>
              </div>
              <div className="text-xs font-bold mt-1 text-amber-800">
                Grants +{(netCreditScore * 0.12).toFixed(2)} Priority Boost in Queue
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
            Guarantees fairness without storing personal trip data.
          </div>
        </div>

      </div>

    </div>
  );
};
