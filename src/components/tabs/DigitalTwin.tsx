import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  Zap, 
  Battery, 
  ShieldCheck, 
  Server, 
  Eye, 
  Code, 
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, GridTwinState, FleetTwinState } from '../../types/antev';

interface DigitalTwinProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  fleet: FleetTwinState;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  evs,
  stations,
  grid,
  fleet
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('STATION');
  const station = stations[0];

  const twinStateJson = {
    "STATION_TWIN_STATE": {
      "timestamp": "2026-08-31T10:35:00Z",
      "station_id": station.id,
      "config": {
        "total_bays": station.totalChargers,
        "transformer_limit_kw": station.maxGridPowerCapacityKw,
        "solar_pv_kw": station.renewableSolarPowerKw,
        "bess_storage_kwh": 120
      },
      "telemetry": {
        "active_power_kw": 246.6,
        "active_occupancy": "6 / 8 bays",
        "queue_count": evs.length - 6,
        "transformer_headroom_kw": station.maxGridPowerCapacityKw - 246.6
      },
      "grid_twin": {
        "status": grid.gridStatus,
        "feeder_load_mw": grid.currentGridLoadMw,
        "renewable_availability_pct": grid.renewableAvailabilityPercent,
        "tariff_usd_kwh": grid.currentTariffPerKwh
      },
      "fleet_twin": {
        "fleet_id": fleet.fleetId,
        "total_vans": fleet.totalVehicles,
        "deadline": fleet.targetDeadlineTimestamp,
        "ready_target": fleet.requiredReadyCount
      },
      "connected_vehicles_count": evs.length
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">06 • Station Central Digital Twin State Tree</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              LEVEL 4 ARCHITECTURE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Hierarchical digital twin integrating station physical hardware, EV sessions, battery prognostics, grid telemetry, and AI forecasts.
          </p>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
          State Sync: Real-Time
        </div>
      </div>

      {/* Grid: Visual Component Tree + State JSON Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Sub-Twin Nodes */}
        <div className="space-y-3">
          {[
            { id: 'STATION', label: 'Station Central Twin', desc: 'Transformer, bays, solar PV, BESS storage', icon: Server },
            { id: 'SESSIONS', label: 'Active EV Session Twins', desc: `${evs.length} vehicle session objects ingested`, icon: Zap },
            { id: 'BATTERY', label: 'Battery & Thermal Twin', desc: 'SOH %, Arrhenius wear, safe envelope', icon: Battery },
            { id: 'GRID', label: 'Grid Feeder Twin', desc: 'Substation load, solar rise, dynamic tariffs', icon: ShieldCheck },
            { id: 'FLEET', label: 'Fleet Cohort Twin', desc: 'Commercial deadline & energy allocation', icon: Layers },
          ].map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`w-full p-4 rounded-2xl border text-left transition shadow-xs flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{node.label}</div>
                    <div className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{node.desc}</div>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>

        {/* Right 2 Columns: Live JSON Unified State Inspector */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Code className="w-4 h-4" />
                <span>UNIFIED_STATION_STATE_INSPECTOR (t)</span>
              </div>
              <span className="text-[10px] text-slate-500">Live JSON Object</span>
            </div>

            <pre className="text-emerald-300 text-[11px] leading-relaxed">
              {JSON.stringify(twinStateJson, null, 2)}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Privacy Hash Protected (No Personal Driver Identifiers)</span>
            <span className="text-emerald-400 font-bold">● Synchronized with Chargers</span>
          </div>
        </div>

      </div>

    </div>
  );
};
