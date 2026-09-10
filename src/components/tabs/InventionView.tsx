import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Zap,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { PATENT_CLAIMS } from '../../services/patent/patentClaims';

export const InventionView: React.FC = () => {
  const [selectedClaimId, setSelectedClaimId] = useState<number>(1);

  const noveltyComparison = [
    {
      dimension: 'Station Authority & Scope',
      fifo: 'Dumb uncoordinated plug',
      ocpp: 'Passive cloud command receiver',
      unconstrainedAi: 'Probabilistic neural controller',
      antev: 'Centralized Station Intelligence Co-Pilot (Autonomous Optimization)'
    },
    {
      dimension: 'Queue Prioritization',
      fifo: 'Blind arrival order (FIFO)',
      ocpp: 'Static manual VIP / paywall',
      unconstrainedAi: 'Black-box neural score',
      antev: 'PRISM-ANT Privacy Reciprocity Ledger with Aging Decay (F3)'
    },
    {
      dimension: 'Charging Target Logic',
      fifo: 'Dumb 100% full top-up',
      ocpp: 'Driver manual slider',
      unconstrainedAi: 'AI estimate without bounds',
      antev: 'Route-Aware Energy Deficit ($E_{req}$) + No-Charge Decision (F1, F8)'
    },
    {
      dimension: 'Battery Degradation Guard',
      fifo: 'None (hardware max wear)',
      ocpp: 'Static fixed power steps',
      unconstrainedAi: 'Neural recommendation (can fail)',
      antev: 'Arrhenius Lifetime Valuation & Safe Power Envelope Clamping (F2, M4)'
    },
    {
      dimension: 'Safety & Physical Limits',
      fifo: 'Physical breaker tripping',
      ocpp: 'Static conservative power caps',
      unconstrainedAi: 'Probabilistic (risk of overload)',
      antev: 'Deterministic Hard Safety Gate (0% Violations Guaranteed)'
    },
    {
      dimension: 'Grid Peak Load Shaving',
      fifo: 'Uncontrolled peak penalties',
      ocpp: 'Fixed time-clock cutoffs',
      unconstrainedAi: 'Offline cloud optimization',
      antev: 'Dynamic Multi-Agent Demand Response & V2G Negotiation (F5, F7)'
    },
    {
      dimension: 'Fleet & Emergency SLAs',
      fifo: 'Treated as ordinary cars',
      ocpp: 'Manual operator bypass',
      unconstrainedAi: 'Ad-hoc priority flags',
      antev: 'Cohort Deadline Optimization & Contextual Preemption (F9, F10)'
    },
    {
      dimension: 'Continuous Learning',
      fifo: 'None',
      ocpp: 'Manual firmware update',
      unconstrainedAi: 'High model drift risk',
      antev: 'Closed-Loop Telemetry Error Feedback & Drift Auto-Calibrate (F11)'
    }
  ];

  const activeClaim = PATENT_CLAIMS.find(c => c.claimNumber === selectedClaimId) || PATENT_CLAIMS[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Patent Invention View &amp; Novelty Matrix</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              PATENT SPECIFICATION VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Formal technical novelty comparison contrasting ANT-EV 2.0 against existing state-of-the-art charging station architectures.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
            IPC: G06Q 50/06 • H02J 3/32 • B60L 53/63
          </div>
        </div>
      </div>

      {/* 1. Direct Novelty Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            State-of-the-Art Prior Art vs ANT-EV 2.0 Novelty Matrix
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-mono">
            8 Novelty Dimensions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-3">Architectural Dimension</th>
                <th className="py-3 px-3">Traditional FIFO Station</th>
                <th className="py-3 px-3">Static Smart OCPP</th>
                <th className="py-3 px-3">Unconstrained Black-Box AI</th>
                <th className="py-3 px-3 text-blue-700 font-black">ANT-EV 2.0 (Proposed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {noveltyComparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{row.dimension}</td>
                  <td className="py-3 px-3 text-slate-500">{row.fifo}</td>
                  <td className="py-3 px-3 text-slate-500">{row.ocpp}</td>
                  <td className="py-3 px-3 text-slate-500">{row.unconstrainedAi}</td>
                  <td className="py-3 px-3 font-bold text-blue-700 bg-blue-50/40">{row.antev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Interactive Claims 1–12 Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              12 Formal Patent Claims Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Select any claim to view its formal technical description, dependent structure, and evidentiary basis:
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700">
            Claims 1–12 Disclosed
          </span>
        </div>

        {/* Claim Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {PATENT_CLAIMS.map((c) => (
            <button
              key={c.claimNumber}
              onClick={() => setSelectedClaimId(c.claimNumber)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                selectedClaimId === c.claimNumber
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Claim {c.claimNumber} {c.claimNumber === 1 ? '(Indep)' : '(Dep)'}
            </button>
          ))}
        </div>

        {/* Selected Claim Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-100 text-blue-800">
              {activeClaim.type} • CLAIM {activeClaim.claimNumber}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">
              Features: {activeClaim.correspondingFeature}
            </span>
          </div>

          <h4 className="text-sm font-black text-slate-900">{activeClaim.title}</h4>
          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
            {activeClaim.claimText}
          </p>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium">
            <b>Dependent Basis:</b> {activeClaim.dependsOn ? `Depends on Claim ${activeClaim.dependsOn}` : 'Independent Claim'}
          </div>
        </div>

      </div>

    </div>
  );
};
