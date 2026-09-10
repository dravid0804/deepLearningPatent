import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  ArrowDownRight, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import type { ChargingStation, GridTwinState } from '../../types/antev';

interface GridEnergyProps {
  stations: ChargingStation[];
  grid: GridTwinState;
}

export const GridEnergy: React.FC<GridEnergyProps> = ({
  stations,
  grid
}) => {
  const station = stations[0];
  const [v2gSimActive, setV2gSimActive] = useState<boolean>(false);

  const siteCapacityKw = station?.maxGridPowerCapacityKw || 300;
  const currentDrawKw = 246.6;
  const solarOutputKw = station?.renewableSolarPowerKw || 45.0;
  const bessCapacityKwh = 120.0;
  const bessSoc = 78.5;

  const netGridDrawKw = v2gSimActive ? currentDrawKw - 50.0 - solarOutputKw : currentDrawKw - solarOutputKw;
  const headroomKw = siteCapacityKw - netGridDrawKw;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">09 • Grid Headroom, Solar PV & Energy Storage</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              SMART TRANSFORMER CO-PILOT
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time grid feeder monitoring, solar self-consumption, on-site battery storage, and bi-directional V2G peak shaving.
          </p>
        </div>

        <button
          onClick={() => setV2gSimActive(!v2gSimActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            v2gSimActive
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{v2gSimActive ? 'Disable V2G Export' : 'Simulate 50 kW V2G Peak Shaving'}</span>
        </button>
      </div>

      {/* Energy Flow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Grid Power */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>NET GRID DRAW</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {netGridDrawKw.toFixed(1)} <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Transformer Limit: <span className="font-bold text-slate-800">{siteCapacityKw} kW</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-600 mt-3 font-bold">
            Headroom: {headroomKw.toFixed(1)} kW
          </div>
        </div>

        {/* Solar Generation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>ON-SITE SOLAR PV</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {solarOutputKw.toFixed(1)} <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Renewable Share: <span className="font-bold text-slate-800">88.7%</span>
          </div>
          <div className="text-[10px] font-mono text-amber-600 mt-3 font-bold">
            Directly Offsets Grid Draw
          </div>
        </div>

        {/* Station BESS Storage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>STATION BESS STORAGE</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {bessSoc}% <span className="text-xs font-normal text-slate-500">SOC</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Capacity: <span className="font-bold text-slate-800">{bessCapacityKwh} kWh</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-600 mt-3 font-bold">
            {v2gSimActive ? 'Discharging 50 kW' : 'Standby / Ready'}
          </div>
        </div>

        {/* Real-time Dynamic Tariff */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>DYNAMIC TARIFF</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            ${station.tariffPerKwh.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tier: <span className="font-bold text-slate-800">Shoulder (Off-Peak at 21:00)</span>
          </div>
          <div className="text-[10px] font-mono text-purple-600 mt-3 font-bold">
            Demand Charge: $18.50/kW
          </div>
        </div>

      </div>

      {/* Interactive V2G & Peak Shaving Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Feature F5 &amp; F7: Peak Shaving &amp; Demand Response</h3>
            <p className="text-xs text-slate-500">
              How ANT-EV prevents expensive utility demand penalties by combining solar PV, stationary batteries, and participating V2G vehicles.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-slate-400 text-[10px] font-bold">RAW ACTIVE VEHICLE LOAD</div>
            <div className="text-lg font-black text-slate-900 mt-1">{currentDrawKw} kW</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Sum across active dispensers</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-amber-600 text-[10px] font-bold">LOCAL GENERATION OFFSET</div>
            <div className="text-lg font-black text-amber-700 mt-1">
              -{solarOutputKw + (v2gSimActive ? 50.0 : 0.0)} kW
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Solar PV + V2G Discharge</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-emerald-700 text-[10px] font-bold">NET GRID TRANSFORMER LOAD</div>
            <div className="text-lg font-black text-emerald-700 mt-1">{netGridDrawKw.toFixed(1)} kW</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Headroom: {headroomKw.toFixed(1)} kW</div>
          </div>
        </div>
      </div>

    </div>
  );
};
