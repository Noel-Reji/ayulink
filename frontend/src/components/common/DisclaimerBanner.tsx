import React from 'react';
import { Sparkles } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-b border-teal-500/20 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-semibold text-teal-300">Prototype Notice:</span>
          <span>AyuLink is a demonstration prototype and is not intended for clinical diagnosis or autonomous prescribing.</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-teal-400/90 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30 text-[11px]">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>AI assists. Clinicians decide.</span>
        </div>
      </div>
    </div>
  );
};
