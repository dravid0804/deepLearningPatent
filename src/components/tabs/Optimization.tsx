import React, { useState } from 'react';
import { 
  Sliders, 
  Zap, 
  ShieldCheck, 
  TrendingDown, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, PrismAntDecisionResult } from '../../types/antev';

interface OptimizationProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  decisions: Record<string, PrismAntDecisionResult>;
}

export const Optimization: React.FC<OptimizationProps> = ({
  evs,
  stations,
  decisions
}) => {
  const station = stations[0];
  const transformerLimitKw = station?.maxGridPowerCapacityKw || 300;

  // Unconstrained Raw Requests (EV1: 150 kW, EV2: 100 kW, EV3: 120 kW, EV4: 80 kW = 450 kW)
  const unconstrainedRequests = [
    { id: 'EV1', name: 'EV-A (Model S)', requestedKw: 150.0, urgency: 0.88, credit: 1.2, temp: 33.5 },
    { id: 'EV2', name: 'EV-B (Ioniq 5)', requestedKw: 100.0, urgency: 0.35, credit: 4.8, temp: 29.8 },
    { id: 'EV3', name: 'EV-C (ID.4)', requestedKw: 120.0, urgency: 0.72, credit: 0.5, temp: 32.0 },
    { id: 'EV4', name: 'EV-D (Mach-E)', requestedKw: 80.0, urgency: 0.85, credit: 2.1, temp: 43.8 }, // Over-temp
  ];

  const totalUnconstrainedKw = unconstrainedRequests.reduce((sum, r) => sum + r.requestedKw, 0);

  // Optimized Allocations under 300 kW Transformer Cap and Thermal Safety Gate
  const optimizedAllocations = [
    { id: 'EV1', name: 'EV-A (Model S)', allocatedKw: 110.0, action: 'PRIORITY_FAST_CHARGE', reason: 'High departure urgency + valid credit' },
    { id: 'EV2', name: 'EV-B (Ioniq 5)', allocatedKw: 45.0, action: 'COOPERATIVE_DELAY', reason: 'Flexible dwell time; earned +0.24 credit' },
    { id: 'EV3', name: 'EV-C (ID.4)', allocatedKw: 120.0, action: 'STANDARD_ALLOCATION', reason: 'Fulfilling route destination deficit' },
    { id: 'EV4', name: 'EV-D (Mach-E)', allocatedKw: 25.0, action: 'BATTERY_THERMAL_GUARD', reason: 'Clamped to 25 kW due to 43.8°C thermal limit' },
  ];

  const totalOptimizedKw = optimizedAllocations.reduce((sum, r) => sum + r.allocatedKw, 0);
  const peakShavedKw = totalUnconstrainedKw - totalOptimizedKw;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">05 • Constrained Station Power Optimization</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              M6 RL + QUADRATIC PROGRAMMING
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Visualizing the mathematical transition from unconstrained vehicle requests to physics-safe, optimal station power dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
            Raw Demand: {totalUnconstrainedKw} kW
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            Optimized: {totalOptimizedKw} kW / {transformerLimitKw} kW Cap
          </div>
        </div>
      </div>

      {/* 3-Stage Interactive Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stage 1: Before Optimization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                STAGE 1 • UNCONSTRAINED
              </span>
              <span className="text-xs font-bold text-slate-400">Sum: {totalUnconstrainedKw} kW</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Raw Charging Demands</h3>
            <p className="text-xs text-slate-500 mb-4">
              Vehicles requesting unmanaged full-power charging simultaneously:
            </p>

            <div className="space-y-3">
              {unconstrainedRequests.map((req) => (
                <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{req.name}</span>
                    <span className="font-mono text-rose-600">{req.requestedKw} kW</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Temp: {req.temp}°C • Urgency: {req.urgency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Overload Risk: Exceeds 300 kW transformer by +150 kW!</span>
          </div>
        </div>

        {/* Stage 2: Hard Constraints Detected */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                STAGE 2 • CONSTRAINT GATE
              </span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Physics & Safety Barriers</h3>
            <p className="text-xs text-slate-500 mb-4">
              Deterministic gates applied by ANT-EV before optimization:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  1. Battery Thermal Guard Triggered
                </div>
                <p className="text-amber-800 text-[11px] mt-1">
                  EV-D battery temp is 43.8°C (&ge; 42.0°C). 80 kW fast charge <b>strictly rejected</b>. Clamped to 25 kW safe envelope.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  2. Station Transformer Cap Enforced
                </div>
                <p className="text-amber-800 text-[11px] mt-1">
                  Total load constrained to &le; 300 kW. PRISM-ANT priority and M6 RL determine power distribution.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  3. Cooperative Sacrifice Identified
                </div>
                <p className="text-blue-800 text-[11px] mt-1">
                  EV-B has high flexibility (120m dwell). Modulated to 45 kW with fairness reciprocity compensation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Feasible Action Set Generated</span>
          </div>
        </div>

        {/* Stage 3: After Optimization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                STAGE 3 • OPTIMIZED DISPATCH
              </span>
              <span className="text-xs font-bold text-emerald-700">Total: {totalOptimizedKw} kW</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Final Dispatched Power</h3>
            <p className="text-xs text-slate-500 mb-4">
              Optimal power allocation executed via OCPP 2.0.1:
            </p>

            <div className="space-y-3">
              {optimizedAllocations.map((alloc) => (
                <div key={alloc.id} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{alloc.name}</span>
                    <span className="font-mono text-emerald-700 font-black">{alloc.allocatedKw} kW</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-medium">
                    {alloc.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
            <span>Peak Shaved: -{peakShavedKw} kW</span>
            <span className="text-emerald-700">0 Overload Violations</span>
          </div>
        </div>

      </div>

    </div>
  );
};
