import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Battery, 
  Thermometer, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  Lock
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, PrismAntDecisionResult } from '../../types/antev';

interface LiveStationProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  decisions: Record<string, PrismAntDecisionResult>;
  onSelectEv: (ev: EVDigitalTwin) => void;
}

export const LiveStation: React.FC<LiveStationProps> = ({
  evs,
  stations,
  decisions,
  onSelectEv
}) => {
  const station = stations[0];
  const [selectedBay, setSelectedBay] = useState<number | null>(null);

  // 8 Physical Charger Bays
  const bays = Array.from({ length: 8 }).map((_, i) => {
    const bayNum = i + 1;
    const ev = evs[i % evs.length];
    const isOccupied = i < 6; // 6 active, 2 available
    const dec = ev ? decisions[ev.id] : null;
    const power = isOccupied ? (dec?.assignedPowerKw || (i === 4 ? 25.0 : 75.0)) : 0.0;
    const temp = isOccupied ? (ev?.telemetry.batteryTemp || 32.0) : 24.0;
    const isThermalThrottled = temp >= 42.0;

    let connectorType = 'CCS2 DC FAST (150 kW)';
    if (i === 5) connectorType = 'NACS DC FAST (150 kW)';
    if (i === 6) connectorType = 'TYPE 2 AC (22 kW)';

    return {
      bayNum,
      chargerId: `CHG_0${bayNum}`,
      connectorType,
      maxPowerKw: i === 6 ? 22 : 150,
      isOccupied,
      ev: isOccupied ? ev : null,
      currentPowerKw: power,
      temperatureC: temp,
      isThermalThrottled,
      status: !isOccupied ? 'AVAILABLE' : (isThermalThrottled ? 'THERMAL_GUARD_THROTTLED' : 'ACTIVE_CHARGING')
    };
  });

  const activeCount = bays.filter(b => b.isOccupied).length;
  const availableCount = bays.filter(b => !b.isOccupied).length;
  const totalPower = bays.reduce((sum, b) => sum + b.currentPowerKw, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">02 • Physical Charger Bays & Hardware Telemetry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              8 DISPENSERS MANAGED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time physical dispenser telemetry, OCPP power dispatch envelopes, and thermal safety guard status.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeCount} Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
            <span>{availableCount} Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
            <span>{totalPower.toFixed(1)} kW Total Draw</span>
          </div>
        </div>
      </div>

      {/* 8-Bay Visual Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bays.map((bay) => {
          const powerPct = Math.round((bay.currentPowerKw / bay.maxPowerKw) * 100);

          return (
            <div 
              key={bay.bayNum}
              onClick={() => {
                setSelectedBay(bay.bayNum);
                if (bay.ev) onSelectEv(bay.ev);
              }}
              className={`bg-white rounded-2xl border transition shadow-xs p-5 cursor-pointer relative group ${
                bay.isThermalThrottled 
                  ? 'border-amber-300 hover:border-amber-500 bg-amber-50/20'
                  : bay.isOccupied 
                    ? 'border-blue-200 hover:border-blue-500' 
                    : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              {/* Top Row: Bay ID & Status Chip */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center ${
                    bay.isThermalThrottled 
                      ? 'bg-amber-100 text-amber-800' 
                      : bay.isOccupied 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-200 text-slate-600'
                  }`}>
                    B{bay.bayNum}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">{bay.chargerId}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{bay.connectorType}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  bay.isThermalThrottled
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : bay.isOccupied
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {bay.status === 'ACTIVE_CHARGING' ? 'CHARGING' : bay.status}
                </span>
              </div>

              {/* Middle Section: Power Meter & Gauges */}
              <div className="my-4">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {bay.currentPowerKw.toFixed(1)} <span className="text-xs font-normal text-slate-500">kW</span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 font-mono">
                    Max {bay.maxPowerKw} kW
                  </div>
                </div>

                {/* Animated Power Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      bay.isThermalThrottled 
                        ? 'bg-amber-500' 
                        : bay.isOccupied 
                          ? 'bg-blue-600' 
                          : 'bg-transparent'
                    }`}
                    style={{ width: `${powerPct}%` }}
                  />
                </div>
              </div>

              {/* Bottom Telemetry Metrics */}
              {bay.ev ? (
                <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Vehicle:</span>
                    <span className="font-bold text-slate-800">{bay.ev.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Battery SOC:</span>
                    <span className="font-bold text-blue-700">{bay.ev.telemetry.soc}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Pack Temp:</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      bay.temperatureC >= 42.0 ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                      <Thermometer className="w-3 h-3" />
                      {bay.temperatureC.toFixed(1)}°C
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center py-2 font-mono">
                  Dispenser Ready for Next Vehicle
                </div>
              )}

              {/* Hover inspect hint */}
              <div className="mt-3 text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <span>Click to Inspect Digital Twin</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
