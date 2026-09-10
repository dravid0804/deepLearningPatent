import React from 'react';
import {
  Activity, BarChart3, BookOpen, Cpu, FileText, GitBranch,
  HeartPulse, Layers, Play, Pause, RotateCcw, Scale, Sliders, StepForward, Zap
} from 'lucide-react';
import type { SimulationScenario } from '../services/simulation/simulationScenarios';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario;
  onSelectScenario: (id: string) => void;
  isSimRunning: boolean;
  onToggleSim: () => void;
  onStepSim: () => void;
  onResetSim: () => void;
  simTime: string;
}

const items = [
  ['split', 'Overview & Split', Zap],
  ['patent-core', 'Patent Core', FileText],
  ['consequence', 'Consequence Matrix', Activity],
  ['models', 'ACCM & Baselines', Cpu],
  ['negotiation', 'PRISM-ANT', Scale],
  ['scenario-lab', 'Scenario Lab', Sliders],
  ['research', 'Research Lab', BarChart3],
  ['explainability', 'Explainability', Layers],
  ['emergency', 'Emergency', HeartPulse],
  ['help', 'Help', BookOpen],
];

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  scenarios,
  activeScenario,
  onSelectScenario,
  isSimRunning,
  onToggleSim,
  onStepSim,
  onResetSim,
  simTime,
}) => (
  <header className="app-header">
    <div className="topbar">
      <button className="brand" onClick={() => setActiveTab('split')}>
        <span className="brand-mark">
          <Zap size={19} />
        </span>
        <span>
          <b>ANT-EV 2.0</b>
          <small>ACCM + PRISM-ANT</small>
        </span>
      </button>

      <div className="scenario-control">
        <span className="live-dot" />
        <select
          aria-label="Demo station"
          value={activeScenario.id}
          onChange={(e) => onSelectScenario(e.target.value)}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sim-controls">
        <span className="sim-time">{simTime}</span>
        <button
          onClick={onToggleSim}
          className={isSimRunning ? 'control active' : 'control'}
        >
          {isSimRunning ? <Pause size={15} /> : <Play size={15} />}
          <span>{isSimRunning ? 'Pause' : 'Run demo'}</span>
        </button>
        <button
          onClick={onStepSim}
          className="icon-control"
          title="Advance 15 minutes"
        >
          <StepForward size={16} />
        </button>
        <button onClick={onResetSim} className="icon-control" title="Reset demo">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>

    <nav className="nav-row overflow-x-auto" aria-label="Application navigation">
      {items.map(([id, label, Icon]) => {
        const I = Icon as typeof Zap;
        return (
          <button
            key={id as string}
            onClick={() => setActiveTab(id as string)}
            className={activeTab === id ? 'nav-item selected' : 'nav-item'}
          >
            <I size={15} />
            <span className="whitespace-nowrap">{label as string}</span>
          </button>
        );
      })}
    </nav>
  </header>
);
