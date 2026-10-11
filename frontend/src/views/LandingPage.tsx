import React from 'react';
import { ShieldCheck, ArrowRight, Cpu, Lock, Activity, Eye, Zap, AlertTriangle, Layers, Radio, Sliders } from 'lucide-react';

interface LandingPageProps {
  onEnterConsole: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterConsole, onExploreDemo }) => {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto w-full text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-6 animate-pulse">
          <ShieldCheck className="w-4 h-4" /> TRUST-GRID ARCHITECTURE
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Securing Critical Infrastructure with <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Zero Trust + AI</span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An intelligent security platform that continuously verifies users, devices, networks, and operational behavior before allowing access to critical SCADA water supply operations.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnterConsole}
            className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center gap-3 transition shadow-xl shadow-cyan-500/20 hover:scale-105"
          >
            Enter Security Console <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreDemo}
            className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm tracking-wider uppercase transition hover:border-cyan-500/50"
          >
            Explore Demo Scenarios
          </button>
        </div>

        {/* Dynamic Tagline Banner */}
        <div className="mt-16 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 max-w-3xl mx-auto flex items-center justify-around font-mono text-xs text-cyan-300">
          <div>TRUST NOTHING. VERIFY EVERYTHING.</div>
          <div className="h-4 w-px bg-slate-700" />
          <div>AI-DRIVEN SCADA PROTECTION</div>
        </div>
      </section>

      {/* "HOW IT WORKS" Architecture Pipeline Flow (Section 64) */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold uppercase tracking-wider text-white">
            HOW THE ZERO TRUST ENGINE WORKS
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            Every SCADA command traverses an 8-factor evaluation pipeline before physical execution.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-2 items-center text-xs font-mono">
            <PipelineStep title="USER" sub="Identity" icon={<Lock className="w-5 h-5 text-cyan-400" />} />
            <ArrowDivider />
            <PipelineStep title="IDENTITY" sub="Auth & RBAC" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} />
            <ArrowDivider />
            <PipelineStep title="DEVICE" sub="Trust State" icon={<Cpu className="w-5 h-5 text-amber-400" />} />
            <ArrowDivider />
            <PipelineStep title="NETWORK" sub="Internal Subnet" icon={<Radio className="w-5 h-5 text-blue-400" />} />
            <ArrowDivider />
            <PipelineStep title="ML BEHAVIOR" sub="Random Forest" icon={<Activity className="w-5 h-5 text-purple-400" />} />
          </div>

          <div className="mt-6 inline-flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold font-mono text-cyan-400 uppercase">RESULTING POLICY DECISION:</span>
            <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">ALLOW (SCADA Mutates)</span>
            <span className="text-slate-500">OR</span>
            <span className="px-3 py-1 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40">BLOCK (State Preserved)</span>
          </div>
        </div>
      </section>

      {/* Core Security Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">
            Comprehensive Industrial Cybersecurity
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-mono">
            Built to defend water treatment & critical physical infrastructure from cyber threats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Sliders className="w-6 h-6 text-cyan-400" />}
            title="Real-Time SCADA Simulator"
            description="Live physical telemetry for water levels, main line pressure, temperature, flow rates, and chemical dosing valves."
          />
          <FeatureCard
            icon={<Cpu className="w-6 h-6 text-purple-400" />}
            title="AI ML Anomaly Classifier"
            description="Scikit-Learn Random Forest & XGBoost models continuously analyzing command frequency and behavioral telemetry."
          />
          <FeatureCard
            icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
            title="Attack Simulation Lab"
            description="Safely trigger simulated unknown devices, external IPs, brute force, abnormal traffic spikes, and ransomware containment."
          />
        </div>
      </section>

      {/* Footer (Section 65) */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
        <div>TRUST-GRID — AI-Powered Zero Trust Security</div>
        <div className="mt-1 text-slate-600">Built for secure critical infrastructure simulation.</div>
      </footer>

    </div>
  );
};

const PipelineStep: React.FC<{ title: string; sub: string; icon: React.ReactNode }> = ({ title, sub, icon }) => (
  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
    <div className="mb-1.5">{icon}</div>
    <div className="font-bold text-white text-[11px]">{title}</div>
    <div className="text-[9px] text-slate-400">{sub}</div>
  </div>
);

const ArrowDivider = () => (
  <div className="hidden md:flex justify-center text-slate-600 font-bold">→</div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition text-left space-y-3">
    <div className="p-3 rounded-xl bg-slate-950 w-fit border border-slate-800">{icon}</div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);
