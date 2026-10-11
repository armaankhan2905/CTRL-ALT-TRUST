import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Globe, Sliders, ShieldCheck, Flame, Laptop, Users, FileText,
  Brain, Search, Key, Settings, Wifi, UserCheck, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, simulatedDevice, simulatedIp } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'scada', label: 'SCADA Control', icon: <Sliders className="w-4 h-4" /> },
    { id: 'zerotrust', label: 'Zero Trust', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'attacks', label: 'Attack Simulator', icon: <Flame className="w-4 h-4" /> },
    { id: 'devices', label: 'Devices', icon: <Laptop className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'logs', label: 'Security Logs', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'ML Analytics', icon: <Brain className="w-4 h-4" /> },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <Search className="w-4 h-4" /> },
    { id: 'crypto', label: 'Crypto Security', icon: <Key className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 backdrop-blur-md border-r border-slate-800 text-slate-300 flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">

      {/* Navigation List */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 pb-2">
          NAVIGATION SOC CONSOLE
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold shadow-lg shadow-cyan-500/5'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Panel (per Hackathon Spec Section 4) */}
      <div className="pt-4 border-t border-slate-800 space-y-2 font-mono text-[11px]">
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>USER:</span>
            <span className="font-bold text-white truncate max-w-[110px]">{user ? user.full_name : 'UNAUTHENTICATED'}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>ROLE:</span>
            <span className={`font-bold uppercase ${
              user?.role === 'ADMIN'
                ? 'text-purple-400'
                : user?.role === 'ENGINEER'
                ? 'text-amber-400'
                : user?.role === 'OPERATOR'
                ? 'text-emerald-400'
                : 'text-slate-500'
            }`}>
              {user ? user.role : 'GUEST'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>DEVICE:</span>
            <span className="font-bold text-slate-300 truncate max-w-[110px]">{simulatedDevice}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>IP:</span>
            <span className="font-bold text-slate-300">{simulatedIp}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <Wifi className="w-3 h-3 animate-pulse" /> CONNECTED
            </span>
            <span className="text-[10px] text-slate-500">ZTA v1.0</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
