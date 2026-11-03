import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Lock,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { Complaint, ComplaintStatus, Priority, MunicipalDepartment } from '../types';
import { DEPARTMENTS } from '../data/seedData';

interface OfficerOperationalUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

const STATUS_STAGES: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: 'Submitted', desc: 'Logged by citizen' },
  { status: 'Under Review', label: 'Under Review', desc: 'Department evaluation' },
  { status: 'Assigned', label: 'Assigned', desc: 'Assigned to field officer' },
  { status: 'Work Planned', label: 'Work Planned', desc: 'Scheduled for repair' },
  { status: 'In Progress', label: 'In Progress', desc: 'Active field execution' },
  { status: 'Resolved', label: 'Resolved', desc: 'Repair work finished' },
  { status: 'Verified', label: 'Verified', desc: 'Verified by officer/citizen' },
  { status: 'Closed', label: 'Closed', desc: 'Formally closed' },
  { status: 'Reopened', label: 'Reopened', desc: 'Reopened for rework' },
  { status: 'Escalated', label: 'Escalated', desc: 'SLA escalated to senior authority' },
];

export const OfficerOperationalUpdateModal: React.FC<OfficerOperationalUpdateModalProps> = ({
  isOpen,
  onClose,
  complaint,
}) => {
  const {
    updateComplaintOperationalFields,
    addInternalNote,
    reviewAppeal,
    currentUser,
    getAllowedNextStatuses,
  } = useCivic();

  const [status, setStatus] = useState<ComplaintStatus>('In Progress');
  const [priority, setPriority] = useState<Priority>('P2-High');
  const [department, setDepartment] = useState<MunicipalDepartment>('Public Works Department (PWD)');
  const [assignedOfficerName, setAssignedOfficerName] = useState('Field Officer');
  const [scheduledWorkDate, setScheduledWorkDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoUrlInput] = useState('');
  const [slaHours, setSlaHours] = useState(48);
  const [appealReviewRemarks, setAppealReviewRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || 'In Progress');
      setPriority(complaint.priority || 'P2-High');
      setDepartment(complaint.department || 'Public Works Department (PWD)');
      setAssignedOfficerName(complaint.assignedOfficer?.name || currentUser.name || 'Field Officer');
      setScheduledWorkDate(complaint.scheduledWorkDate || '');
      setRemarks('');
      setInternalNoteText('');
      setResolutionNotes(complaint.resolutionDetails?.notes || '');
      setProofPhotos(complaint.resolutionDetails?.proofPhotos || []);
      setSlaHours(complaint.slaHours || 48);
      setAppealReviewRemarks('');
    }
  }, [complaint, currentUser.name]);

  if (!isOpen || !complaint) return null;

  const handleAddSamplePhoto = (url: string) => {
    if (!proofPhotos.includes(url)) {
      setProofPhotos([...proofPhotos, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setProofPhotos(proofPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isResolving = status === 'Resolved' || status === 'Closed';

      const updateData: any = {
        status,
        priority,
        department,
        slaHours,
        scheduledWorkDate: scheduledWorkDate || undefined,
        assignedOfficer: {
          id: complaint.assignedOfficer?.id || `FO-${Date.now()}`,
          name: assignedOfficerName,
          phone: complaint.assignedOfficer?.phone || '+91 94441 23456',
          badgeNumber: complaint.assignedOfficer?.badgeNumber || 'SC-OFF-204',
          department,
        },
        remarks: remarks.trim() || `Status updated to ${status} by ${currentUser.name}`,
      };

      if (isResolving || resolutionNotes.trim()) {
        updateData.resolutionDetails = {
          resolvedAt: new Date().toISOString(),
          notes: resolutionNotes.trim() || remarks.trim() || 'Work completed per municipal standards.',
          proofPhotos: proofPhotos,
          resolvedBy: currentUser.name || 'Field Officer',
        };
      }

      if (internalNoteText.trim()) {
        addInternalNote(complaint.id, internalNoteText.trim());
      }

      await updateComplaintOperationalFields(complaint.id, updateData);
      onClose();
    } catch (err) {
      console.error('Failed to update complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">{complaint.id}</span>
                <span className="text-slate-400 text-xs">• {complaint.category}</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Officer Operational Action &amp; Response Management
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Issue Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{complaint.title}</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                Current: {complaint.status}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{complaint.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
              <span>📍 {complaint.district || 'Chennai'} · {complaint.location?.ward || 'Unassigned Ward'}</span>
              <span>👤 Citizen: {complaint.reportedBy?.name || 'Resident'}</span>
            </div>
          </div>

          {/* Citizen Appeals Review Section (Section 10 & 12) */}
          {Array.isArray(complaint.appeals) && complaint.appeals.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 text-xs">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Citizen Appeal Review ({complaint.appeals.length})</span>
              </div>
              {complaint.appeals.map((apl) => (
                <div key={apl.id} className="bg-white p-3 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-700">
                      {apl.id}: {apl.reason}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      {apl.status}
                    </span>
                  </div>
                  {apl.additionalDescription && (
                    <p className="text-slate-600 text-[11px]">{apl.additionalDescription}</p>
                  )}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={appealReviewRemarks}
                      onChange={(e) => setAppealReviewRemarks(e.target.value)}
                      placeholder="Enter official review decision remarks..."
                      className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        reviewAppeal(
                          complaint.id,
                          apl.id,
                          'Accepted',
                          appealReviewRemarks.trim() || 'Appeal accepted. Re-dispatching field team for rework.'
                        );
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                    >
                      Accept &amp; Rework
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reviewAppeal(
                          complaint.id,
                          apl.id,
                          'Rejected',
                          appealReviewRemarks.trim() || 'Appeal reviewed. On-site inspection confirmed resolution meets standards.'
                        );
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px]"
                    >
                      Reject Appeal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Operational Status Stage Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Update Grievance Lifecycle Stage <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {currentUser.role === 'admin'
                  ? 'Admin Mode: Full Lifecycle Override Enabled'
                  : 'Controlled Workflow: Step-by-Step Progression'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUS_STAGES.map((st) => {
                const isSelected = status === st.status;
                const allowedNext = getAllowedNextStatuses(complaint.status);
                const isAllowed =
                  currentUser.role === 'admin' ||
                  st.status === complaint.status ||
                  allowedNext.includes(st.status);

                return (
                  <button
                    key={st.status}
                    type="button"
                    disabled={!isAllowed}
                    onClick={() => isAllowed && setStatus(st.status)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : isAllowed
                        ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        : 'border-slate-100 bg-slate-50/60 text-slate-400 opacity-55 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-[11px]">{st.label}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : !isAllowed ? (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{st.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority, Department, Field Officer, Scheduled Work Date & SLA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="P1-Critical">P1 - Critical (12h-24h SLA)</option>
                <option value="P2-High">P2 - High (24h-48h SLA)</option>
                <option value="P3-Medium">P3 - Medium (48h-72h SLA)</option>
                <option value="P4-Low">P4 - Low (72h-120h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Department {currentUser.role !== 'admin' && <span className="text-[10px] text-slate-400 font-normal">(Admin Reassign Only)</span>}
              </label>
              <select
                value={department}
                disabled={currentUser.role !== 'admin'}
                onChange={(e) => setDepartment(e.target.value as MunicipalDepartment)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Field Officer
              </label>
              <input
                type="text"
                value={assignedOfficerName}
                onChange={(e) => setAssignedOfficerName(e.target.value)}
                placeholder="Officer Name"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                SLA Target Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="336"
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value) || 48)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Scheduled Work / Target Completion Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={scheduledWorkDate}
                  onChange={(e) => setScheduledWorkDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 1. Citizen-Visible Status Update Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Citizen-Visible Status Update Remarks{' '}
              <span className="text-emerald-600 font-semibold">(Shown on Public Citizen Timeline)</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter official status update visible to the citizen (e.g. Field crew dispatched with hot-mix asphalt)..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* 2. Confidential Internal Administrative Notes (Hidden from Citizens) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>2. Internal Administrative Notes (Confidential — Staff &amp; Admin Only)</span>
            </label>
            <textarea
              rows={2}
              value={internalNoteText}
              onChange={(e) => setInternalNoteText(e.target.value)}
              placeholder="Record confidential inter-departmental coordination, contractor vendor codes, or budget notes (Never shown to citizens)..."
              className="w-full p-2.5 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            {Array.isArray(complaint.internalNotes) && complaint.internalNotes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold uppercase text-amber-800">
                  Previous Internal Notes ({complaint.internalNotes.length}):
                </div>
                {complaint.internalNotes.map((n) => (
                  <div key={n.id} className="text-[11px] bg-white/90 p-2 rounded-lg border border-amber-200/80 text-slate-700">
                    <strong>{n.author} ({n.role}):</strong> {n.text}{' '}
                    <span className="text-[10px] text-slate-400">
                      ({new Date(n.timestamp).toLocaleDateString()})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Resolution Summary <span className="text-emerald-700 font-normal">(If marking Resolved / Closed)</span>
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe final repair work performed, material replaced, or verification findings..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Photo Evidence (OPTIONAL) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  Resolution Photo Evidence{' '}
                  <span className="text-emerald-700 text-[11px] font-normal">(OPTIONAL)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Attach after-work completion photos or proceed without image.
                </span>
              </div>
            </div>

            {proofPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {proofPhotos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs"
                  >
                    <img src={photo} alt={`Proof ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 opacity-90 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={photoInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://... (Optional Completion Photo URL)"
                className="flex-1 p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (photoInput.trim()) {
                    handleAddSamplePhoto(photoInput.trim());
                    setPhotoUrlInput('');
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
              >
                Add Photo
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Saving Updates...' : 'Save Operational Update'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
