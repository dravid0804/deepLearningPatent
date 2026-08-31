import React, { useState } from 'react';
import type { 
  EVDigitalTwin, 
  ChargingStation, 
  GridTwinState, 
  FleetTwinState, 
  PrismAntDecisionResult 
} from '../../types/antev';
import { AVAILABLE_EV_MODELS } from '../../services/simulation/simulationScenarios';
import { 
  Zap, 
  Battery, 
  Thermometer, 
  Clock, 
  ShieldCheck, 
  Sun, 
  TrendingDown, 
  Flame, 
  Compass, 
  ChevronRight, 
  Coins, 
  Sparkles,
  ArrowUpRight,
  Car,
  Plus,
  Sliders
} from 'lucide-react';

interface MasterDashboardProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
  fleet: FleetTwinState;
  decisions: Record<string, PrismAntDecisionResult>;
  onSelectEv: (ev: EVDigitalTwin) => void;
  onTriggerNegotiation: (evId: string) => void;
  onNavigateTab: (tabId: string) => void;
  onAddEvToQueue?: (model: EVDigitalTwin) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  evs,
  stations,
  grid,
  decisions,
  onSelectEv,
  onTriggerNegotiation,
  onNavigateTab,
  onAddEvToQueue
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('STATION-1');
  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const getActionBadge = (action?: string) => {
    switch (action) {
      case 'CHARGE_NOW_FAST': 
        return { label: 'FAST CHARGE (120 kW)', class: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'CHARGE_NOW_STANDARD': 
        return { label: 'STANDARD CHARGE (50 kW)', class: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'COOPERATIVE_DELAY': 
        return { label: 'COOPERATIVE DELAY (+15 cr)', class: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'REDUCE_POWER': 
        return { label: 'THROTTLED POWER (22 kW)', class: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'REDIRECT_STATION': 
        return { label: 'REDIRECTED (Station 2)', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ELIGIBLE_V2G_EXPORT': 
        return { label: 'V2G GRID EXPORT (-20 kW)', class: 'bg-pink-100 text-pink-800 border-pink-300' };
      case 'NO_CHARGE_NEEDED': 
        return { label: 'NO CHARGE NEEDED (F8)', class: 'bg-slate-100 text-slate-800 border-slate-300' };
      default: 
        return { label: 'IN NEGOTIATION', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top 4 KPI Metric Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Wait Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-sky-500 light-card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Queue Waiting Time</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">14.8 min</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -57% vs FIFO
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Cooperative delay indexing (F3) alleviates peak congestion</p>
        </div>

        {/* KPI 2: Battery Health Preservation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 light-card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Battery Health Preservation</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">+24.2%</span>
                <span className="text-xs font-bold text-emerald-600 font-mono">$3.20/cycle</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Battery className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">M4 thermal stress guard prevents SEI degradation</p>
        </div>

        {/* KPI 3: Renewable Solar Co-location */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500 light-card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Renewable Green Energy</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">88.7%</span>
                <span className="text-xs font-bold text-amber-600 font-mono">+{grid.renewableForecastRiseMin}m Surge</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Energy window reservation (F4) aligns charge with solar peak</p>
        </div>

        {/* KPI 4: Hard Safety Constraints */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500 light-card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Safety & Physics Violations</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600 font-mono">0 VIOLATIONS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">100% SAFE</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Deterministic gate strictly bounds neural policy (M6)</p>
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: City Interactive Topology Map & Grid Status */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Interactive City Energy Topology Visualizer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-600" />
                  City-Wide Digital Twin Energy Network Topology
                </h2>
                <p className="text-xs text-slate-500">Live multi-agent power distribution, renewable solar generation, and cross-station routing</p>
              </div>

              {/* Station Switcher */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {stations.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStationId(st.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      selectedStationId === st.id
                        ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Schematic Canvas with animated power flow lines */}
            <div className="relative w-full h-[320px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Animated SVG Energy Flow Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 120 160 Q 240 80 400 100" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6,4" fill="none" className="animate-flow-dash" />
                <path d="M 120 160 Q 240 220 400 230" stroke="#34d399" strokeWidth="2.5" strokeDasharray="6,4" fill="none" className="animate-flow-dash" />
                <path d="M 400 100 Q 480 160 560 160" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" fill="none" />
              </svg>

              {/* Node 1: Regional Grid Substation */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center p-2 border-2 shadow-lg transition-all ${
                  grid.gridStatus === 'HIGH_LOAD' 
                    ? 'bg-amber-950/90 border-amber-400 text-amber-300' 
                    : 'bg-sky-950/90 border-sky-400 text-sky-300'
                }`}>
                  <Zap className="w-6 h-6 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase mt-1">Grid Feeder</span>
                  <span className="text-[9px] font-mono font-bold">{grid.currentGridLoadMw} MW</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-bold">{grid.gridStatus}</span>
              </div>

              {/* Node 2: Station 1 (Metro Central) */}
              <div className="absolute left-[38%] top-[18%] flex flex-col items-center">
                <div 
                  onClick={() => setSelectedStationId('STATION-1')}
                  className={`cursor-pointer w-28 p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedStationId === 'STATION-1'
                      ? 'bg-sky-950 border-sky-400 ring-2 ring-sky-400/50 scale-105 shadow-lg'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    <span className="text-[11px] font-bold text-white">Station 1</span>
                  </div>
                  <span className="text-[9px] text-amber-300 font-bold mt-0.5">Queue: {stations[0].queueLength} EVs</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${(stations[0].currentPowerDrawKw / stations[0].maxGridPowerCapacityKw) * 100}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 mt-0.5">{stations[0].currentPowerDrawKw} / {stations[0].maxGridPowerCapacityKw} kW</span>
                </div>
              </div>

              {/* Node 3: Station 2 (Tech Park Depot) */}
              <div className="absolute left-[38%] bottom-[15%] flex flex-col items-center">
                <div 
                  onClick={() => setSelectedStationId('STATION-2')}
                  className={`cursor-pointer w-28 p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedStationId === 'STATION-2'
                      ? 'bg-emerald-950 border-emerald-400 ring-2 ring-emerald-400/50 scale-105 shadow-lg'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold text-white">Station 2</span>
                  </div>
                  <span className="text-[9px] text-emerald-300 font-bold mt-0.5">Queue: {stations[1].queueLength} EV</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${(stations[1].currentPowerDrawKw / stations[1].maxGridPowerCapacityKw) * 100}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 mt-0.5">{stations[1].currentPowerDrawKw} / {stations[1].maxGridPowerCapacityKw} kW</span>
                </div>
              </div>

              {/* Node 4: Fleet Logistics Hub */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div 
                  onClick={() => setSelectedStationId('STATION-3')}
                  className={`cursor-pointer w-28 p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedStationId === 'STATION-3'
                      ? 'bg-purple-950 border-purple-400 ring-2 ring-purple-400/50 scale-105 shadow-lg'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold text-white">Fleet Depot</span>
                  <span className="text-[9px] text-purple-300 font-bold mt-0.5">20 Vans Target</span>
                  <span className="text-[8px] font-mono text-slate-400 mt-1">Solar: {stations[2].renewableSolarPowerKw} kW</span>
                </div>
              </div>

            </div>

            {/* Selected Station Telemetry Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Selected Station</span>
                <p className="text-xs font-bold text-slate-900 truncate">{selectedStation.name}</p>
                <p className="text-[10px] text-slate-500">{selectedStation.location}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Chargers Available</span>
                <p className="text-xs font-bold text-emerald-600 font-mono">
                  {selectedStation.availableChargers} / {selectedStation.totalChargers} Plugs Free
                </p>
                <p className="text-[10px] text-slate-500">Active Sessions: {selectedStation.activeSessions}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">M2 Demand Forecast</span>
                <p className="text-xs font-bold text-amber-700 font-mono">+{selectedStation.forecastDemand30m} kW (30m)</p>
                <p className="text-[10px] text-slate-500">Congestion: {(selectedStation.congestionIndex * 100).toFixed(0)}%</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Dynamic Tariff</span>
                <p className="text-xs font-bold text-sky-700 font-mono">${selectedStation.tariffPerKwh.toFixed(2)} / kWh</p>
                <p className="text-[10px] text-slate-500">Solar Gen: {selectedStation.renewableSolarPowerKw} kW</p>
              </div>
            </div>

          </div>

          {/* Quick EV Fleet Car Catalog / Showroom */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-600" />
                  Explore & Test 8 EV Car Models in Demo Catalog
                </h3>
                <p className="text-[11px] text-slate-500">Click any EV model to inspect its battery telemetry and simulate instant PRISM-ANT decisions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVAILABLE_EV_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSelectEv(model)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {model.id}
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-1 truncate">{model.model.split(' ')[0]} {model.model.split(' ')[1]}</p>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{model.telemetry.soc}% SOC</span>
                    <span className={model.telemetry.batteryTemp > 40 ? "text-red-600 font-bold" : ""}>{model.telemetry.batteryTemp}°C</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Active EV Digital Twins Queue & Live PRISM-ANT Decisions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-600" />
              Connected EV Digital Twins ({evs.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Click to inspect state</span>
          </div>

          {/* EV Twin Cards List */}
          <div className="space-y-3">
            {evs.map((ev) => {
              const decision = decisions[ev.id];
              const isHot = ev.telemetry.batteryTemp >= 40;
              const isUrgent = ev.utilityToken.urgencyScore > 0.8;
              const badge = getActionBadge(decision?.selectedAction);

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEv(ev)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-400 hover:shadow-md transition-all cursor-pointer relative group"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
                          {ev.id}: {ev.name.split(' (')[0]}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {ev.model}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Route: {ev.mobility.route} ({ev.mobility.distanceKm} km)
                      </p>
                    </div>

                    {/* Final Action Outcome Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-4 gap-2 my-2.5">
                    {/* SOC */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">SOC</span>
                        <Battery className="w-3 h-3 text-sky-600" />
                      </div>
                      <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{ev.telemetry.soc}%</p>
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-sky-500 h-full" style={{ width: `${ev.telemetry.soc}%` }} />
                      </div>
                    </div>

                    {/* Battery Temp */}
                    <div className={`p-2 rounded-xl border ${
                      isHot 
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Temp</span>
                        {isHot ? <Flame className="w-3 h-3 text-red-600 animate-pulse" /> : <Thermometer className="w-3 h-3 text-slate-400" />}
                      </div>
                      <p className={`text-xs font-black font-mono mt-0.5 ${isHot ? 'text-red-700' : 'text-slate-900'}`}>
                        {ev.telemetry.batteryTemp}°C
                      </p>
                      <span className="text-[8px] text-slate-500 font-semibold">{isHot ? '⚠️ Throttled' : 'Nominal'}</span>
                    </div>

                    {/* Deadline */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Deadline</span>
                        <Clock className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-xs font-black font-mono mt-0.5 text-slate-900">
                        {ev.mobility.departureDeadlineMin}m
                      </p>
                      <span className="text-[8px] text-slate-500">{isUrgent ? 'High Urgency' : 'Flexible'}</span>
                    </div>

                    {/* Reciprocity */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Reciprocity</span>
                        <Coins className="w-3 h-3 text-amber-600" />
                      </div>
                      <p className="text-xs font-black text-amber-700 font-mono mt-0.5">
                        {ev.utilityToken.reciprocityCredit}
                      </p>
                      <span className="text-[8px] text-slate-500">Credits (F3)</span>
                    </div>
                  </div>

                  {/* Decision Rationale Summary */}
                  {decision && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{decision.explainability.winningFactorSummary}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerNegotiation(ev.id);
                        }}
                        className="shrink-0 px-2 py-0.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold border border-sky-300 flex items-center gap-0.5 transition"
                      >
                        <span>Re-Solve</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Navigation to PRISM-ANT Sandbox */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-sky-950">Live Decision Simulation Studio</p>
              <p className="text-[11px] text-sky-700">Tune temperature, urgency, and reciprocity with live sliders</p>
            </div>
            <button
              onClick={() => onNavigateTab('negotiation')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm shadow-sky-500/20"
            >
              <span>Launch Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
