import React, { useState, useMemo } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Upload,
  Camera,
  Filter,
  Calendar,
  Layers,
  ShieldCheck,
  FileText,
  UserCheck,
  Search,
  Sparkles,
  CheckCircle,
  FileCheck2,
  Map as MapIcon,
  Building2,
  Compass,
  Download,
  Printer,
  XCircle,
  Flame,
  Archive,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { Complaint, ComplaintStatus, MunicipalDepartment, Priority } from '../types';
import { LeafletMap } from './LeafletMap';
import { OfficerTaskManager } from './OfficerTaskManager';
import { OfficerOperationalUpdateModal } from './OfficerOperationalUpdateModal';
import { InfrastructureProjects } from './InfrastructureProjects';
import { ZoneConstituencyAnalytics } from './ZoneConstituencyAnalytics';
import { WARDS, ZONES, CONSTITUENCIES, DEPARTMENTS, FIELD_OFFICERS } from '../data/seedData';
import {
  downloadComplaintAcknowledgement,
  printComplaintAcknowledgement,
  downloadComplaintStatusReport,
  downloadInspectionReport,
  downloadDepartmentSummaryReport,
} from '../utils/acknowledgementHelper';

const CATEGORIES = [
  'Pothole',
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Drainage',
  'Streetlight',
  'Traffic',
  'Pollution',
  'Public Property Damage',
  'Park Issue',
  'Sanitation',
  'Other',
];

export const OfficerDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    departmentComplaints,
    getAllowedNextStatuses,
    updateComplaintStatus,
    assignOfficer,
    updatePriority,
    officialVerifyComplaint,
    workerStartWork,
    workerCompleteTask,
    setSelectedComplaint,
    toggleDutyStatus,
  } = useCivic();

  const [mainNavTab, setMainNavTab] = useState<'dashboard' | 'complaints' | 'projects' | 'tasks' | 'gis_map' | 'zones'>('dashboard');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [constituencyFilter, setConstituencyFilter] = useState<string>('ALL');
  const [deptScope, setDeptScope] = useState<string>('MY_DEPT');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'sla'>('newest');

  const [selectedTask, setSelectedTask] = useState<Complaint | null>(() => departmentComplaints[0] || complaints[0] || null);

  // Operational Update Modal State
  const [isOperationalModalOpen, setIsOperationalModalOpen] = useState(false);
  const [selectedOperationalComplaint, setSelectedOperationalComplaint] = useState<Complaint | null>(null);

  // Inspection modal state
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionRemarks, setInspectionRemarks] = useState('');
  const [inspectionDate, setInspectionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [targetComplaintId, setTargetComplaintId] = useState('');

  // Staff assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(FIELD_OFFICERS[0]?.id || 'FO-CHN-101');
  const [selectedDept, setSelectedDept] = useState<MunicipalDepartment>('Public Works Department (PWD)');
  const [selectedPriorityVal, setSelectedPriorityVal] = useState<Priority>('P2-High');
  const [assignRemarks, setAssignRemarks] = useState('');

  // Before & After photo modals
  const [isBeforePhotoModalOpen, setIsBeforePhotoModalOpen] = useState(false);
  const [isAfterPhotoModalOpen, setIsAfterPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

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

  // Department scope filtering (defaults to the logged-in officer's assigned department)
  const scopedComplaints = useMemo(() => {
    if (deptScope === 'MY_DEPT') return departmentComplaints;
    if (deptScope === 'ALL') return complaints;
    return complaints.filter(
      (c) => c.department === deptScope || c.assignedDepartment === deptScope
    );
  }, [complaints, departmentComplaints, deptScope]);

  // 9 Dynamically Derived KPI Cards (Section 6.1)
  const kpis = useMemo(() => {
    const total = scopedComplaints.length;
    const submitted = scopedComplaints.filter((c) => c.status === 'Submitted').length;
    const underReview = scopedComplaints.filter(
      (c) => c.status === 'Under Review' || c.status === 'Verified' || c.status === 'Pending Verification'
    ).length;
    const assigned = scopedComplaints.filter(
      (c) => c.status === 'Assigned' || c.status === 'Accepted'
    ).length;
    const workPlanned = scopedComplaints.filter((c) => c.status === 'Work Planned').length;
    const inProgress = scopedComplaints.filter(
      (c) => c.status === 'In Progress' || c.status === 'Work Completed'
    ).length;
    const resolved = scopedComplaints.filter(
      (c) => c.status === 'Resolved' || c.status === 'RESOLVED'
    ).length;
    const closed = scopedComplaints.filter((c) => c.status === 'Closed').length;
    const overdue = scopedComplaints.filter((c) => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      if (c.isOverdue || c.status === 'Escalated') return true;
      if (c.slaDeadline && new Date(c.slaDeadline).getTime() < Date.now()) return true;
      return false;
    }).length;

    return {
      total,
      submitted,
      underReview,
      assigned,
      workPlanned,
      inProgress,
      resolved,
      closed,
      overdue,
    };
  }, [scopedComplaints]);

  // Filtered & Sorted Complaints
  const filteredTasks = useMemo(() => {
    return scopedComplaints
      .filter((t) => {
        if (statusTab !== 'ALL') {
          if (statusTab === 'OVERDUE') {
            const isDone = t.status === 'Resolved' || t.status === 'Closed';
            const isLate =
              !isDone &&
              (t.isOverdue ||
                t.status === 'Escalated' ||
                (t.slaDeadline && new Date(t.slaDeadline).getTime() < Date.now()));
            if (!isLate) return false;
          } else if (statusTab === 'Under Review') {
            if (
              t.status !== 'Under Review' &&
              t.status !== 'Verified' &&
              t.status !== 'Pending Verification'
            )
              return false;
          } else if (statusTab === 'Assigned') {
            if (t.status !== 'Assigned' && t.status !== 'Accepted') return false;
          } else if (statusTab === 'In Progress') {
            if (t.status !== 'In Progress' && t.status !== 'Work Completed') return false;
          } else if (t.status !== statusTab) {
            return false;
          }
        }

        if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
        if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
        if (wardFilter !== 'ALL' && t.location?.ward !== wardFilter) return false;
        if (zoneFilter !== 'ALL' && t.location?.zone !== zoneFilter) return false;
        if (constituencyFilter !== 'ALL' && t.location?.constituency !== constituencyFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            (t.id || '').toLowerCase().includes(q) ||
            (t.title || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q) ||
            (t.location?.ward || '').toLowerCase().includes(q) ||
            (t.location?.address || '').toLowerCase().includes(q) ||
            (t.assignedOfficer?.name || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const rank = (p?: string) =>
            p === 'P1-Critical' ? 1 : p === 'P2-High' ? 2 : p === 'P3-Medium' ? 3 : 4;
          return rank(a.priority) - rank(b.priority);
        }
        if (sortBy === 'sla') {
          const da = a.slaDeadline ? new Date(a.slaDeadline).getTime() : Infinity;
          const db = b.slaDeadline ? new Date(b.slaDeadline).getTime() : Infinity;
          return da - db;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    scopedComplaints,
    statusTab,
    categoryFilter,
    priorityFilter,
    wardFilter,
    zoneFilter,
    constituencyFilter,
    searchQuery,
    sortBy,
  ]);

  const handleFileUploadToDataUrl = (file: File, onReady: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onReady(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Workflow Action Handlers
  const handleOpenAssignModal = (complaint: Complaint) => {
    setTargetComplaintId(complaint.id);
    setSelectedDept(complaint.department || 'Public Works Department (PWD)');
    setSelectedPriorityVal(complaint.priority || 'P2-High');
    setSelectedStaffId(complaint.assignedOfficer?.id || FIELD_OFFICERS[0]?.id || 'FO-CHN-101');
    setAssignRemarks('Assigned to field engineering unit for site inspection and SLA execution.');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!targetComplaintId) return;
    const chosenOfficer =
      FIELD_OFFICERS.find((o) => o.id === selectedStaffId) || FIELD_OFFICERS[0];
    assignOfficer(targetComplaintId, selectedDept, chosenOfficer, assignRemarks);
    updatePriority(targetComplaintId, selectedPriorityVal);
    setIsAssignModalOpen(false);
  };

  const handleStartInspection = (complaintId: string) => {
    setTargetComplaintId(complaintId);
    setInspectionRemarks(
      'Department Officer scheduled and completed on-site physical inspection. Work plan and materials approved.'
    );
    setIsInspectionModalOpen(true);
  };

  const handleConfirmInspection = () => {
    if (!targetComplaintId) return;
    updateComplaintStatus(
      targetComplaintId,
      'Work Planned',
      `[Inspection Date: ${inspectionDate}] ${inspectionRemarks}`
    );
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

  const handleOpenAfterPhoto = (complaintId: string) => {
    setTargetComplaintId(complaintId);
    setPhotoUrlInput(sampleAfterPhotos[0]);
    setCompletionNotes(
      'Field rectification completed. Site cleared, quality verified, and after-work photographic evidence attached.'
    );
    setIsAfterPhotoModalOpen(true);
  };

  const handleSubmitAfterPhoto = () => {
    if (!photoUrlInput.trim() || !completionNotes.trim() || !targetComplaintId) return;
    workerCompleteTask(targetComplaintId, photoUrlInput.trim(), completionNotes.trim());
    setIsAfterPhotoModalOpen(false);
    setPhotoUrlInput('');
    setCompletionNotes('');
  };

  const activeDetailTask = useMemo(() => {
    if (!selectedTask) return filteredTasks[0] || null;
    return complaints.find((c) => c.id === selectedTask.id) || selectedTask;
  }, [selectedTask, complaints, filteredTasks]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Department Officer Portal Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                  DEPARTMENT OFFICER PORTAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Integrated Field &amp; Departmental Operations
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span>
                  Officer ID: <strong className="text-white">{currentUser.employeeId || 'SC-OFF-204'}</strong>
                </span>
                <span>•</span>
                <span>
                  Primary Wing:{' '}
                  <strong className="text-emerald-300">
                    {currentUser.department || 'Public Works Department (PWD)'}
                  </strong>
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={toggleDutyStatus}
                  className={`px-3 py-1 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm border ${
                    currentUser.dutyStatus === 'OFF_DUTY'
                      ? 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentUser.dutyStatus === 'OFF_DUTY' ? 'bg-slate-400' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  <span>{currentUser.dutyStatus === 'OFF_DUTY' ? 'OFF DUTY' : 'ON DUTY'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Downloadable Departmental Reports Toolbar (Section 6.2) */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between gap-4">
              <span>Official Departmental Reports</span>
              <span className="text-emerald-400 font-mono">Instant HTML / PDF</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  'Department Complaint Summary',
                  'Work Progress Report',
                  'Resolution Report',
                  'Monthly Complaint Report',
                ] as const
              ).map((rep) => (
                <button
                  key={rep}
                  type="button"
                  onClick={() =>
                    downloadDepartmentSummaryReport(
                      filteredTasks,
                      rep,
                      deptScope === 'ALL' ? 'All Municipal Departments' : deptScope
                    )
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/80 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500/50 text-[11px] font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{rep.replace('Department ', '').replace(' Complaint', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 9 Dynamically Calculated KPI Cards (Section 6.1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {[
          { key: 'ALL', label: 'Total Complaints', val: kpis.total, color: 'text-slate-900 dark:text-white border-slate-200 dark:border-slate-800' },
          { key: 'Submitted', label: 'Submitted', val: kpis.submitted, color: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' },
          { key: 'Under Review', label: 'Under Review', val: kpis.underReview, color: 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50' },
          { key: 'Assigned', label: 'Assigned', val: kpis.assigned, color: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' },
          { key: 'Work Planned', label: 'Work Planned', val: kpis.workPlanned, color: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50' },
          { key: 'In Progress', label: 'In Progress', val: kpis.inProgress, color: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50' },
          { key: 'Resolved', label: 'Resolved', val: kpis.resolved, color: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' },
          { key: 'Closed', label: 'Closed', val: kpis.closed, color: 'text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50' },
          { key: 'OVERDUE', label: 'Overdue SLA', val: kpis.overdue, color: 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' },
        ].map((card) => {
          const active = statusTab === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setStatusTab(card.key);
                if (mainNavTab !== 'dashboard' && mainNavTab !== 'complaints') {
                  setMainNavTab('dashboard');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                active
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : `bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 ${card.color}`
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </div>
              <div className={`text-2xl font-black mt-1 ${card.color.split(' ')[0]}`}>{card.val}</div>
            </button>
          );
        })}
      </div>

      {/* Primary Officer Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMainNavTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            mainNavTab === 'dashboard'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Complaint Operations &amp; Field Execution ({filteredTasks.length})</span>
        </button>

        <button
          onClick={() => setMainNavTab('tasks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            mainNavTab === 'tasks'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Field Inspection &amp; Task Schedule</span>
        </button>

        <button
          onClick={() => setMainNavTab('projects')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            mainNavTab === 'projects'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-400" />
          <span>Infrastructure Projects</span>
        </button>

        <button
          onClick={() => setMainNavTab('zones')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            mainNavTab === 'zones'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Zone &amp; Constituency Analytics</span>
        </button>

        <button
          onClick={() => setMainNavTab('gis_map')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            mainNavTab === 'gis_map'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <MapIcon className="w-4 h-4 text-cyan-400" />
          <span>GIS Field Map</span>
        </button>
      </div>

      {/* RENDER TASKS TAB */}
      {mainNavTab === 'tasks' && <OfficerTaskManager />}

      {/* RENDER PROJECTS TAB */}
      {mainNavTab === 'projects' && <InfrastructureProjects />}

      {/* RENDER ZONES TAB */}
      {mainNavTab === 'zones' && <ZoneConstituencyAnalytics />}

      {/* RENDER MAP TAB */}
      {mainNavTab === 'gis_map' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Department Officer GIS Map Workload ({filteredTasks.length} Pins)
            </h3>
            <span className="text-xs text-slate-500">Click any marker to inspect or update complaint</span>
          </div>
          <LeafletMap
            complaints={filteredTasks}
            center={[13.0827, 80.2707]}
            zoom={12}
            height="520px"
            onSelectComplaint={(c) => {
              setSelectedComplaint(c);
              setSelectedTask(c);
            }}
          />
        </div>
      )}

      {/* RENDER DASHBOARD / COMPLAINTS CONTENT */}
      {(mainNavTab === 'dashboard' || mainNavTab === 'complaints') && (
        <div className="space-y-5">
          {/* Comprehensive Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, title, ward, officer..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Department Scope */}
              <select
                value={deptScope}
                onChange={(e) => setDeptScope(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="MY_DEPT">
                  My Assigned Wing: {currentUser.department || 'Department'} ({departmentComplaints.length})
                </option>
                <option value="ALL">All Municipal Departments ({complaints.length})</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="ALL">All Priorities</option>
                <option value="P1-Critical">P1-Critical</option>
                <option value="P2-High">P2-High</option>
                <option value="P3-Medium">P3-Medium</option>
                <option value="P4-Low">P4-Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Ward Filter */}
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="ALL">All Wards</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              {/* Zone Filter */}
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="ALL">All Zones</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>

              {/* Constituency Filter */}
              <select
                value={constituencyFilter}
                onChange={(e) => setConstituencyFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="ALL">All Constituencies</option>
                {CONSTITUENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="priority">Sort: Highest Priority</option>
                  <option value="sla">Sort: Earliest SLA Deadline</option>
                </select>
                {(statusTab !== 'ALL' ||
                  categoryFilter !== 'ALL' ||
                  priorityFilter !== 'ALL' ||
                  wardFilter !== 'ALL' ||
                  zoneFilter !== 'ALL' ||
                  constituencyFilter !== 'ALL' ||
                  deptScope !== 'MY_DEPT' ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusTab('ALL');
                      setCategoryFilter('ALL');
                      setPriorityFilter('ALL');
                      setWardFilter('ALL');
                      setZoneFilter('ALL');
                      setConstituencyFilter('ALL');
                      setDeptScope('MY_DEPT');
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Complaints Feed + Active Detail & Verification Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* Left Column: Complaints Queue */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    No complaints match the current filter
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try resetting the status, ward, zone, or category filters to inspect all departmental complaints.
                  </p>
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isSelected = activeDetailTask?.id === t.id;
                  const isOverdueItem =
                    t.status !== 'Resolved' &&
                    t.status !== 'Closed' &&
                    (t.isOverdue ||
                      t.status === 'Escalated' ||
                      (t.slaDeadline && new Date(t.slaDeadline).getTime() < Date.now()));

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                            {t.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (t.priority || '').includes('P1')
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                : (t.priority || '').includes('P2')
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            }`}
                          >
                            {t.priority || 'P3-Medium'}
                          </span>
                          {isOverdueItem && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : t.status === 'In Progress' || t.status === 'Work Planned'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{t.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {t.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {t.location?.ward || 'Ward Unassigned'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          {t.assignedOfficer?.name || 'Unassigned'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          SLA: {t.slaHours || 24}h
                        </span>
                      </div>

                      {/* Integrated Field & Departmental Action Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAssignModal(t);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Assign Staff</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInspection(t.id);
                          }}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule / Record Inspection</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBeforePhoto(t.id);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Before Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAfterPhoto(t.id);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Upload After Photo &amp; Complete</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOperationalComplaint(t);
                            setIsOperationalModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Full Operational Update</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Active Complaint Dossier, Verification & Report Downloads */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sticky top-20 self-start">
              {activeDetailTask ? (
                <>
                  <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {activeDetailTask.id}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {activeDetailTask.title}
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0">
                      {activeDetailTask.status}
                    </span>
                  </div>

                  {/* Quick Report Downloads for Selected Complaint */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Download / Print Official Dossiers
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => downloadComplaintAcknowledgement(activeDetailTask)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acknowledgement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInspectionReport(activeDetailTask, currentUser.name)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspection Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadComplaintStatusReport(activeDetailTask)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Status Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => printComplaintAcknowledgement(activeDetailTask)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Print / Save PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Controlled Ordered Lifecycle Advancement + Verification Controls */}
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Controlled Lifecycle Progression</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                        Now: {activeDetailTask.status}
                      </span>
                    </div>

                    {/* Next Valid Stage Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {getAllowedNextStatuses(activeDetailTask.status)
                        .filter((st) => st !== activeDetailTask.status)
                        .map((nextSt) => (
                          <button
                            key={nextSt}
                            type="button"
                            onClick={() =>
                              updateComplaintStatus(
                                activeDetailTask.id,
                                nextSt,
                                `Complaint advanced from ${activeDetailTask.status} to ${nextSt} by ${currentUser.name} (${currentUser.department || 'Department Officer'}).`
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Advance → {nextSt}</span>
                          </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60">
                      <button
                        type="button"
                        onClick={() =>
                          officialVerifyComplaint(
                            activeDetailTask.id,
                            'approved',
                            'Department Officer verified field completion and photographic evidence. Approved.'
                          )
                        }
                        className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Resolve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          officialVerifyComplaint(
                            activeDetailTask.id,
                            'rejected',
                            'Rework required on site.',
                            'Incomplete surface finishing — re-inspect and re-upload proof.'
                          )
                        }
                        className="px-2.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject / Rework</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateComplaintStatus(
                            activeDetailTask.id,
                            'Verified',
                            'Resolution verified by Department Officer following site inspection.'
                          )
                        }
                        className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Mark Verified</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateComplaintStatus(
                            activeDetailTask.id,
                            'Closed',
                            'Complaint formally closed and archived after verification.'
                          )
                        }
                        className="px-2.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Close Complaint</span>
                      </button>
                    </div>
                  </div>

                  {/* Evidence Photos */}
                  {activeDetailTask.photos && activeDetailTask.photos.length > 0 ? (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                        Citizen Evidence Photos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {activeDetailTask.photos.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt="Citizen evidence"
                            className="w-full h-28 object-cover rounded-xl border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      No citizen image uploaded with this complaint.
                    </div>
                  )}

                  {/* Resolution Proof Card if uploaded */}
                  {activeDetailTask.workerProof && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Before &amp; After Field Evidence</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {activeDetailTask.workerProof.beforePhoto && (
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 mb-1">Before Work</div>
                            <img
                              src={activeDetailTask.workerProof.beforePhoto}
                              alt="Before repair"
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                          </div>
                        )}
                        {activeDetailTask.workerProof.afterPhoto && (
                          <div>
                            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                              After Repair
                            </div>
                            <img
                              src={activeDetailTask.workerProof.afterPhoto}
                              alt="After repair"
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                          </div>
                        )}
                      </div>

                      {activeDetailTask.workerProof.completionNotes && (
                        <div className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-semibold">Completion Notes: </span>
                          {activeDetailTask.workerProof.completionNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location & Contact Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-slate-800 dark:text-white text-[11px] uppercase tracking-wider mb-1">
                      Location &amp; Citizen Details
                    </div>
                    <div>
                      <strong>Department:</strong> {activeDetailTask.department}
                    </div>
                    <div>
                      <strong>Assigned Staff:</strong> {activeDetailTask.assignedOfficer?.name || 'Pending Assignment'}
                    </div>
                    <div>
                      <strong>Ward:</strong> {activeDetailTask.location?.ward || 'Unassigned'}
                    </div>
                    {activeDetailTask.location?.zone && (
                      <div>
                        <strong>Zone:</strong> {activeDetailTask.location.zone}
                      </div>
                    )}
                    <div>
                      <strong>Address:</strong> {activeDetailTask.location?.address || 'Site address'}
                    </div>
                    <div>
                      <strong>Reported By:</strong> {activeDetailTask.reportedBy?.name || 'Citizen'}
                      {activeDetailTask.reportedBy?.phone && ` (${activeDetailTask.reportedBy.phone})`}
                    </div>
                  </div>

                  {/* Audit Timeline */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                      Status History Timeline ({Array.isArray(activeDetailTask.timeline) ? activeDetailTask.timeline.length : 0})
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {Array.isArray(activeDetailTask.timeline) && activeDetailTask.timeline.length > 0 ? (
                        activeDetailTask.timeline.map((item, i) => (
                          <div
                            key={i}
                            className="text-xs flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {item?.status || 'Update'} — {item?.updatedBy || 'Official'}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {item?.remarks || 'Status logged.'}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item?.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 p-2 bg-slate-50 rounded-xl">
                          Intake logged. Status is {activeDetailTask.status || 'Submitted'}.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">
                    Select any complaint on the left to manage field operations, verify work, or download reports.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operational Process / Update Modal */}
      <OfficerOperationalUpdateModal
        isOpen={isOperationalModalOpen}
        onClose={() => setIsOperationalModalOpen(false)}
        complaint={selectedOperationalComplaint}
      />

      {/* Modal: Assign Staff & Priority */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Assign Complaint to Department Staff</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as MunicipalDepartment)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsible Officer / Field Engineer
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  {FIELD_OFFICERS.map((fo) => (
                    <option key={fo.id} value={fo.id}>
                      {fo.name} — {fo.badgeNumber} ({fo.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <select
                  value={selectedPriorityVal}
                  onChange={(e) => setSelectedPriorityVal(e.target.value as Priority)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <option value="P1-Critical">P1-Critical (Immediate)</option>
                  <option value="P2-High">P2-High (24h SLA)</option>
                  <option value="P3-Medium">P3-Medium (48h SLA)</option>
                  <option value="P4-Low">P4-Low (72h SLA)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dispatch Remarks</label>
                <textarea
                  rows={2}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Schedule / Record Inspection */}
      {isInspectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>Schedule &amp; Record Site Inspection</span>
            </h3>
            <p className="text-xs text-slate-500">
              Record site inspection date and technical observations to transition complaint to Work Planned.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Inspection Date
              </label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Inspection Remarks &amp; Work Plan
              </label>
              <textarea
                rows={3}
                value={inspectionRemarks}
                onChange={(e) => setInspectionRemarks(e.target.value)}
                className="w-full p-3 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsInspectionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInspection}
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs"
              >
                Save Inspection &amp; Mark Work Planned
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Before-Work Photo Proof */}
      {isBeforePhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              <span>Upload Before-Work Evidence Photo</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload photographic proof from your device or paste an image URL before repair work begins.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUploadToDataUrl(file, setPhotoUrlInput);
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Or Image URL
              </label>
              <input
                type="text"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              <img
                src={photoUrlInput}
                alt="Preview"
                className="w-full h-32 object-cover rounded-xl border border-slate-200"
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsBeforePhotoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBeforePhoto}
                disabled={!photoUrlInput.trim()}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                Save Before Photo &amp; Mark In Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: After-Work Photo Proof & Completion */}
      {isAfterPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Upload After-Work Evidence &amp; Complete</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload completed work photographic proof and operational remarks to record resolution.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Completed Work Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUploadToDataUrl(file, setPhotoUrlInput);
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Or Completed Work Photo URL
              </label>
              <input
                type="text"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              <img
                src={photoUrlInput}
                alt="After preview"
                className="w-full h-32 object-cover rounded-xl border border-slate-200"
              />
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Completion Remarks &amp; Material Notes
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Detail the work carried out, materials applied, and safety checks completed..."
                className="w-full p-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAfterPhotoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAfterPhoto}
                disabled={!photoUrlInput.trim() || !completionNotes.trim()}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                Submit Proof &amp; Complete Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
