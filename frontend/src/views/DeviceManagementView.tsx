import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { devicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Laptop, ShieldCheck, ShieldAlert, AlertOctagon, Plus, RefreshCw, Lock } from 'lucide-react';

export const DeviceManagementView: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New device form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('172.16.1.10');
  const [deviceType, setDeviceType] = useState('HMI Workstation');
  const [assignedUser, setAssignedUser] = useState('Operator One');

  const isAdmin = user?.role === 'ADMIN';

  const fetchDevices = async () => {
    try {
      const data = await devicesAPI.list();
      setDevices(data);
    } catch (err) {
      console.error("Failed to load devices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleIsolateDevice = async (id: number) => {
    if (!isAdmin) return;
    try {
      await devicesAPI.isolate(id);
      fetchDevices();
    } catch (err) {
      console.error("Failed to isolate device:", err);
    }
  };

  const handleToggleTrust = async (id: number, currentStatus: string) => {
    if (!isAdmin) return;
    try {
      const newStatus = currentStatus === 'TRUSTED' ? 'UNTRUSTED' : 'TRUSTED';
      await devicesAPI.update(id, { trust_status: newStatus as any });
      fetchDevices();
    } catch (err) {
      console.error("Failed to update trust:", err);
    }
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await devicesAPI.create({
        name,
        ip_address: ipAddress,
        device_type: deviceType,
        assigned_user: assignedUser,
        network_subnet: ipAddress.startsWith('172.16.') ? 'Internal SCADA (172.16.1.x)' : 'External Public',
        trust_status: 'TRUSTED'
      });
      setShowAddModal(false);
      setName('');
      fetchDevices();
    } catch (err) {
      console.error("Failed to create device:", err);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Laptop className="w-7 h-7 text-cyan-400" /> DEVICE IDENTITY & TRUST MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Registered HMI, PLC, and Workstation Asset Directory
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> REGISTER DEVICE
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" /> READ-ONLY DIRECTORY (ADMIN REQUIRED)
          </div>
        )}
      </div>

      {/* Devices Table (Section 36) */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <th className="p-3">DEVICE ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">IP ADDRESS</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">ASSIGNED USER</th>
                <th className="p-3">TRUST STATUS</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {devices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-cyan-400">{dev.device_code}</td>
                  <td className="p-3 font-semibold text-white">{dev.name}</td>
                  <td className="p-3 text-slate-400">{dev.ip_address}</td>
                  <td className="p-3">{dev.device_type}</td>
                  <td className="p-3 text-slate-300">{dev.assigned_user || 'Unassigned'}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      dev.trust_status === 'TRUSTED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : dev.trust_status === 'ISOLATED'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {dev.trust_status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleToggleTrust(dev.id, dev.trust_status)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                        >
                          {dev.trust_status === 'TRUSTED' ? 'Revoke Trust' : 'Trust'}
                        </button>
                        {dev.trust_status !== 'ISOLATED' && (
                          <button
                            onClick={() => handleIsolateDevice(dev.id)}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] font-bold"
                          >
                            Isolate Host
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Device Modal (Section 37) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white uppercase font-mono">REGISTER NEW SCADA DEVICE</h3>
            <form onSubmit={handleCreateDevice} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase mb-1">DEVICE NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ENGINEERING-PC-02"
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">IP ADDRESS</label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="172.16.1.15"
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">DEVICE TYPE</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="HMI Workstation">HMI Workstation</option>
                  <option value="PLC Controller">PLC Controller</option>
                  <option value="Engineering Console">Engineering Console</option>
                  <option value="Gateway Node">Gateway Node</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-500 text-slate-950 font-bold"
                >
                  REGISTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
