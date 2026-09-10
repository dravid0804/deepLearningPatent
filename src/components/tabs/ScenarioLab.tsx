import React, { useState } from 'react';
import type { SimulationScenario } from '../../services/simulation/simulationScenarios';
import { 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Car,
  Clock, 
  Zap, 
  Thermometer,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface ScenarioLabProps {
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario;
  onSelectScenario: (id: string) => void;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const workflowSteps = [
    {
      step: 1,
      title: "Collect & Validate Multi-Modal Input Telemetry",
      desc: "Digital twin samples 60-step temporal window: EV battery SOC, cell temperatures, driver deadlines, bay queues, and transformer load.",
      badge: "Inputs (T=60)"
    },
    {
      step: 2,
      title: "Run ACCM Deep Learning Consequence Model",
      desc: "Single unified ACCM neural network evaluates all candidate power actions and generates multi-horizon predictions and 8-dim Action Sacrifice Vectors.",
      badge: "ACCM Deep Net"
    },
    {
      step: 3,
      title: "Enforce Deterministic Hard Physics & Safety Gate",
      desc: "Runtime safety interlock intercepts candidate actions against the 42°C thermal threshold and transformer capacity. Unsafe actions are clamped immediately.",
      badge: "Safety Gate"
    },
    {
      step: 4,
      title: "PRISM-ANT Reciprocity Negotiation & Scoring",
      desc: "PRISM-ANT game-theoretic engine evaluates the Action Sacrifice Vector against driver reciprocity credit ledgers to determine equitable bay allocations.",
      badge: "PRISM-ANT Engine"
    },
    {
      step: 5,
      title: "Execute Dynamic Charge Splitting Across Bays",
      desc: "Station controller splits power: EV-A clamped to 22 kW (thermal guard), EV-B accepts cooperative delay (+15 credits), EV-C receives 50 kW for fleet readiness.",
      badge: "Dynamic Split"
    },
    {
      step: 6,
      title: "Closed-Loop State Update & Reciprocity Ledger",
      desc: "Measure actual power delivered, update digital twins, log reciprocity tokens into the auditable ledger, and recirculate updated states to ACCM.",
      badge: "Feedback Loop"
    }
  ];

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => Math.min(workflowSteps.length - 1, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="focused-page">
      {/* Hero Header */}
      <section className="split-hero">
        <div>
          <p className="eyebrow"><span className="live-dot" /> INTERACTIVE PLAYTHROUGH LAB</p>
          <h1>Station Scenario Lab: Dynamic Charge Splitting</h1>
          <p>
            Step-by-step interactive player. Watch how <b>ACCM consequence prediction</b>, <b>PRISM-ANT reciprocity negotiation</b>, and the <b>deterministic safety gate</b> dynamically split power when multiple EVs compete at a congested station.
          </p>
        </div>
        <div className="split-total">
          <span>Active Test Scenario</span>
          <strong>{activeScenario.name.split(' (')[0]}</strong>
          <small>{activeScenario.evs.length} Competing Vehicles · {activeScenario.badge}</small>
        </div>
      </section>

      {/* Scenario Context Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 uppercase">{activeScenario.badge}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeScenario.name}</h3>
            <p className="text-xs text-slate-600 mt-1">{activeScenario.description}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {activeScenario.keyPatentFeatures.map((feat, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-blue-700 text-[10px] font-mono border border-slate-200 font-bold">
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Participating Vehicles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {activeScenario.evs.map((ev) => (
            <div key={ev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-900 font-mono">{ev.id}: {ev.name.split(' (')[0]}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 font-mono border border-slate-200">{ev.model}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-700">
                <div>
                  <span className="text-slate-400 text-[9px] block">SOC</span>
                  <p className="font-bold text-blue-700">{ev.telemetry.soc}%</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">Temp</span>
                  <p className={`font-bold ${ev.telemetry.batteryTemp > 40 ? 'text-rose-600' : 'text-slate-800'}`}>{ev.telemetry.batteryTemp}°C</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">Deadline</span>
                  <p className="font-bold text-amber-700">{ev.mobility.departureDeadlineMin}m</p>
                </div>
              </div>

              {activeScenario.expectedDecisions[ev.id] && (
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 font-medium">
                  <span className="font-bold">Negotiated Action: </span>
                  {activeScenario.expectedDecisions[ev.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Playback Stepper */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Stepper Header & Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold font-mono text-sm border border-blue-300">
              {currentStepIndex + 1}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Step {workflowSteps[currentStepIndex].step}: {workflowSteps[currentStepIndex].title}
              </h3>
              <p className="text-xs text-slate-500">{workflowSteps[currentStepIndex].desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold"
            >
              Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === workflowSteps.length - 1}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
              title="Reset Steps"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {workflowSteps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-2.5 rounded-xl border text-left transition ${
                currentStepIndex === idx
                  ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                  : currentStepIndex > idx
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-mono font-bold block">{s.badge}</span>
              <span className="text-[11px] font-bold text-slate-800 truncate block mt-0.5">
                Step {s.step}
              </span>
            </button>
          ))}
        </div>

        {/* Deep Step Insights Box */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs text-slate-200">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>Execution Trace Snapshot (@ Step {currentStepIndex + 1})</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Verification
            </span>
          </div>

          {currentStepIndex === 0 && (
            <div className="space-y-1">
              <p className="text-blue-300">📥 Ingesting EV Telemetry & Station Bay State across T=60...</p>
              <p className="text-slate-400">• EV-A (Sedan): SOC 18%, Temp 44.5°C (Critical), Deadline 45 min, Urgency 0.92</p>
              <p className="text-slate-400">• EV-B (Commuter): SOC 42%, Temp 28.0°C (Cool), Deadline 180 min, Reciprocity 65 cr</p>
              <p className="text-slate-400">• EV-C (Fleet Truck): SOC 27%, Temp 32.5°C, Deadline 90 min, Logistics Target 06:00 AM</p>
              <p className="text-slate-400">• Station Transformer Capacity: 150 kW maximum safe site envelope</p>
            </div>
          )}

          {currentStepIndex === 1 && (
            <div className="space-y-1">
              <p className="text-blue-300">🧠 Running Unified ACCM Neural Network (1.23M parameters)...</p>
              <p className="text-slate-400">• Temporal S6 SSM: Forecasts steep thermal rise for EV-A under 150 kW charge (+5.2°C in 15m)</p>
              <p className="text-slate-400">• Relational GAT: Identifies transformer headroom deficit if EV-A and EV-C charge simultaneously</p>
              <p className="text-slate-400">• Action Sacrifice Vector (EV-A Fast Charge): S_therm = 0.95, S_deg = 0.88, S_grid = 0.76</p>
              <p className="text-slate-400">• Action Sacrifice Vector (EV-B Cooperative Delay): S_wait = 0.18, S_therm = 0.02, S_grid = 0.00</p>
            </div>
          )}

          {currentStepIndex === 2 && (
            <div className="space-y-1">
              <p className="text-amber-300">🛡️ Enforcing Deterministic Hard Physics Safety Gate...</p>
              <p className="text-rose-400">❌ EV-A 150 kW Fast Charge: CLAMPED (Core Temp 44.5°C &gt; 42.0°C Thermal Interlock)</p>
              <p className="text-emerald-400">✅ EV-A 22 kW Reduced Power: APPROVED (Permits safe charging under thermal envelope)</p>
              <p className="text-emerald-400">✅ EV-B Cooperative Delay: APPROVED (Available 180 min deadline accommodates wait)</p>
              <p className="text-emerald-400">✅ EV-C 50 kW Power Allocation: APPROVED (Satisfies commercial fleet delivery commitment)</p>
            </div>
          )}

          {currentStepIndex === 3 && (
            <div className="space-y-1">
              <p className="text-purple-300">⚖️ PRISM-ANT Reciprocity Negotiation Engine...</p>
              <p className="text-slate-400">• EV-A: REDUCE_POWER negotiated (Protects battery cell while delivering necessary home range)</p>
              <p className="text-slate-400">• EV-B: COOPERATIVE_DELAY negotiated (+15 Reciprocity credits awarded for future fast charging)</p>
              <p className="text-slate-400">• EV-C: CHARGE_NOW_STANDARD negotiated (Fulfills commercial logistics guarantee)</p>
            </div>
          )}

          {currentStepIndex === 4 && (
            <div className="space-y-1">
              <p className="text-emerald-300">⚡ Dynamic Charge Splitting Executed Across Charging Bays...</p>
              <p className="text-white">• Bay 1 (EV-A): Allocated 22 kW. Thermal rise halted; cooling begins toward 38°C.</p>
              <p className="text-white">• Bay 2 (EV-B): Allocated 0 kW (Delaying). Reciprocity balance incremented: 65 → 80 credits.</p>
              <p className="text-white">• Bay 3 (EV-C): Allocated 50 kW. Commercial departure readiness on track (100%).</p>
              <p className="text-emerald-400">• Total Station Draw: 72 kW &lt; 150 kW limit (Transformer headroom preserved at 52%).</p>
            </div>
          )}

          {currentStepIndex === 5 && (
            <div className="space-y-1">
              <p className="text-blue-300">📊 Observing Outcome & Logging Feedback into Digital Twins...</p>
              <p className="text-slate-400">• Actual vs Predicted Temperature MAE: 0.18°C (Within ACCM 95% confidence interval)</p>
              <p className="text-slate-400">• Zero thermal violations. Transformer peak load shaved by 38.4%.</p>
              <p className="text-emerald-400">• Reciprocity ledger committed. Digital twin states refreshed for next 60s cycle.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
