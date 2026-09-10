import React, { useState } from 'react';
import {
  Table, ShieldCheck, AlertCircle, ArrowUpDown, Zap, CheckCircle2,
  AlertTriangle, Clock, Flame, Battery, TrendingUp, Info, Cpu, Scale,
  Lock, Activity, Sliders, ChevronRight
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

  const getActionColor = (action: string) => {
    if (action.includes('FAST')) return 'bg-amber-500 text-amber-900 border-amber-300';
    if (action.includes('DELAY')) return 'bg-purple-500 text-purple-900 border-purple-300';
    if (action.includes('V2G')) return 'bg-emerald-500 text-emerald-900 border-emerald-300';
    if (action.includes('REDUCE')) return 'bg-orange-500 text-orange-900 border-orange-300';
    return 'bg-blue-500 text-blue-900 border-blue-300';
  };

  return (
    <div className="focused-page">
      {/* 1. Header Hero */}
      <section className="split-hero">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> ACCM ACTION EXPLORATION MATRIX · MULTI-HORIZON SIMULATION
          </p>
          <h1>Action-Conditioned Consequence & Sacrifice Matrix</h1>
          <p>
            Real-time forward simulation of candidate energy actions for <b>{currentEv.name}</b>.
            ACCM forward-simulates physical states across 5 operational horizons, generating the 8-dimensional
            sacrifice vector consumed by PRISM-ANT for fair power negotiation.
          </p>
        </div>
        <div className="split-total">
          <span>Active EV Telemetry</span>
          <strong>{currentEv.name}</strong>
          <small>SOC: {currentEv.telemetry.soc}% · Temp: {currentEv.telemetry.batteryTemp}°C · Pmax: {currentEv.telemetry.maxChargingPowerKw} kW</small>
        </div>
      </section>

      {/* 2. Top Summary Metrics Bar (Aligned with App Visual Identity) */}
      <section className="split-summary">
        <div>
          <b>7 Actions</b>
          <span>Candidate choices forward-simulated</span>
        </div>
        <div>
          <b>5 Horizons</b>
          <span>5m, 10m, 15m, 30m, 60m predictions</span>
        </div>
        <div>
          <b>8-Dim Vector</b>
          <span>S_a ∈ [0, 1]⁸ sacrifice space</span>
        </div>
        <div>
          <b>42.0°C Guard</b>
          <span>Non-bypassable thermal safety clamp</span>
        </div>
      </section>

      {/* 3. Interactive Control Bar: EV Selector & Horizon Switcher */}
      <section className="allocation-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* EV Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Battery size={14} className="text-blue-600" /> Target Vehicle:
            </span>
            <select
              aria-label="Select vehicle for consequence matrix"
              value={selectedEvId}
              onChange={(e) => setSelectedEvId(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {evs.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.telemetry.soc}% SOC · {ev.telemetry.batteryTemp}°C · {ev.type})
                </option>
              ))}
            </select>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Arrival: {currentEv.mobility.departureDeadlineMin}m deadline
            </span>
          </div>

          {/* Horizon Switcher as Clean Segmented Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600" /> Forecast Horizon:
            </span>
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              {['5m', '10m', '15m', '30m', '60m'].map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    selectedHorizon === h
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Consequence Matrix Table */}
      <section className="allocation-panel">
        <div className="panel-head mb-4">
          <div>
            <p className="eyebrow">PHYSICAL FORWARD SIMULATION AT T + {selectedHorizon.toUpperCase()}</p>
            <h2>Action-Conditioned Consequence Trajectory Table</h2>
          </div>
          <span className="safe-pill">
            <ShieldCheck size={14} /> Calibrated Heteroscedastic Uncertainty (±σ)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-[980px] w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold">
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors w-[250px]"
                  onClick={() => handleSort('action')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate Action</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[110px]"
                  onClick={() => handleSort('soc')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>SOC ({selectedHorizon})</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[115px]"
                  onClick={() => handleSort('temp')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Cell Temp</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[140px]"
                  onClick={() => handleSort('degradation')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Degradation Risk</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[115px]"
                  onClick={() => handleSort('grid')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Grid Feeder</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[95px]"
                  onClick={() => handleSort('waiting')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Wait Added</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-center w-[100px]"
                  onClick={() => handleSort('confidence')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Confidence</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center w-[115px]">
                  <span>Safety Interlock</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedActions.map((row) => {
                const data = row.horizons[selectedHorizon];
                const unc = row.uncertainty[selectedHorizon];
                const conf = row.confidence[selectedHorizon];
                const s = row.sacrifice_vector;
                const isClamped = !row.safety_approved;

                return (
                  <tr
                    key={row.action}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isClamped ? 'bg-red-50/20' : ''
                    }`}
                  >
                    {/* Action Name & Description */}
                    <td className="px-4 py-3.5 font-bold">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-none ${getActionColor(row.action).split(' ')[0]}`} />
                        <div>
                          <span className="font-extrabold text-slate-900 block tracking-tight">
                            {row.action}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal leading-tight block mt-0.5">
                            {row.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Predicted SOC */}
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span className="font-bold text-slate-900 text-xs block">
                        {data.soc.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        ± {unc.soc.toFixed(1)}%
                      </span>
                    </td>

                    {/* Battery Temperature */}
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span
                        className={`font-extrabold text-xs block ${
                          data.battery_temp_c >= 42.0
                            ? 'text-red-600'
                            : data.battery_temp_c >= 37.0
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {data.battery_temp_c.toFixed(1)}°C
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        ± {unc.battery_temp_c.toFixed(1)}°C
                      </span>
                    </td>

                    {/* Degradation Risk */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full ${
                              s.degradation > 0.4
                                ? 'bg-red-500'
                                : s.degradation > 0.2
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, s.degradation * 150))}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {s.degradation.toFixed(3)}
                        </span>
                      </div>
                    </td>

                    {/* Grid Load */}
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span
                        className={`font-bold text-xs block ${
                          data.grid_load_pct > 85
                            ? 'text-red-600'
                            : data.grid_load_pct > 70
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {data.grid_load_pct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans block">
                        {data.station_load_kw.toFixed(0)} kW draw
                      </span>
                    </td>

                    {/* Waiting Penalty */}
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span className="font-bold text-slate-800 text-xs">
                        +{data.waiting_time_min}m
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {conf}%
                      </span>
                    </td>

                    {/* Safety Gate Decision */}
                    <td className="px-4 py-3.5 text-center">
                      {row.safety_approved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
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
      </section>

      {/* 5. 8-Dimensional Action Sacrifice Vector Breakdown (Fixed CSS Selector Conflict) */}
      <section className="allocation-panel">
        <div className="panel-head mb-4">
          <div>
            <p className="eyebrow">LEARNED ACTION SACRIFICE VECTORS · S_a ∈ [0, 1]⁸</p>
            <h2>Normalized Sacrifice Vectors Consumed by PRISM-ANT</h2>
          </div>
          <span className="safe-pill">
            <Scale size={14} /> Multi-Attribute Reciprocity Currency
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-4 -mt-2">
          ACCM compresses multi-horizon physical consequences into an 8-dimensional normalized sacrifice vector S_a.
          PRISM-ANT evaluates these trade-offs against driver credit ledgers to negotiate equitable power-splitting without black-box reward gaming.
        </p>

        {/* Clean, Uniform Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {sortedActions.map((row, idx) => {
            const s = row.sacrifice_vector;
            const composite = ((s.thermal + s.degradation + s.grid + s.waiting + s.fairness) / 5).toFixed(3);

            return (
              <div
                key={row.action}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      a = {idx}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      Dim 8
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-2 tracking-tight">
                    {row.action}
                  </h4>
                </div>

                {/* Dimension Bars */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Thermal Strain:</span>
                    <span className="font-mono font-bold text-slate-800">{s.thermal.toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.thermal * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Degradation:</span>
                    <span className="font-mono font-bold text-slate-800">{s.degradation.toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${s.degradation * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Grid Feeder:</span>
                    <span className="font-mono font-bold text-slate-800">{s.grid.toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.grid * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Wait Added:</span>
                    <span className="font-mono font-bold text-slate-800">{s.waiting.toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.waiting * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Fairness Deviation:</span>
                    <span className="font-mono font-bold text-slate-800">{s.fairness.toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${s.fairness * 100}%` }} />
                  </div>
                </div>

                {/* Composite Sacrifice Magnitude */}
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-bold">Sacrifice Index ||S_a||:</span>
                  <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {composite}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Technical Explanation: How PRISM-ANT Consumes Consequence Intelligence */}
      <section className="allocation-panel bg-slate-50/50">
        <div className="panel-head mb-3">
          <div>
            <p className="eyebrow">GAME-THEORETIC RECIPROCITY COUPLING</p>
            <h2>How PRISM-ANT Reads ACCM Consequence Outputs</h2>
          </div>
          <span className="safe-pill">
            <Lock size={14} /> Deterministic Safety Coupling
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed mt-3">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Cpu size={14} />
              <span>1. Predictive Intelligence Layer</span>
            </div>
            <p className="text-slate-600">
              ACCM forward-simulates all 7 candidate actions across 5 horizons simultaneously. It outputs calibrated mean physical parameters, heteroscedastic uncertainty (±σ), and the 8-dim Action Sacrifice Vector S_a.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-700 font-bold">
              <Scale size={14} />
              <span>2. Reciprocity Negotiation</span>
            </div>
            <p className="text-slate-600">
              PRISM-ANT accepts S_a as an immutable trade-off currency. It balances driver urgency, departure deadlines, and historical concession credits in an auditable exponential decay ledger without touching neural weights.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <ShieldCheck size={14} />
              <span>3. Inviolable Safety Gate</span>
            </div>
            <p className="text-slate-600">
              Before any negotiated power level is actuated at a charging bay dispenser, the deterministic safety gate unconditionally verifies that cell temperature &lt; 42.0°C and total feeder power ≤ transformer limits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
