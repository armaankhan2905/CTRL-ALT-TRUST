import React from 'react';
import { SCADAAsset } from '../types';
import { Activity, AlertTriangle, CheckCircle, Droplets, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface PlantVisualizationProps {
  assets: SCADAAsset[];
  onCommandTrigger?: (assetCode: string, commandType: string) => void;
}

export const PlantVisualization: React.FC<PlantVisualizationProps> = ({ assets, onCommandTrigger }) => {
  const getAsset = (code: string) => assets.find(a => a.asset_code === code);

  const pump1 = getAsset('PUMP-01');
  const pump2 = getAsset('PUMP-02');
  const valve1 = getAsset('VALVE-01');
  const valve2 = getAsset('VALVE-02');
  const tank1 = getAsset('TANK-01');
  const pressSensor = getAsset('SENSOR-PRESSURE');
  const tempSensor = getAsset('SENSOR-TEMP');
  const flowSensor = getAsset('SENSOR-FLOW');
  const chlorineSensor = getAsset('SENSOR-CHLORINE');

  const isPump1Running = pump1?.status === 'RUNNING';
  const isPump2Running = pump2?.status === 'RUNNING';
  const isValve1Open = valve1?.status === 'OPEN';
  const isValve2Open = valve2?.status === 'OPEN';

  const waterLevelPercent = tank1?.value ?? 72.4;

  return (
    <div className="relative w-full bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl overflow-hidden text-slate-100">
      {/* Decorative background grid & glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
            <h3 className="text-xl font-bold tracking-wide text-white uppercase">
              WATER TREATMENT SCADA SCHEMATIC
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            PLC System ID: PLC-WATER-PRIMARY // Real-time Sensor Telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> PLC LINK: ONLINE
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-3.5 h-3.5 animate-spin" /> LIVE SIMULATION
          </span>
        </div>
      </div>

      {/* Main SCADA Plant Diagram SVG + Cards */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">

        {/* 1. Water Source */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-cyan-950/80 border-2 border-cyan-500/40 flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/10">
            <Droplets className="w-8 h-8 text-cyan-400 animate-bounce" />
          </div>
          <span className="text-xs font-bold text-slate-300">WATER SOURCE</span>
          <span className="text-[10px] text-slate-500 font-mono">Raw Reservoir</span>
        </div>

        {/* Flow Pipe 1 */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className={`h-2.5 w-full rounded-full transition-all duration-500 ${isPump1Running ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]' : 'bg-slate-800'}`}>
            {isPump1Running && (
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
            )}
          </div>
        </div>

        {/* 2. Intake Pump 1 & Intake Valve 1 */}
        <div className="flex flex-col gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl relative">
          {/* Pump 1 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">INTAKE PUMP 1</div>
              <div className="text-[10px] font-mono text-slate-400">PUMP-01</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isPump1Running ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-ping' : 'bg-slate-600'}`} />
              <span className={`text-xs font-mono font-bold ${isPump1Running ? 'text-emerald-400' : 'text-slate-500'}`}>
                {pump1?.status || 'STOPPED'}
              </span>
            </div>
          </div>

          {/* Valve 1 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">INTAKE VALVE 1</div>
              <div className="text-[10px] font-mono text-slate-400">VALVE-01</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isValve1Open ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`} />
              <span className={`text-xs font-mono font-bold ${isValve1Open ? 'text-emerald-400' : 'text-slate-500'}`}>
                {valve1?.status || 'CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Flow Pipe 2 */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className={`h-2.5 w-full rounded-full transition-all duration-500 ${isPump1Running && isValve1Open ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]' : 'bg-slate-800'}`} />
        </div>

        {/* 3. Treatment Storage Tank */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl relative">
          <span className="text-xs font-bold text-cyan-300 mb-2">TREATMENT TANK 1</span>

          {/* Tank Fill Graphic */}
          <div className="w-24 h-32 bg-slate-950 border-2 border-cyan-500/40 rounded-xl relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
            <div
              className="w-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-400 rounded-b-lg transition-all duration-700 relative overflow-hidden"
              style={{ height: `${waterLevelPercent}%` }}
            >
              {/* Animated wave sheen */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black font-mono text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {waterLevelPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-2">Cap: 500,000 L</span>
        </div>

        {/* Flow Pipe 3 */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className={`h-2.5 w-full rounded-full transition-all duration-500 ${isPump2Running ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-800'}`} />
        </div>

        {/* 4. Chemical Dosing & Distribution Pump 2 */}
        <div className="flex flex-col gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          {/* Chlorine Valve */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">CHLORINE VALVE 2</div>
              <div className="text-[10px] font-mono text-slate-400">VALVE-02</div>
            </div>
            <span className={`text-xs font-mono font-bold ${isValve2Open ? 'text-amber-400' : 'text-slate-500'}`}>
              {valve2?.status || 'CLOSED'}
            </span>
          </div>

          {/* Distribution Pump 2 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">DISTRIB PUMP 2</div>
              <div className="text-[10px] font-mono text-slate-400">PUMP-02</div>
            </div>
            <span className={`text-xs font-mono font-bold ${isPump2Running ? 'text-emerald-400' : 'text-slate-500'}`}>
              {pump2?.status || 'STANDBY'}
            </span>
          </div>
        </div>

      </div>

      {/* Live Sensors Strip */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">PRESSURE SENSOR</div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
            {pressSensor?.value ?? 4.3} <span className="text-xs font-normal text-slate-400">bar</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">WATER TEMP</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
            {tempSensor?.value ?? 27.1} <span className="text-xs font-normal text-slate-400">°C</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">MAIN FLOW RATE</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {flowSensor?.value ?? 82.0} <span className="text-xs font-normal text-slate-400">L/min</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">CHLORINE LEVEL</div>
          <div className="text-lg font-bold font-mono text-purple-400 mt-0.5">
            {chlorineSensor?.value ?? 1.8} <span className="text-xs font-normal text-slate-400">mg/L</span>
          </div>
        </div>
      </div>
    </div>
  );
};
