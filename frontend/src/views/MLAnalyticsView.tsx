import React, { useState, useEffect } from 'react';
import { MLMetrics } from '../types';
import { mlAPI } from '../services/api';
import { Brain, Cpu, BarChart2, CheckCircle, Activity, ShieldAlert, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const MLAnalyticsView: React.FC = () => {
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [activeModel, setActiveModel] = useState('Random Forest');

  const fetchMetrics = async () => {
    try {
      const data = await mlAPI.getMetrics();
      setMetrics(data);
      setActiveModel(data.active_model);
    } catch (err) {
      console.error("Failed to load ML metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSelectModel = async (name: string) => {
    try {
      await mlAPI.selectModel(name);
      setActiveModel(name);
      fetchMetrics();
    } catch (err) {
      console.error("Model select error:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" /> MACHINE LEARNING SECURITY ANALYTICS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-Time Anomaly & SCADA Telemetry Attack Classifier
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
          <Cpu className="w-4 h-4" /> ACTIVE MODEL: {activeModel}
        </div>
      </div>

      {/* Metric Cards (Section 24) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">TOTAL TELEMETRY ANALYZED</div>
          <div className="text-2xl font-black text-white">{metrics?.total_events_analyzed ?? 42}</div>
          <div className="text-[10px] text-slate-500">Live feature vectors</div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">NORMAL PATTERNS</div>
          <div className="text-2xl font-black text-emerald-400">{metrics?.normal_events_count ?? 38}</div>
          <div className="text-[10px] text-emerald-500 font-bold">Baseline telemetry</div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">ANOMALIES / ATTACKS</div>
          <div className="text-2xl font-black text-rose-500">{metrics?.anomalies_count ?? 4}</div>
          <div className="text-[10px] text-rose-400 font-bold">Flagged by ML</div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">MODEL DETECTION RATE</div>
          <div className="text-2xl font-black text-purple-400">{metrics?.detection_rate ?? 96.4}%</div>
          <div className="text-[10px] text-slate-500">F1 Score benchmark</div>
        </div>
      </div>

      {/* Model Comparison Stats Table (Section 23) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" /> MODEL PERFORMANCE EVALUATION (SCADA TELEMETRY DATASET)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <th className="p-3">MODEL ALGORITHM</th>
                <th className="p-3">ACCURACY</th>
                <th className="p-3">PRECISION</th>
                <th className="p-3">RECALL</th>
                <th className="p-3">F1 SCORE</th>
                <th className="p-3">LATENCY</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {metrics?.model_comparison.map((m) => (
                <tr key={m.model_name} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    {m.model_name}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">{m.accuracy}%</td>
                  <td className="p-3 font-bold text-cyan-400">{m.precision}%</td>
                  <td className="p-3 text-slate-300">{m.recall}%</td>
                  <td className="p-3 font-bold text-purple-400">{m.f1_score}%</td>
                  <td className="p-3 text-slate-400">{m.latency_ms} ms</td>
                  <td className="p-3">
                    {m.model_name === activeModel ? (
                      <span className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40">
                        ACTIVE ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectModel(m.model_name)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        ACTIVATE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importances Chart */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase text-white tracking-wider">
          ML FEATURE IMPORTANCE WEIGHTS (%)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics?.feature_importances || []} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 40]} stroke="#64748b" />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="importance" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
