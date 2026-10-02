import React, { useEffect, useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { UserRole, MunicipalDepartment } from '../types';
import { WARDS, DEPARTMENTS } from '../data/seedData';
import { StateGovtLogo, CityCorpLogo } from './Logos';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, authError, isAuthLoading } = useCivic();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState(WARDS[0]);
  const [role, setRole] = useState<UserRole>('citizen');
  const [department, setDepartment] = useState<MunicipalDepartment>('Solid Waste Management');
  const [localError, setLocalError] = useState<string | null>(null);

  const forcedCitizenRole = 'citizen';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (mode === 'signup') {
        if (!name) {
          setLocalError('Please enter your full name.');
          return;
        }
        await signUpWithEmail(email, password, {
          name,
          phone: phone || '+91 8922 245000',
          ward,
          role: forcedCitizenRole,
          department: undefined,
        });
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth submit error:', err);
      setLocalError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 overflow-hidden relative">
        {/* Top Header Strip with Municipal Crests */}
        <div className="bg-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white/10 border border-white/20">
              <CityCorpLogo className="w-10 h-10 shrink-0" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Real-Time Citizen & Officer Auth</span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {mode === 'signin' ? 'Sign In to Smart Civic' : 'Register New Civic Account'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Smart Civic Platform • Public Grievance Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs: Sign In or Sign Up */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800/90 p-1 rounded-xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setLocalError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setLocalError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {(localError || authError) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">
                  {(localError || authError)?.includes('operation-not-allowed')
                    ? 'Firebase Authentication Provider Notice'
                    : 'Authentication Notice'}
                </div>
                <div className="text-[11px] text-amber-800 leading-relaxed">
                  {(localError || authError)?.includes('operation-not-allowed')
                    ? 'Email/Password sign-in is disabled in the Firebase Console. Enable it under Authentication > Sign-in method for project sound-quarter-q2sm5.'
                    : localError || authError}
                </div>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98480 22334"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Smart City Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role is always CITIZEN for public registration */}
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Citizen Account</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Public accounts are registered as Citizens. Staff and Admin accounts are provisioned by authorized system administrators.
                  </p>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@Smart City.gov.in"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAuthLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Complete Registration & Save Profile</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
