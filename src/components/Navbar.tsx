import React from 'react';
import { 
  Zap, 
  Activity, 
  Network, 
  Cpu, 
  Sliders, 
  Award, 
  PlayCircle, 
  Eye, 
  BarChart3, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Layers,
  BookOpen,
  Car
} from 'lucide-react';
import type { SimulationScenario } from '../services/simulation/simulationScenarios';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario;
  onSelectScenario: (scenarioId: string) => void;
  isSimRunning: boolean;
  onToggleSim: () => void;
  onStepSim: () => void;
  onResetSim: () => void;
  simTime: string;
  onOpenPatentReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
  onOpenPatentReport
}) => {

  const navItems = [
    { id: 'dashboard', label: 'Master Dashboard', icon: Activity, badge: 'Live' },
    { id: 'twins', label: 'Digital Twin Graph', icon: Network, badge: 'F6' },
    { id: 'ai-models', label: 'AI Prediction Center', icon: Cpu, badge: 'M1–M6' },
    { id: 'negotiation', label: 'PRISM-ANT Sandbox', icon: Sliders, badge: 'Core' },
    { id: 'patent-features', label: '11 Patent Features', icon: Award, badge: 'F1–F11' },
    { id: 'scenario-lab', label: 'Scenario Lab', icon: PlayCircle, badge: 'Sec 16' },
    { id: 'explainability', label: 'Explainability & XAI', icon: Eye, badge: 'Audit' },
    { id: 'analytics', label: 'Analytics & Claims', icon: BarChart3, badge: '12 Claims' },
    { id: 'docs', label: 'Docs & Setup Guide', icon: BookOpen, badge: 'Manual' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & System Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-500/20 text-white">
            <Zap className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tech-font">
                ANT-EV 2.0
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700 border border-sky-200 tracking-wide">
                PATENT SPECIFICATION VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Autonomous EV Energy Negotiation Network • PRISM-ANT™
            </p>
          </div>
        </div>

        {/* Live Simulation Controls & Scenario Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Scenario Selector */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Layers className="w-4 h-4 text-sky-600" />
            <span className="text-xs text-slate-500 font-medium">Scenario:</span>
            <select
              value={activeScenario.id}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-slate-800">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Simulation Clock & Step Controls */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-700 mr-2">
              {simTime}
            </span>

            <button
              onClick={onToggleSim}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                isSimRunning 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title={isSimRunning ? "Pause Auto-Simulation" : "Start Live Simulation"}
            >
              {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimRunning ? "Pause" : "Live"}</span>
            </button>

            <button
              onClick={onStepSim}
              className="px-2 py-1 bg-white hover:bg-slate-50 text-sky-700 text-xs rounded-lg border border-slate-200 font-bold transition shadow-xs"
              title="Step forward +15 mins"
            >
              +15m
            </button>

            <button
              onClick={onResetSim}
              className="p-1 bg-white hover:bg-slate-50 text-slate-500 rounded-lg border border-slate-200 transition shadow-xs"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export Patent Report Button */}
          <button
            onClick={onOpenPatentReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-700 hover:to-blue-700 transition text-xs font-bold shadow-sm shadow-sky-500/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Patent Report & Claims</span>
          </button>

          {/* Hard Constraints Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0 Violations</span>
          </div>

        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="max-w-[1720px] mx-auto px-4 overflow-x-auto">
        <div className="flex items-center gap-1 border-t border-slate-200/80 pt-1 pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
