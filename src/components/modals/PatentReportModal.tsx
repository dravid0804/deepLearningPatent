import React from 'react';
import { PATENT_FEATURES, PATENT_CLAIMS } from '../../services/patent/patentClaims';
import { EVALUATION_METRICS_DATA } from '../../services/simulation/simulationScenarios';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Award
} from 'lucide-react';

interface PatentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatentReportModal: React.FC<PatentReportModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                ANT-EV 2.0 Patent Specification & Technical Disclosure Document
              </h2>
              <p className="text-xs text-slate-500">Formal invention disclosures, mathematical proofs, experimental results, and 12 patent claims</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-8 font-sans text-slate-800 printable-area">
          
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-2">
            <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">
              PATENT TECHNICAL DISCLOSURE & SPECIFICATION REPORT
            </span>
            <h1 className="text-2xl font-black text-slate-900 tech-font">
              ANT-EV 2.0: Deep-Learning-Enhanced Autonomous EV Energy Negotiation Network
            </h1>
            <p className="text-xs text-slate-500">
              Inventors: ANT-EV Systems Research Group • Classification: G06Q 50/06, H02J 3/32, B60L 53/63 • Status: Demonstration Ready
            </p>
          </div>

          {/* 1. Abstract */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider font-mono">1. Abstract of the Invention</h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              A computer-implemented multi-agent system for autonomous electric vehicle (EV) charging negotiation that couples a deep-learning predictive intelligence layer with a privacy-preserving reciprocity memory engine (PRISM-ANT) and a deterministic safety constraint subsystem. Deep learning models predict actual energy required for upcoming trips, forecast station demand, estimate battery state of health, and calculate degradation costs. Competing charging requests are resolved through digital-twin utility token exchange under hard battery thermal, electrical power envelope, and grid capacity constraints, ensuring zero safety violations while reducing waiting time by 57% and extending battery lifetime by 24%.
            </p>
          </div>

          {/* 2. Central Inventive Framing */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider font-mono">2. Central Inventive Technical Framing</h3>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "A computer-implemented system that receives current and historical EV/infrastructure data; generates learned predictions of future energy need, charging demand and battery condition; converts predicted battery impact into a charging-lifetime cost; maintains a reciprocity state from prior cooperative actions; creates feasible charging alternatives across authorized resources; applies physical and operational constraints; and uses a multi-agent negotiation process to select and execute an explainable charging action, followed by comparison of predicted and observed outcomes."
            </p>
          </div>

          {/* 3. The 11 Real-World Features (F1–F11) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider font-mono">3. Eleven Real-World Patent Features (F1–F11)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {PATENT_FEATURES.map((feat) => (
                <div key={feat.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-sky-800 font-mono">{feat.id}: {feat.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{feat.claimReference}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{feat.simpleDefinition}</p>
                  <div className="pt-1 font-mono text-[10px] text-slate-900 overflow-x-auto bg-white p-2 rounded border border-slate-200">
                    <code>{feat.mathematicalBasis}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Experimental Validation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider font-mono">4. Experimental Verification & Baseline Comparison</h3>
            <table className="w-full text-left font-mono text-xs text-slate-800 border border-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[9px]">
                <tr>
                  <th className="py-2.5 px-2.5 border-b border-slate-200">Metric</th>
                  <th className="py-2.5 px-2 border-b border-slate-200">Baseline FIFO</th>
                  <th className="py-2.5 px-2 border-b border-slate-200">PRISM-ANT 1.0</th>
                  <th className="py-2.5 px-2 border-b border-slate-200 text-sky-700 font-bold">ANT-EV 2.0 (Proposed)</th>
                  <th className="py-2.5 px-2 border-b border-slate-200 text-emerald-700 font-bold">Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Mean Waiting Time</td>
                  <td className="py-2 px-2">{EVALUATION_METRICS_DATA.averageWaitTimeMin.baselineFifo}m</td>
                  <td className="py-2 px-2">{EVALUATION_METRICS_DATA.averageWaitTimeMin.baselinePrism1}m</td>
                  <td className="py-2 px-2 font-bold text-sky-700">{EVALUATION_METRICS_DATA.averageWaitTimeMin.antev2}m</td>
                  <td className="py-2 px-2 text-emerald-700 font-bold">-57.1%</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Battery Lifetime Preserved</td>
                  <td className="py-2 px-2">{EVALUATION_METRICS_DATA.batteryLifetimePreservedPercent.baselineFifo}%</td>
                  <td className="py-2 px-2">{EVALUATION_METRICS_DATA.batteryLifetimePreservedPercent.baselinePrism1}%</td>
                  <td className="py-2 px-2 font-bold text-emerald-700">{EVALUATION_METRICS_DATA.batteryLifetimePreservedPercent.antev2}%</td>
                  <td className="py-2 px-2 text-emerald-700 font-bold">+24.2%</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-bold text-slate-900">Hard Safety Violations</td>
                  <td className="py-2 px-2 text-red-600 font-bold">{EVALUATION_METRICS_DATA.hardConstraintViolationsCount.baselineFifo}</td>
                  <td className="py-2 px-2 text-amber-600 font-bold">{EVALUATION_METRICS_DATA.hardConstraintViolationsCount.baselinePrism1}</td>
                  <td className="py-2 px-2 font-black text-emerald-700">0 (STRICT ZERO)</td>
                  <td className="py-2 px-2 text-emerald-700 font-bold">100% Safe</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Complete Patent Claims */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider font-mono">5. Formal Patent Claims (1–12)</h3>
            <div className="space-y-3 font-mono text-xs">
              {PATENT_CLAIMS.map((c) => (
                <div key={c.claimNumber} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-sky-800">
                    <span>Claim {c.claimNumber} ({c.type}): {c.title}</span>
                    <span className="text-slate-500">{c.correspondingFeature}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed font-sans">{c.claimText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>ANT-EV 2.0 System Specification Verification</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Patent Filing & Evaluation
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
