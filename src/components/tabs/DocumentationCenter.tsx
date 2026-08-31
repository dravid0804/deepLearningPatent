import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Download, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

export const DocumentationCenter: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeDocSection, setActiveDocSection] = useState<'SETUP' | 'ARCH' | 'PATENT' | 'FAQ'>('SETUP');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              OFFICIAL SYSTEM MANUAL
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Documentation, Architecture & System Setup Guide
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Everything needed to install, execute, understand, and defend ANT-EV 2.0 on any workstation, presentation laptop, or evaluation environment.
          </p>
        </div>

        {/* Section Navigation Buttons */}
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveDocSection('SETUP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeDocSection === 'SETUP' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & Run</span>
          </button>
          <button
            onClick={() => setActiveDocSection('ARCH')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeDocSection === 'ARCH' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI & Models (M1–M6)</span>
          </button>
          <button
            onClick={() => setActiveDocSection('PATENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeDocSection === 'PATENT' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Patent Claims & Math</span>
          </button>
          <button
            onClick={() => setActiveDocSection('FAQ')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeDocSection === 'FAQ' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Evaluation Q&A</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SYSTEM SETUP & INSTALLATION GUIDE */}
      {activeDocSection === 'SETUP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Columns: Step-by-Step Installation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-600" />
                Quick Installation & Deployment Guide
              </h3>

              {/* Step 1: System Prerequisites */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">System Prerequisites</h4>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-8 list-disc">
                  <li><strong className="text-slate-800">Node.js</strong>: Version 18.0.0 or higher (<a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-sky-600 underline">nodejs.org</a>)</li>
                  <li><strong className="text-slate-800">Package Manager</strong>: npm (v9+) or yarn / pnpm</li>
                  <li><strong className="text-slate-800">Web Browser</strong>: Chrome, Edge, Firefox, or Safari (modern HTML5 / CSS3 support)</li>
                  <li><strong className="text-slate-800">Operating System</strong>: Windows 10/11, macOS, or Linux</li>
                </ul>
              </div>

              {/* Step 2: Install Dependencies */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Install Dependencies</h4>
                  </div>
                  <button
                    onClick={() => handleCopy("npm install", "inst")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === "inst" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400">
                  <code>npm install</code>
                </div>
              </div>

              {/* Step 3: Run Development Server */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Launch Application</h4>
                  </div>
                  <button
                    onClick={() => handleCopy("npm run dev", "run")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === "run" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400">
                  <code>npm run dev</code>
                </div>
                <p className="text-[11px] text-slate-500">
                  Opens the platform at <strong className="text-slate-800">http://localhost:5173</strong>.
                </p>
              </div>

              {/* Windows One-Click Batch Script */}
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-1">
                <p className="text-xs font-bold text-sky-900">⚡ Windows One-Click Start:</p>
                <p className="text-xs text-sky-700">
                  You can also simply double-click <code className="bg-white px-1.5 py-0.5 rounded border border-sky-300 font-mono font-bold">start.bat</code> in the project root folder.
                </p>
              </div>

            </div>
          </div>

          {/* Right 5 Columns: Architecture Highlights & Zero-Backend Reliability */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Zero-Backend Standalone Architecture */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Zero-Backend Architecture</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All neural state estimators (M1–M5), the RL policy Q-network (M6), and the PRISM-ANT negotiation engine run client-side in TypeScript with zero external server dependencies. This ensures 100% offline demonstration reliability during guide presentations and defense evaluations.
              </p>
            </div>

            {/* Production Build & Standalone Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Building for Production / Offline USB
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To create a single static distribution package:
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400">
                <code>npm run build</code>
              </div>
              <p className="text-[11px] text-slate-500">
                The output files in <code className="text-slate-800 font-bold font-mono">dist/</code> can be served by any static server or opened directly in a browser.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 2: AI MODELS M1–M6 ARCHITECTURE */}
      {activeDocSection === 'ARCH' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Deep Learning Intelligence Layer (Models M1–M6)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Specifications, training datasets, and operational outputs</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-mono font-bold border border-sky-200">
              Decoupled Predictor-Constraint Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* M1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-mono font-bold">M1: Session Predictor</span>
              <p className="font-bold text-slate-900">Caltech ACN-Data (31,420 Sessions)</p>
              <p className="text-slate-600 leading-relaxed">
                Estimates actual required energy (E_req in kWh), duration, and departure readiness probability from trip distance and destination commitment.
              </p>
            </div>

            {/* M2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-mono font-bold">M2: Demand Forecaster</span>
              <p className="font-bold text-slate-900">ACN Station Time-Series</p>
              <p className="text-slate-600 leading-relaxed">
                Forecasts 15/30/60-min queue surges, occupancy percentages, and substation transformer load envelopes.
              </p>
            </div>

            {/* M3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold">M3: Battery Health & RUL</span>
              <p className="font-bold text-slate-900">NASA Li-ion Aging Dataset</p>
              <p className="text-slate-600 leading-relaxed">
                Estimates battery State of Health (SOH), capacity fade slope, and Remaining Useful Life cycles (RUL) to 70% EOL threshold.
              </p>
            </div>

            {/* M4 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-bold">M4: Degradation Cost Index</span>
              <p className="font-bold text-slate-900">NASA Thermal Stress Series</p>
              <p className="text-slate-600 leading-relaxed">
                Converts Arrhenius temperature stress and high C-rates into a dollar cost ($/session) and enforces the safe power envelope.
              </p>
            </div>

            {/* M5 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold">M5: Mamba State Model</span>
              <p className="font-bold text-slate-900">Selective State-Space Architecture</p>
              <p className="text-slate-600 leading-relaxed">
                Compresses long temporal telemetry into low-dimensional future state trajectories with $O(N)$ inference complexity.
              </p>
            </div>

            {/* M6 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-mono font-bold">M6: RL Policy Network</span>
              <p className="font-bold text-slate-900">ACN-Sim Simulation Engine</p>
              <p className="text-slate-600 leading-relaxed">
                Actor-Critic Q-value ranking over feasible candidate actions, maximizing long-term system reward subject to zero safety violations.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 3: PATENT CLAIMS & FORMULATIONS */}
      {activeDocSection === 'PATENT' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mathematical Formulations & Patent Inventions</h3>
            <p className="text-xs text-slate-500">Core equations powering the PRISM-ANT negotiation algorithm and deterministic constraints</p>
          </div>

          <div className="space-y-4 font-mono text-xs text-slate-800">
            {/* Formula 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-sky-700 font-bold font-sans text-xs">1. PRISM-ANT 2.0 Multi-Factor Objective Score:</span>
              <div className="p-3 bg-white rounded-lg border border-slate-300 overflow-x-auto text-slate-900">
                <code>Score(A) = w_u · Urgency_i + w_r · Reciprocity_i - w_d · DegradationCost + w_g · GridFit - w_c · Congestion + w_rl · Q(A)</code>
              </div>
            </div>

            {/* Formula 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-emerald-700 font-bold font-sans text-xs">2. Reciprocity Aging & Decay Ledger (Feature F3):</span>
              <div className="p-3 bg-white rounded-lg border border-slate-300 overflow-x-auto text-slate-900">
                <code>R_i(t+1) = R_i(t) · e^(-λ · Δt) + γ · Δt_sacrifice - ω · PriorityConsumed</code>
              </div>
            </div>

            {/* Formula 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-amber-700 font-bold font-sans text-xs">3. Battery Thermal Arrhenius Degradation Currency (Feature F2):</span>
              <div className="p-3 bg-white rounded-lg border border-slate-300 overflow-x-auto text-slate-900">
                <code>C_deg = C_pack · [ α · (I_chg / C_nom)^γ + β · e^((T_bat - T_ref) / κ) ] · ΔSOC</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: GUIDE & EVALUATION FAQ */}
      {activeDocSection === 'FAQ' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Guide Presentation & Defense Talking Points</h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Q1: Why is this patentable instead of standard AI charging?</p>
              <p className="text-slate-600 leading-relaxed">
                Standard approaches treat charging as a centralized mathematical queue or let black-box neural networks directly switch relays. ANT-EV 2.0 introduces a decoupled closed-loop architecture where AI predicts future physical states, PRISM-ANT negotiates through privacy-preserving tokens, and a deterministic safety gate enforces hard electrochemical and grid limits.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Q2: How does the system handle driver privacy?</p>
              <p className="text-slate-600 leading-relaxed">
                Drivers never broadcast GPS routes, calendar events, or identity. The EV Digital Twin computes normalized utility tokens (Urgency $u_i \in [0, 1]$, Flexibility $f_i \in [0, 1]$, and Reciprocity $R_i$) signed by an anonymized cryptographic hash.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Q3: How does the system guarantee zero safety violations?</p>
              <p className="text-slate-600 leading-relaxed">
                The Hard Constraints Safety Gate is deterministic and runs after neural inferences. If an EV's battery is above 42°C, 150 kW fast charging is strictly blocked and rejected regardless of driver urgency.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
