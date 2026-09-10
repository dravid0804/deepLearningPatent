import React, { useState } from 'react';
import { 
  Clock, 
  Battery, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, PrismAntDecisionResult } from '../../types/antev';

interface ChargingQueueProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  decisions: Record<string, PrismAntDecisionResult>;
  onSelectEv: (ev: EVDigitalTwin) => void;
  onTriggerNegotiation: (evId: string) => void;
}

export const ChargingQueue: React.FC<ChargingQueueProps> = ({
  evs,
  stations,
  decisions,
  onSelectEv,
  onTriggerNegotiation
}) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredEvs = evs.filter((ev) => {
    if (filterAction === 'ALL') return true;
    const dec = decisions[ev.id];
    return dec?.selectedAction === filterAction;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">03 • EV Charging Queue & Priority Scheduler</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              PRISM-ANT 2.0 RECIPROCITY ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Centrally manages competing vehicle session objects, calculates station priority scores, and selects optimal actions.
          </p>
        </div>

        {/* Action Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'CHARGE_NOW_FAST', 'COOPERATIVE_DELAY', 'REDUCE_POWER', 'NO_CHARGE_NEEDED'].map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterAction === act
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Session & Vehicle</th>
                <th className="py-3.5 px-4">Current SOC</th>
                <th className="py-3.5 px-4">Target SOC</th>
                <th className="py-3.5 px-4">Energy Deficit (E_req)</th>
                <th className="py-3.5 px-4">Departure Req</th>
                <th className="py-3.5 px-4">Flexibility</th>
                <th className="py-3.5 px-4">Battery / Temp</th>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4">Recommended Station Action</th>
                <th className="py-3.5 px-4 text-right">Power Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvs.map((ev, idx) => {
                const dec = decisions[ev.id];
                const action = dec?.selectedAction || 'STANDARD_QUEUE';
                const power = dec?.assignedPowerKw || 0;
                const isThrottled = ev.telemetry.batteryTemp >= 42.0;

                return (
                  <tr 
                    key={ev.id}
                    onClick={() => onSelectEv(ev)}
                    className="hover:bg-blue-50/40 transition cursor-pointer group"
                  >
                    {/* Session ID & Vehicle Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ev.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ev.utilityToken.anonymizedHash || `SESS_10${idx+1}`} • {ev.model}
                      </div>
                    </td>

                    {/* Current SOC */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{ev.telemetry.soc}%</span>
                      </div>
                    </td>

                    {/* Target SOC */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {ev.mobility.destinationSocRequired}%
                    </td>

                    {/* Energy Deficit */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                      {ev.mobility.estimatedTripEnergyKwh.toFixed(1)} kWh
                    </td>

                    {/* Departure Deadline */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {ev.mobility.departureDeadlineMin} mins
                    </td>

                    {/* Flexibility */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ev.utilityToken.flexibilityScore > 0.6 
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.utilityToken.flexibilityScore > 0.3
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ev.utilityToken.flexibilityScore > 0.6 ? 'High' : ev.utilityToken.flexibilityScore > 0.3 ? 'Medium' : 'Strict'}
                      </span>
                    </td>

                    {/* Battery Status & Temp */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-bold ${isThrottled ? 'text-amber-700' : 'text-slate-700'}`}>
                        {ev.telemetry.batteryTemp}°C
                      </span>
                      <div className="text-[10px] text-slate-400">SOH: {ev.telemetry.soh}%</div>
                    </td>

                    {/* PRISM-ANT Priority Score */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {(ev.utilityToken.urgencyScore * 0.5 + ev.utilityToken.reciprocityCredit * 0.1).toFixed(2)}
                    </td>

                    {/* Recommended Action */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        action.includes('FAST')
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : action.includes('DELAY')
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : action.includes('REDUCE')
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Power Dispatched */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {power > 0 ? `${power.toFixed(1)} kW` : '0 kW (Queued)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
