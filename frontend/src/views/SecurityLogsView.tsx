import React, { useState, useEffect } from 'react';
import { SecurityEvent } from '../types';
import { logsAPI } from '../services/api';
import { FileText, Download, Search, Filter, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

export const SecurityLogsView: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await logsAPI.getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch security events:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (filterSeverity !== 'ALL' && evt.severity !== filterSeverity) return false;
    if (filterDecision !== 'ALL' && evt.zta_decision !== filterDecision) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        evt.event_code.toLowerCase().includes(q) ||
        evt.user_name.toLowerCase().includes(q) ||
        evt.command.toLowerCase().includes(q) ||
        evt.device_name.toLowerCase().includes(q) ||
        evt.ip_address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['EventID', 'Timestamp', 'User', 'Role', 'Device', 'IP', 'Command', 'RiskScore', 'MLResult', 'ZTA_Decision', 'Status'];
    const rows = filteredEvents.map(e => [
      e.event_code, e.timestamp, e.user_name, e.role, e.device_name, e.ip_address, `"${e.command}"`, e.risk_score, e.ml_result, e.zta_decision, e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trust_grid_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <FileText className="w-7 h-7 text-cyan-400" /> SECURITY AUDIT TRAIL & LOGS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Immutable Audit Log for SCADA Commands & Zero Trust Policy Decisions
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" /> EXPORT LOGS CSV
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by user, command, IP..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
        >
          <option value="ALL">Severity: ALL</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <select
          value={filterDecision}
          onChange={(e) => setFilterDecision(e.target.value)}
          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
        >
          <option value="ALL">Decision: ALL</option>
          <option value="ALLOW">ALLOW</option>
          <option value="BLOCK">BLOCK</option>
          <option value="REQUIRE_VERIFICATION">VERIFY</option>
        </select>
      </div>

      {/* Security Event Timeline Visual (Section 35) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> REAL-TIME SECURITY EVENT TIMELINE
        </h3>

        <div className="space-y-3 font-mono text-xs max-h-48 overflow-y-auto pr-2">
          {filteredEvents.slice(0, 5).map((evt) => (
            <div key={evt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className={`w-3 h-3 rounded-full ${evt.zta_decision === 'ALLOW' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'}`} />
              <div className="text-slate-400 text-[11px] w-24 shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</div>
              <div className="font-bold text-white w-20 shrink-0">{evt.event_code}</div>
              <div className="flex-1 truncate text-slate-300">{evt.user_name} ({evt.role}) executed <span className="text-cyan-400 font-bold">{evt.command}</span></div>
              <div className={`font-bold ${evt.zta_decision === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}`}>{evt.zta_decision} (Risk: {evt.risk_score})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Audit Log Table (Section 34) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <th className="p-3">EVENT ID</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">USER (ROLE)</th>
                <th className="p-3">DEVICE (IP)</th>
                <th className="p-3">COMMAND</th>
                <th className="p-3">RISK SCORE</th>
                <th className="p-3">ML RESULT</th>
                <th className="p-3">ZTA DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-cyan-400">{evt.event_code}</td>
                  <td className="p-3 text-slate-400 text-[11px]">{new Date(evt.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-white">{evt.user_name} <span className="text-[10px] text-slate-500 font-normal">({evt.role})</span></td>
                  <td className="p-3 text-slate-400">{evt.device_name} <span className="text-[10px] text-slate-500 font-normal">({evt.ip_address})</span></td>
                  <td className="p-3 font-bold text-slate-200">{evt.command}</td>
                  <td className="p-3 font-bold text-cyan-400">{evt.risk_score} / 100</td>
                  <td className="p-3 text-slate-400">{evt.ml_result}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      evt.zta_decision === 'ALLOW'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}>
                      {evt.zta_decision}
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
