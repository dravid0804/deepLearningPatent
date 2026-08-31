import React, { useState } from 'react';
import { PATENT_FEATURES, type PatentFeature } from '../../services/patent/patentClaims';
import { 
  Award, 
  Zap, 
  BatteryCharging, 
  Coins, 
  Calendar, 
  AlertTriangle, 
  Network, 
  Compass, 
  CheckCircle, 
  Truck, 
  RefreshCw, 
  ChevronRight,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';

export const PatentFeaturesShowcase: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('F1');
  const activeFeature: PatentFeature = PATENT_FEATURES.find(f => f.id === selectedFeatureId) || PATENT_FEATURES[0];

  const getFeatureIcon = (id: string) => {
    switch (id) {
      case 'F1': return Zap;
      case 'F2': return BatteryCharging;
      case 'F3': return Coins;
      case 'F4': return Calendar;
      case 'F5': return AlertTriangle;
      case 'F6': return Network;
      case 'F7': return Compass;
      case 'F8': return CheckCircle;
      case 'F9': return Sparkles;
      case 'F10': return Truck;
      case 'F11': return RefreshCw;
      default: return Award;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold font-mono">
              SECTION 3 SPECIFICATION
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tech-font">
              Eleven Real-World Features Added in ANT-EV 2.0 (F1–F11)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Each feature represents a specific patentable technical innovation solving critical challenges in electric vehicle mobility, battery electrochemistry, grid resilience, and autonomous multi-agent economics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-sky-700 text-xs font-mono font-bold">
          <Award className="w-4 h-4 text-sky-600" />
          <span>11 Inventions Documented</span>
        </div>
      </div>

      {/* Grid of 11 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {PATENT_FEATURES.map((feature) => {
          const Icon = getFeatureIcon(feature.id);
          const isSelected = selectedFeatureId === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setSelectedFeatureId(feature.id)}
              className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50 border-sky-400 shadow-sm ring-1 ring-sky-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {feature.id}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2 leading-tight">{feature.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">{feature.simpleDefinition}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>{feature.claimReference}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Deep-Dive Panel for Selected Feature */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-bold text-sm">
                FEATURE {activeFeature.id}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tech-font">{activeFeature.name}</h3>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-4xl leading-relaxed">{activeFeature.simpleDefinition}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Patent Claims Mapping</span>
            <p className="text-xs font-bold text-sky-700 font-mono">{activeFeature.claimReference}</p>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Pillar 1: Operational Output */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold">
              <Zap className="w-4 h-4" />
              <h4 className="text-xs uppercase tracking-wider">Operational Output</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeFeature.operationalOutput}
            </p>
          </div>

          {/* Pillar 2: Technical Novelty */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs uppercase tracking-wider">Inventive Step / Novelty</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeFeature.technicalNovelty}
            </p>
          </div>

          {/* Pillar 3: Mathematical Basis */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <Code className="w-4 h-4" />
              <h4 className="text-xs uppercase tracking-wider">Mathematical Formulation</h4>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-300 font-mono text-[11px] text-slate-900 overflow-x-auto">
              <code>{activeFeature.mathematicalBasis}</code>
            </div>
          </div>

        </div>

        {/* Consuming Neural Models */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-600" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Consuming Deep Learning Models</span>
              <div className="flex gap-2 mt-0.5">
                {activeFeature.usedModels.map((m, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-mono font-bold border border-purple-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 italic">
            Patent Defense Note: Enforces strict closed-loop validation before executing any physical power actuation.
          </div>
        </div>

      </div>

    </div>
  );
};
