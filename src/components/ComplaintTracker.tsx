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
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { Complaint, ComplaintStatus, CitizenFeedback, PhotoAuthenticityAnalysis } from '../types';
import { OfficialInspectionReportModal } from './OfficialInspectionReportModal';
import { analyzePhotoAuthenticity } from '../services/imageAuthenticityService';

const LIFECYCLE_STEPS: ComplaintStatus[] = [
  'Submitted',
  'Verified',
  'Assigned',
  'In Progress',
  'Work Completed',
  'Resolved',
  'Closed',
];

export const ComplaintTracker: React.FC = () => {
  const {
    complaints,
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

  // Reopen modal state
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [timeliness, setTimeliness] = useState<'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied'>('very_satisfied');

  // Current active complaint (defaults to selectedComplaint or first complaint)
  const activeComplaint = selectedComplaint || complaints[0];

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

  // Filter complaints list
  const filteredComplaints = complaints.filter((comp) => {
    const matchQuery =
      comp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.location.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = filterCategory === 'All' || comp.category === filterCategory;
    const matchStatus = filterStatus === 'All' || comp.status === filterStatus;

    return matchQuery && matchCat && matchStatus;
  });

  const getStepIndex = (status: ComplaintStatus) => {
    const idx = LIFECYCLE_STEPS.indexOf(status);
    if (idx !== -1) return idx;
    if (status === 'Reopened' || status === 'Escalated') return 4; // midway
    return 1;
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !reopenReason.trim()) return;
    reopenComplaint(activeComplaint.id, reopenReason);
    setReopenModalOpen(false);
    setReopenReason('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    const feedback: CitizenFeedback = {
      rating,
      comment: feedbackComment || 'Resolution verified by citizen.',
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
            placeholder="Search by ID (e.g. CIVIC-2026-8812) or keyword..."
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
                        <span>📍 {comp.location.ward.split('-')[0]}</span>
                        <span className="font-semibold text-rose-600">{comp.priority}</span>
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

                  {/* Upvote & Official Inspection Dossier Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                      title="View official municipal inspection report and forensic audit dossier"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-200" />
                      <span>{t.viewOfficialReportBtn}</span>
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
                      <span>{activeComplaint.upvotes} Citizens Supported</span>
                    </button>
                  </div>
                </div>

                {/* Visual Lifecycle Stepper */}
                <div className="py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Grievance Lifecycle Pipeline</span>
                    <span className="text-[11px] text-slate-400">
                      Target SLA: <strong>{activeComplaint.slaHours} Hours</strong>
                    </span>
                  </div>

                  {/* Stepper Bar */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                      style={{
                        width: `${(getStepIndex(activeComplaint.status) / (LIFECYCLE_STEPS.length - 1)) * 100}%`,
                      }}
                    ></div>

                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(activeComplaint.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className="flex flex-col items-center group relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white ring-4 ring-white shadow-xs'
                                : 'bg-slate-200 text-slate-500 ring-4 ring-white'
                            } ${isCurrent ? 'ring-emerald-200 scale-110' : ''}`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-medium whitespace-nowrap hidden sm:inline ${
                              isCurrent ? 'font-bold text-emerald-800' : 'text-slate-500'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
                      {activeComplaint.reportedBy.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Location Ward:</span>
                    <span className="font-semibold text-slate-900">{activeComplaint.location.ward}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Priority Level:</span>
                    <span className="font-bold text-rose-600">{activeComplaint.priority}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Created At:</span>
                    <span className="text-slate-700">
                      {new Date(activeComplaint.createdAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Description & Address */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Issue Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {activeComplaint.description}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {activeComplaint.location.address}
                      {activeComplaint.location.landmark && ` • Landmark: ${activeComplaint.location.landmark}`}
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
                              (localPhotoAnalysis || activeComplaint.photoAnalysis)?.verdict === 'GENUINE_EVIDENCE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : (localPhotoAnalysis || activeComplaint.photoAnalysis)?.verdict === 'AI_GENERATED_DETECTED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.verdict.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {(localPhotoAnalysis || activeComplaint.photoAnalysis) ? (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-[11px] text-slate-300">
                            {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.explanation}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                            <span>AI Probability: {(((localPhotoAnalysis || activeComplaint.photoAnalysis)?.aiGeneratedProbability ?? 0) * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span>Authenticity Score: {(((localPhotoAnalysis || activeComplaint.photoAnalysis)?.authenticityScore ?? 0) * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span>Category Match: {(localPhotoAnalysis || activeComplaint.photoAnalysis)?.matchesReportedCategory ? 'VERIFIED' : 'MISMATCH'}</span>
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

                    {activeComplaint.resolutionDetails.proofPhotos && (
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

                {/* Citizen Actions (Reopen & Rating) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* Reopen Button */}
                    <button
                      type="button"
                      onClick={() => setReopenModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold px-3 py-2 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Not Resolved? Reopen Ticket</span>
                    </button>
                  </div>

                  <div>
                    {/* Citizen Feedback / Rating */}
                    {activeComplaint.feedback ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                        <span className="font-semibold text-emerald-800">Your Rating:</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: activeComplaint.feedback.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                    ) : activeComplaint.status === 'Resolved' ? (
                      <button
                        type="button"
                        onClick={() => setFeedbackModalOpen(true)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Rate Municipal Resolution</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Status Transition History Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Audit Timeline & Status Transitions</span>
                </h3>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeComplaint.timeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative flex items-start gap-4 text-xs">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs z-10">
                        {idx + 1}
                      </div>

                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900">{item.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mb-1.5 leading-relaxed">
                          {item.remarks}
                        </p>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Updated by: <span className="text-slate-800">{item.updatedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select a complaint from the left panel to inspect tracking details.
            </div>
          )}
        </div>
      </div>

      {/* Reopen Complaint Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reopen Civic Complaint</h3>
            <p className="text-xs text-slate-500 mb-4">
              If the reported issue was not satisfactorily resolved or has recurred, detail the grounds for escalation.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Reopening <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g. The pothole was only filled with loose sand and washed away after light rain..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  required
                />
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
                  Confirm Reopen & Escalate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Feedback & Rating Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">Rate Municipal Resolution</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your evaluation directly feeds into departmental SLA compliance metrics.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Overall Satisfaction</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timeliness</label>
                <select
                  value={timeliness}
                  onChange={(e) => setTimeliness(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="very_satisfied">Resolved much faster than expected</option>
                  <option value="satisfied">Resolved within reasonable SLA</option>
                  <option value="neutral">Average turnaround</option>
                  <option value="dissatisfied">Delayed or required repeated follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share feedback for the municipal field team..."
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
