import React, { useState } from 'react';
import {
  Table, ShieldCheck, AlertCircle, ArrowUpDown, Zap, CheckCircle2,
  AlertTriangle, Clock, Flame, Battery, TrendingUp, Info
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, GridTwinState } from '../../types/antev';
import type { CandidateAction, AccmActionConsequence } from '../../types/accm';
import { AccmService } from '../../services/models/accmService';

interface Props {
  evs: EVDigitalTwin[];
  station: ChargingStation;
  grid: GridTwinState;
}

export const LiveConsequenceMatrix: React.FC<Props> = ({ evs, station, grid }) => {
  const [selectedEvId, setSelectedEvId] = useState<string>(evs[0]?.id || '');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('15m');
  const [sortBy, setSortBy] = useState<string>('action');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const currentEv = evs.find((e) => e.id === selectedEvId) || evs[0];
  const accmResult = currentEv ? AccmService.predictConsequences(currentEv, station, grid) : null;

  if (!currentEv || !accmResult) {
    return <div className="p-8 text-center text-slate-500">No active vehicles available for consequence matrix.</div>;
  }

  // Sort candidate actions
  const sortedActions = [...accmResult.actions].sort((a, b) => {
    let valA: any = 0;
    let valB: any = 0;

    const dataA = a.horizons[selectedHorizon];
    const dataB = b.horizons[selectedHorizon];

    if (sortBy === 'action') {
      valA = a.action;
      valB = b.action;
    } else if (sortBy === 'soc') {
      valA = dataA.soc;
      valB = dataB.soc;
    } else if (sortBy === 'temp') {
      valA = dataA.battery_temp_c;
      valB = dataB.battery_temp_c;
    } else if (sortBy === 'degradation') {
      valA = a.sacrifice_vector.degradation;
      valB = b.sacrifice_vector.degradation;
    } else if (sortBy === 'grid') {
      valA = dataA.grid_load_pct;
      valB = dataB.grid_load_pct;
    } else if (sortBy === 'waiting') {
      valA = dataA.waiting_time_min;
      valB = dataB.waiting_time_min;
    } else if (sortBy === 'confidence') {
      valA = a.confidence[selectedHorizon];
      valB = b.confidence[selectedHorizon];
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="focused-page">
      {/* Header */}
      <section className="split-hero">
        <div>
          <p className="eyebrow"><span className="live-dot" /> ACCM ACTION EXPLORATION MATRIX</p>
          <h1>Action-Conditioned Multi-Horizon Consequence Matrix</h1>
          <p>
            Comparing predicted future states for all 7 candidate actions at {selectedHorizon} horizon.
            Notice how ACCM predicts distinct consequence trajectories and sacrifice vectors for each proposal.
          </p>
        </div>
        <div className="split-total">
          <span>Active EV</span>
          <strong>{currentEv.name}</strong>
          <small>SOC {currentEv.telemetry.soc}% · {currentEv.telemetry.batteryTemp}°C</small>
        </div>
      </section>

      {/* Control Bar: EV Selector & Horizon Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Select Vehicle:</span>
          <select
            aria-label="Select vehicle for consequence matrix"
            value={selectedEvId}
            onChange={(e) => setSelectedEvId(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
          >
            {evs.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.telemetry.soc}% SOC, {ev.telemetry.batteryTemp}°C)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Forecast Horizon:</span>
          {['5m', '10m', '15m', '30m', '60m'].map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHorizon(h)}
              className={`px-3 py-1 text-xs font-extrabold rounded-md transition-colors ${
                selectedHorizon === h ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Live Matrix Table */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
              <th className="p-3.5 cursor-pointer" onClick={() => handleSort('action')}>
                Candidate Action <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 cursor-pointer text-right" onClick={() => handleSort('soc')}>
                SOC ({selectedHorizon}) <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 cursor-pointer text-right" onClick={() => handleSort('temp')}>
                Battery Temp <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 cursor-pointer text-right" onClick={() => handleSort('degradation')}>
                Degradation Risk <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 cursor-pointer text-right" onClick={() => handleSort('grid')}>
                Grid Load <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 cursor-pointer text-right" onClick={() => handleSort('waiting')}>
                Wait Added <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 cursor-pointer text-right" onClick={() => handleSort('confidence')}>
                Confidence <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" />
              </th>
              <th className="p-3.5 text-center">Safety Gate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedActions.map((row) => {
              const data = row.horizons[selectedHorizon];
              const unc = row.uncertainty[selectedHorizon];
              const conf = row.confidence[selectedHorizon];
              const s = row.sacrifice_vector;
              const isFast = row.action === 'CHARGE_NOW_FAST';
              const isDelay = row.action === 'COOPERATIVE_DELAY';
              const isV2G = row.action === 'ELIGIBLE_V2G_EXPORT';

              return (
                <tr key={row.action} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isFast ? 'bg-amber-500' : isDelay ? 'bg-purple-500' : isV2G ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <div>
                        <span className="font-extrabold text-slate-900 block">{row.action}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{row.description}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-right font-mono">
                    <span className="font-bold text-slate-800">{data.soc}%</span>
                    <span className="text-[10px] text-slate-400 block font-sans">± {unc.soc}%</span>
                  </td>

                  <td className="p-3.5 text-right font-mono">
                    <span className={`font-bold ${data.battery_temp_c >= 42.0 ? 'text-red-600' : data.battery_temp_c >= 36.0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {data.battery_temp_c}°C
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">± {unc.battery_temp_c}°C</span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.degradation > 0.4 ? 'bg-red-500' : s.degradation > 0.15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, s.degradation * 150)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-700">{s.degradation.toFixed(3)}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-right font-mono">
                    <span className={`font-bold ${data.grid_load_pct > 85 ? 'text-red-600' : data.grid_load_pct > 70 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {data.grid_load_pct}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">{data.station_load_kw} kW</span>
                  </td>

                  <td className="p-3.5 text-right font-mono">
                    <span className="font-bold text-slate-800">+{data.waiting_time_min}m</span>
                  </td>

                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {conf}%
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    {row.safety_approved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        <AlertTriangle size={12} /> Clamped
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 8-Dimensional Action Sacrifice Vector Breakdown */}
      <div className="algorithm-card">
        <p className="eyebrow">LEARNED ACTION SACRIFICE VECTORS \vec{`{S}`}_a \in [0, 1]^8</p>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Sacrifice Vector Breakdown by Candidate Action</h2>
        <p className="text-xs text-slate-500 mb-4">
          PRISM-ANT consumes these normalized vectors to compute equity trade-offs between EV drivers and station grid operators.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedActions.map((row) => {
            const s = row.sacrifice_vector;
            return (
              <div key={row.action} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>{row.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">Dim: 8</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thermal Strain:</span>
                    <span className="font-mono font-bold text-slate-700">{s.thermal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Degradation:</span>
                    <span className="font-mono font-bold text-slate-700">{s.degradation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grid Impact:</span>
                    <span className="font-mono font-bold text-slate-700">{s.grid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waiting Penalty:</span>
                    <span className="font-mono font-bold text-slate-700">{s.waiting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fairness Deviation:</span>
                    <span className="font-mono font-bold text-slate-700">{s.fairness}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
