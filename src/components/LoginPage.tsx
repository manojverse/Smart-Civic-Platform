import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Chrome,
  Phone,
  User as UserIcon,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { validatePassword } from '../services/firebase';
import { ThemeToggle } from './ThemeToggle';

export const LoginPage: React.FC = () => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
    isAuthLoading,
    authError,
  } = useCivic();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up fields (Strictly Citizen Account — No role selector)
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleForgotPassword = async () => {
    setLocalError(null);
    setResetSuccessMessage(null);

    const emailToReset = identifier.trim();
    if (!emailToReset) {
      setLocalError('Please enter your email address first.');
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword(emailToReset);
      setResetSuccessMessage('Password reset email sent. Please check your inbox and follow the instructions.');
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!identifier.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await signInWithEmail(identifier.trim(), password);
    } catch (error: any) {
      setLocalError(error?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSignUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!fullName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      setLocalError('Please provide a valid email address.');
      return;
    }

    if (!mobileNumber.trim()) {
      setLocalError('Please enter your mobile phone number.');
      return;
    }

    const passValidation = validatePassword(signupPassword);
    if (!passValidation.valid) {
      setLocalError(passValidation.error || 'Password does not meet requirements.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter your password.');
      return;
    }

    try {
      // Public registration creates ONLY citizen account
      await signUpWithEmail(signupEmail.trim(), signupPassword, {
        name: fullName.trim(),
        phone: mobileNumber.trim(),
        role: 'citizen',
        ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
      });
    } catch (error: any) {
      setLocalError(error?.message || 'Failed to create your account.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setLocalError(error?.message || 'Google sign-in could not be completed.');
    }
  };

  // Demo sign-in helpers for easy testing with real Firebase Authentication
  const handleQuickDemo = async (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setLocalError(null);
    try {
      await signInWithEmail(email, pass);
    } catch (err: any) {
      setLocalError(err?.message || `Could not sign in with test credentials for ${email}.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {/* Quick Theme Switcher in Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle variant="button" />
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Hero Panel */}
          <div className="bg-slate-950 text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                SMART CIVIC PLATFORM
              </div>

              <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                SMART CIVIC
              </h1>
              <p className="text-emerald-400 font-bold text-sm tracking-wide mt-1">
                Development &amp; Complaint Resolution Platform
              </p>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-md">
                A unified digital civic operations platform for Tamil Nadu municipal infrastructure monitoring, citizen complaint lifecycle resolution, GIS mapping, and SLA governance.
              </p>

              <div className="mt-8 space-y-3.5">
                {[
                  'Multi-stage citizen complaint registration & live tracking',
                  'Public infrastructure project monitoring with milestone & budget tracking',
                  'Dedicated role-based portals for Citizens, Department Officers, and Administrators',
                  'GIS interactive map with geospatial complaint & project clustering',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="mt-0.5 rounded-lg bg-emerald-500/15 p-1.5 text-emerald-300 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-200 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-slate-800/80 mt-8 flex items-center justify-between text-xs text-slate-400">
              <span>Primary Context: Chennai, Tamil Nadu</span>
              <span className="font-mono text-emerald-400">v2.0 • 2026</span>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-6 sm:p-8 lg:p-10 bg-white dark:bg-slate-900 flex flex-col justify-center">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setLocalError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setLocalError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {authMode === 'signin' ? 'Sign in to your portal' : 'Create Resident Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {authMode === 'signin'
                  ? 'Access your Citizen, Department Officer, or Administrator workspace.'
                  : 'Public registration grants immediate access to the Citizen Portal.'}
              </p>
            </div>

            {resetSuccessMessage && (
              <div className="mb-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            {(localError || authError) && (
              <div className="mb-5 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300 leading-relaxed flex items-start gap-2">
                <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">✕</span>
                <span>{localError || authError}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {authMode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="identifier"
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="citizen@smartcivic.local"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isResettingPassword || isAuthLoading}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline disabled:opacity-50"
                    >
                      {isResettingPassword ? 'Sending...' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                  {isAuthLoading ? 'Authenticating...' : 'Sign In to Portal'}
                  {!isAuthLoading && <ArrowRight className="h-4 w-4" />}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAuthLoading}
                  onClick={handleGoogleSignIn}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50"
                >
                  <Chrome className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Google Sign-In</span>
                </button>
              </form>
            ) : (
              /* TAB 2: CREATE CITIZEN ACCOUNT (Strictly citizen, no role selector) */
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. S. Karthikeyan"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="karthik@example.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98401 22334"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-8 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-2 top-2.5 text-slate-400"
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Role disclosure notice */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold">Automatic Citizen Role Assignment</strong>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-tight">
                      All newly registered public residents receive verified <strong>Citizen</strong> role with reporting and tracking privileges.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isAuthLoading ? 'Creating Citizen Account...' : 'Complete Registration'}
                  {!isAuthLoading && <UserPlus className="h-4 w-4" />}
                </button>
              </form>
            )}

            {/* Quick Demo Credentials Panel for 3 Main Portals */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-black border border-amber-200 dark:border-amber-800">
                    DEMO CREDENTIALS
                  </span>
                  <span>3-Portal Access</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Click to auto-fill &amp; sign in</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('citizen@civic', 'city@123')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Citizen</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">PORTAL 1</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate mt-1">citizen@civic</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Pass: city@123</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('officer@civic', 'officer@123')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-blue-700 dark:group-hover:text-blue-400">Department Officer</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">PORTAL 2</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate mt-1">officer@civic</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Pass: officer@123</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@civic', 'admin@123')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-purple-50 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-purple-700 dark:group-hover:text-purple-400">Admin</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">PORTAL 3</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate mt-1">admin@civic</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Pass: admin@123</div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
