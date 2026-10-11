import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Radio, Clock, Laptop, UserCheck, AlertTriangle, Layers } from 'lucide-react';

export const ZeroTrustView: React.FC = () => {
  const { user, simulatedDevice, simulatedIp } = useAuth();

  const mockRiskScore = 18; // Low baseline

  const trustFactors = [
    { label: 'IDENTITY VERIFICATION', value: user ? `${user.user_code} (${user.full_name})` : 'USR-002 (Operator One)', status: 'VERIFIED ✓', isOk: true, icon: <UserCheck className="w-5 h-5" /> },
    { label: 'ROLE AUTHORIZATION', value: user ? user.role : 'OPERATOR', status: 'AUTHORIZED ✓', isOk: true, icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'DEVICE IDENTITY', value: `${simulatedDevice} (TRUSTED)`, status: 'TRUSTED ✓', isOk: true, icon: <Laptop className="w-5 h-5" /> },
    { label: 'SUBNET / NETWORK IP', value: `${simulatedIp} (Internal SCADA)`, status: 'INTERNAL ✓', isOk: true, icon: <Radio className="w-5 h-5" /> },
    { label: 'OPERATIONAL WINDOW', value: '10:15 AM (Normal 08:00-18:00)', status: 'NORMAL ✓', isOk: true, icon: <Clock className="w-5 h-5" /> },
    { label: 'LOCATION PROFILE', value: 'Plant HMI Console #1', status: 'EXPECTED ✓', isOk: true, icon: <Layers className="w-5 h-5" /> },
    { label: 'COMMAND PERMISSION', value: 'Medium Sensitivity allowed', status: 'ALLOWED ✓', isOk: true, icon: <Lock className="w-5 h-5" /> },
    { label: 'ML BEHAVIOR ANOMALY', value: 'Random Forest (Confidence: 96.4%)', status: 'NORMAL ✓', isOk: true, icon: <Cpu className="w-5 h-5" /> },
  ];

  const zeroTrustPolicies = [
    { code: 'ZTP-001', name: 'Working Hours SCADA Enforcement', category: 'Context Policy', minRole: 'OPERATOR', threshold: 'Risk <= 60', status: 'ENABLED' },
    { code: 'ZTP-002', name: 'Untrusted Subnet Auto-Block', category: 'Network Policy', minRole: 'OPERATOR', threshold: 'Risk <= 40', status: 'ENABLED' },
    { code: 'ZTP-003', name: 'Critical Command MFA Requirement', category: 'Access Control', minRole: 'ENGINEER', threshold: 'Risk <= 50', status: 'ENABLED' },
    { code: 'ZTP-004', name: 'ML Behavioral Threat Containment', category: 'Threat Prevention', minRole: 'ADMIN', threshold: 'Risk <= 80', status: 'ENABLED' }
  ];

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-cyan-400" /> ZERO TRUST SECURITY CENTER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Continuous Authentication & Microsegmentation Policy Gateway
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">PRINCIPLE:</span>
          <span className="font-bold text-cyan-400">NEVER TRUST, ALWAYS VERIFY</span>
        </div>
      </div>

      {/* Risk Score & Trust Factor Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Large Circular / Meter Risk Score Display (Section 13 & 45) */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            SYSTEM COMPOSITE RISK SCORE
          </h3>

          <div className="relative w-44 h-44 rounded-full border-8 border-cyan-500/20 bg-slate-900/90 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <span className="text-4xl font-black text-emerald-400 font-mono">{mockRiskScore}</span>
            <span className="text-xs text-slate-500 font-mono font-semibold">/ 100</span>
            <span className="mt-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              LOW RISK
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Composite score evaluated from identity, device health, IP subnet, time window, command sensitivity, and ML threat classifier.
          </p>
        </div>

        {/* 8-Factor Matrix Display Cards (Section 13) */}
        <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">
            EIGHT-FACTOR ZERO TRUST MATRIX STATUS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {trustFactors.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">{f.icon}</div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{f.label}</div>
                    <div className="text-slate-200 text-[11px] font-semibold">{f.value}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Zero Trust Policies Table (Section 52) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> ACTIVE ZERO TRUST GATEWAY POLICIES
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <th className="p-3">POLICY CODE</th>
                <th className="p-3">POLICY NAME</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">MIN ROLE</th>
                <th className="p-3">THRESHOLD</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {zeroTrustPolicies.map((pol) => (
                <tr key={pol.code} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-cyan-400">{pol.code}</td>
                  <td className="p-3 font-semibold text-white">{pol.name}</td>
                  <td className="p-3 text-slate-400">{pol.category}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">{pol.minRole}</span></td>
                  <td className="p-3 text-slate-400">{pol.threshold}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {pol.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
