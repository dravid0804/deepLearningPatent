import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  Battery, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Sliders,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import type { EVDigitalTwin, ChargingStation, GridTwinState } from '../../types/antev';
import { DeepLearningIntelligenceLayer } from '../../services/models/deepLearningLayer';

interface AiIntelligenceProps {
  evs: EVDigitalTwin[];
  stations: ChargingStation[];
  grid: GridTwinState;
}

export const AiIntelligence: React.FC<AiIntelligenceProps> = ({
  evs,
  stations,
  grid
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('M1');
  const [selectedEvIndex, setSelectedEvIndex] = useState<number>(0);
  const currentEv = evs[selectedEvIndex] || evs[0];
  const station = stations[0];

  const predictions = DeepLearningIntelligenceLayer.runFullInferencePackage(currentEv, station, grid);

  const modelCards = [
    {
      id: 'M1',
      name: 'EV Energy & Session Predictor',
      tagline: 'Predicts net energy deficit (kWh) and departure duration from route commitments.',
      datasetName: 'Caltech ACN-Data (EV Charging Sessions)',
      datasetSource: 'Kaggle / Caltech EV Research Portal (30,000+ sessions)',
      inputFeatures: ['arrival_soc', 'target_soc', 'connection_time_hours', 'battery_temp_avg_c'],
      outputGenerated: `${predictions.m1EnergySession.predictedEnergyKwh} kWh deficit • ${predictions.m1EnergySession.predictedDurationMin} min dwell`,
      confidence: `${(predictions.m1EnergySession.confidence * 100).toFixed(0)}%`,
      mae: 'Evaluation required before deployment',
      downstreamUse: 'Level 3 & 4: Queue scheduling, departure readiness determination (F1, F8)'
    },
    {
      id: 'M2',
      name: 'Station Demand & Queue Forecaster',
      tagline: 'Forecasts 15/30/60-min station bay occupancy, queue surges, and power demand.',
      datasetName: 'Electric Vehicle Charging Station Demand Time-Series',
      datasetSource: 'Kaggle EV Charging Demand Forecasting Dataset',
      inputFeatures: ['timestamp', 'hour_of_day', 'day_of_week', 'active_power_kw', 'tariff_rate'],
      outputGenerated: `15m: ${predictions.m2DemandForecast.forecast15mKw} kW • 30m: ${predictions.m2DemandForecast.forecast30mKw} kW • 60m: ${predictions.m2DemandForecast.forecast60mKw} kW`,
      confidence: 'Demo estimate; no validated model loaded',
      mae: 'Evaluate with rolling-origin validation',
      downstreamUse: 'Level 5: Capacity reservation, transformer headroom planning (F4, F5)'
    },
    {
      id: 'M3',
      name: 'Battery Health & RUL Prognostics',
      tagline: 'Estimates battery State of Health (SOH) and Remaining Useful Life (RUL) cycles.',
      datasetName: 'NASA Ames Li-ion Battery Aging Datasets',
      datasetSource: 'NASA PCoE / Kaggle (B0005, B0006, B0007 run-to-failure series)',
      inputFeatures: ['cycle_number', 'voltage_measured', 'current_measured', 'internal_impedance', 'capacity_ah'],
      outputGenerated: `${predictions.m3BatteryHealthRul.predictedSohPercent}% SOH • ${predictions.m3BatteryHealthRul.estimatedRulRemainingCycles} RUL cycles`,
      confidence: `${predictions.m3BatteryHealthRul.confidencePercent}% Confidence`,
      mae: 'Requires pack-specific validation',
      downstreamUse: 'Level 4 & 6: Battery degradation tracking, second-life assessment (F2, F8)'
    },
    {
      id: 'M4',
      name: 'Battery Thermal Stress & Lifetime Cost',
      tagline: 'Translates high C-rate and high-temperature charging into a financial cost ($/session).',
      datasetName: 'NASA Battery Thermal Degradation & High C-Rate Series',
      datasetSource: 'NASA Ames Research Center / Kaggle Electrochemical Data',
      inputFeatures: ['c_rate', 'temperature_c', 'delta_soc', 'internal_resistance_mohm'],
      outputGenerated: `$${predictions.m4BatteryCostStress.lifetimeDegradationCostUsd.toFixed(2)} / session • Safe Envelope: ${predictions.m4BatteryCostStress.recommendedPowerEnvelopeKw} kW`,
      confidence: 'Relative demo stress indicator',
      mae: 'Do not infer battery wear savings',
      downstreamUse: 'Level 6: Safe power envelope calculation, thermal guard clamping (F2, F4)'
    },
    {
      id: 'M5',
      name: 'Mamba (S6) Selective State-Space Sequence Model',
      tagline: 'Linear-time associative scan predicting multi-step future station state trajectories.',
      datasetName: 'Electric Vehicle Driving and Charging Time-Series',
      datasetSource: 'Kaggle Sequential EV Telemetry Dataset',
      inputFeatures: ['60-step historical sliding sequence: [SOC(t), Temp(t), Power(t), Grid(t)]'],
      outputGenerated: `5-step Trajectory: [${predictions.m5MambaState.trajectorySocHorizon.join(', ')}]% SOC`,
      confidence: 'Sequence-model interface; demo estimator',
      mae: 'Evaluate per forecast horizon',
      downstreamUse: 'Level 5: Multi-horizon state forecasting, proactive station modulation'
    },
    {
      id: 'M6',
      name: 'Constrained Reinforcement Learning Policy',
      tagline: 'Deep Actor-Critic policy ranking feasible station actions to maximize system reward.',
      datasetName: 'ACN-Sim EV Charging Gym Environment',
      datasetSource: 'Caltech ACN-Sim Simulator Gym (Kaggle / GitHub)',
      inputFeatures: ['State Vector (24 dims: Tokens + M1-M5 Predictions + Grid Headroom)'],
      outputGenerated: `Selected Action: ${predictions.m6RlPolicy.recommendedAction} (Reward: ${predictions.m6RlPolicy.systemRewardExpected})`,
      confidence: 'Safety-filtered demo candidate set',
      mae: 'Evaluate in held-out simulator scenarios',
      downstreamUse: 'Level 7: Optimal power allocation under hard deterministic constraints'
    }
  ];

  const activeCard = modelCards.find(m => m.id === selectedModelId) || modelCards[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">04 • Deep Learning Intelligence Center (Models M1–M6)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              DEMO ESTIMATORS · MODEL ARTIFACTS NOT LOADED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Explore the 6 modular deep learning models that generate predictive inputs for the station optimization engine.
          </p>
        </div>

        {/* Vehicle Selector for Live Testing */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <span className="text-slate-500">Test Session:</span>
          <select 
            value={selectedEvIndex}
            onChange={(e) => setSelectedEvIndex(parseInt(e.target.value))}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {evs.map((ev, idx) => (
              <option key={ev.id} value={idx}>{ev.name} ({ev.model})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {modelCards.map((m) => {
          const isSelected = selectedModelId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`p-3.5 rounded-2xl border text-left transition shadow-xs ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-700'
                }`}>
                  {m.id}
                </span>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  Demo interface
                </span>
              </div>
              <div className={`text-xs font-bold mt-2 truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {m.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Selected Model Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-100 text-blue-800">
                MODEL {activeCard.id}
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeCard.name}</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {activeCard.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono">
              Evaluation note: {activeCard.mae}
            </span>
          </div>
        </div>

        {/* 3-Column Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Col 1: Dataset Provenance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Dataset Provenance</span>
            </div>
            <div className="font-bold text-slate-800">{activeCard.datasetName}</div>
            <p className="text-slate-500 text-[11px]">{activeCard.datasetSource}</p>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-blue-600 font-bold flex items-center gap-1">
              <span>Public Kaggle Dataset Verified</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* Col 2: Inputs & Features */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Input Features Matrix</span>
            </div>
            <div className="space-y-1">
              {activeCard.inputFeatures.map((feat, idx) => (
                <div key={idx} className="font-mono text-[11px] text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Live Output for Test Vehicle */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Inference Output</span>
            </div>
            <div className="text-base font-black text-slate-900 font-mono mt-1">
              {activeCard.outputGenerated}
            </div>
            <div className="text-[11px] text-slate-600 font-medium pt-2 border-t border-blue-200">
              <b>Downstream Action:</b> {activeCard.downstreamUse}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
