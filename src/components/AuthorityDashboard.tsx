import React, { useState } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  UserCheck,
  FileCheck,
  ShieldCheck,
  Eye,
  Send,
  MessageSquare,
  Sparkles,
  Camera,
  Check,
  ExternalLink,
  Database,
  Activity,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import {
  Complaint,
  ComplaintStatus,
  MunicipalDepartment,
  Priority,
  Severity,
  AssignedOfficer,
} from '../types';
import { ApGovtLogo, VizianagaramCorpLogo } from './Logos';
import { DEPARTMENTS, FIELD_OFFICERS, WARDS } from '../data/seedData';
import { UserDatabaseView } from './UserDatabaseView';
import { WorkerDashboard } from './WorkerDashboard';
import { HigherOfficialDashboard } from './HigherOfficialDashboard';
import { AdminDashboard } from './AdminDashboard';

export const AuthorityDashboard: React.FC = () => {
  const {
    complaints,
    currentUser,
    updateComplaintStatus,
    assignOfficer,
    updatePriority,
    addInternalNote,
    setSelectedComplaint,
    registeredUsers,
  } = useCivic();

  const getDefaultTab = (): 'complaints' | 'worker' | 'higher_official' | 'admin' | 'users' => {
    if (currentUser.role === 'worker') return 'worker';
    if (currentUser.role === 'higher_official') return 'higher_official';
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return 'admin';
    return 'complaints';
  };

  // Dashboard Subtab (Triage, Worker, Higher Official, Admin Governance, User DB)
  const [dashboardTab, setDashboardTab] = useState<'complaints' | 'worker' | 'higher_official' | 'admin' | 'users'>(getDefaultTab());

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>(
    currentUser.role === 'department_officer' && currentUser.department
      ? currentUser.department
      : 'All'
  );
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'upvotes'>('date');

  // Inspection & Assignment Drawer/Modal State
  const [activeModalComplaint, setActiveModalComplaint] = useState<Complaint | null>(null);
  const [selectedDept, setSelectedDept] = useState<MunicipalDepartment>(DEPARTMENTS[0]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(FIELD_OFFICERS[0].id);
  const [assignRemarks, setAssignRemarks] = useState('');

  // Status Change State
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionProof, setResolutionProof] = useState('');

  // Internal Note State
  const [noteText, setNoteText] = useState('');

  // Calculate Authority KPIs
  const totalCount = complaints.length;
  const newCount = complaints.filter((c) => c.status === 'Submitted').length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'Under Review' || c.status === 'Verified'
  ).length;
  const assignedCount = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const reopenedCount = complaints.filter((c) => c.status === 'Reopened').length;
  const criticalCount = complaints.filter((c) => c.priority === 'P1-Critical').length;
  const slaBreachedCount = complaints.filter(
    (c) => c.isOverdue || c.isEscalated || c.status === 'Escalated'
  ).length;

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchDept = departmentFilter === 'All' || c.department === departmentFilter;
    const matchWard = wardFilter === 'All' || c.location.ward === wardFilter;

    return matchSearch && matchStatus && matchPriority && matchDept && matchWard;
  });

  // Sort complaints
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      const pWeights = { 'P1-Critical': 4, 'P2-High': 3, 'P3-Medium': 2, 'P4-Low': 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOpenAssign = (comp: Complaint) => {
    setActiveModalComplaint(comp);
    setSelectedDept(comp.department || DEPARTMENTS[0]);
    const matchedOfficers = FIELD_OFFICERS.filter((o) => o.department === (comp.department || DEPARTMENTS[0]));
    setSelectedOfficerId(matchedOfficers[0]?.id || FIELD_OFFICERS[0].id);
    setNewStatus(comp.status);
    setAssignRemarks('');
    setStatusRemarks('');
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalComplaint) return;
    const officer = FIELD_OFFICERS.find((o) => o.id === selectedOfficerId) || FIELD_OFFICERS[0];
    assignOfficer(activeModalComplaint.id, selectedDept, officer, assignRemarks);
    setActiveModalComplaint(null);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalComplaint) return;
    updateComplaintStatus(
      activeModalComplaint.id,
      newStatus,
      statusRemarks || `Status changed by ${currentUser.name}`,
      resolutionProof || undefined
    );
    setActiveModalComplaint(null);
    setResolutionProof('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalComplaint || !noteText.trim()) return;
    addInternalNote(activeModalComplaint.id, noteText);
    setNoteText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Municipal Credentials */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <VizianagaramCorpLogo className="w-12 h-12 shrink-0 drop-shadow-xs" />
            <ApGovtLogo className="w-11 h-11 shrink-0 drop-shadow-xs hidden sm:block" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                VMC Authority Command & Triage Portal
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              విజయనగరం నగరపాలక సంస్థ • Government of Andhra Pradesh | Signed in:{' '}
              <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
            </p>
          </div>
        </div>

        {currentUser.department && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-blue-800 font-medium shadow-xs">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Active Department:</span>
            <strong>{currentUser.department}</strong>
          </div>
        )}
      </div>

      {/* Subtab Navigation (Grievances vs Field Worker vs High Official vs Admin vs User Database) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setDashboardTab('complaints')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dashboardTab === 'complaints'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Triage & SLAs ({totalCount})</span>
          </button>

          <button
            onClick={() => setDashboardTab('worker')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dashboardTab === 'worker'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50/70 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Field Worker Portal</span>
          </button>

          <button
            onClick={() => setDashboardTab('higher_official')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dashboardTab === 'higher_official'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Higher Official Review</span>
          </button>

          <button
            onClick={() => setDashboardTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dashboardTab === 'admin'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Governance</span>
          </button>

          <button
            onClick={() => setDashboardTab('users')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dashboardTab === 'users'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-purple-50/70 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-600" />
            <span>User DB ({registeredUsers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 px-3 py-1 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{registeredUsers.filter((u) => u.isOnline).length} Online</span>
          </span>
        </div>
      </div>

      {dashboardTab === 'worker' ? (
        <WorkerDashboard />
      ) : dashboardTab === 'higher_official' ? (
        <HigherOfficialDashboard />
      ) : dashboardTab === 'admin' ? (
        <AdminDashboard />
      ) : dashboardTab === 'users' ? (
        <UserDatabaseView
          onSelectComplaint={(comp) => {
            setActiveModalComplaint(comp);
            setDashboardTab('complaints');
          }}
        />
      ) : (
        <>
          {/* KPI Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Total</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{totalCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-blue-600 font-medium">New</span>
          <div className="text-xl font-extrabold text-blue-700 mt-0.5">{newCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-indigo-600 font-medium">Pending</span>
          <div className="text-xl font-extrabold text-indigo-700 mt-0.5">{pendingCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-amber-600 font-medium">Assigned</span>
          <div className="text-xl font-extrabold text-amber-700 mt-0.5">{assignedCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-orange-600 font-medium">In-Progress</span>
          <div className="text-xl font-extrabold text-orange-700 mt-0.5">{inProgressCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-emerald-600 font-medium">Resolved</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{resolvedCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-pink-600 font-medium">Reopened</span>
          <div className="text-xl font-extrabold text-pink-700 mt-0.5">{reopenedCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs bg-rose-50/40">
          <span className="text-[11px] text-rose-600 font-medium">Critical</span>
          <div className="text-xl font-extrabold text-rose-700 mt-0.5">{criticalCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-red-300 shadow-xs bg-red-50/60">
          <span className="text-[11px] text-red-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600" /> Overdue
          </span>
          <div className="text-xl font-extrabold text-red-800 mt-0.5">{slaBreachedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, keyword, citizen name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700"
            >
              <option value="All">All Priorities</option>
              <option value="P1-Critical">P1 - Critical</option>
              <option value="P2-High">P2 - High</option>
              <option value="P3-Medium">P3 - Medium</option>
              <option value="P4-Low">P4 - Low</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="md:col-span-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-medium"
            >
              <option value="date">Sort: Most Recent</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="upvotes">Sort: Most Upvoted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Complaint ID</th>
                <th className="px-4 py-3.5">Issue & Location</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Assigned Officer</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">SLA Deadline</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No complaints match the specified query or filters.
                  </td>
                </tr>
              ) : (
                sorted.map((comp) => {
                  const isOverdue = comp.isOverdue || comp.status === 'Escalated';
                  const activeVisitors = registeredUsers.filter((u) => u.lastVisitedComplaintId === comp.id);
                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {comp.id}
                      </td>

                      {/* Issue */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">{comp.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>📍 {comp.location.ward.split('-')[0]}</span>
                          <span>• {comp.upvotes} upvotes</span>
                        </div>
                        {activeVisitors.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 w-fit animate-in fade-in">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>
                              {activeVisitors.length} visiting: {activeVisitors.map((v) => v.name.split(' ')[0]).join(', ')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Dept */}
                      <td className="px-4 py-3 text-slate-800">
                        {comp.department ? (
                          <span className="font-medium text-[11px]">{comp.department}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Officer */}
                      <td className="px-4 py-3 text-slate-800">
                        {comp.assignedOfficer ? (
                          <div>
                            <div className="font-semibold text-slate-900">{comp.assignedOfficer.name}</div>
                            <div className="text-[10px] text-slate-500">{comp.assignedOfficer.badgeNumber}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                            Action Needed
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                            comp.priority === 'P1-Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : comp.priority === 'P2-High'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {comp.priority}
                        </span>
                      </td>

                      {/* SLA */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
                          <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                            {comp.slaHours}h window
                          </span>
                        </div>
                        {isOverdue && (
                          <span className="text-[9px] font-bold text-red-600 uppercase">SLA Breached</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            comp.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comp.status === 'In Progress'
                              ? 'bg-orange-100 text-orange-800'
                              : comp.status === 'Escalated'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAssign(comp)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          Manage & Assign
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Assignment & Management Modal */}
      {activeModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {activeModalComplaint.id}
                  </span>
                  <span className="text-xs font-bold text-rose-600">
                    {activeModalComplaint.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{activeModalComplaint.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {activeModalComplaint.location.address} • Reported by: {activeModalComplaint.reportedBy.name}
                </p>
              </div>

              <button
                onClick={() => setActiveModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Priority & Officer Assignment Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* Assign Department & Officer */}
              <form onSubmit={handleSaveAssignment} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Assign Field Department & Officer</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      const newDept = e.target.value as MunicipalDepartment;
                      setSelectedDept(newDept);
                      const matched = FIELD_OFFICERS.filter((o) => o.department === newDept);
                      if (matched[0]) setSelectedOfficerId(matched[0].id);
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Field Officer</label>
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {FIELD_OFFICERS.filter((o) => o.department === selectedDept).map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} ({officer.badgeNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dispatch Remarks</label>
                  <input
                    type="text"
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                    placeholder="e.g. Dispatched with road patch truck #4"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Save & Notify Field Officer
                </button>
              </form>

              {/* Status Update & Resolution Proof */}
              <form onSubmit={handleSaveStatus} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Update Operational Lifecycle</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Verified">Verified</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved (Complete)</option>
                    <option value="On Hold">On Hold (Pending Material)</option>
                    <option value="Rejected">Rejected (Out of Municipal Scope)</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Remarks</label>
                  <input
                    type="text"
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="e.g. Asphalt compaction completed; road reopened"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                {newStatus === 'Resolved' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Resolution Proof Photo URL
                    </label>
                    <input
                      type="url"
                      value={resolutionProof}
                      onChange={(e) => setResolutionProof(e.target.value)}
                      placeholder="Paste resolved site photo URL"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Commit Status Update
                </button>
              </form>
            </div>

            {/* Internal Staff Notes */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span>Internal Authority Work Notes (Confidential)</span>
              </h4>

              {/* Previous Notes */}
              <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                {activeModalComplaint.internalNotes && activeModalComplaint.internalNotes.length > 0 ? (
                  activeModalComplaint.internalNotes.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-100 text-xs text-slate-700">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                        <strong>{n.author} ({n.role})</strong>
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{n.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No internal authority notes recorded yet.</p>
                )}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add private municipal field note..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Post Note
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
