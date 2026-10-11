import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Laptop, Network, LogOut, Bell, Flame, Activity } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  securityScore?: number;
  activeAlertCount?: number;
  onRunDemoScenario?: (scenarioKey: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  securityScore = 92,
  activeAlertCount = 1,
  onRunDemoScenario
}) => {
  const { user, quickLogin, logout, simulatedDevice, simulatedIp, setSimulatedDevice, setSimulatedIp } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-lg font-black tracking-wider text-white whitespace-nowrap">TRUST-GRID</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono whitespace-nowrap">
                ZERO TRUST AI v1.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
              TRUST NOTHING. VERIFY EVERYTHING.
            </p>
          </div>
        </div>

        {/* Hackathon Demo Quick Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold px-2">
            DEMO PRESETS:
          </span>

          <button
            onClick={() => onRunDemoScenario?.('NORMAL')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition text-[11px] font-medium"
          >
            ✓ Normal
          </button>

          <button
            onClick={() => onRunDemoScenario?.('UNKNOWN_DEVICE')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition text-[11px] font-medium"
          >
            🚨 Unknown Device
          </button>

          <button
            onClick={() => onRunDemoScenario?.('RANSOMWARE')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition text-[11px] font-medium"
          >
            ☣️ Ransomware
          </button>

          <button
            onClick={() => onRunDemoScenario?.('INSIDER_THREAT')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition text-[11px] font-medium"
          >
            🔍 Insider Threat
          </button>

          {/* Read-Only Authenticated Role Display */}
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-400 uppercase text-[10px] font-bold">AUTHENTICATED ROLE:</span>
            <span className={`px-2.5 py-0.5 rounded font-bold uppercase ${
              user?.role === 'ADMIN'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : user?.role === 'ENGINEER'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {user ? user.role : 'GUEST / UNAUTHENTICATED'}
            </span>
          </div>
        </div>

        {/* User Info & System Status */}
        <div className="flex items-center gap-3">
          {/* Security Score Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs font-mono">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-[10px] text-slate-400 uppercase font-semibold">SECURITY HEALTH</div>
            <div className="font-bold text-emerald-400">{securityScore}/100</div>
          </div>

          {/* User Badge */}
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right text-xs">
                <div className="font-bold text-white leading-tight">{user.full_name}</div>
                <div className={`text-[10px] font-mono font-bold uppercase ${
                  user.role === 'ADMIN'
                    ? 'text-purple-400'
                    : user.role === 'ENGINEER'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1 text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
            >
              LOGIN
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
