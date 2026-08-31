import React from 'react';
import type { EVDigitalTwin, ChargingStation, GridTwinState, PrismAntDecisionResult } from '../../types/antev';
import { DeepLearningIntelligenceLayer } from '../../services/models/deepLearningLayer';
import { 
  X, 
  Car, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface EvDetailModalProps {
  ev: EVDigitalTwin | null;
  station: ChargingStation;
  grid: GridTwinState;
  decision?: PrismAntDecisionResult;
  onClose: () => void;
}

export const EvDetailModal: React.FC<EvDetailModalProps> = ({
  ev,
  station,
  grid,
  decision,
  onClose
}) => {
  if (!ev) return null;

  const predictions = DeepLearningIntelligenceLayer.runFullInferencePackage(ev, station, grid, 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{ev.name}</h2>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-mono font-bold">{ev.id}</span>
              </div>
              <p className="text-xs text-slate-500">{ev.model} • {ev.mobility.route}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Telemetry & Battery State */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">State of Charge</span>
              <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{ev.telemetry.soc}%</p>
              <span className="text-[10px] text-slate-500">Nominal: {ev.telemetry.nominalCapacityKwh} kWh</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Battery Temperature</span>
              <p className={`text-xl font-black font-mono mt-0.5 ${ev.telemetry.batteryTemp > 40 ? 'text-red-600' : 'text-slate-900'}`}>
                {ev.telemetry.batteryTemp}°C
              </p>
              <span className="text-[10px] text-slate-500">{ev.telemetry.batteryTemp > 40 ? 'Thermal Throttle Active' : 'Safe Range'}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Departure Window</span>
              <p className="text-xl font-black text-amber-700 font-mono mt-0.5">{ev.mobility.departureDeadlineMin} min</p>
              <span className="text-[10px] text-slate-500">Distance: {ev.mobility.distanceKm} km</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Reciprocity Balance</span>
              <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">{ev.utilityToken.reciprocityCredit} cr</p>
              <span className="text-[10px] text-slate-500">Sacrificed: {ev.utilityToken.sacrificeMinutesHistory} min</span>
            </div>
          </div>

          {/* AI Predictors Package */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Deep Learning Intelligence Layer Output (M1–M6)
            </h3>

            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px]">M1 Trip Need:</span>
                <p className="font-bold text-slate-900">{predictions.m1EnergySession.predictedEnergyKwh} kWh</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px]">M3 SOH / RUL:</span>
                <p className="font-bold text-emerald-700">{predictions.m3BatteryHealthRul.predictedSohPercent}% ({predictions.m3BatteryHealthRul.estimatedRulRemainingCycles} cyc)</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px]">M4 Degradation Cost:</span>
                <p className="font-bold text-amber-700">${predictions.m4BatteryCostStress.lifetimeDegradationCostUsd}</p>
              </div>
            </div>
          </div>

          {/* PRISM-ANT Decision */}
          {decision && (
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sky-900 uppercase font-mono">Current Action: {decision.selectedAction.replace(/_/g, ' ')}</span>
                <span className="text-emerald-700 font-mono font-bold">{decision.assignedPowerKw > 0 ? `${decision.assignedPowerKw} kW Assigned` : 'Cooperative Hold'}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{decision.explainability.winningFactorSummary}</p>
            </div>
          )}

          {/* Privacy Token Info */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Privacy Token: {ev.utilityToken.anonymizedHash}
            </span>
            <span className="text-emerald-700 font-bold">Zero PII Transmitted</span>
          </div>

        </div>

      </div>
    </div>
  );
};
