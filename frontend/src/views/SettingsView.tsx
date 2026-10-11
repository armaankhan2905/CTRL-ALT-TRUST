import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');
  const [criticalThreshold, setCriticalThreshold] = useState(60);
  const [autoIsolate, setAutoIsolate] = useState(true);
  const [mlSensitivity, setMlSensitivity] = useState('HIGH');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">

      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Settings className="w-7 h-7 text-cyan-400" /> SYSTEM ADMIN SECURITY SETTINGS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero Trust Policy Engine Thresholds & Automation Rules
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>READ-ONLY VIEW: You are logged in as <strong>{user?.role}</strong>. Only <strong>ADMIN</strong> users can modify system security parameters.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs text-slate-100">

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> System security settings saved successfully.
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-2">
            OPERATIONAL TIME WINDOW POLICY
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">WORKING HOURS START</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">WORKING HOURS END</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-2">
            RISK THRESHOLD ENFORCEMENT
          </h3>
          <div>
            <label className="block text-slate-400 uppercase mb-1">CRITICAL BLOCK RISK THRESHOLD (0-100)</label>
            <input
              type="number"
              min={10}
              max={90}
              disabled={!isAdmin}
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-500 mt-1">Commands evaluating with Risk Score &gt; {criticalThreshold} are automatically BLOCKED.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-2">
            AUTOMATED CONTAINMENT POLICIES
          </h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="font-bold text-white">AUTOMATIC HOST ISOLATION</div>
              <div className="text-[10px] text-slate-400">Instantly isolate host device if ML Anomaly Confidence &gt; 90%</div>
            </div>
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={autoIsolate}
              onChange={(e) => setAutoIsolate(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {isAdmin && (
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> SAVE SETTINGS
            </button>
          </div>
        )}

      </form>

    </div>
  );
};

