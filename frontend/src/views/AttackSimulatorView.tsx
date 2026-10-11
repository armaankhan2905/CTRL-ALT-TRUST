import React, { useState } from 'react';
import { attackAPI } from '../services/api';
import { AttackSimulationResponse } from '../types';
import { ZeroTrustModal } from '../components/ZeroTrustModal';
import { Flame, ShieldAlert, Laptop, Radio, AlertOctagon, Biohazard, UserX, Cpu, CheckCircle, XCircle } from 'lucide-react';

export const AttackSimulatorView: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<AttackSimulationResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRunAttack = async (attackType: string) => {
    setIsSimulating(true);
    try {
      const res = await attackAPI.simulate(attackType);
      setActiveSimulation(res);
      setModalOpen(true);
    } catch (err) {
      console.error("Attack simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Flame className="w-7 h-7 text-rose-500 animate-bounce" /> ATTACK SIMULATION LAB
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Safe Cybersecurity Threat Simulator for Critical SCADA Infrastructure
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> FICTIONAL SIMULATION MODE ONLY
        </div>
      </div>

      {/* Attack Scenario Trigger Cards (Section 25) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <AttackCard
          title="Unknown Device Attack"
          code="UNKNOWN_DEVICE"
          icon={<Laptop className="w-6 h-6 text-rose-400" />}
          description="Simulates command issued from an unregistered host (UNKNOWN-PC) via external IP."
          onRun={() => handleRunAttack('UNKNOWN_DEVICE')}
          disabled={isSimulating}
        />

        <AttackCard
          title="External Subnet IP Attack"
          code="EXTERNAL_IP"
          icon={<Radio className="w-6 h-6 text-amber-400" />}
          description="Simulates valid operator credentials originating from untrusted public IP subnet."
          onRun={() => handleRunAttack('EXTERNAL_IP')}
          disabled={isSimulating}
        />

        <AttackCard
          title="Brute Force Auth Pattern"
          code="BRUTE_FORCE"
          icon={<UserX className="w-6 h-6 text-purple-400" />}
          description="Simulates 25 rapid failed login attempts triggering automated account lockout."
          onRun={() => handleRunAttack('BRUTE_FORCE')}
          disabled={isSimulating}
        />

        <AttackCard
          title="Unauthorized Command"
          code="UNAUTHORIZED_COMMAND"
          icon={<AlertOctagon className="w-6 h-6 text-rose-500" />}
          description="Simulates Operator role attempting restricted system configuration modification."
          onRun={() => handleRunAttack('UNAUTHORIZED_COMMAND')}
          disabled={isSimulating}
        />

        <AttackCard
          title="Abnormal SCADA Traffic"
          code="ABNORMAL_TRAFFIC"
          icon={<Cpu className="w-6 h-6 text-cyan-400" />}
          description="Simulates high-frequency command burst (150 cmds/min) triggering ML anomaly detector."
          onRun={() => handleRunAttack('ABNORMAL_TRAFFIC')}
          disabled={isSimulating}
        />

        <AttackCard
          title="Ransomware Threat"
          code="RANSOMWARE"
          icon={<Biohazard className="w-6 h-6 text-rose-500" />}
          description="Simulates compromised engineering PC attempting PLC binary overwrite & demand card."
          onRun={() => handleRunAttack('RANSOMWARE')}
          disabled={isSimulating}
        />

        <AttackCard
          title="Insider Threat Anomaly"
          code="INSIDER_THREAT"
          icon={<Flame className="w-6 h-6 text-amber-500" />}
          description="Simulates trusted user on trusted device issuing rapid off-hours shutdown commands."
          onRun={() => handleRunAttack('INSIDER_THREAT')}
          disabled={isSimulating}
        />

        <AttackCard
          title="SCADA Command Injection"
          code="COMMAND_INJECTION"
          icon={<AlertOctagon className="w-6 h-6 text-cyan-400" />}
          description="Simulates malicious SQL/command payload injected into SCADA argument buffer."
          onRun={() => handleRunAttack('COMMAND_INJECTION')}
          disabled={isSimulating}
        />

      </div>

      {/* Ransomware Safe Visual Containment Display (Section 31) */}
      {activeSimulation?.attack_type === 'RANSOMWARE' && (
        <div className="bg-rose-950/80 backdrop-blur-xl border-2 border-rose-600 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn text-slate-100">
          <div className="flex items-center justify-between border-b border-rose-800 pb-3">
            <div className="flex items-center gap-3">
              <Biohazard className="w-8 h-8 text-rose-500 animate-pulse" />
              <div>
                <h3 className="text-lg font-black text-rose-400 uppercase tracking-wider">
                  RANSOMWARE ATTACK SIMULATION & ZERO TRUST CONTAINMENT
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  Safe Fictional Asset Simulation // Real SCADA System Protected
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500 font-mono text-xs font-bold">
              CONTAINED & ISOLATED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">

            {/* Affected Assets Sandbox Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-rose-400 uppercase">AFFECTED FICTIONAL ASSETS</div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span>PLC Configuration</span>
                  <span className="text-rose-400 font-bold">SIMULATED ENCRYPTION</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span>SCADA Database</span>
                  <span className="text-rose-400 font-bold">SIMULATED ENCRYPTION</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span>Pump Controller</span>
                  <span className="text-emerald-400 font-bold">ZTA PROTECTED ✓</span>
                </div>
              </div>
            </div>

            {/* Mock Ransom Demand Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase">SIMULATED RANSOM DEMAND</div>
                <div className="text-2xl font-black text-rose-500 mt-1">5.0 BTC</div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mock ransom demand string generated by simulation payload. No real file encryption performed.
                </p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                ✓ ZERO TRUST AUTOMATED HOST ISOLATION ENGAGED
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Decision Evaluation Modal */}
      {activeSimulation && (
        <ZeroTrustModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          decision={activeSimulation.decision}
          commandName={activeSimulation.attack_type}
          targetAsset="SCADA_SYSTEM"
          userEmail={activeSimulation.simulated_request.user}
          deviceName={activeSimulation.simulated_request.device}
          ipAddress={activeSimulation.simulated_request.ip}
        />
      )}

    </div>
  );
};

const AttackCard: React.FC<{
  title: string;
  code: string;
  icon: React.ReactNode;
  description: string;
  onRun: () => void;
  disabled: boolean;
}> = ({ title, icon, description, onRun, disabled }) => (
  <div className="p-5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-rose-500/40 transition">
    <div className="space-y-2">
      <div className="p-3 rounded-xl bg-slate-900 w-fit border border-slate-800">{icon}</div>
      <h3 className="text-sm font-bold text-white uppercase">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed font-mono">{description}</p>
    </div>
    <button
      onClick={onRun}
      disabled={disabled}
      className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-2"
    >
      <Flame className="w-3.5 h-3.5" /> SIMULATE ATTACK
    </button>
  </div>
);
