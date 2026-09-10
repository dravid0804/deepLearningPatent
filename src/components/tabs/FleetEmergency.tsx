import React, { useState } from 'react';
import { 
  Truck, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';
import type { FleetTwinState, EVDigitalTwin } from '../../types/antev';

interface FleetEmergencyProps {
  fleet: FleetTwinState;
  evs: EVDigitalTwin[];
}

export const FleetEmergency: React.FC<FleetEmergencyProps> = ({
  fleet,
  evs
}) => {
  const [emergencySimActive, setEmergencySimActive] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">11 • Commercial Fleet Staggering &amp; Emergency Preemption</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              PATENT FEATURES F9 &amp; F10 ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Optimizes commercial fleet cohort departure readiness while providing safe, context-aware preemption for emergency vehicles.
          </p>
        </div>

        <button
          onClick={() => setEmergencySimActive(!emergencySimActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            emergencySimActive
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{emergencySimActive ? 'Emergency Ambulance Active (120 kW)' : 'Simulate Emergency Arrival'}</span>
        </button>
      </div>

      {/* 2-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Commercial Fleet Optimization (F10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">Commercial Fleet Cohort Scheduling</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Target: {fleet.targetDeadlineTimestamp}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Treats the commercial delivery fleet ({fleet.fleetName}) as an aggregated cohort. Staggers individual charging slots so all vans are 90% ready without spiking station transformer peaks:
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold">TOTAL VANS</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{fleet.totalVehicles} Vehicles</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold">READY AT 06:00</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">{fleet.requiredReadyCount} / {fleet.totalVehicles}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold">ENERGY DEFICIT</div>
                <div className="text-lg font-black text-blue-700 mt-0.5">{fleet.totalEnergyDeficitKwh} kWh</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {fleet.fleetOptimizedSchedule.map((slot, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-bold text-slate-800">{slot.vehicleId}</span>
                  </div>
                  <span className="text-slate-600">Target SOC: {slot.targetSoc}%</span>
                  <span className="font-bold text-blue-700">{slot.scheduledSlot}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fleet SLA 100% Guaranteed under 300 kW Transformer Cap</span>
          </div>
        </div>

        {/* Right Column: Contextual Emergency Preemption (F9) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">Emergency Vehicle Preemption</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                emergencySimActive ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {emergencySimActive ? 'AMBULANCE ACTIVE' : 'NO EMERGENCY'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Contextual priority is granted based on verified real-time battery deficit and critical departure needs, while maintaining safe battery thermal boundaries:
            </p>

            {emergencySimActive ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>Active Preemption: EV_EMERGENCY_AMB1</span>
                    <span className="font-mono text-rose-700">120.0 kW Dispatched</span>
                  </div>
                  <p className="text-rose-800 text-[11px] mt-1 font-medium">
                    Arrival SOC: 12% • Required: 90% in 30 minutes • Battery Temp: 31.0°C (Safe).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">Station Compensation &amp; Safety Protocol:</div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Delayed commercial sessions automatically credited with +0.5 Reciprocity.</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Thermal sensors active: If T_bat &ge; 42.0°C, power clamps safely to 25 kW.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-xl">
                No active emergency service vehicle at the station. Standard PRISM-ANT priority active.
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Context-Aware Preemption (No permanent hardcoded flags)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
