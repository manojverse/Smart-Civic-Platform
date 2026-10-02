import React from 'react';
import {
  User,
  ShieldAlert,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { getRoleDisplayName } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, complaints } = useCivic();

  if (!isOpen) return null;

  const userComplaints = complaints.filter((c) => c.reportedBy.id === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              {getRoleDisplayName(currentUser.role)}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{getRoleDisplayName(currentUser.role)}</h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email:</span>
            </span>
            <span className="font-semibold text-slate-900">{currentUser.email}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone:</span>
            </span>
            <span className="font-semibold text-slate-900">{currentUser.phone || '+91 98800 00000'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Jurisdiction / Ward:</span>
            </span>
            <span className="font-semibold text-slate-900">Ward 112 - Domlur</span>
          </div>

          {currentUser.department && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-blue-700">{currentUser.department}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500">Civic Activity:</span>
            <span className="font-bold text-emerald-700">{userComplaints.length} Logged Issues</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};
