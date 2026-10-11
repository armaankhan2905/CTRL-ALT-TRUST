import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Lock, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Trash2, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Action Modals State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | 'DELETE' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    if (user?.role !== 'ADMIN') {
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }
    try {
      const data = await usersAPI.list();
      setUsers(data);
      setAccessDenied(false);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setAccessDenied(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';

  const pendingUsers = users.filter((u) => u.status === 'PENDING');
  const allUsers = users;

  const handleOpenModal = (targetUser: User, action: 'APPROVE' | 'REJECT' | 'DELETE') => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedUser(targetUser);
    setModalAction(action);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalAction(null);
    setIsProcessing(false);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !modalAction) return;

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (modalAction === 'APPROVE') {
        await usersAPI.approve(selectedUser.id);
        setSuccessMsg(`User registration for '${selectedUser.email}' approved successfully.`);
      } else if (modalAction === 'REJECT') {
        await usersAPI.reject(selectedUser.id);
        setSuccessMsg(`User registration for '${selectedUser.email}' rejected.`);
      } else if (modalAction === 'DELETE') {
        await usersAPI.deleteUser(selectedUser.id);
        setSuccessMsg(`User account '${selectedUser.email}' deleted.`);
      }
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else {
        setErrorMsg(`Failed to ${modalAction.toLowerCase()} user.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async (targetUser: User) => {
    try {
      await usersAPI.reactivate(targetUser.id);
      setSuccessMsg(`User '${targetUser.email}' reactivated.`);
      fetchUsers();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Reactivation failed.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide flex items-center gap-3">
            <Users className="w-7 h-7 text-cyan-400" /> USER IDENTITY & ROLE MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Admin Registration Approval & RBAC Privileges
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className={`px-3 py-1 rounded text-xs font-mono font-bold border ${pendingUsers.length > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              PENDING REQUESTS: {pendingUsers.length}
            </div>
          )}
          <div className={`px-3 py-1 rounded text-xs font-mono font-bold ${isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
            ROLE: {user?.role || 'GUEST'}
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2 font-bold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {!isAdmin ? (
        <div className="bg-slate-950/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 text-center space-y-3 font-mono">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">ADMIN PRIVILEGES REQUIRED</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            User Directory and RBAC Role Administration is restricted to Admin Security Officers (`admin@trustgrid.local`).
          </p>
          <div className="text-[11px] text-cyan-400 pt-2 font-bold">
            AUTHENTICATED AS: {user?.full_name} ({user?.role})
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Section A: PENDING SIGNUP REQUESTS */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <UserCheck className="w-4 h-4 text-amber-400" /> PENDING SIGNUP REQUESTS ({pendingUsers.length})
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                REQUIRES ADMIN APPROVAL
              </span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
                ✓ No pending registration requests at this time. All users are reviewed.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingUsers.map((pending) => (
                  <div key={pending.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{pending.full_name}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 animate-pulse">
                        PENDING
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div><span className="text-slate-500">EMAIL:</span> {pending.email}</div>
                      <div><span className="text-slate-500">ORG:</span> {pending.organization}</div>
                      <div><span className="text-slate-500">ROLE:</span> <span className="font-bold text-cyan-400">{pending.role}</span></div>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenModal(pending, 'APPROVE')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> APPROVE
                      </button>
                      <button
                        onClick={() => handleOpenModal(pending, 'REJECT')}
                        className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: ALL USERS DIRECTORY */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Users className="w-4 h-4 text-cyan-400" /> ALL SYSTEM USERS DIRECTORY
              </h3>
              <span className="text-[10px] font-mono text-slate-400">TOTAL: {allUsers.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-3">USER CODE</th>
                    <th className="p-3">FULL NAME</th>
                    <th className="p-3">EMAIL</th>
                    <th className="p-3">ORGANIZATION</th>
                    <th className="p-3">ROLE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">RISK SCORE</th>
                    <th className="p-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {allUsers.map((usr) => {
                    const statusStr = usr.status || (usr.is_active ? 'ACTIVE' : 'INACTIVE');
                    return (
                      <tr key={usr.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-cyan-400">{usr.user_code}</td>
                        <td className="p-3 font-semibold text-white">{usr.full_name}</td>
                        <td className="p-3 text-slate-400">{usr.email}</td>
                        <td className="p-3 text-slate-400">{usr.organization}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                            usr.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : usr.role === 'ENGINEER'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusStr === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : statusStr === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                              : statusStr === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {statusStr}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-400">{usr.risk_score} / 100</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {statusStr === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleOpenModal(usr, 'APPROVE')}
                                  className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold"
                                >
                                  APPROVE
                                </button>
                                <button
                                  onClick={() => handleOpenModal(usr, 'REJECT')}
                                  className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[10px] font-bold"
                                >
                                  REJECT
                                </button>
                              </>
                            )}

                            {statusStr === 'ACTIVE' && (
                              <button
                                onClick={() => handleOpenModal(usr, 'DELETE')}
                                className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 text-[10px] font-bold flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3 h-3" /> DELETE
                              </button>
                            )}

                            {(statusStr === 'DELETED' || statusStr === 'REJECTED' || statusStr === 'INACTIVE') && (
                              <button
                                onClick={() => handleReactivate(usr)}
                                className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1 transition"
                              >
                                <RefreshCw className="w-3 h-3" /> ACTIVATE
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal */}
      {modalAction && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              {modalAction === 'APPROVE' ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : modalAction === 'REJECT' ? (
                <XCircle className="w-6 h-6 text-rose-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              )}
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {modalAction === 'APPROVE' && 'Approve Registration Request?'}
                {modalAction === 'REJECT' && 'Reject Registration Request?'}
                {modalAction === 'DELETE' && 'Delete User Account?'}
              </h3>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div><span className="text-slate-500">NAME:</span> <span className="font-bold text-white">{selectedUser.full_name}</span></div>
              <div><span className="text-slate-500">EMAIL:</span> {selectedUser.email}</div>
              <div><span className="text-slate-500">ROLE:</span> <span className="font-bold text-cyan-400">{selectedUser.role}</span></div>
              <div><span className="text-slate-500">ORG:</span> {selectedUser.organization}</div>
            </div>

            {modalAction === 'DELETE' && (
              <p className="text-[11px] text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                Deleting this account will prevent the user from accessing the system. Security and audit history will be preserved.
              </p>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition ${
                  modalAction === 'APPROVE'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                    : 'bg-rose-600 hover:bg-rose-500 text-white font-black'
                }`}
              >
                {isProcessing ? 'PROCESSING...' : modalAction === 'DELETE' ? 'DELETE USER' : modalAction}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
