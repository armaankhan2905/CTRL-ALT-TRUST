import React, { useState, useEffect } from 'react';
import { SCADAAsset, ZeroTrustDecision } from '../types';
import { scadaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlantVisualization } from '../components/PlantVisualization';
import { ZeroTrustModal } from '../components/ZeroTrustModal';
import { Play, Square, Unlock, Lock, AlertOctagon, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

export const ScadaControlView: React.FC = () => {
  const { user, simulatedDevice, simulatedIp, simulatedTime } = useAuth();
  const [assets, setAssets] = useState<SCADAAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDecision, setActiveDecision] = useState<ZeroTrustDecision | null>(null);
  const [modalCmdName, setModalCmdName] = useState('');
  const [modalTargetAsset, setModalTargetAsset] = useState('');

  // Load live SCADA state
  const fetchScadaState = async () => {
    try {
      const data = await scadaAPI.getState();
      setAssets(data);
    } catch (err) {
      console.error("Failed to load SCADA assets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const data = await scadaAPI.refreshTelemetry();
      setAssets(data);
    } catch (err) {
      console.error("Failed to refresh SCADA telemetry:", err);
      // Fallback to standard fetch
      fetchScadaState();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  useEffect(() => {
    fetchScadaState();
    const interval = setInterval(fetchScadaState, 3000); // Live polling every 3s
    return () => clearInterval(interval);
  }, []);

  const handleExecuteCommand = async (
    targetAsset: string,
    commandType: string,
    forceUnknownDevice = false,
    forceExternalIp = false
  ) => {
    try {
      setModalCmdName(commandType);
      setModalTargetAsset(targetAsset);

      const res = await scadaAPI.sendCommand({
        target_asset: targetAsset,
        command_type: commandType,
        device_name: forceUnknownDevice ? 'UNKNOWN-PC-89' : simulatedDevice,
        ip_address: forceExternalIp ? '203.0.113.45' : simulatedIp,
        override_time: simulatedTime || undefined,
        force_unknown_device: forceUnknownDevice,
        force_external_ip: forceExternalIp
      });

      setActiveDecision(res.decision);
      setModalOpen(true);
      fetchScadaState(); // Refresh plant state
    } catch (err) {
      console.error("SCADA command failed:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400 animate-pulse" /> SCADA CONTROL CENTER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Water Supply & Treatment Plant Simulation // Zero Trust Protected Gateway
          </p>
        </div>

        <button
          onClick={handleRefreshTelemetry}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-500/20 text-xs font-mono font-bold text-slate-200 flex items-center gap-2 transition disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'REFRESHING...' : 'REFRESH TELEMETRY'}
        </button>
      </div>

      {/* Interactive SCADA Plant Visualization (Section 10) */}
      <PlantVisualization assets={assets} />

      {/* SCADA Equipment Controls Grid (Section 11) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> ZERO TRUST AUTHENTICATED EQUIPMENT CONTROLS
          </h3>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            GATEWAY VERIFICATION: ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Pump 1 Control */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">INTAKE PUMP 1</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400">PUMP-01</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => handleExecuteCommand('PUMP-01', 'START')}
                className="py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5" /> START
              </button>
              <button
                onClick={() => handleExecuteCommand('PUMP-01', 'STOP')}
                className="py-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Square className="w-3.5 h-3.5" /> STOP
              </button>
            </div>
          </div>

          {/* Pump 2 Control */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">DISTRIB PUMP 2</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400">PUMP-02</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => handleExecuteCommand('PUMP-02', 'START')}
                className="py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5" /> START
              </button>
              <button
                onClick={() => handleExecuteCommand('PUMP-02', 'STOP')}
                className="py-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Square className="w-3.5 h-3.5" /> STOP
              </button>
            </div>
          </div>

          {/* Valve 1 Control */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">INTAKE VALVE 1</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400">VALVE-01</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => handleExecuteCommand('VALVE-01', 'OPEN')}
                className="py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Unlock className="w-3.5 h-3.5" /> OPEN
              </button>
              <button
                onClick={() => handleExecuteCommand('VALVE-01', 'CLOSE')}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5" /> CLOSE
              </button>
            </div>
          </div>

          {/* Valve 2 Control */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">CHLORINE VALVE 2</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400">VALVE-02</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => handleExecuteCommand('VALVE-02', 'OPEN')}
                className="py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Unlock className="w-3.5 h-3.5" /> OPEN
              </button>
              <button
                onClick={() => handleExecuteCommand('VALVE-02', 'CLOSE')}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5" /> CLOSE
              </button>
            </div>
          </div>

        </div>

        {/* Emergency Shutdown Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => handleExecuteCommand('PLANT_EMERGENCY', 'EMERGENCY_SHUTDOWN')}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/30 transition hover:scale-105"
          >
            <AlertOctagon className="w-5 h-5 animate-pulse" /> EMERGENCY PLANT SHUTDOWN
          </button>
        </div>
      </div>

      {/* Decision Modal */}
      <ZeroTrustModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        decision={activeDecision}
        commandName={modalCmdName}
        targetAsset={modalTargetAsset}
        userEmail={user?.email}
        deviceName={simulatedDevice}
        ipAddress={simulatedIp}
      />

    </div>
  );
};
