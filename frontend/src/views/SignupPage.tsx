import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { ShieldCheck, UserCheck, Mail, Lock, Building, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface SignupPageProps {
  onGoToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('Water Treatment Operations');
  const [role, setRole] = useState<'OPERATOR' | 'ENGINEER'>('OPERATOR');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authAPI.signup({
        full_name: fullName,
        email,
        password,
        organization,
        role
      });
      setSuccessMsg(res.message || 'Registration submitted successfully. Your account is pending administrator approval. You will be able to log in after an administrator approves your request.');
      setIsSubmitted(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        setErrorMsg(detail[0].msg);
      } else {
        setErrorMsg('Signup failed. Check details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100 relative overflow-hidden">

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white uppercase">REGISTER OPERATOR</h2>
          <p className="text-xs text-slate-400 font-mono">
            Create Authorized TRUST-GRID Credentials
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 font-mono text-center">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">REGISTRATION SUBMITTED</h3>
            <p className="text-xs text-amber-300 leading-relaxed">
              Your account registration is pending administrator approval. You will be able to log in after an administrator approves your request.
            </p>
            <div className="pt-2">
              <button
                onClick={onGoToLogin}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                RETURN TO LOGIN <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">FULL NAME</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Operator Jane Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@trustgrid.local"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">CONFIRM PASS</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ORGANIZATION</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Role selection (Section 7) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">REQUESTED SCADA ROLE</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('OPERATOR')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${role === 'OPERATOR' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  OPERATOR
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ENGINEER')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${role === 'ENGINEER' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  ENGINEER
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Self-registration requires Administrator approval before activation.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider transition mt-2 shadow-lg shadow-cyan-500/20"
            >
              SUBMIT REGISTRATION
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{' '}
          <button onClick={onGoToLogin} className="text-cyan-400 font-bold hover:underline">
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};
