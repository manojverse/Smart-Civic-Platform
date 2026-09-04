import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ThumbsUp,
  MapPin,
  ExternalLink,
  Award,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { Complaint } from '../types';

interface MyComplaintsProps {
  onTrackComplaint: (complaint: Complaint) => void;
  onNavigateToReport: () => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  onTrackComplaint,
  onNavigateToReport,
}) => {
  const { complaints, currentUser } = useCivic();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');

  // Filter complaints reported by current user or show relevant user complaints
  const myComplaints = complaints.filter(
    (c) =>
      c.reportedBy.id === currentUser.id ||
      c.reportedBy.email === currentUser.email ||
      c.reportedBy.name === currentUser.name
  );

  // If none match exactly (e.g. user switched role), show active citizen list
  const displayComplaints = myComplaints.length > 0 ? myComplaints : complaints.slice(0, 3);

  const filtered = displayComplaints.filter((c) => {
    if (statusFilter === 'active') {
      return c.status !== 'Resolved' && c.status !== 'Closed';
    }
    if (statusFilter === 'resolved') {
      return c.status === 'Resolved' || c.status === 'Closed';
    }
    return true;
  });

  const totalReported = displayComplaints.length;
  const totalResolved = displayComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const totalActive = totalReported - totalResolved;
  const civicImpactPoints = totalReported * 25 + totalResolved * 50;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Citizen Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified Citizen
            </span>
            <span className="text-xs text-slate-400">Ward 112 - Domlur Corridor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentUser.name}
          </h1>

          <p className="text-xs text-slate-300 max-w-lg">
            Track real-time progress, municipal repair crew updates, and photographic resolution evidence for all your reported civic issues.
          </p>
        </div>

        {/* Civic Karma & Metric Chips */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Civic Karma Score
            </div>
            <div className="text-xl font-extrabold text-white">{civicImpactPoints} pts</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Active Neighborhood Guardian</div>
          </div>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">Total Grievances Filed</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalReported}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-600 font-semibold">Active & In Progress</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{totalActive}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-600 font-semibold">Successfully Resolved</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{totalResolved}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and New Report Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Reports ({displayComplaints.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            In Progress ({totalActive})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Resolved ({totalResolved})
          </button>
        </div>

        <button
          onClick={onNavigateToReport}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-800 text-sm">No complaints found in this view.</div>
            <p className="text-xs text-slate-400">
              You have not registered any complaints under this filter status.
            </p>
            <button
              onClick={onNavigateToReport}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              File a new complaint now →
            </button>
          </div>
        ) : (
          filtered.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {comp.photos && comp.photos[0] && (
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={comp.photos[0]} alt={comp.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {comp.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        comp.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : comp.status === 'Escalated'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {comp.status}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      {comp.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{comp.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{comp.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {comp.location.ward}
                    </span>
                    <span>• Department: <strong>{comp.department || 'Under Review'}</strong></span>
                    <span>• Reported: {new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => onTrackComplaint(comp)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Track Status</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
