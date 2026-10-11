import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToSignup }) => {
  const { login, quickLogin, isLoading } = useAuth();

  const [email, setEmail] = useState('operator@trustgrid.local');
  const [password, setPassword] = useState('operator123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        setErrorMsg(detail[0].msg);
      } else {
        setErrorMsg('Authentication failed. Invalid credentials.');
      }
    }
  };

  const handleQuickPill = async (role: UserRole) => {
    try {
      await quickLogin(role);
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        setErrorMsg(detail[0].msg);
      } else {
        setErrorMsg('Quick login failed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Subtitle (Section 6) */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white uppercase">TRUST-GRID</h2>
          <p className="text-xs text-slate-400 font-mono">
            AI-Powered Zero Trust Security for Critical Infrastructure
          </p>
        </div>

        {/* Demo Credentials Section (Section 6) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
            DEMO PRESET CREDENTIALS (CLICK TO AUTO-LOGIN):
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickPill('ADMIN')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition text-center"
            >
              <div className="font-bold text-cyan-400 text-[11px]">ADMIN</div>
              <div className="text-[9px] text-slate-400">Officer</div>
            </button>

            <button
              onClick={() => handleQuickPill('OPERATOR')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition text-center"
            >
              <div className="font-bold text-emerald-400 text-[11px]">OPERATOR</div>
              <div className="text-[9px] text-slate-400 font-normal">Operator01</div>
            </button>

            <button
              onClick={() => handleQuickPill('ENGINEER')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition text-center"
            >
              <div className="font-bold text-amber-400 text-[11px]">ENGINEER</div>
              <div className="text-[9px] text-slate-400 font-normal">Engineer01</div>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-mono">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@trustgrid.local"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-mono">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? 'AUTHENTICATING...' : 'LOGIN TO CONSOLE'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Need an operator account?{' '}
          <button onClick={onGoToSignup} className="text-cyan-400 font-bold hover:underline">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
