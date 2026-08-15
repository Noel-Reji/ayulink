import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart3, 
  Sparkles 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { api } from '../../services/api';
import type { DemandMetric } from '../../types';

export const DemandCharts: React.FC = () => {
  const [metrics, setMetrics] = useState<DemandMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<DemandMetric | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);

  useEffect(() => {
    async function loadDemand() {
      try {
        const data = await api.getDemandMetrics();
        setMetrics(data);
        // Find ORS or high gap item by default
        const ors = data.find((d: any) => d.medicine_name.includes('ORS')) || data[0];
        if (ors) {
          setSelectedMetric(ors);
          fetchExplanation(ors.medicine_id);
        }
      } catch (err) {
        console.error("Failed to load demand intelligence:", err);
      }
    }
    loadDemand();
  }, []);

  const fetchExplanation = async (medId: string) => {
    try {
      const res = await api.explainDemand(medId);
      setExplanation(res);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = metrics.map(m => ({
    name: m.medicine_name.split(' ')[0],
    fullName: m.medicine_name,
    searches: m.search_count,
    prescriptions: m.prescription_count,
    availability: m.availability_percentage,
    level: m.demand_level,
    score: m.demand_score
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Demand Intelligence Dashboard
          </h3>
          <p className="text-xs text-slate-400">
            Aggregated, privacy-preserving demand signals across Thrissur regional health network.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-teal-300">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Non-promotional analytics for capacity planning</span>
        </div>
      </div>

      {/* Primary Supply Gap Alert Highlight (Master Demo Requirement 7) */}
      {selectedMetric && selectedMetric.supply_gap_detected && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-amber-300">
                Potential Supply Gap Detected: {selectedMetric.medicine_name}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
              Demand Level: {selectedMetric.demand_level}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Local Anonymous Searches</span>
              <span className="text-base font-bold text-slate-100">{selectedMetric.search_count}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Prescription Orders</span>
              <span className="text-base font-bold text-slate-100">{selectedMetric.prescription_count}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Regional Availability</span>
              <span className="text-base font-bold text-rose-400">{selectedMetric.availability_percentage}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Recommendation</span>
              <span className="text-xs font-semibold text-amber-300">Review inventory levels</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * AyuLink provides capacity intelligence. The pharmacy independently determines all stocking and ordering decisions.
          </p>
        </div>
      )}

      {/* Grid: Interactive Charts & Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Bar Graph: Search vs Prescriptions */}
        <div className="lg:col-span-8 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Aggregated Demand Signals by Pharmaceutical Category
          </h4>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="searches" name="Anonymous Searches" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prescriptions" name="Prescription Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability / AI scoring panel */}
        <div className="lg:col-span-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Demand Score Breakdown
          </h4>

          {explanation ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{explanation.medicine_name}</span>
                  <span className="font-mono text-teal-400 font-bold">{explanation.score} / 100</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {explanation.explanation}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Weighted Contributing Factors:
                </span>
                {explanation.factors.map((f: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-slate-200 font-medium">{f.factor}</span>
                      <span className="text-[10px] text-slate-400 block">{f.value}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.impact === 'Critical Gap' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {f.impact} ({f.weight})
                    </span>
                  </div>
                ))}
              </div>

              <span className="text-[10px] text-slate-400 block italic">
                {explanation.disclaimer}
              </span>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Select an item to view demand score details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
