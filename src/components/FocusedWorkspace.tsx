import React, { useState } from 'react';
import {
  ArrowRight, Cpu, Plus, ShieldCheck, Trash2, Zap,
  Activity, CheckCircle2, AlertTriangle, Battery, Gauge
} from 'lucide-react';
import type { ChargingStation, EVDigitalTwin, GridTwinState, PrismAntDecisionResult } from '../types/antev';
import { allocateStationPower, type StationAllocation } from '../services/engine/stationAllocator';

type Props = {
  tab: string;
  evs: EVDigitalTwin[];
  station: ChargingStation;
  grid: GridTwinState;
  decisions: Record<string, PrismAntDecisionResult>;
  onAddEv: (v: {
    name: string;
    soc: number;
    target: number;
    deadline: number;
    maxPower: number;
    temperature: number;
    emergency: boolean;
    goods: boolean;
  }) => void;
  onRemoveEv: (id: string) => void;
};

export const FocusedWorkspace: React.FC<Props> = ({
  evs,
  station,
  decisions,
  onAddEv,
  onRemoveEv,
}) => {
  const rows = allocateStationPower(evs, decisions, station);
  const totalAllocated = rows.reduce((s, r) => s + r.powerKw, 0);
  const completed = evs.filter((x) => x.status === 'completed');
  const availableHeadroom = Math.max(0, station.maxGridPowerCapacityKw - totalAllocated);

  return (
    <main className="focused-page">
      {/* Hero Section */}
      <section className="split-hero">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> STATION CONTROLLER · DYNAMIC CHARGE SPLITTING
          </p>
          <h1>Real-Time Autonomous Power Allocation Across Bays</h1>
          <p>
            The charging station controller uses <b>ACCM consequence intelligence</b> to evaluate candidate power levels and <b>PRISM-ANT</b> to negotiate dynamic charge-splitting, subject to an inviolable 42°C thermal and transformer safety gate.
          </p>
        </div>
        <div className="split-total">
          <span>Active Station Power</span>
          <strong>{totalAllocated.toFixed(1)} kW</strong>
          <small>of {station.maxGridPowerCapacityKw} kW Site Transformer Limit ({availableHeadroom.toFixed(1)} kW headroom)</small>
        </div>
      </section>

      {/* ACCM Status Banner */}
      <section className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-900">ACCM DEEP LEARNING MODEL</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">ONLINE</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Single Unified Neural Network (1.23M params) assisting PRISM-ANT Negotiation
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Temporal S6 SSM: <b className="text-emerald-600 font-extrabold">ONLINE</b>
          </span>
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Bay Relational GAT: <b className="text-emerald-600 font-extrabold">ONLINE</b>
          </span>
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Physics Residual: <b className="text-emerald-600 font-extrabold">ONLINE</b>
          </span>
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Action Decoder: <b className="text-emerald-600 font-extrabold">ONLINE</b>
          </span>
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Uncertainty: <b className="text-emerald-600 font-extrabold">ONLINE</b>
          </span>
        </div>
      </section>

      {/* Station Summary Metrics */}
      <section className="split-summary">
        <div>
          <b>{rows.length}</b>
          <span>Occupied Charging Bays</span>
        </div>
        <div>
          <b>{rows.filter((r) => r.powerKw > 0).length}</b>
          <span>Actively Receiving Power</span>
        </div>
        <div>
          <b>{completed.length}</b>
          <span>Completed & Ready to Depart</span>
        </div>
        <div>
          <b>{availableHeadroom < 1.0 ? 'TRANSFORMER FULL' : 'HEADROOM SAFE'}</b>
          <span>Grid Feeder Constraint</span>
        </div>
      </section>

      {/* Add EV Component */}
      <AddEv onAdd={onAddEv} />

      {/* Live Allocation Panel */}
      <section className="allocation-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">DYNAMIC CHARGE SPLITTING</p>
            <h2>Power Allocation, Reasoning, and Safety Envelopes per Bay</h2>
          </div>
          <span className="safe-pill">
            <ShieldCheck size={15} /> 42°C Thermal Interlock + Transformer Gate Enforced
          </span>
        </div>

        <div className="allocation-list">
          {rows.map((row) => (
            <AllocationRow
              key={row.ev.id}
              row={row}
              station={station}
              onRemove={onRemoveEv}
            />
          ))}
        </div>

        {completed.length > 0 && (
          <div className="completed-strip mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <b>Ready to depart:</b>{' '}
            {completed.map((ev) => `${ev.name} (${ev.telemetry.soc}%)`).join(' · ')}
          </div>
        )}
      </section>

      {/* Algorithm Explainer Card */}
      <section className="algorithm-card">
        <div>
          <Cpu size={19} />
          <div>
            <p className="eyebrow">CLOSED-LOOP ALLOCATION METHODOLOGY</p>
            <h2>ACCM Consequence Prediction + PRISM-ANT Reciprocity + Deterministic Safety</h2>
          </div>
        </div>
        <ol>
          <li>
            <b>1. ACCM Consequence Forecast:</b> The unified deep learning model forecasts the multi-horizon battery temperature, SOC delta, degradation cost, and grid impact for candidate power actions, generating an 8-dimensional Action Sacrifice Vector (S_a).
          </li>
          <li>
            <b>2. PRISM-ANT Reciprocity Ledger:</b> PRISM-ANT calculates an auditable allocation priority using travel urgency, departure deadline, and accumulated driver reciprocity credits (cooperative drivers receive charging priority).
          </li>
          <li>
            <b>3. Deterministic Hard Safety Gate:</b> Electro-thermal constraints clamp the maximum power intake if core battery temperature reaches 42°C or if the station transformer is congested.
          </li>
          <li>
            <b>4. Dynamic Capped Water-Filling:</b> The station controller divides all available transformer capacity fairly among active bays, dynamically recalculating whenever a new EV plugs in or departs.
          </li>
        </ol>
      </section>
    </main>
  );
};

function AllocationRow({
  row,
  station,
  onRemove,
}: {
  row: StationAllocation;
  station: ChargingStation;
  onRemove: (id: string) => void;
}) {
  const { ev, powerKw, capKw, reserveKw, targetSoc, reason, signals } = row;
  const isCappedByTemp = ev.telemetry.batteryTemp >= 41.5;

  return (
    <article className={powerKw > 0 ? 'allocation-row receiving' : 'allocation-row'}>
      <div className="vehicle-label">
        <span className="vehicle-dot">
          <Zap size={14} />
        </span>
        <div>
          <b className="text-slate-900 font-bold">{ev.name}</b>
          <small className="text-slate-500">
            {ev.telemetry.soc}% → {targetSoc}% · departure in {ev.mobility.departureDeadlineMin} min · {ev.telemetry.batteryTemp}°C
          </small>
        </div>
      </div>

      <div className="allocation-track">
        <i
          style={{
            width: `${Math.min(100, (powerKw / Math.max(1, station.maxGridPowerCapacityKw)) * 250)}%`,
          }}
        />
      </div>

      <div className="allocation-value text-right">
        <b className="text-blue-700 font-bold">{powerKw.toFixed(1)} kW</b>
        <small className="text-slate-500 block">
          Reserve: {reserveKw.toFixed(0)} kW · Safe Cap: {capKw.toFixed(0)} kW
        </small>
      </div>

      <div className="reason">
        <b className="text-slate-800 font-bold">Allocation Logic</b>
        <span className="text-slate-600 block text-xs">{reason}</span>
        <small className="signal-line text-[10px] text-blue-700 font-mono mt-1 block">
          ACCM Energy: {signals.energyNeedKwh.toFixed(1)} kWh · ACCM Thermal Risk: {Math.round(signals.thermalRisk * 100)}% {isCappedByTemp ? '(THERMAL CLAMP ACTIVE)' : ''} · Reciprocity Credit: {ev.utilityToken.reciprocityCredit}
        </small>
      </div>

      <button
        className="remove-ev text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50"
        onClick={() => onRemove(ev.id)}
        title="Unplug this EV"
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}

function AddEv({ onAdd }: { onAdd: Props['onAddEv'] }) {
  const [v, setV] = useState({
    name: 'New EV',
    soc: 25,
    target: 80,
    deadline: 90,
    maxPower: 80,
    temperature: 30,
    emergency: false,
    goods: false,
  });

  const set = (key: keyof typeof v, value: string | boolean) =>
    setV((x) => ({
      ...x,
      [key]: typeof value === 'string' && key !== 'name' ? Number(value) : value,
    }));

  const field = (
    label: string,
    key: 'soc' | 'target' | 'deadline' | 'maxPower' | 'temperature',
    min: number,
    max?: number
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={v[key]}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );

  return (
    <section className="add-ev">
      <div>
        <p className="eyebrow">SIMULATE NEW VEHICLE ARRIVAL</p>
        <h2>Connect EV to Charging Bay</h2>
        <p>Plug in a new vehicle to see the station controller re-estimate ACCM consequences and dynamically split power.</p>
      </div>
      <div className="add-grid">
        <label className="field name-field">
          <span>Vehicle Name / Bay ID</span>
          <input value={v.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        {field('Current SOC %', 'soc', 1, 99)}
        {field('Target SOC %', 'target', 1, 95)}
        {field('Departure in min', 'deadline', 15)}
        {field('Max Intake kW', 'maxPower', 1)}
        {field('Battery Temp °C', 'temperature', 0, 50)}

        <div className="add-actions">
          <label className="check">
            <input
              type="checkbox"
              checked={v.emergency}
              onChange={(e) => set('emergency', e.target.checked)}
            />{' '}
            Medical Emergency
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={v.goods}
              onChange={(e) => set('goods', e.target.checked)}
            />{' '}
            Commercial Fleet
          </label>
          <button onClick={() => onAdd(v)}>
            <Plus size={15} /> Plug In & Reallocate
          </button>
        </div>
      </div>
    </section>
  );
}
