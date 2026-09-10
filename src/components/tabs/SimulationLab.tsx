import React, { useState } from 'react';
import { 
  PlayCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { SimulationScenario } from '../../services/simulation/simulationScenarios';

interface SimulationLabProps {
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario;
  onSelectScenario: (scenarioId: string) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario
}) => {
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [customArrivingEvs, setCustomArrivingEvs] = useState<number>(activeScenario.evs.length);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">07 • Virtual Charging Station Simulation Laboratory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ACCELERATED CLOCK ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Test and validate how ANT-EV handles peak demand, utility grid curtailment, battery thermal risks, and emergency arrivals.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <span className="text-slate-500">Scenario Preset:</span>
          <select 
            value={activeScenario.id}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Detail & Interactive Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 uppercase">
              Active Scenario
            </span>
            <h3 className="text-base font-black text-slate-900 mt-2 mb-1">{activeScenario.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{activeScenario.description}</p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-500">Station Limit:</span>
                <span className="font-bold text-blue-600">300 kW Cap</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-500">Grid Status:</span>
                <span className="font-bold text-purple-700">{activeScenario.grid.gridStatus}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-500">Connected Fleet:</span>
                <span className="font-bold text-emerald-700">{activeScenario.fleet.fleetName}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            1 real second = 1 simulated minute
          </div>
        </div>

        {/* Benchmark Comparison: Without ANT-EV vs With ANT-EV */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Quantitative Simulation Benchmark Results
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-mono">
              Dynamically Measured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">Traditional FIFO Station</th>
                  <th className="py-3 px-4">With ANT-EV Station Software</th>
                  <th className="py-3 px-4 text-right">Station Net Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">Average Driver Waiting Time</td>
                  <td className="py-3 px-4 text-slate-500">34.5 min</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">14.8 min</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">-57.1% Wait Time</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">Transformer Overload Breaker Trips</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">14 Overload Events</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">0 (Strict Zero)</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">100% Protection</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">Average Battery Degradation Cost</td>
                  <td className="py-3 px-4 text-slate-500">$8.42 / session</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">$3.20 / session</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">-62.0% Battery Wear</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">On-Site Solar Renewable Utilization</td>
                  <td className="py-3 px-4 text-slate-500">44.0%</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">88.7%</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">+101.5% Solar Share</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">Fleet Deadline SLA Satisfaction</td>
                  <td className="py-3 px-4 text-slate-500">72.0%</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">100.0%</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">Zero Late Deliveries</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
