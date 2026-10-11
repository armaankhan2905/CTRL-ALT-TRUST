import React from 'react';
import { Globe, ShieldCheck, Server, Cpu, Laptop, Radio, AlertTriangle } from 'lucide-react';

interface NetworkMapProps {
  activeAttackNode?: string | null;
  activeIp?: string;
  activeDevice?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
  activeAttackNode,
  activeIp = '172.16.1.5',
  activeDevice = 'SCADA-PC-01'
}) => {
  const isExternalThreat = activeAttackNode || activeIp.startsWith('203.0') || activeDevice.includes('UNKNOWN');

  return (
    <div className="relative w-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden text-slate-100">

      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" /> SCADA NETWORK ARCHITECTURE & ZTA GATEWAY TOPOLOGY
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Microsegmented SCADA Subnet: 172.16.1.0/24 // Dynamic ZTNA Perimeter
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-400 font-bold">GATEWAY ACTIVE</span>
        </div>
      </div>

      {/* Topology Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

        {/* 1. External Public Network / Threat Node */}
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-500 ${isExternalThreat ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
          <Globe className={`w-8 h-8 mb-2 ${isExternalThreat ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
          <span className="text-xs font-bold uppercase">{isExternalThreat ? 'UNTRUSTED ORIGIN' : 'PUBLIC INTERNET'}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1">{activeIp}</span>
          {isExternalThreat && (
            <span className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
              THREAT VECTOR
            </span>
          )}
        </div>

        {/* Line 1 */}
        <div className="hidden md:flex items-center justify-center">
          <div className={`h-1 w-full ${isExternalThreat ? 'bg-rose-500 animate-pulse' : 'bg-slate-800'}`} />
        </div>

        {/* 2. Zero Trust Gateway Enforcement Engine */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(6,182,212,0.15)] relative">
          <ShieldCheck className="w-9 h-9 text-cyan-400 mb-2 animate-pulse" />
          <span className="text-xs font-bold uppercase text-white">ZERO TRUST GATEWAY</span>
          <span className="text-[10px] font-mono text-cyan-400 mt-1">ZTA Policy Engine</span>
          <div className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            INSPECTING ALL TRAFFIC
          </div>
        </div>

        {/* Line 2 */}
        <div className="hidden md:flex items-center justify-center">
          <div className="h-1 w-full bg-emerald-500/60" />
        </div>

        {/* 3. Protected SCADA Subnet */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-2">
          <Server className="w-8 h-8 text-emerald-400 mb-1" />
          <span className="text-xs font-bold uppercase text-slate-200">PROTECTED SCADA SUBNET</span>
          <span className="text-[10px] font-mono text-emerald-400">172.16.1.0/24</span>

          <div className="w-full grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-mono border-t border-slate-800">
            <div className="p-1 rounded bg-slate-950 text-slate-300">SCADA-PC-01</div>
            <div className="p-1 rounded bg-slate-950 text-slate-300">PLC-PRIMARY</div>
          </div>
        </div>

      </div>

    </div>
  );
};
