import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Building2,
  UserCheck,
  RotateCcw,
  Star,
  ThumbsUp,
  FileText,
  Calendar,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  FileCheck2,
  ShieldCheck,
  Image as ImageIcon,
  Download,
  Camera,
  X,
  Printer,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { Complaint, ComplaintStatus, CitizenFeedback, PhotoAuthenticityAnalysis } from '../types';
import { OfficialInspectionReportModal } from './OfficialInspectionReportModal';
import { analyzePhotoAuthenticity } from '../services/imageAuthenticityService';
import {
  downloadComplaintAcknowledgement,
  printComplaintAcknowledgement,
  downloadComplaintStatusReport,
} from '../utils/acknowledgementHelper';

const ELEVEN_STAGE_PIPELINE: { id: string; label: string; shortLabel: string }[] = [
  { id: 'Submitted', label: 'Complaint Submitted', shortLabel: '1. Submitted' },
  { id: 'Acknowledgement', label: 'Acknowledgement Generated', shortLabel: '2. Acknowledged' },
  { id: 'Under Review', label: 'Under Review', shortLabel: '3. Review' },
  { id: 'Assigned Dept', label: 'Assigned to Department', shortLabel: '4. Dept' },
  { id: 'Assigned Officer', label: 'Assigned to Officer', shortLabel: '5. Officer' },
  { id: 'Work Planned', label: 'Work Planned', shortLabel: '6. Planned' },
  { id: 'In Progress', label: 'Work In Progress', shortLabel: '7. In Progress' },
  { id: 'Work Completed', label: 'Work Completed', shortLabel: '8. Completed' },
  { id: 'Resolved', label: 'Resolved', shortLabel: '9. Resolved' },
  { id: 'Verified', label: 'Officially Verified', shortLabel: '10. Verified' },
  { id: 'Closed', label: 'Closed', shortLabel: '11. Closed' },
];

export const ComplaintTracker: React.FC = () => {
  const {
    complaints,
    myComplaints,
    canAccessComplaint,
    selectedComplaint,
    setSelectedComplaint,
    reopenComplaint,
    submitFeedback,
    upvoteComplaint,
    currentUser,
    recordComplaintVisit,
  } = useCivic();

  const { t } = useLanguage();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [localPhotoAnalysis, setLocalPhotoAnalysis] = useState<PhotoAuthenticityAnalysis | null>(null);
  const [isAuditingPhoto, setIsAuditingPhoto] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Reopen / Appeal modal state (Section 12)
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('Incomplete or temporary repair');
  const [reopenDescription, setReopenDescription] = useState('');
  const [reopenPhotoUrl, setReopenPhotoUrl] = useState<string>('');

  // Feedback modal state (Section 15)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [resolutionQuality, setResolutionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [officerExperience, setOfficerExperience] = useState<'very_helpful' | 'professional' | 'average' | 'unresponsive'>('very_helpful');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [timeliness, setTimeliness] = useState<'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied'>('very_satisfied');

  // Strict account-scoped complaint list for Citizens; full/departmental list for Officers/Admins
  const scopedComplaints = currentUser.role === 'citizen' ? myComplaints : complaints;

  // Filter complaints list
  const filteredComplaints = (scopedComplaints || []).filter((comp) => {
    if (!comp) return false;
    const q = (searchQuery || '').toLowerCase();
    const matchQuery =
      (comp.id || '').toLowerCase().includes(q) ||
      (comp.title || '').toLowerCase().includes(q) ||
      (comp.location?.ward || '').toLowerCase().includes(q) ||
      (comp.location?.address || '').toLowerCase().includes(q);

    const matchCat = filterCategory === 'All' || comp.category === filterCategory;
    const matchStatus = filterStatus === 'All' || comp.status === filterStatus;

    return matchQuery && matchCat && matchStatus;
  });

  // Check if citizen manually searched for a complaint ID belonging to another account
  const searchedGlobalComplaint = searchQuery.trim()
    ? (complaints || []).find((c) => (c?.id || '').toLowerCase() === searchQuery.trim().toLowerCase())
    : null;

  const isUnauthorizedLookup = Boolean(
    searchedGlobalComplaint &&
      currentUser.role === 'citizen' &&
      !canAccessComplaint(searchedGlobalComplaint)
  );

  const exactMatch =
    searchedGlobalComplaint && canAccessComplaint(searchedGlobalComplaint)
      ? searchedGlobalComplaint
      : null;

  const validSelectedComplaint =
    selectedComplaint && canAccessComplaint(selectedComplaint) ? selectedComplaint : null;

  const activeComplaint = isUnauthorizedLookup
    ? null
    : exactMatch || validSelectedComplaint || filteredComplaints[0] || null;

  // Record user visiting complaint in real-time Firestore database for Admin view
  useEffect(() => {
    if (activeComplaint?.id && recordComplaintVisit) {
      recordComplaintVisit(activeComplaint.id);
    }
    if (activeComplaint?.photoAnalysis) {
      setLocalPhotoAnalysis(activeComplaint.photoAnalysis);
    } else {
      setLocalPhotoAnalysis(null);
    }
  }, [activeComplaint?.id, activeComplaint?.photoAnalysis]);

  const getStepIndex = (status: ComplaintStatus, hasOfficer?: boolean) => {
    switch (status) {
      case 'Submitted':
        return 1; // Submitted + Acknowledgement Generated
      case 'Under Review':
      case 'Pending Verification':
        return 2;
      case 'Assigned':
      case 'Accepted':
        return hasOfficer ? 4 : 3;
      case 'Work Planned':
        return 5;
      case 'In Progress':
      case 'Reopened':
      case 'Escalated':
        return 6;
      case 'Work Completed':
        return 7;
      case 'Resolved':
        return 8;
      case 'Verified':
        return 9;
      case 'Closed':
        return 10;
      default:
        return 2;
    }
  };

  const handleAppealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReopenPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !reopenReason.trim()) return;
    reopenComplaint(
      activeComplaint.id,
      reopenReason,
      reopenDescription.trim() || undefined,
      reopenPhotoUrl || undefined
    );
    setReopenModalOpen(false);
    setReopenDescription('');
    setReopenPhotoUrl('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    const feedback: CitizenFeedback = {
      rating,
      resolutionQuality,
      officerResponseExperience: officerExperience,
      comment: feedbackComment || 'Resolution verified and rated by citizen.',
      submittedAt: new Date().toISOString(),
      timelinessSatisfaction: timeliness,
    };
    submitFeedback(activeComplaint.id, feedback);
    setFeedbackModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Quick Lookup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            <span>Complaint Lifecycle & SLA Tracking</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stage transparency, field officer updates, SLA timers, and verification feedback.
          </p>
        </div>

        {/* Search & Lookup Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by complaint number (e.g. SC-2026-000001) or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Main Grid: Left List (1 col) and Right Detail/Timeline (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaint Select List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Issues ({filteredComplaints.length})
              </span>
              <span className="text-[11px] text-slate-500">Live Sync</span>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
                <option value="Reopened">Reopened</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="All">All Categories</option>
                <option value="Pothole">Pothole</option>
                <option value="Garbage">Garbage</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Drainage">Drainage</option>
                <option value="Streetlight">Streetlight</option>
              </select>
            </div>

            {/* Complaint List Items */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No complaints match your search filter.
                </div>
              ) : (
                filteredComplaints.map((comp) => {
                  const isSelected = activeComplaint?.id === comp.id;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedComplaint(comp)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">{comp.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            comp.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comp.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : comp.status === 'Escalated'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </div>

                      <h3 className="font-semibold text-xs text-slate-800 line-clamp-1 mb-1">
                        {comp.title}
                      </h3>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>📍 {comp.location?.ward ? comp.location.ward.split('-')[0].trim() : 'Ward Unassigned'}</span>
                        <span className="font-semibold text-rose-600">{comp.priority || 'Normal'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Complaint Detail & Visual Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {activeComplaint ? (
            <>
              {/* Main Ticket Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                        {activeComplaint.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          activeComplaint.status === 'Resolved'
                            ? 'bg-emerald-600 text-white'
                            : activeComplaint.status === 'In Progress'
                            ? 'bg-amber-500 text-white'
                            : activeComplaint.status === 'Escalated'
                            ? 'bg-rose-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {activeComplaint.status}
                      </span>
                      {activeComplaint.isEscalated && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> SLA Escalated
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {activeComplaint.title}
                    </h2>
                  </div>

                  {/* Upvote, Acknowledgement & Official Inspection Dossier Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadComplaintAcknowledgement(activeComplaint)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all"
                      title="Download Official Grievance Acknowledgement"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledgement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => printComplaintAcknowledgement(activeComplaint)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs transition-all"
                      title="Print or Save Grievance Acknowledgement as PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadComplaintStatusReport(activeComplaint)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
                      title="Download Complaint Status Report with Full History Timeline"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-200" />
                      <span>Status Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                      title="View official municipal inspection report and audit dossier"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-200" />
                      <span>{t('viewOfficialReportBtn')}</span>
                    </button>

                    <button
                      onClick={() => upvoteComplaint(activeComplaint.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        activeComplaint.upvotedBy?.includes(currentUser.id)
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{activeComplaint.upvotes} Supported</span>
                    </button>
                  </div>
                </div>

                {/* 11-Stage Visual Lifecycle Stepper (Section 8) */}
                <div className="py-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      11-Stage Grievance Resolution Pipeline
                    </span>
                    <div className="flex items-center gap-2">
                      {activeComplaint.status === 'Reopened' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Reopened via Citizen Appeal
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        Target SLA: <strong>{activeComplaint.slaHours || 48} Hours</strong>
                      </span>
                    </div>
                  </div>

                  {/* Stepper Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-11 gap-1.5">
                    {ELEVEN_STAGE_PIPELINE.map((stage, idx) => {
                      const currentIdx = getStepIndex(
                        activeComplaint.status,
                        Boolean(activeComplaint.assignedOfficer)
                      );
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={stage.id}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                              : isCompleted
                              ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                          title={stage.label}
                        >
                          <div
                            className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <div className="text-[9px] font-bold leading-tight line-clamp-2">
                            {stage.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SLA & Resolution Monitoring Strip (Section 14) */}
                {(() => {
                  const createdMs = new Date(activeComplaint.createdAt || Date.now()).getTime();
                  const slaHours = activeComplaint.slaHours || 48;
                  const deadlineMs = activeComplaint.slaDeadline
                    ? new Date(activeComplaint.slaDeadline).getTime()
                    : createdMs + slaHours * 3600 * 1000;
                  const responseMs = activeComplaint.targetResponseDate
                    ? new Date(activeComplaint.targetResponseDate).getTime()
                    : createdMs + 4 * 3600 * 1000;
                  const resolvedMs = activeComplaint.resolutionDetails?.resolvedAt
                    ? new Date(activeComplaint.resolutionDetails.resolvedAt).getTime()
                    : null;
                  const isDone =
                    activeComplaint.status === 'Resolved' || activeComplaint.status === 'Closed';
                  const nowMs = Date.now();
                  const slaState = isDone
                    ? resolvedMs && resolvedMs > deadlineMs
                      ? 'Completed After SLA'
                      : 'Completed Within SLA'
                    : nowMs > deadlineMs || activeComplaint.isOverdue
                    ? 'Overdue'
                    : deadlineMs - nowMs < 6 * 3600 * 1000
                    ? 'Near Due'
                    : 'Within SLA';

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          SLA Start Date
                        </span>
                        <span className="font-semibold text-slate-100">
                          {new Date(createdMs).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Target Response
                        </span>
                        <span className="font-semibold text-blue-300">
                          {new Date(responseMs).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Est. Resolution
                        </span>
                        <span className="font-semibold text-amber-300">
                          {new Date(deadlineMs).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Actual Resolution
                        </span>
                        <span className="font-semibold text-emerald-300">
                          {resolvedMs
                            ? new Date(resolvedMs).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'In Progress'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          SLA Compliance
                        </span>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            slaState === 'Overdue' || slaState === 'Completed After SLA'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : slaState === 'Near Due'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {slaState}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Complaint Details Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Department:</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {activeComplaint.department || 'Under Evaluation'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Field Officer:</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {activeComplaint.assignedOfficer ? activeComplaint.assignedOfficer.name : 'Pending Dispatch'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Reported By:</span>
                    <span className="font-semibold text-slate-900">
                      {activeComplaint.reportedBy?.name || 'Resident'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Location Ward:</span>
                    <span className="font-semibold text-slate-900">{activeComplaint.location?.ward || 'Unassigned Ward'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Priority Level:</span>
                    <span className="font-bold text-rose-600">{activeComplaint.priority || 'Normal'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Created At:</span>
                    <span className="text-slate-700">
                      {activeComplaint.createdAt
                        ? new Date(activeComplaint.createdAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Description & Address */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Issue Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {activeComplaint.description || 'No detailed description provided.'}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {activeComplaint.location?.address || 'Site location logged'}
                      {activeComplaint.location?.landmark && ` • Landmark: ${activeComplaint.location.landmark}`}
                    </span>
                  </div>
                </div>

                {/* Visual Photos */}
                {activeComplaint.photos && activeComplaint.photos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Attached Photographic Evidence</h4>
                    <div className="flex flex-wrap gap-3">
                      {activeComplaint.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo}
                          target="_blank"
                          rel="noreferrer"
                          className="block relative rounded-xl overflow-hidden border border-slate-200 w-36 h-24 hover:opacity-90 transition-opacity shadow-xs"
                        >
                          <img src={photo} alt="Civic issue" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Photo #{idx + 1}
                          </span>
                        </a>
                      ))}
                    </div>

                    {/* Photo Authenticity & Fake AI Forensic Audit Panel */}
                    <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-700 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          <span>Computer Vision & Fake Photo Analysis</span>
                        </div>

                        {(localPhotoAnalysis || activeComplaint.photoAnalysis) && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (localPhotoAnalysis || activeComplaint.photoAnalysis)?.imageFraudVerdict === 'AUTHENTIC_FIELD_CAPTURE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : (localPhotoAnalysis || activeComplaint.photoAnalysis)?.imageFraudVerdict === 'SUSPECTED_AI_GENERATED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.imageFraudVerdict?.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {(localPhotoAnalysis || activeComplaint.photoAnalysis) ? (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-[11px] text-slate-300">
                            {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.relevanceExplanation}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                            <span>AI Generated: {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.isAiGenerated ? 'YES' : 'NO'}</span>
                            <span>•</span>
                            <span>Authenticity Score: {((localPhotoAnalysis || activeComplaint.photoAnalysis)?.authenticityScore ?? 0)}%</span>
                            <span>•</span>
                            <span>Category Match: {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.relevanceToCivicIssue === 'RELEVANT_MATCH' ? 'VERIFIED' : 'MISMATCH'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            Perform forensic computer vision scan to detect deepfakes, synthetic AI generation, or photo mismatches.
                          </span>
                          <button
                            type="button"
                            disabled={isAuditingPhoto}
                            onClick={async () => {
                              if (!activeComplaint.photos?.[0]) return;
                              setIsAuditingPhoto(true);
                              try {
                                const res = await analyzePhotoAuthenticity({
                                  photoUrl: activeComplaint.photos[0],
                                  reportedCategory: activeComplaint.category,
                                  reportedTitle: activeComplaint.title,
                                  reportedDescription: activeComplaint.description,
                                });
                                setLocalPhotoAnalysis(res);
                              } catch (e) {
                                console.error('Photo scan error:', e);
                              } finally {
                                setIsAuditingPhoto(false);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                          >
                            {isAuditingPhoto ? 'Auditing Photo...' : 'Scan Photo with AI'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Verification & Smart Routing Report Box */}
                {(activeComplaint.aiValidity || activeComplaint.aiAnalysis) && (
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-xl p-4 text-xs space-y-3 border border-indigo-500/30 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>AI Complaint Verification & Smart Routing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeComplaint.aiValidity && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              activeComplaint.aiValidity === 'VALID'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : activeComplaint.aiValidity === 'INVALID'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {activeComplaint.aiValidity}
                          </span>
                        )}
                        <span className="text-[10px] bg-indigo-900/60 border border-indigo-700/50 px-2 py-0.5 rounded text-indigo-200 font-mono">
                          {activeComplaint.aiConfidence || activeComplaint.aiAnalysis?.confidence || 94}% Confidence
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block">AI Category</span>
                        <span className="font-semibold text-slate-200 truncate block">
                          {activeComplaint.aiCategory || activeComplaint.category}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block">AI Priority</span>
                        <span className="font-semibold text-slate-200 block">
                          {activeComplaint.aiPriority || activeComplaint.priority}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Location Status</span>
                        <span className="font-semibold text-slate-200 block">
                          {activeComplaint.locationStatus || 'PROVIDED'}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Smart Routing</span>
                        <span className="font-semibold text-indigo-300 truncate block">
                          {activeComplaint.recommendedDepartment || activeComplaint.department}
                        </span>
                      </div>
                    </div>

                    {activeComplaint.aiReason && (
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <strong className="text-indigo-200">Verification Rationale:</strong> {activeComplaint.aiReason}
                      </p>
                    )}

                    {activeComplaint.recommendedAction && (
                      <p className="text-[11px] text-emerald-200/90 leading-relaxed bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
                        <strong className="text-emerald-300">Recommended Action:</strong> {activeComplaint.recommendedAction}
                      </p>
                    )}

                    {activeComplaint.duplicateStatus && (
                      <div className="text-[11px] text-purple-200 bg-purple-950/50 p-2.5 rounded-lg border border-purple-800/40">
                        <strong className="text-purple-300">Duplicate Notice:</strong> {activeComplaint.duplicateSummary || 'Similar complaint already logged in this ward.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Field Worker Completion Proof (Before & After) */}
                {activeComplaint.workerProof && (
                  <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200 text-xs space-y-3">
                    <div className="flex items-center justify-between text-amber-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Field Worker Execution Proof</span>
                      </span>
                      {activeComplaint.workerProof.completedAt && (
                        <span className="text-[10px] text-amber-700 font-normal">
                          Submitted on {new Date(activeComplaint.workerProof.completedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {activeComplaint.workerProof.completionNotes && (
                      <p className="text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-amber-200">
                        {activeComplaint.workerProof.completionNotes}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {activeComplaint.workerProof.beforePhoto && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Before Work Started
                          </span>
                          <img
                            src={activeComplaint.workerProof.beforePhoto}
                            alt="Before repair"
                            className="w-full h-32 object-cover rounded-lg border border-amber-200 shadow-xs"
                          />
                        </div>
                      )}
                      {activeComplaint.workerProof.afterPhoto && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            After Work Completed (Worker Proof)
                          </span>
                          <img
                            src={activeComplaint.workerProof.afterPhoto}
                            alt="After repair proof"
                            className="w-full h-32 object-cover rounded-lg border border-emerald-300 shadow-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Field Worker: <strong>{activeComplaint.workerProof.workerName || 'Assigned Technician'}</strong>
                    </div>
                  </div>
                )}

                {/* Higher Official Verification Audit Stamp */}
                {activeComplaint.verificationDetails && (
                  <div className={`rounded-xl p-4 border text-xs space-y-2 ${
                    activeComplaint.verificationDetails.decision === 'approved'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        <span>Higher Official Verification: {activeComplaint.verificationDetails.decision.toUpperCase()}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(activeComplaint.verificationDetails.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {activeComplaint.verificationDetails.officialNotes && (
                      <p className="text-slate-700 leading-relaxed bg-white/70 p-2 rounded-lg">
                        {activeComplaint.verificationDetails.officialNotes}
                      </p>
                    )}
                    <div className="text-[11px] text-slate-600">
                      Verified & Certified By: <strong>{activeComplaint.verificationDetails.verifiedBy}</strong>
                    </div>
                  </div>
                )}

                {/* Resolution Details (if resolved) */}
                {activeComplaint.resolutionDetails && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Resolution Audit Details</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Resolved on {new Date(activeComplaint.resolutionDetails.resolvedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {activeComplaint.resolutionDetails.notes}
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Signed off by: <strong>{activeComplaint.resolutionDetails.resolvedBy}</strong>
                    </div>

                    {Array.isArray(activeComplaint.resolutionDetails?.proofPhotos) && activeComplaint.resolutionDetails.proofPhotos.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {activeComplaint.resolutionDetails.proofPhotos.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Resolution evidence"
                            className="w-24 h-16 object-cover rounded-lg border border-emerald-300"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Citizen Appeals History (Section 12) */}
                {Array.isArray(activeComplaint.appeals) && activeComplaint.appeals.length > 0 && (
                  <div className="bg-rose-50/70 rounded-xl p-4 border border-rose-200 text-xs space-y-2.5">
                    <div className="font-bold text-rose-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-rose-600" />
                        <span>Citizen Appeal &amp; Reopening History ({activeComplaint.appeals.length})</span>
                      </span>
                    </div>
                    {activeComplaint.appeals.map((apl) => (
                      <div key={apl.id} className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-rose-700">{apl.id} — {apl.reason}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {apl.status}
                          </span>
                        </div>
                        {apl.additionalDescription && (
                          <p className="text-slate-600 text-[11px]">{apl.additionalDescription}</p>
                        )}
                        {apl.reviewRemarks && (
                          <p className="text-emerald-800 bg-emerald-50 p-2 rounded text-[11px] font-medium">
                            <strong>Officer Decision ({apl.reviewedBy}):</strong> {apl.reviewRemarks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Citizen Actions (Appeal / Reopen & Rating) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReopenModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('appealComplaint')}</span>
                    </button>
                  </div>

                  <div>
                    {activeComplaint.feedback ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                        <span className="font-semibold text-emerald-800">Your Rating:</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: Math.max(1, Math.min(5, activeComplaint.feedback?.rating || 5)) }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFeedbackModalOpen(true)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{t('provideFeedback')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Transition History Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Official Grievance Timeline &amp; Status Remarks</span>
                </h3>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {Array.isArray(activeComplaint.timeline) && activeComplaint.timeline.length > 0 ? (
                    activeComplaint.timeline.map((item, idx) => (
                      <div key={item?.id || idx} className="relative flex items-start gap-4 text-xs">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs z-10">
                          {idx + 1}
                        </div>

                        <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-slate-900">{item?.status || 'Update Logged'}</span>
                            <span className="text-[10px] text-slate-400">
                              {item?.timestamp
                                ? new Date(item.timestamp).toLocaleString([], {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })
                                : 'Recent'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mb-1.5 leading-relaxed">
                            {item?.remarks || 'Status update logged.'}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-medium">
                            <span>
                              Updated by: <strong className="text-slate-800">{item?.updatedBy || 'Civic Operations'}</strong>
                            </span>
                            <span>Department: {activeComplaint.department}</span>
                          </div>
                          {item?.evidenceUrl && (
                            <div className="mt-2">
                              <img
                                src={item.evidenceUrl}
                                alt="Timeline evidence"
                                className="w-28 h-20 object-cover rounded-lg border border-slate-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative flex items-start gap-4 text-xs">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs z-10">
                        1
                      </div>
                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900">{activeComplaint.status || 'Submitted'}</span>
                          <span className="text-[10px] text-slate-400">
                            {activeComplaint.createdAt
                              ? new Date(activeComplaint.createdAt).toLocaleString([], {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : 'Recent'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mb-1.5 leading-relaxed">
                          Complaint registered into the municipal operations platform. Initial department review underway.
                        </p>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Updated by: <span className="text-slate-800">System Intake</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : isUnauthorizedLookup ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-rose-900 text-base">
                Access Denied — Account-Wise Data Isolation
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                Complaint ID <span className="font-mono font-bold">{searchQuery.trim().toUpperCase()}</span> belongs to another citizen account. Under strict privacy and ownership rules, citizens can only inspect complaints registered under their own Account ID (<span className="font-mono font-bold">{currentUser.id}</span>).
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition"
              >
                Clear Search &amp; Return to My Complaints
              </button>
            </div>
          ) : scopedComplaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 gap-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700 text-sm">
                  No complaints found. You haven&apos;t submitted any complaints yet.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Submit a complaint from the Report Issue page to track its live 11-stage workflow here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">👈</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-600 text-sm">Select a complaint</p>
                <p className="text-xs text-slate-400 mt-1">Choose one of your complaints from the list on the left to view its details and status.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appeal & Reopen Complaint Modal (Section 12) */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">Appeal &amp; Reopen Civic Complaint</h3>
            <p className="text-xs text-slate-500 mb-4">
              If the issue was not satisfactorily resolved or has recurred, submit a formal appeal. All previous timeline history is preserved.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Appeal <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Incomplete or temporary repair">Incomplete or temporary repair</option>
                  <option value="Issue recurred immediately after closure">Issue recurred immediately after closure</option>
                  <option value="Marked resolved without site work">Marked resolved without site work</option>
                  <option value="Safety hazard still present on site">Safety hazard still present on site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reopenDescription}
                  onChange={(e) => setReopenDescription(e.target.value)}
                  placeholder="Describe why the resolution is unsatisfactory (e.g. Pothole was only filled with loose gravel and washed away)..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Supporting Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAppealPhotoUpload}
                  className="w-full text-xs text-slate-600"
                />
                {reopenPhotoUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={reopenPhotoUrl} alt="Appeal proof" className="w-24 h-16 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setReopenPhotoUrl('')}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                >
                  Submit Appeal &amp; Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Feedback & Rating Modal (Section 15) */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">Citizen Resolution Feedback</h3>
            <p className="text-xs text-slate-500 mb-4">
              Rate the quality, timeliness, and officer responsiveness for complaint {activeComplaint?.id}.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Overall Satisfaction Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Quality</label>
                  <select
                    value={resolutionQuality}
                    onChange={(e) => setResolutionQuality(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="excellent">Excellent &amp; Durable</option>
                    <option value="good">Good Standard</option>
                    <option value="fair">Fair / Acceptable</option>
                    <option value="poor">Poor Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Officer Response</label>
                  <select
                    value={officerExperience}
                    onChange={(e) => setOfficerExperience(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="very_helpful">Very Helpful &amp; Proactive</option>
                    <option value="professional">Professional</option>
                    <option value="average">Average</option>
                    <option value="unresponsive">Unresponsive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timeliness</label>
                <select
                  value={timeliness}
                  onChange={(e) => setTimeliness(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="very_satisfied">Resolved faster than target SLA</option>
                  <option value="satisfied">Resolved within reasonable SLA</option>
                  <option value="neutral">Average turnaround</option>
                  <option value="dissatisfied">Delayed beyond SLA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Written Feedback</label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your experience with the municipal field and departmental team..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Submit Citizen Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Municipal Inspection & Verification Dossier Modal */}
      <OfficialInspectionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        complaint={activeComplaint}
      />
    </div>
  );
};
