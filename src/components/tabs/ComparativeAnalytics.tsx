import React, { useState } from 'react';
import { EVALUATION_METRICS_DATA } from '../../services/simulation/simulationScenarios';
import { PATENT_CLAIMS } from '../../services/patent/patentClaims';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Award
} from 'lucide-react';

export const ComparativeAnalytics: React.FC = () => {
  const [selectedClaimNumber, setSelectedClaimNumber] = useState<number>(1);
  const selectedClaim = PATENT_CLAIMS.find(c => c.claimNumber === selectedClaimNumber) || PATENT_CLAIMS[0];

  const metrics = EVALUATION_METRICS_DATA;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              SECTION 12 & 17
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Comparative Benchmark Analytics & Patent Claims Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Quantitative evaluation comparing ANT-EV 2.0 against Baseline FIFO (Greedy) and Baseline PRISM-ANT 1.0. Complete formal mapping of Patent Claims 1–12 against software modules and algorithmic proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-emerald-700 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>12 Claims Verified</span>
        </div>
      </div>

      {/* Comparative Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Average Waiting Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Average Waiting Time</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">{metrics.averageWaitTimeMin.antev2} min</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -57.1%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100 font-mono">
            <div className="flex justify-between"><span>Baseline FIFO:</span> <span>{metrics.averageWaitTimeMin.baselineFifo} min</span></div>
            <div className="flex justify-between"><span>PRISM 1.0:</span> <span>{metrics.averageWaitTimeMin.baselinePrism1} min</span></div>
          </div>
        </div>

        {/* Metric 2: Battery Degradation Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Battery Degradation Cost</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 font-mono">${metrics.batteryDegradationCostTotalUsd.antev2}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -62.0%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100 font-mono">
            <div className="flex justify-between"><span>Baseline FIFO:</span> <span>${metrics.batteryDegradationCostTotalUsd.baselineFifo}</span></div>
            <div className="flex justify-between"><span>PRISM 1.0:</span> <span>${metrics.batteryDegradationCostTotalUsd.baselinePrism1}</span></div>
          </div>
        </div>

        {/* Metric 3: Renewable Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Renewable Energy Utilized</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-700 font-mono">{metrics.renewableEnergyUtilizedPercent.antev2}%</span>
            <span className="text-xs font-bold text-sky-700 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +101.5%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100 font-mono">
            <div className="flex justify-between"><span>Baseline FIFO:</span> <span>{metrics.renewableEnergyUtilizedPercent.baselineFifo}%</span></div>
            <div className="flex justify-between"><span>PRISM 1.0:</span> <span>{metrics.renewableEnergyUtilizedPercent.baselinePrism1}%</span></div>
          </div>
        </div>

        {/* Metric 4: Hard Safety Violations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Constraint Violations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 font-mono">{metrics.hardConstraintViolationsCount.antev2}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">STRICT 0</span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100 font-mono">
            <div className="flex justify-between text-red-600"><span>Baseline FIFO:</span> <span>{metrics.hardConstraintViolationsCount.baselineFifo} violations</span></div>
            <div className="flex justify-between text-amber-600"><span>PRISM 1.0:</span> <span>{metrics.hardConstraintViolationsCount.baselinePrism1} violations</span></div>
          </div>
        </div>

      </div>

      {/* Architecture Comparison Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          Three-Tier System Architecture Benchmark Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[9px]">
              <tr>
                <th className="py-3 px-3">Evaluation Metric</th>
                <th className="py-3 px-3 text-slate-500">Baseline 1: FIFO (Greedy)</th>
                <th className="py-3 px-3 text-blue-700">Baseline 2: PRISM-ANT 1.0</th>
                <th className="py-3 px-3 text-sky-800 font-bold bg-sky-50 border-l border-r border-sky-200">
                  ANT-EV 2.0 (Proposed ML+RL)
                </th>
                <th className="py-3 px-3 text-emerald-700 font-bold">Desired Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Mean Waiting Time</td>
                <td className="py-2.5 px-3 text-slate-500">34.5 min</td>
                <td className="py-2.5 px-3 text-blue-700">26.2 min</td>
                <td className="py-2.5 px-3 font-bold text-sky-800 bg-sky-50 border-l border-r border-sky-200">14.8 min</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Lower (57% saved)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Battery Lifetime Preserved</td>
                <td className="py-2.5 px-3 text-slate-500">68.2%</td>
                <td className="py-2.5 px-3 text-blue-700">76.5%</td>
                <td className="py-2.5 px-3 font-bold text-emerald-600 bg-sky-50 border-l border-r border-sky-200">92.4%</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Higher (+24.2%)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Grid Peak Load Contribution</td>
                <td className="py-2.5 px-3 text-slate-500">485 kW</td>
                <td className="py-2.5 px-3 text-blue-700">390 kW</td>
                <td className="py-2.5 px-3 font-bold text-sky-800 bg-sky-50 border-l border-r border-sky-200">295 kW</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Lower (-39.1%)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Unnecessary Charging Avoided (F8)</td>
                <td className="py-2.5 px-3 text-slate-500">0.0 kWh</td>
                <td className="py-2.5 px-3 text-blue-700">18.5 kWh</td>
                <td className="py-2.5 px-3 font-bold text-sky-800 bg-sky-50 border-l border-r border-sky-200">74.2 kWh</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Lower Overconsumption</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Fairness Index (Jain's Index)</td>
                <td className="py-2.5 px-3 text-slate-500">0.52</td>
                <td className="py-2.5 px-3 text-blue-700">0.81</td>
                <td className="py-2.5 px-3 font-bold text-sky-800 bg-sky-50 border-l border-r border-sky-200">0.94</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Balanced Fairness</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Hard Safety Violations</td>
                <td className="py-2.5 px-3 text-red-600 font-bold">14 Unsafe Actions</td>
                <td className="py-2.5 px-3 text-amber-600 font-bold">3 Unsafe Actions</td>
                <td className="py-2.5 px-3 font-black text-emerald-600 bg-sky-50 border-l border-r border-sky-200">0 (STRICT ZERO)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Zero Violations</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Explainability Audit Coverage</td>
                <td className="py-2.5 px-3 text-slate-500">0%</td>
                <td className="py-2.5 px-3 text-blue-700">85%</td>
                <td className="py-2.5 px-3 font-bold text-sky-800 bg-sky-50 border-l border-r border-sky-200">100% Target</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Full Auditability</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Patent Claims Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-600" />
              Formal Patent Claims Matrix (12 Claims Filed)
            </h3>
            <p className="text-xs text-slate-500">Complete formal patent claims structure drafted for patent publishing and examiner review</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-700 border border-slate-200">
            Patent Class: G06Q / H02J / B60L
          </span>
        </div>

        {/* Claim Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PATENT_CLAIMS.map((claim) => (
            <button
              key={claim.claimNumber}
              onClick={() => setSelectedClaimNumber(claim.claimNumber)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedClaimNumber === claim.claimNumber
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>Claim {claim.claimNumber}</span>
              <span className="text-[10px] opacity-75">({claim.type[0]})</span>
            </button>
          ))}
        </div>

        {/* Selected Claim Content */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold text-sky-700">
                {selectedClaim.type === 'INDEPENDENT' ? 'INDEPENDENT CLAIM' : `DEPENDENT CLAIM (Depends on Claim ${selectedClaim.dependsOn})`}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Claim {selectedClaim.claimNumber}: {selectedClaim.title}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-mono font-bold border border-purple-200">
              Features: {selectedClaim.correspondingFeature}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed">
            <p>{selectedClaim.claimText}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
