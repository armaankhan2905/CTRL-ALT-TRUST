import React from 'react';
import { ZeroTrustDecision } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, CheckCircle, Cpu, Clock, Laptop, UserCheck, Network } from 'lucide-react';

interface ZeroTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: ZeroTrustDecision | null;
  commandName: string;
  targetAsset: string;
  userEmail?: string;
  deviceName?: string;
  ipAddress?: string;
}

export const ZeroTrustModal: React.FC<ZeroTrustModalProps> = ({
  isOpen,
  onClose,
  decision,
  commandName,
  targetAsset,
  userEmail = 'operator@trustgrid.local',
  deviceName = 'SCADA-PC-01',
  ipAddress = '172.16.1.5'
}) => {
  if (!isOpen || !decision) return null;

  const isAllowed = decision.decision === 'ALLOW';
  const isBlocked = decision.decision === 'BLOCK';
  const isRequireVerification = decision.decision === 'REQUIRE_VERIFICATION';

  const riskScore = decision.risk_score;
  let scoreColor = 'text-emerald-400';
  let scoreBg = 'bg-emerald-500/10 border-emerald-500/30';

  if (riskScore > 60) {
    scoreColor = 'text-rose-500';
    scoreBg = 'bg-rose-500/10 border-rose-500/30';
  } else if (riskScore > 30) {
    scoreColor = 'text-amber-400';
    scoreBg = 'bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">

        {/* Modal Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isBlocked ? 'bg-rose-950/60 border-rose-800/80' : isRequireVerification ? 'bg-amber-950/60 border-amber-800/80' : 'bg-emerald-950/60 border-emerald-800/80'}`}>
          <div className="flex items-center gap-3">
            {isBlocked ? (
              <ShieldAlert className="w-8 h-8 text-rose-500 animate-bounce" />
            ) : isRequireVerification ? (
              <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            )}
            <div>
              <h3 className="text-lg font-bold tracking-wide uppercase">
                ZERO TRUST EVALUATION GATEWAY
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                COMMAND: <span className="font-bold text-white">{commandName} {targetAsset}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Decision Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${isBlocked ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' : isRequireVerification ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'}`}>
            <div className="flex items-center gap-3">
              {isBlocked ? (
                <XCircle className="w-7 h-7 text-rose-500" />
              ) : isRequireVerification ? (
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              ) : (
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              )}
              <div>
                <div className="text-sm font-black uppercase tracking-wider">
                  {isBlocked ? '🚨 ACCESS BLOCKED' : isRequireVerification ? '⚠️ VERIFICATION REQUIRED' : '✓ ACCESS GRANTED'}
                </div>
                <div className="text-xs opacity-90">
                  {isBlocked ? 'Zero Trust policy rejected SCADA command execution.' : isRequireVerification ? 'Secondary multi-factor confirmation required.' : 'All required Zero Trust policy parameters satisfied.'}
                </div>
              </div>
            </div>

            {/* Composite Risk Meter */}
            <div className={`px-4 py-2 rounded-xl border font-mono text-center ${scoreBg}`}>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">RISK SCORE</div>
              <div className={`text-xl font-extrabold ${scoreColor}`}>
                {riskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider">{decision.risk_category}</div>
            </div>
          </div>

          {/* 8-Factor Matrix Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              8-FACTOR TRUST MATRIX VERIFICATION
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <FactorItem icon={<UserCheck className="w-4 h-4" />} label="IDENTITY" status={decision.factors.identity_verified} />
              <FactorItem icon={<ShieldCheck className="w-4 h-4" />} label="ROLE" status={decision.factors.role_authorized} />
              <FactorItem icon={<Laptop className="w-4 h-4" />} label="DEVICE" status={decision.factors.device_trusted} />
              <FactorItem icon={<Network className="w-4 h-4" />} label="SUBNET IP" status={decision.factors.ip_internal} />
              <FactorItem icon={<Clock className="w-4 h-4" />} label="TIME WINDOW" status={decision.factors.time_normal} />
              <FactorItem icon={<Network className="w-4 h-4" />} label="LOCATION" status={decision.factors.location_expected} />
              <FactorItem icon={<ShieldCheck className="w-4 h-4" />} label="COMMAND" status={decision.factors.command_allowed} />
              <FactorItem icon={<Cpu className="w-4 h-4" />} label="ML BEHAVIOR" status={decision.factors.ml_behavior_normal} />
            </div>
          </div>

          {/* Request Metadata Details */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono">
            <div>
              <span className="text-slate-500">USER:</span> <span className="text-slate-200 font-semibold">{userEmail}</span>
            </div>
            <div>
              <span className="text-slate-500">DEVICE:</span> <span className="text-slate-200 font-semibold">{deviceName}</span>
            </div>
            <div>
              <span className="text-slate-500">IP ADDRESS:</span> <span className="text-slate-200 font-semibold">{ipAddress}</span>
            </div>
            <div>
              <span className="text-slate-500">ML CLASSIFICATION:</span> <span className={`font-semibold ${decision.ml_result === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400'}`}>{decision.ml_result} ({Math.round(decision.ml_confidence * 100)}%)</span>
            </div>
          </div>

          {/* Policy Evaluation Reasons */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              POLICY ENGINE LOG REASONS
            </h4>
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto">
              {decision.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-500 select-none">›</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

const FactorItem: React.FC<{ icon: React.ReactNode; label: string; status: boolean }> = ({ icon, label, status }) => (
  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${status ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/30 text-rose-300'}`}>
    {icon}
    <div className="truncate">
      <div className="text-[10px] opacity-75">{label}</div>
      <div className="font-bold text-[11px]">{status ? 'VERIFIED ✓' : 'FAILED ✗'}</div>
    </div>
  </div>
);
