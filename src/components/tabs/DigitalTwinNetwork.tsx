import React, { useState } from 'react';
import type { EVDigitalTwin, ChargingStation, GridTwinState, FleetTwinState } from '../../types/antev';
import { 
  Network, 
  Car, 
  BatteryCharging, 
  Zap, 
  Building2, 
  Truck, 
  Lock, 
  CheckCircle2, 
  Database,
  Cpu
} from 'lucide-react';

interface DigitalTwinNetworkProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  fleet: FleetTwinState;
}

export const DigitalTwinNetwork: React.FC<DigitalTwinNetworkProps> = ({
  evs,
  stations,
  grid,
  fleet
}) => {
  const [selectedAgentType, setSelectedAgentType] = useState<'EV' | 'BATTERY' | 'STATION' | 'GRID' | 'FLEET'>('EV');
  const [selectedEvId, setSelectedEvId] = useState<string>(evs[0]?.id || 'EV-A');
  const selectedEv = evs.find(e => e.id === selectedEvId) || evs[0];

  return (
    <div className="space-y-6">
      {/* Top Description Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              PATENT FEATURE F6
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Multi-Agent Digital Twin Network & Unified State Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Each physical asset runs an autonomous digital twin in software. Twins exchange cryptographically signed, privacy-preserving utility tokens rather than raw user identities, negotiating optimal resource allocation under hard physical limits.
          </p>
        </div>

        {/* Agent Switcher */}
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedAgentType('EV')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedAgentType === 'EV' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>EV Twin</span>
          </button>
          <button
            onClick={() => setSelectedAgentType('BATTERY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedAgentType === 'BATTERY' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Battery Twin</span>
          </button>
          <button
            onClick={() => setSelectedAgentType('STATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedAgentType === 'STATION' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Station Twin</span>
          </button>
          <button
            onClick={() => setSelectedAgentType('GRID')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedAgentType === 'GRID' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Grid Twin</span>
          </button>
          <button
            onClick={() => setSelectedAgentType('FLEET')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedAgentType === 'FLEET' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet Twin</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Columns: Interactive Multi-Agent Network Topology Diagram */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Network className="w-4 h-4 text-sky-600" />
              Asynchronous Multi-Agent Token Exchange Graph
            </h3>

            {/* Interactive Graph Box */}
            <div className="relative w-full h-[360px] bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" className="animate-flow-dash" />
                <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#34d399" strokeWidth="2" strokeDasharray="4,4" className="animate-flow-dash" />
                <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4,4" className="animate-flow-dash" />
                <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" className="animate-flow-dash" />
                <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#c084fc" strokeWidth="2" strokeDasharray="4,4" className="animate-flow-dash" />
              </svg>

              {/* Central PRISM-ANT Core */}
              <div className="relative z-10 w-28 h-28 rounded-full bg-slate-950 border-2 border-sky-400 p-2 flex flex-col items-center justify-center shadow-lg text-center">
                <Cpu className="w-6 h-6 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span className="text-[10px] font-black text-white mt-1 font-mono">PRISM-ANT</span>
                <span className="text-[8px] text-sky-300">Negotiation Core</span>
              </div>

              {/* Node 1: EV Twin */}
              <div 
                onClick={() => setSelectedAgentType('EV')}
                className={`absolute top-6 left-8 cursor-pointer p-3 rounded-xl border flex flex-col items-center transition ${
                  selectedAgentType === 'EV' ? 'bg-sky-950 border-sky-400 scale-110 shadow-md text-sky-300' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <Car className="w-5 h-5 text-sky-400" />
                <span className="text-[10px] font-bold mt-1">EV Twin</span>
                <span className="text-[8px] text-slate-400 font-mono">{selectedEv.id}</span>
              </div>

              {/* Node 2: Battery Twin */}
              <div 
                onClick={() => setSelectedAgentType('BATTERY')}
                className={`absolute top-6 right-8 cursor-pointer p-3 rounded-xl border flex flex-col items-center transition ${
                  selectedAgentType === 'BATTERY' ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-md text-emerald-300' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold mt-1">Battery Twin</span>
                <span className="text-[8px] text-emerald-300 font-mono">NASA Aging</span>
              </div>

              {/* Node 3: Station Twin */}
              <div 
                onClick={() => setSelectedAgentType('STATION')}
                className={`absolute bottom-6 left-6 cursor-pointer p-3 rounded-xl border flex flex-col items-center transition ${
                  selectedAgentType === 'STATION' ? 'bg-blue-950 border-blue-400 scale-110 shadow-md text-blue-300' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] font-bold mt-1">Station Twin</span>
                <span className="text-[8px] text-blue-300 font-mono">Queue {stations[0].queueLength}</span>
              </div>

              {/* Node 4: Grid Twin */}
              <div 
                onClick={() => setSelectedAgentType('GRID')}
                className={`absolute bottom-6 right-6 cursor-pointer p-3 rounded-xl border flex flex-col items-center transition ${
                  selectedAgentType === 'GRID' ? 'bg-amber-950 border-amber-400 scale-110 shadow-md text-amber-300' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] font-bold mt-1">Grid Twin</span>
                <span className="text-[8px] text-amber-300 font-mono">{grid.gridStatus}</span>
              </div>

              {/* Node 5: Fleet Twin */}
              <div 
                onClick={() => setSelectedAgentType('FLEET')}
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 cursor-pointer p-2.5 rounded-xl border flex flex-col items-center transition ${
                  selectedAgentType === 'FLEET' ? 'bg-purple-950 border-purple-400 scale-110 shadow-md text-purple-300' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <Truck className="w-4 h-4 text-purple-400" />
                <span className="text-[9px] font-bold mt-0.5">Fleet Twin</span>
                <span className="text-[8px] text-purple-300 font-mono">20 Vans</span>
              </div>

            </div>

            {/* Privacy Token Explanation */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">Privacy-Preserving Utility Token (Zero-PII Exposure)</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Raw user identity, driver calendar, and trip addresses are strictly protected inside the vehicle twin. Only normalized math tokens are shared during PRISM-ANT negotiation.
              </p>

              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Token ID:</span>
                  <span className="text-sky-700 font-bold">{selectedEv.utilityToken.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cryptographic Hash:</span>
                  <span className="text-emerald-700 font-bold">{selectedEv.utilityToken.anonymizedHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Urgency Index (u_i):</span>
                  <span className="text-slate-900 font-bold">{selectedEv.utilityToken.urgencyScore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flexibility Index (f_i):</span>
                  <span className="text-slate-900 font-bold">{selectedEv.utilityToken.flexibilityScore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reciprocity Credit (R_i):</span>
                  <span className="text-amber-700 font-bold">{selectedEv.utilityToken.reciprocityCredit} cr</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right 6 Columns: Unified Digital-Twin State Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            {/* EV Selector Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Unified Digital-Twin State Inspector</h3>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {evs.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvId(e.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition ${
                      selectedEvId === e.id ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {e.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Tree State Structure */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs space-y-3 overflow-x-auto text-slate-300">
              <div className="text-sky-400 font-bold">
                EV_TWIN_STATE({selectedEv.id} @ t)
              </div>

              {/* Branch 1 */}
              <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                <span className="text-sky-400 font-semibold">├─ Vehicle Telemetry</span>
                <p className="text-slate-200 pl-3">SOC: <span className="text-white font-bold">{selectedEv.telemetry.soc}%</span> | SOH: <span className="text-emerald-400 font-bold">{selectedEv.telemetry.soh}%</span> | Temp: <span className={selectedEv.telemetry.batteryTemp > 40 ? "text-red-400 font-bold" : "text-white font-bold"}>{selectedEv.telemetry.batteryTemp}°C</span></p>
                <p className="text-slate-400 pl-3">Voltage: {selectedEv.telemetry.voltage}V | Max Power: {selectedEv.telemetry.maxChargingPowerKw} kW</p>
              </div>

              {/* Branch 2 */}
              <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                <span className="text-purple-400 font-semibold">├─ Mobility & Route</span>
                <p className="text-slate-200 pl-3">Route: {selectedEv.mobility.route} ({selectedEv.mobility.distanceKm} km)</p>
                <p className="text-slate-200 pl-3">Deadline: <span className="text-amber-300 font-bold">{selectedEv.mobility.departureDeadlineMin} min</span> | Required Trip Energy: <span className="text-white font-bold">{selectedEv.mobility.estimatedTripEnergyKwh} kWh</span></p>
              </div>

              {/* Branch 3 */}
              <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                <span className="text-emerald-400 font-semibold">├─ Driver Utility Token</span>
                <p className="text-slate-200 pl-3">Urgency: {selectedEv.utilityToken.urgencyScore.toFixed(2)} | Flexibility: {selectedEv.utilityToken.flexibilityScore.toFixed(2)} | Reciprocity: {selectedEv.utilityToken.reciprocityCredit} cr</p>
              </div>

              {/* Branch 4 */}
              <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                <span className="text-amber-400 font-semibold">├─ Battery Prognostics (NASA Model M3/M4)</span>
                <p className="text-slate-200 pl-3">Degradation Cost: <span className="text-amber-300 font-bold">${selectedEv.batteryTwin.degradationCostPerKwh}/kWh</span> | RUL: <span className="text-emerald-400 font-bold">{selectedEv.batteryTwin.remainingUsefulLifeCycles} cycles</span></p>
                <p className="text-slate-200 pl-3">Safe Power Envelope: <span className="text-sky-300 font-bold">≤ {selectedEv.batteryTwin.safePowerEnvelopeKw} kW</span></p>
              </div>

              {/* Branch 5 */}
              <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                <span className="text-blue-400 font-semibold">├─ Station & Grid Context</span>
                <p className="text-slate-200 pl-3">Assigned: {stations[0].name} | Queue: {stations[0].queueLength} EVs | Grid: {grid.gridStatus}</p>
              </div>

              {/* Branch 6 */}
              <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                <span className="text-green-400 font-semibold">└─ AI Inferences (M1–M6)</span>
                <p className="text-slate-200 pl-3">Confidence: 94.2% | Uncertainty: ±0.4 kWh | Status: Validated Closed-Loop</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-900 font-bold">Zero-PII Compliance Verified</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">ISO 15118-20 / OCPP 2.0.1 Ready</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
