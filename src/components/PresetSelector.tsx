import React from 'react';
import { ArrowRight, BookOpen, Clock, Video, Sparkles, TrendingUp, Cpu } from 'lucide-react';
import { PresetItem } from '../types';

interface PresetSelectorProps {
  onSelectPreset: (presetId: string) => void;
  isLoading: boolean;
}

export const PRESET_LIST: PresetItem[] = [
  {
    id: 'smc-lecture-1',
    title: '01. What is Smart Money Concept (SMC) & Why SMC is Important - Forex Dada (Level 3)',
    category: 'Forex & Trading Course',
    duration: '24:18',
    sourceType: 'video',
    targetLanguage: 'roman_urdu',
    description: 'Retail vs Institutional Smart Money trading, stop hunting, liquidity pools aur high risk-to-reward entries ka buniyadi lecture.',
  },
  {
    id: 'smc-lecture-4',
    title: '04. Order Flow & Smart Money Concept - Forex Dada (Level 3)',
    category: 'Forex & Trading Course',
    duration: '31:45',
    sourceType: 'video',
    targetLanguage: 'roman_urdu',
    description: 'Institutional order flow delivery, mitigation cycles, BOS vs CHoCH aur inducement sweep rules.',
  },
  {
    id: 'ai-foundations-2026',
    title: 'Generative AI & LLM Architecture Explained Simply - Tech Explainer',
    category: 'Technology & AI',
    duration: '18:50',
    sourceType: 'audio',
    targetLanguage: 'roman_urdu',
    description: 'Transformers, self-attention, tokens, aur context window ki asaan Roman Urdu wazahat.',
  },
];

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="max-w-2xl mb-6">
        <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
          Featured Course Lectures & Demos
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Select any lecture below to test the Roman Urdu summary, Smart Money Concept technical definitions, chapter breakdowns, and interactive Q&A.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PRESET_LIST.map((preset) => {
          const isTrading = preset.category.includes('Trading');
          return (
            <div
              key={preset.id}
              onClick={() => !isLoading && onSelectPreset(preset.id)}
              className="group border border-slate-200 hover:border-slate-400 rounded-xl p-5 bg-white transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    {isTrading ? (
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>{preset.category}</span>
                  </div>
                  <span className="font-mono tabular-nums">{preset.duration}</span>
                </div>

                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-slate-800 transition-colors line-clamp-2 mb-2">
                  {preset.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Roman Urdu Summary
                </span>
                <span className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Load Lecture
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
