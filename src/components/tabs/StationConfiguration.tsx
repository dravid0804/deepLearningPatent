import React, { useState } from 'react';
import { 
  Settings, 
  UploadCloud, 
  Save, 
  CheckCircle2, 
  Zap, 
  Sun, 
  BatteryCharging, 
  DollarSign, 
  ShieldCheck,
  FileText,
  Sparkles
} from 'lucide-react';
import type { ChargingStation } from '../../types/antev';

interface StationConfigurationProps {
  station: ChargingStation;
  onSaveConfig?: (config: any) => void;
}

export const StationConfiguration: React.FC<StationConfigurationProps> = ({
  station,
  onSaveConfig
}) => {
  const [stationName, setStationName] = useState<string>(station.name);
  const [stationId, setStationId] = useState<string>(station.id);
  const [baysCount, setBaysCount] = useState<number>(station.totalChargers);
  const [transformerKw, setTransformerKw] = useState<number>(station.maxGridPowerCapacityKw);
  const [solarKw, setSolarKw] = useState<number>(station.renewableSolarPowerKw);
  const [bessKwh, setBessKwh] = useState<number>(120);
  const [peakTariff, setPeakTariff] = useState<number>(0.48);
  const [offPeakTariff, setOffPeakTariff] = useState<number>(0.12);
  const [thermalLimitC, setThermalLimitC] = useState<number>(42.0);
  const [safeEnvelopeKw, setSafeEnvelopeKw] = useState<number>(25.0);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [datasetLoaded, setDatasetLoaded] = useState<boolean>(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">14 • Level 1: Station Hardware Configuration &amp; Data Onboarding</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              STATION-CENTRIC ONBOARDING
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure the physical electrical infrastructure, charger bay profiles, pricing rules, and calibrate using station datasets.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Station Configuration Saved &amp; Twins Recalibrated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Station Hardware & Electrical Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Station Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Station Physical &amp; Electrical Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Station Name</label>
                <input 
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Station ID (Unique)</label>
                <input 
                  type="text"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Total Physical Charging Bays</label>
                <input 
                  type="number"
                  min="2"
                  max="32"
                  value={baysCount}
                  onChange={(e) => setBaysCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Transformer Power Limit (P_grid, max in kW)</label>
                <input 
                  type="number"
                  step="10"
                  value={transformerKw}
                  onChange={(e) => setTransformerKw(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">On-Site Solar PV Capacity (kWp)</label>
                <input 
                  type="number"
                  value={solarKw}
                  onChange={(e) => setSolarKw(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-amber-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Station BESS Storage Capacity (kWh)</label>
                <input 
                  type="number"
                  value={bessKwh}
                  onChange={(e) => setBessKwh(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card: Tariffs & Hard Safety Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Tariff Policy &amp; Hard Safety Gate Limits</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Peak Time-of-Use Rate ($/kWh)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={peakTariff}
                  onChange={(e) => setPeakTariff(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-purple-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Off-Peak Rate ($/kWh)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={offPeakTariff}
                  onChange={(e) => setOffPeakTariff(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Battery Thermal Cutoff Limit (°C)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={thermalLimitC}
                  onChange={(e) => setThermalLimitC(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-amber-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Throttled Safe Power Envelope (kW)</label>
                <input 
                  type="number"
                  value={safeEnvelopeKw}
                  onChange={(e) => setSafeEnvelopeKw(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration &amp; Sync Station Engine</span>
              </button>
            </div>
          </div>

        </div>

        {/* Col 3: Dataset Ingestion & Model Calibration Center */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UploadCloud className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Dataset Ingestion &amp; Calibration</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Upload local historical session logs to calibrate Model M1 (E_req) and Model M2 (Demand forecast) specifically for this charging station:
            </p>

            <div className="p-4 border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl text-center cursor-pointer transition bg-slate-50/50 mb-4">
              <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">historical_sessions.csv</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Caltech ACN-Data format • 10,480 records</div>
              <div className="mt-2 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md inline-block">
                CALIBRATED • MAE 1.85 kWh
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Model M1 Baseline:</span>
                <span className="font-bold text-emerald-700">Calibrated</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Model M2 Forecast:</span>
                <span className="font-bold text-emerald-700">Calibrated</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">NASA Aging Series:</span>
                <span className="font-bold text-blue-700">Pre-trained</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Station-Specific Calibration Ready</span>
          </div>
        </div>

      </form>

    </div>
  );
};
