import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Upload,
  Camera,
  Navigation,
  Phone,
  Filter,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileText,
  UserCheck,
  Search,
  Eye,
  ArrowRight,
  Sparkles,
  CheckCircle,
  FileCheck2,
  AlertCircle,
  Map as MapIcon,
  Bell,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { Complaint, ComplaintStatus } from '../types';
import { LeafletMap } from './LeafletMap';

export const OfficerDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    updateComplaintStatus,
    workerStartWork,
    workerCompleteTask,
    setSelectedComplaint,
    notifications,
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'assigned' | 'inspection' | 'work_started' | 'in_progress' | 'resolved' | 'map' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);

  // Inspection modal state
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionRemarks, setInspectionRemarks] = useState('');
  const [targetComplaintId, setTargetComplaintId] = useState('');

  // Before & After photo modals
  const [isBeforePhotoModalOpen, setIsBeforePhotoModalOpen] = useState(false);
  const [isAfterPhotoModalOpen, setIsAfterPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Sample photo helpers for quick inspection testing
  const sampleBeforePhotos = [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
  ];

  const sampleAfterPhotos = [
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=80',
  ];

  // Filter tasks relevant to this officer or department
  const officerTasks = complaints.filter((c) => {
    const isDirectMatch =
      c.assignedOfficer?.badgeNumber === currentUser.employeeId ||
      c.assignedOfficer?.id === currentUser.id ||
      (currentUser.name && c.assignedOfficer?.name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
      c.workerProof?.workerId === currentUser.id;

    const isDeptMatch = currentUser.department ? c.department === currentUser.department : true;
    return isDirectMatch || isDeptMatch;
  });

  const filteredTasks = officerTasks.filter((t) => {
    const s = String(t.status).toUpperCase().replace(/[\s-]/g, '_');
    if (activeTab === 'assigned') return s === 'ASSIGNED' || s === 'ACCEPTED';
    if (activeTab === 'inspection') return s === 'INSPECTION' || s === 'UNDER_REVIEW';
    if (activeTab === 'work_started') return s === 'WORK_STARTED';
    if (activeTab === 'in_progress') return s === 'IN_PROGRESS';
    if (activeTab === 'resolved') return s === 'RESOLVED' || s === 'WORK_COMPLETED' || s === 'CITIZEN_VERIFICATION' || s === 'CLOSED';

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.location.ward.toLowerCase().includes(q) ||
        t.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const assignedCount = officerTasks.filter((t) => {
    const s = String(t.status).toUpperCase();
    return s.includes('ASSIGN') || s.includes('ACCEPT');
  }).length;

  const inspectionCount = officerTasks.filter((t) => {
    const s = String(t.status).toUpperCase();
    return s.includes('INSPECT') || s.includes('REVIEW');
  }).length;

  const inProgressCount = officerTasks.filter((t) => {
    const s = String(t.status).toUpperCase();
    return s.includes('PROGRESS') || s.includes('WORK_STARTED');
  }).length;

  const resolvedCount = officerTasks.filter((t) => {
    const s = String(t.status).toUpperCase();
    return s.includes('RESOLV') || s.includes('COMPLET') || s.includes('CLOSE');
  }).length;

  // Handlers for Officer Workflow Steps: ASSIGNED -> INSPECTION -> WORK_STARTED -> IN_PROGRESS -> RESOLVED
  const handleStartInspection = (complaintId: string) => {
    setTargetComplaintId(complaintId);
    setInspectionRemarks('Field officer arrived on-site. Physical damage and site measurements verified.');
    setIsInspectionModalOpen(true);
  };

  const handleConfirmInspection = () => {
    if (!targetComplaintId) return;
    updateComplaintStatus(targetComplaintId, 'INSPECTION' as ComplaintStatus, inspectionRemarks);
    setIsInspectionModalOpen(false);
    setInspectionRemarks('');
  };

  const handleOpenBeforePhoto = (complaintId: string) => {
    setTargetComplaintId(complaintId);
    setPhotoUrlInput(sampleBeforePhotos[0]);
    setIsBeforePhotoModalOpen(true);
  };

  const handleSubmitBeforePhoto = () => {
    if (!photoUrlInput.trim() || !targetComplaintId) return;
    workerStartWork(targetComplaintId, photoUrlInput.trim());
    setIsBeforePhotoModalOpen(false);
    setPhotoUrlInput('');
  };

  const handleAdvanceToInProgress = (complaintId: string) => {
    updateComplaintStatus(complaintId, 'IN_PROGRESS' as ComplaintStatus, 'Field repairs actively in progress. Material compaction and site crew engaged.');
  };

  const handleOpenAfterPhoto = (complaintId: string) => {
    setTargetComplaintId(complaintId);
    setPhotoUrlInput(sampleAfterPhotos[0]);
    setCompletionNotes('Pothole cavity cleaned, aggregate compacted with steam roller, asphalt levelled to gradient, safety barricades removed.');
    setIsAfterPhotoModalOpen(true);
  };

  const handleSubmitAfterPhoto = () => {
    if (!photoUrlInput.trim() || !completionNotes.trim() || !targetComplaintId) return;
    workerCompleteTask(targetComplaintId, photoUrlInput.trim(), completionNotes.trim());
    setIsAfterPhotoModalOpen(false);
    setPhotoUrlInput('');
    setCompletionNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Officer Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Field Officer Terminal
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentUser.department || 'Public Works Department (PWD)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                <span>Badge / ID: <strong className="text-slate-200">{currentUser.employeeId || 'SC-OFF-204'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Jurisdiction: <strong className="text-slate-200">{currentUser.ward || 'Chennai Metropolitan Zones'}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Field Duty
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
            <div className="text-center px-3 py-1.5 bg-slate-900/80 rounded-xl">
              <div className="text-lg font-bold text-amber-400">{assignedCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Assigned</div>
            </div>
            <div className="text-center px-3 py-1.5 bg-slate-900/80 rounded-xl">
              <div className="text-lg font-bold text-blue-400">{inspectionCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Inspect</div>
            </div>
            <div className="text-center px-3 py-1.5 bg-slate-900/80 rounded-xl">
              <div className="text-lg font-bold text-orange-400">{inProgressCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Progress</div>
            </div>
            <div className="text-center px-3 py-1.5 bg-slate-900/80 rounded-xl">
              <div className="text-lg font-bold text-emerald-400">{resolvedCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Officer Workflow Stage Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Municipal Field Resolution Protocol (5-Stage Workflow)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
          {[
            { step: '1. ASSIGNED', desc: 'Auto-assigned by department', color: 'bg-amber-50 border-amber-300 text-amber-800' },
            { step: '2. INSPECTION', desc: 'On-site verification & notes', color: 'bg-blue-50 border-blue-300 text-blue-800' },
            { step: '3. WORK_STARTED', desc: 'Before-work photo uploaded', color: 'bg-indigo-50 border-indigo-300 text-indigo-800' },
            { step: '4. IN_PROGRESS', desc: 'Physical repair execution', color: 'bg-orange-50 border-orange-300 text-orange-800' },
            { step: '5. RESOLVED', desc: 'After photo proof & verification', color: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
          ].map((s, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border ${s.color}`}>
              <div className="font-bold text-[11px]">{s.step}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
          {[
            { id: 'all', label: `All Tasks (${officerTasks.length})` },
            { id: 'assigned', label: `Assigned (${assignedCount})` },
            { id: 'inspection', label: `Inspection (${inspectionCount})` },
            { id: 'in_progress', label: `In Progress (${inProgressCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` },
            { id: 'map', label: 'GIS Field Map' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'map' && (
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, ward..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* View Content: GIS Map or Task Cards */}
      {activeTab === 'map' ? (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Assigned Tasks Field Map (Chennai)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any marker to inspect grievance coordinates, priority, and progress.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {officerTasks.length} Active Geo-Markers
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 h-[500px]">
            <LeafletMap
              center={[13.0827, 80.2707]}
              zoom={12}
              height="500px"
              complaints={officerTasks}
              onSelectComplaint={(c) => {
                setSelectedComplaint(c);
                setSelectedTask(c);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* Complaints Feed */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No tasks in this category</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All assigned civic grievances in this queue have been attended to or verified.
                </p>
              </div>
            ) : (
              filteredTasks.map((t) => {
                const isSelected = selectedTask?.id === t.id;
                const statusNormalized = String(t.status).toUpperCase().replace(/[\s-]/g, '_');
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.priority.includes('Critical') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        statusNormalized === 'RESOLVED' || statusNormalized === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : statusNormalized === 'IN_PROGRESS' || statusNormalized === 'WORK_STARTED'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-2">{t.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{t.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {t.location.ward}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        SLA: {t.slaHours}h target
                      </span>
                    </div>

                    {/* Quick Step Buttons for Officer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      {statusNormalized === 'SUBMITTED' || statusNormalized === 'ASSIGNED' || statusNormalized === 'ACCEPTED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInspection(t.id);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>1. Begin Inspection</span>
                        </button>
                      ) : null}

                      {statusNormalized === 'INSPECTION' || statusNormalized === 'UNDER_REVIEW' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBeforePhoto(t.id);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>2. Start Work (Before Photo)</span>
                        </button>
                      ) : null}

                      {statusNormalized === 'WORK_STARTED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceToInProgress(t.id);
                          }}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>3. Mark In Progress</span>
                        </button>
                      ) : null}

                      {statusNormalized === 'IN_PROGRESS' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAfterPhoto(t.id);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>4. Submit Resolution Proof</span>
                        </button>
                      ) : null}

                      {statusNormalized === 'RESOLVED' || statusNormalized === 'WORK_COMPLETED' ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Resolution Proof Submitted</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Task Details & Proof Inspector Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 sticky top-24 self-start">
            {selectedTask ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {selectedTask.id}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{selectedTask.title}</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    {selectedTask.status}
                  </span>
                </div>

                {/* Evidence Photos */}
                {selectedTask.photos && selectedTask.photos.length > 0 && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                      Citizen Evidence Photos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTask.photos.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Citizen evidence"
                          className="w-full h-32 object-cover rounded-xl border border-slate-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Proof Card if uploaded */}
                {selectedTask.workerProof && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Resolution Proof Dossier</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {selectedTask.workerProof.beforePhoto && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 mb-1">Before Work</div>
                          <img
                            src={selectedTask.workerProof.beforePhoto}
                            alt="Before repair"
                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                      {selectedTask.workerProof.afterPhoto && (
                        <div>
                          <div className="text-[10px] font-bold text-emerald-700 mb-1">After Repair</div>
                          <img
                            src={selectedTask.workerProof.afterPhoto}
                            alt="After repair"
                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    {selectedTask.workerProof.completionNotes && (
                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800">Completion Notes: </span>
                        {selectedTask.workerProof.completionNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Location & Contact Details */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Location & Resident</div>
                  <div><strong className="text-slate-700">Ward:</strong> {selectedTask.location.ward}</div>
                  <div><strong className="text-slate-700">Address:</strong> {selectedTask.location.address}</div>
                  {selectedTask.location.landmark && (
                    <div><strong className="text-slate-700">Landmark:</strong> {selectedTask.location.landmark}</div>
                  )}
                  <div>
                    <strong className="text-slate-700">Reported By:</strong> {selectedTask.reportedBy.name}
                    {selectedTask.reportedBy.phone && ` (${selectedTask.reportedBy.phone})`}
                  </div>
                </div>

                {/* Audit Timeline */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    Execution Timeline
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTask.timeline.map((item, i) => (
                      <div key={i} className="text-xs flex items-start gap-2 p-2 bg-slate-50 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">{item.status} — {item.updatedBy}</div>
                          <div className="text-[11px] text-slate-500">{item.remarks}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{new Date(item.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Select any task on the left to view details &amp; record progress proof.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Inspection Notes */}
      {isInspectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Step 1: Record Site Inspection</span>
            </h3>
            <p className="text-xs text-slate-500">
              Confirm your field arrival and record initial inspection remarks for this grievance.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Remarks</label>
              <textarea
                rows={3}
                value={inspectionRemarks}
                onChange={(e) => setInspectionRemarks(e.target.value)}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsInspectionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInspection}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Confirm Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Before-Work Photo Proof */}
      {isBeforePhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              <span>Step 2: Before-Work Photo Proof</span>
            </h3>
            <p className="text-xs text-slate-500">
              Provide photographic proof before repair commences to verify the original site defect.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL / Upload</label>
              <input
                type="text"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                {sampleBeforePhotos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoUrlInput(url)}
                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    Sample #{i + 1}
                  </button>
                ))}
              </div>
            </div>
            {photoUrlInput && (
              <img src={photoUrlInput} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsBeforePhotoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBeforePhoto}
                disabled={!photoUrlInput.trim()}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                Upload &amp; Mark Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resolution Proof & Final Resolve */}
      {isAfterPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Step 4: Submit Resolution Proof &amp; Resolve</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload completed work photographic proof and operational remarks to verify resolution.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Completed Work Photo URL</label>
              <input
                type="text"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                {sampleAfterPhotos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoUrlInput(url)}
                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    Sample #{i + 1}
                  </button>
                ))}
              </div>
            </div>
            {photoUrlInput && (
              <img src={photoUrlInput} alt="After preview" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Completion Remarks &amp; Material Notes</label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Detail the work carried out, materials applied, and safety checks completed..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAfterPhotoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAfterPhoto}
                disabled={!photoUrlInput.trim() || !completionNotes.trim()}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                Resolve Grievance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
