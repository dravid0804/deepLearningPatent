import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MasterDashboard } from './components/tabs/MasterDashboard';
import { DigitalTwinNetwork } from './components/tabs/DigitalTwinNetwork';
import { AiPredictionCenter } from './components/tabs/AiPredictionCenter';
import { NegotiationSandbox } from './components/tabs/NegotiationSandbox';
import { PatentFeaturesShowcase } from './components/tabs/PatentFeaturesShowcase';
import { ScenarioLab } from './components/tabs/ScenarioLab';
import { DecisionExplainability } from './components/tabs/DecisionExplainability';
import { ComparativeAnalytics } from './components/tabs/ComparativeAnalytics';
import { DocumentationCenter } from './components/tabs/DocumentationCenter';
import { PatentReportModal } from './components/modals/PatentReportModal';
import { EvDetailModal } from './components/modals/EvDetailModal';

import { 
  ALL_SCENARIOS, 
  SimulationScenario 
} from './services/simulation/simulationScenarios';
import type { 
  EVDigitalTwin, 
  ChargingStation, 
  GridTwinState, 
  FleetTwinState, 
  PrismAntDecisionResult 
} from './types/antev';
import { PrismAntEngine } from './services/engine/prismAntEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [scenarios] = useState<SimulationScenario[]>(ALL_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(ALL_SCENARIOS[0]);
  
  // Live Simulation State
  const [evs, setEvs] = useState<EVDigitalTwin[]>(ALL_SCENARIOS[0].evs);
  const [stations, setStations] = useState<ChargingStation[]>(ALL_SCENARIOS[0].stations);
  const [grid, setGrid] = useState<GridTwinState>(ALL_SCENARIOS[0].grid);
  const [fleet, setFleet] = useState<FleetTwinState>(ALL_SCENARIOS[0].fleet);
  
  // Stored Decisions Map
  const [decisions, setDecisions] = useState<Record<string, PrismAntDecisionResult>>({});
  
  // Simulation Clock
  const [simTimeMinutes, setSimTimeMinutes] = useState<number>(600); // 10:00 AM (600 mins from midnight)
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);

  // Modals
  const [isPatentModalOpen, setIsPatentModalOpen] = useState<boolean>(false);
  const [selectedEvForModal, setSelectedEvForModal] = useState<EVDigitalTwin | null>(null);

  // Format Sim Time string
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const padH = hours < 10 ? `0${hours}` : hours;
    const padM = mins < 10 ? `0${mins}` : mins;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${padH}:${padM} ${ampm}`;
  };

  // Re-run PRISM-ANT decisions for all EVs
  const computeAllDecisions = (currentEvs: EVDigitalTwin[], currentStations: ChargingStation[], currentGrid: GridTwinState) => {
    const newDecisions: Record<string, PrismAntDecisionResult> = {};
    currentEvs.forEach((ev) => {
      const station = currentStations.find(s => s.id === ev.assignedStationId) || currentStations[0];
      const result = PrismAntEngine.negotiateChargingDecision(ev, station, currentStations, currentGrid);
      newDecisions[ev.id] = result;
    });
    setDecisions(newDecisions);
  };

  // Initial calculation on scenario change
  useEffect(() => {
    setEvs(JSON.parse(JSON.stringify(activeScenario.evs)));
    setStations(JSON.parse(JSON.stringify(activeScenario.stations)));
    setGrid({ ...activeScenario.grid });
    setFleet({ ...activeScenario.fleet });
    computeAllDecisions(activeScenario.evs, activeScenario.stations, activeScenario.grid);
  }, [activeScenario]);

  // Simulation tick loop
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      handleStepSim();
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimRunning, simTimeMinutes, evs, grid]);

  // Advance simulation by 15 minutes
  const handleStepSim = () => {
    setSimTimeMinutes(prev => prev + 15);
    
    // Simulate battery charge progress for active charging EVs
    setEvs(prevEvs => {
      const updated = prevEvs.map(ev => {
        const dec = decisions[ev.id];
        if (dec && dec.assignedPowerKw > 0) {
          const powerKw = dec.assignedPowerKw;
          const energyAdded = (powerKw * 0.25); // 15 mins = 0.25 hr
          const socAdded = (energyAdded / ev.telemetry.nominalCapacityKwh) * 100;
          const newSoc = Math.min(100, Number((ev.telemetry.soc + socAdded).toFixed(1)));
          
          const tempDelta = powerKw > 50 ? 0.8 : -0.2;
          const newTemp = Math.max(24, Math.min(48, Number((ev.telemetry.batteryTemp + tempDelta).toFixed(1))));
          
          return {
            ...ev,
            telemetry: {
              ...ev.telemetry,
              soc: newSoc,
              batteryTemp: newTemp
            }
          };
        } else if (dec && dec.selectedAction === 'COOPERATIVE_DELAY') {
          const newTemp = Math.max(24, Number((ev.telemetry.batteryTemp - 0.6).toFixed(1)));
          return {
            ...ev,
            telemetry: {
              ...ev.telemetry,
              batteryTemp: newTemp
            }
          };
        }
        return ev;
      });

      computeAllDecisions(updated, stations, grid);
      return updated;
    });

    setGrid(prevGrid => ({
      ...prevGrid,
      renewableForecastRiseMin: Math.max(0, prevGrid.renewableForecastRiseMin - 15),
      renewableAvailabilityPercent: prevGrid.renewableForecastRiseMin <= 15 ? Math.min(95, prevGrid.renewableAvailabilityPercent + 25) : prevGrid.renewableAvailabilityPercent
    }));
  };

  const handleSelectScenario = (scenarioId: string) => {
    const target = scenarios.find(s => s.id === scenarioId) || scenarios[0];
    setActiveScenario(target);
    setSimTimeMinutes(600);
    setIsSimRunning(false);
  };

  const handleResetSim = () => {
    setEvs(JSON.parse(JSON.stringify(activeScenario.evs)));
    setStations(JSON.parse(JSON.stringify(activeScenario.stations)));
    setGrid({ ...activeScenario.grid });
    setSimTimeMinutes(600);
    setIsSimRunning(false);
    computeAllDecisions(activeScenario.evs, activeScenario.stations, activeScenario.grid);
  };

  const handleTriggerNegotiation = (evId: string) => {
    const targetEv = evs.find(e => e.id === evId);
    if (!targetEv) return;
    const station = stations.find(s => s.id === targetEv.assignedStationId) || stations[0];
    const res = PrismAntEngine.negotiateChargingDecision(targetEv, station, stations, grid);
    setDecisions(prev => ({ ...prev, [evId]: res }));
  };

  const handleUpdateEv = (updated: EVDigitalTwin) => {
    setEvs(prev => prev.map(e => e.id === updated.id ? updated : e));
    handleTriggerNegotiation(updated.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-500/20 selection:text-sky-900">
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        isSimRunning={isSimRunning}
        onToggleSim={() => setIsSimRunning(!isSimRunning)}
        onStepSim={handleStepSim}
        onResetSim={handleResetSim}
        simTime={formatTime(simTimeMinutes)}
        onOpenPatentReport={() => setIsPatentModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <MasterDashboard
            evs={evs}
            stations={stations}
            grid={grid}
            fleet={fleet}
            decisions={decisions}
            onSelectEv={(ev) => setSelectedEvForModal(ev)}
            onTriggerNegotiation={handleTriggerNegotiation}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'twins' && (
          <DigitalTwinNetwork
            evs={evs}
            stations={stations}
            grid={grid}
            fleet={fleet}
          />
        )}

        {activeTab === 'ai-models' && (
          <AiPredictionCenter
            evs={evs}
            stations={stations}
            grid={grid}
          />
        )}

        {activeTab === 'negotiation' && (
          <NegotiationSandbox
            evs={evs}
            stations={stations}
            grid={grid}
            onUpdateEv={handleUpdateEv}
          />
        )}

        {activeTab === 'patent-features' && (
          <PatentFeaturesShowcase />
        )}

        {activeTab === 'scenario-lab' && (
          <ScenarioLab
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {activeTab === 'explainability' && (
          <DecisionExplainability
            evs={evs}
            stations={stations}
            grid={grid}
            decisions={decisions}
          />
        )}

        {activeTab === 'analytics' && (
          <ComparativeAnalytics />
        )}

        {activeTab === 'docs' && (
          <DocumentationCenter />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-[1720px] mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>ANT-EV 2.0 • Autonomous EV Energy Negotiation Network</span>
          <span className="text-sky-700 font-bold">Caltech ACN-Data & NASA Ames Li-ion Prognostics Verified</span>
          <span>Patent Specification Disclosure Ready (Claims 1–12)</span>
        </div>
      </footer>

      {/* Modals */}
      <PatentReportModal
        isOpen={isPatentModalOpen}
        onClose={() => setIsPatentModalOpen(false)}
      />

      <EvDetailModal
        ev={selectedEvForModal}
        station={stations[0]}
        grid={grid}
        decision={selectedEvForModal ? decisions[selectedEvForModal.id] : undefined}
        onClose={() => setSelectedEvForModal(null)}
      />

    </div>
  );
}
export default App;
