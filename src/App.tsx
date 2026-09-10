import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { FocusedWorkspace } from './components/FocusedWorkspace';
import { PatentCore } from './components/tabs/PatentCore';
import { LiveConsequenceMatrix } from './components/tabs/LiveConsequenceMatrix';
import { ResearchEvaluation } from './components/tabs/ResearchEvaluation';
import { AiPredictionCenter } from './components/tabs/AiPredictionCenter';
import { NegotiationSandbox } from './components/tabs/NegotiationSandbox';
import { ScenarioLab } from './components/tabs/ScenarioLab';
import { DecisionExplainability } from './components/tabs/DecisionExplainability';

import { FOCUSED_SCENARIOS, type SimulationScenario } from './services/simulation/simulationScenarios';
import type { EVDigitalTwin, ChargingStation, GridTwinState, PrismAntDecisionResult } from './types/antev';
import { PrismAntEngine } from './services/engine/prismAntEngine';
import { allocateStationPower } from './services/engine/stationAllocator';
import { AccmPrismAdapter } from './services/engine/accmPrismAdapter';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('split');
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(FOCUSED_SCENARIOS[0]);
  const [evs, setEvs] = useState<EVDigitalTwin[]>(FOCUSED_SCENARIOS[0].evs);
  const [stations, setStations] = useState<ChargingStation[]>(FOCUSED_SCENARIOS[0].stations);
  const [grid, setGrid] = useState<GridTwinState>(FOCUSED_SCENARIOS[0].grid);
  const [decisions, setDecisions] = useState<Record<string, PrismAntDecisionResult>>({});
  const [simTime, setSimTime] = useState<number>(600);
  const [running, setRunning] = useState<boolean>(false);

  const buildDecisions = (
    sessions: EVDigitalTwin[],
    site: ChargingStation[],
    currentGrid: GridTwinState
  ) => {
    const result: Record<string, PrismAntDecisionResult> = {};
    sessions
      .filter((ev) => ev.status !== 'completed')
      .forEach((ev) => {
        const station = site.find((s) => s.id === ev.assignedStationId) ?? site[0];
        result[ev.id] = PrismAntEngine.negotiateChargingDecision(ev, station, site, currentGrid);
      });
    return result;
  };

  const calculate = (
    sessions: EVDigitalTwin[],
    site: ChargingStation[],
    currentGrid: GridTwinState
  ) => setDecisions(buildDecisions(sessions, site, currentGrid));

  useEffect(() => {
    const copy = structuredClone(activeScenario);
    setEvs(copy.evs);
    setStations(copy.stations);
    setGrid(copy.grid);
    setSimTime(600);
    setRunning(false);
    calculate(copy.evs, copy.stations, copy.grid);
  }, [activeScenario]);

  const step = () => {
    setEvs((previous) => {
      const current = buildDecisions(previous, stations, grid);
      const allocations = allocateStationPower(previous, current, stations[0]);
      const updated: EVDigitalTwin[] = previous.map((ev) => {
        const row = allocations.find((item) => item.ev.id === ev.id);
        if (!row || row.powerKw <= 0 || ev.status === 'completed') return ev;

        const soc = Math.min(
          row.targetSoc,
          ev.telemetry.soc + (row.powerKw * 0.25 / ev.telemetry.nominalCapacityKwh) * 100
        );
        const completed = soc >= row.targetSoc - 0.05;
        return {
          ...ev,
          status: completed ? 'completed' : 'charging',
          telemetry: {
            ...ev.telemetry,
            soc: Number(soc.toFixed(1)),
            batteryTemp: Number(
              Math.max(
                20,
                Math.min(48, ev.telemetry.batteryTemp + (row.powerKw > 50 ? 0.35 : -0.1))
              ).toFixed(1)
            ),
          },
        };
      });
      calculate(updated, stations, grid);
      return updated;
    });
    setSimTime((value) => value + 15);
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(step, 1800);
    return () => window.clearInterval(timer);
  }, [running, evs, stations, grid]);

  const handleUpdateEv = (updatedEv: EVDigitalTwin) => {
    setEvs((previous) => {
      const next = previous.map((e) => (e.id === updatedEv.id ? updatedEv : e));
      calculate(next, stations, grid);
      return next;
    });
  };

  const addEv = (input: {
    name: string;
    soc: number;
    target: number;
    deadline: number;
    maxPower: number;
    temperature: number;
    emergency: boolean;
    goods: boolean;
  }) => {
    setEvs((previous) => {
      const id = `CUSTOM-${Date.now()}`;
      const ev: EVDigitalTwin = {
        id,
        name: input.name || `EV ${previous.length + 1}`,
        model: 'User-added demo EV',
        licensePlateAnonymized: 'DEMO',
        type: input.goods ? 'fleet_truck' : 'passenger_sedan',
        telemetry: {
          soc: input.soc,
          soh: 92,
          batteryTemp: input.temperature,
          voltage: 400,
          current: 0,
          maxChargingPowerKw: input.maxPower,
          nominalCapacityKwh: 70,
        },
        mobility: {
          route: 'Demo route',
          distanceKm: 40,
          destination: 'Configured destination',
          departureDeadlineMin: input.deadline,
          estimatedTripEnergyKwh: 12,
          destinationSocRequired: input.target,
        },
        utilityToken: {
          tokenId: id,
          anonymizedHash: id,
          urgencyScore: input.emergency ? 1 : input.goods ? 0.8 : 0.55,
          flexibilityScore: input.emergency ? 0 : 0.35,
          isFleet: input.goods,
          isEmergency: input.emergency,
          reciprocityCredit: 0,
          sacrificeMinutesHistory: 0,
        },
        batteryTwin: {
          degradationCostPerKwh: 0.08,
          thermalRiskScore: input.temperature >= 42 ? 0.95 : 0.2,
          remainingUsefulLifeCycles: 1000,
          safePowerEnvelopeKw: input.temperature >= 42 ? 22 : input.maxPower,
          cycleCount: 200,
          internalImpedanceMilliOhm: 60,
        },
        assignedStationId: stations[0].id,
        status: 'in_negotiation',
      };
      const next = [...previous, ev];
      calculate(next, stations, grid);
      return next;
    });
  };

  const removeEv = (id: string) => {
    setEvs((previous) => {
      const next = previous.filter((ev) => ev.id !== id);
      calculate(next, stations, grid);
      return next;
    });
  };

  const reset = () => setActiveScenario({ ...activeScenario });
  const time = `${String(Math.floor(simTime / 60) % 24).padStart(2, '0')}:${String(simTime % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenarios={FOCUSED_SCENARIOS}
        activeScenario={activeScenario}
        onSelectScenario={(id) =>
          setActiveScenario(FOCUSED_SCENARIOS.find((s) => s.id === id) ?? FOCUSED_SCENARIOS[0])
        }
        isSimRunning={running}
        onToggleSim={() => setRunning(!running)}
        onStepSim={step}
        onResetSim={reset}
        simTime={time}
      />

      <main className="py-2">
        {activeTab === 'split' && (
          <FocusedWorkspace
            tab="split"
            evs={evs}
            station={stations[0]}
            grid={grid}
            decisions={decisions}
            onAddEv={addEv}
            onRemoveEv={removeEv}
          />
        )}

        {activeTab === 'patent-core' && <PatentCore />}

        {activeTab === 'consequence' && (
          <LiveConsequenceMatrix evs={evs} station={stations[0]} grid={grid} />
        )}

        {activeTab === 'models' && (
          <AiPredictionCenter evs={evs} stations={stations} grid={grid} />
        )}

        {activeTab === 'negotiation' && (
          <NegotiationSandbox
            evs={evs}
            stations={stations}
            grid={grid}
            onUpdateEv={handleUpdateEv}
          />
        )}

        {activeTab === 'scenario-lab' && (
          <ScenarioLab
            scenarios={FOCUSED_SCENARIOS}
            activeScenario={activeScenario}
            onSelectScenario={(id) =>
              setActiveScenario(FOCUSED_SCENARIOS.find((s) => s.id === id) ?? FOCUSED_SCENARIOS[0])
            }
          />
        )}

        {activeTab === 'research' && <ResearchEvaluation />}

        {activeTab === 'explainability' && (
          <DecisionExplainability
            evs={evs}
            stations={stations}
            grid={grid}
            decisions={decisions}
          />
        )}

        {activeTab === 'emergency' && (
          <FocusedWorkspace
            tab="emergency"
            evs={evs}
            station={stations[0]}
            grid={grid}
            decisions={decisions}
            onAddEv={addEv}
            onRemoveEv={removeEv}
          />
        )}

        {activeTab === 'help' && (
          <FocusedWorkspace
            tab="help"
            evs={evs}
            station={stations[0]}
            grid={grid}
            decisions={decisions}
            onAddEv={addEv}
            onRemoveEv={removeEv}
          />
        )}
      </main>

      <footer className="focused-footer mt-8 py-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>ANT-EV 2.0 • Autonomous EV Energy Negotiation Network</span>
          <span className="text-blue-700 font-bold">ACCM (1.23M params) + PRISM-ANT Engine Verified</span>
          <span>Patent Specification Disclosure Ready · Claims 1–12</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
