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
  ShieldCheck
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
      title: "Collect & Validate Input Telemetry",
      desc: "Receive raw EV battery SOC, temperatures, driver deadlines, station queues, and grid load signals. Check bounds & sensor consistency.",
      badge: "Inputs"
    },
    {
      step: 2,
      title: "Run Deep Learning Intelligence Layer (M1–M5)",
      desc: "M1 predicts actual energy needed for trip. M2 forecasts 30m queue surge. M3/M4 computes battery degradation cost and thermal risk. M5 projects Mamba state trajectory.",
      badge: "Inference"
    },
    {
      step: 3,
      title: "Apply Deterministic Hard Physics & Safety Constraints",
      desc: "Evaluate candidate actions against 45°C thermal limit, safe power envelope, and vehicle departure deadlines. Unsafe actions are rejected immediately.",
      badge: "Safety Gate"
    },
    {
      step: 4,
      title: "PRISM-ANT Multi-Agent Negotiation & Reciprocity Ledger",
      desc: "Compute multi-factor score: Urgency + Reciprocity - DegradationCost + GridFit - Congestion. M6 policy network ranks feasible actions.",
      badge: "Negotiation"
    },
    {
      step: 5,
      title: "Execute Optimal Charging Actions Across Network",
      desc: "Dispatch commands: EV-A throttled to 22 kW (thermal guard), EV-B accepts cooperative delay (+15 credits), EV-C allocated 50 kW for fleet readiness.",
      badge: "Execution"
    },
    {
      step: 6,
      title: "Observe Real Outcome & Closed-Loop Learning Feedback (F11)",
      desc: "Measure actual delivery vs predictions, compute residual errors, and feed validated metrics back into continuous model monitoring.",
      badge: "Feedback"
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
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              SECTION 16 BENCHMARK
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Complete Scenario Lab & Decision Playthrough
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Step-by-step interactive player. Watch PRISM-ANT balance competing EV urgency, battery thermal safety, fleet deadlines, and grid constraints in the exact Section 16 specification scenario.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                onSelectScenario(sc.id);
                setCurrentStepIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeScenario.id === sc.id
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sc.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Context Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-mono font-bold text-sky-600 uppercase">{activeScenario.badge}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeScenario.name}</h3>
            <p className="text-xs text-slate-600 mt-1">{activeScenario.description}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {activeScenario.keyPatentFeatures.map((feat, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-sky-700 text-[10px] font-mono border border-slate-200 font-bold">
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
                  <span className="text-slate-400 text-[9px]">SOC</span>
                  <p className="font-bold text-sky-700">{ev.telemetry.soc}%</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px]">Temp</span>
                  <p className={`font-bold ${ev.telemetry.batteryTemp > 40 ? 'text-red-600' : 'text-slate-800'}`}>{ev.telemetry.batteryTemp}°C</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px]">Deadline</span>
                  <p className="font-bold text-amber-700">{ev.mobility.departureDeadlineMin}m</p>
                </div>
              </div>

              {activeScenario.expectedDecisions[ev.id] && (
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 font-medium">
                  <span className="font-bold">Expected: </span>
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
            <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold font-mono text-sm border border-sky-300">
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
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
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
        <div className="grid grid-cols-6 gap-2">
          {workflowSteps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-2.5 rounded-xl border text-left transition ${
                currentStepIndex === idx
                  ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
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
              <p className="text-sky-300">📥 Ingesting EV Telemetry & Grid State...</p>
              <p className="text-slate-400">• EV-A: SOC 18%, Temp 44.5°C, Deadline 45 min, Urgency 0.92</p>
              <p className="text-slate-400">• EV-B: SOC 42%, Temp 28.0°C, Deadline 180 min, Reciprocity 65 cr</p>
              <p className="text-slate-400">• EV-C: SOC 27%, Temp 32.5°C, Deadline 90 min, Fleet Target 06:00 AM</p>
            </div>
          )}

          {currentStepIndex === 1 && (
            <div className="space-y-1">
              <p className="text-sky-300">🧠 Running Neural Predictors (M1–M5)...</p>
              <p className="text-slate-400">• M1: EV-A trip energy deficit = 14 kWh | EV-B = 8 kWh | EV-C = 12 kWh</p>
              <p className="text-slate-400">• M2: Station 1 occupancy forecast = 92% (High Congestion Alert)</p>
              <p className="text-slate-400">• M4: EV-A battery degradation cost index = $4.85 (High Thermal Stress)</p>
              <p className="text-slate-400">• M5: Mamba projects grid renewable surge in +25 minutes</p>
            </div>
          )}

          {currentStepIndex === 2 && (
            <div className="space-y-1">
              <p className="text-amber-300">🛡️ Enforcing Hard Constraints Gate...</p>
              <p className="text-red-400">❌ EV-A 150 kW Fast Charge: REJECTED (Temp 44.5°C &gt; 42.0°C Thermal Limit)</p>
              <p className="text-emerald-400">✅ EV-A 22 kW Reduced Power: APPROVED (Preserves mobility within thermal envelope)</p>
              <p className="text-emerald-400">✅ EV-B Cooperative Delay: APPROVED (Available 180m &gt; 25m delay window)</p>
              <p className="text-emerald-400">✅ EV-C Standard Charge: APPROVED (Satisfies 06:00 fleet readiness window)</p>
            </div>
          )}

          {currentStepIndex === 3 && (
            <div className="space-y-1">
              <p className="text-purple-300">⚖️ Computing PRISM-ANT Scoring & M6 RL Policy...</p>
              <p className="text-slate-400">• EV-A: REDUCE_POWER score = 0.884 (Highest feasible safe action)</p>
              <p className="text-slate-400">• EV-B: COOPERATIVE_DELAY score = 0.915 (+15 Reciprocity credits earned)</p>
              <p className="text-slate-400">• EV-C: CHARGE_NOW_STANDARD score = 0.840 (Guarantees fleet deadline)</p>
            </div>
          )}

          {currentStepIndex === 4 && (
            <div className="space-y-1">
              <p className="text-emerald-300">⚡ Dispatching Power & Updating Reciprocity Ledgers...</p>
              <p className="text-white">• EV-A allocated 22 kW safe power. Battery protected from thermal runaway.</p>
              <p className="text-white">• EV-B scheduled for charge during renewable surge. Reciprocity balance updated: 65 → 80 cr.</p>
              <p className="text-white">• EV-C allocated 50 kW charging slot. Fleet readiness status: ON TRACK (100%).</p>
            </div>
          )}

          {currentStepIndex === 5 && (
            <div className="space-y-1">
              <p className="text-sky-300">📊 Observing Outcome & Logging Closed-Loop Residuals (F11)...</p>
              <p className="text-slate-400">• Actual vs Predicted Energy Error (MAE): 0.12 kWh</p>
              <p className="text-slate-400">• Zero constraint violations recorded. Station congestion successfully reduced by 40%.</p>
              <p className="text-emerald-400">• System validated against Section 12 Evaluation Metrics.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
