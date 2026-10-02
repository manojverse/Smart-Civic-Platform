import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, LogIn, UserPlus, ShieldCheck, ArrowRight, Sparkles, Chrome } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const LoginPage: React.FC = () => {
  const {
    signInWithEmail,
    signInWithGoogle,
    openAuthModal,
    isAuthLoading,
    authError,
  } = useCivic();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!identifier.trim()) {
      setLocalError('Please enter your username or email.');
      return;
    }

    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await signInWithEmail(identifier, password);
    } catch (error: any) {
      setLocalError(error?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const googleConfigured = Boolean((import.meta as any).env?.VITE_FIREBASE_GOOGLE_CLIENT_ID);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setLocalError(error?.message || 'Google sign-in is unavailable right now.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-200 overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-slate-950 text-white p-8 sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Civic Platform
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-white">
              SMART CIVIC
            </h1>
            <p className="mt-3 max-w-md text-sm text-slate-300 leading-6">
              A unified civic operations platform for resident reporting, infrastructure monitoring, field response, and municipal decision support.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Live complaint tracking and SLA monitoring',
                'GIS-based infrastructure and service visibility',
                'Role-aware municipal dashboards and workflows',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="mt-0.5 rounded-lg bg-emerald-500/15 p-1.5 text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 bg-white">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Welcome back</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Sign in to your account</h2>
            </div>

            {(localError || authError) && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {localError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter username or email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAuthLoading ? 'Signing in...' : 'Sign In'}
                {!isAuthLoading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-500 opacity-70"
                  title="Password reset requires external auth provider configuration"
                  disabled
                >
                  Forgot Password
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Secure access</div>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {googleConfigured ? 'Google ready' : 'Provider required'}
                </span>
              </div>

              <button
                type="button"
                disabled={!googleConfigured || isAuthLoading}
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Chrome className="h-4 w-4" />
                {googleConfigured ? (isAuthLoading ? 'Connecting to Google...' : 'Continue with Google') : 'Google Sign-In (configure provider)'}
              </button>

              {!googleConfigured && (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Google OAuth requires Firebase Authentication and environment configuration such as VITE_FIREBASE_GOOGLE_CLIENT_ID.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
