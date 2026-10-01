import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Building2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  UserX,
  Sparkles,
  MapPin,
  Eye,
  Info,
  X,
  Copy,
  ChevronRight,
  BarChart3,
  Flame,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { User, AuditLog, Complaint, AIValidity, AIPriority, getRoleDisplayName } from '../types';
import { OfficialInspectionReportModal } from './OfficialInspectionReportModal';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    allUsers,
    approveStaffUser,
    auditLogs,
    complaints,
    setSelectedComplaint,
  } = useCivic();

  const [adminTab, setAdminTab] = useState<'ai_governance' | 'users' | 'audit' | 'complaints'>('ai_governance');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'citizen' | 'worker' | 'higher_official'>('all');
  const [auditSearch, setAuditSearch] = useState('');

  // AI Verification & Smart Routing Filters
  const { t } = useLanguage();
  const [selectedReportComplaint, setSelectedReportComplaint] = useState<Complaint | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [validityFilter, setValidityFilter] = useState<'all' | AIValidity>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | AIPriority>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [inspectComplaint, setInspectComplaint] = useState<Complaint | null>(null);

  // 7 Core Administrative Metrics
  const totalComplaints = complaints.length;
  const validComplaints = complaints.filter(
    (c) => c.aiValidity === 'VALID' || (!c.aiValidity && c.status !== 'Rejected')
  ).length;
  const invalidComplaints = complaints.filter(
    (c) => c.aiValidity === 'INVALID' || c.status === 'Rejected'
  ).length;
  const needsReviewComplaints = complaints.filter(
    (c) => c.aiValidity === 'NEEDS_REVIEW'
  ).length;
  const highPriorityComplaints = complaints.filter(
    (c) =>
      c.aiPriority === 'HIGH' ||
      c.priority === 'P2-High' ||
      c.severity === 'High'
  ).length;
  const criticalPriorityComplaints = complaints.filter(
    (c) =>
      c.aiPriority === 'CRITICAL' ||
      c.priority === 'P1-Critical' ||
      c.severity === 'Critical'
  ).length;
  const duplicateComplaints = complaints.filter(
    (c) => c.duplicateStatus === true || c.duplicateMatchId !== undefined
  ).length;

  // Category Distribution Map
  const categoryCounts = complaints.reduce<Record<string, number>>((acc, c) => {
    const cat = c.aiCategory || c.category || 'Other Civic Issues';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Department Routing Map
  const departmentCounts = complaints.reduce<Record<string, number>>((acc, c) => {
    const dept = c.recommendedDepartment || c.department || 'Municipal Administration';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Filtered AI Complaints Feed
  const filteredAIComplaints = complaints.filter((c) => {
    if (validityFilter !== 'all') {
      const v = c.aiValidity || (c.status === 'Rejected' ? 'INVALID' : 'VALID');
      if (v !== validityFilter) return false;
    }
    if (categoryFilter !== 'all') {
      const cat = (c.aiCategory || c.category || '').toLowerCase();
      if (!cat.includes(categoryFilter.toLowerCase())) return false;
    }
    if (priorityFilter !== 'all') {
      const p =
        c.aiPriority ||
        (c.priority?.includes('P1') || c.severity === 'Critical'
          ? 'CRITICAL'
          : c.priority?.includes('P2') || c.severity === 'High'
          ? 'HIGH'
          : 'MEDIUM');
      if (p !== priorityFilter) return false;
    }
    if (departmentFilter !== 'all') {
      const d = (c.recommendedDepartment || c.department || '').toLowerCase();
      if (!d.includes(departmentFilter.toLowerCase())) return false;
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }
    if (complaintSearch.trim()) {
      const q = complaintSearch.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.location?.address && c.location.address.toLowerCase().includes(q)) ||
        (c.location?.ward && c.location.ward.toLowerCase().includes(q)) ||
        (c.aiReason && c.aiReason.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtering users
  const filteredUsers = allUsers.filter((u) => {
    if (userRoleFilter === 'all') return true;
    return u.role === userRoleFilter;
  });

  const pendingApprovals = allUsers.filter((u) => u.approvalStatus === 'pending');

  // Filtering audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.complaintId && log.complaintId.toLowerCase().includes(q)) ||
      log.details.toLowerCase().includes(q)
    );
  });

  // Export audit logs as CSV
  const handleExportAuditCSV = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'User', 'Role', 'Complaint ID', 'Details'];
    const rows = auditLogs.map((log) => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.action,
      `"${log.userName}"`,
      log.userRole,
      log.complaintId || 'N/A',
      `"${log.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `City Corp_Smart Civic_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Municipal Commissioner
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">
                Staff ID: <span className="font-mono text-indigo-200">City Corp-ADM-001</span> • Smart City Municipal Corporation (City Corp)
              </p>
              <div className="text-xs text-slate-400 mt-1">
                Full Municipal Governance, Audit Surveillance, and Staff Access Control
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center border border-white/10">
              <div className="text-xs text-slate-300">Pending Staff Approvals</div>
              <div className="text-2xl font-bold text-amber-400">{pendingApprovals.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center border border-white/10">
              <div className="text-xs text-slate-300">Audit Events</div>
              <div className="text-2xl font-bold text-indigo-300">{auditLogs.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setAdminTab('ai_governance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'ai_governance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-300" />
          <span>AI Verification & Smart Routing</span>
          <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Staff Approvals</span>
          {pendingApprovals.length > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Chronological Audit Trail</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('complaints')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'complaints'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Citywide Complaints ({complaints.length})</span>
        </button>
      </div>

      {/* Tab 0: AI Verification & Smart Routing Dashboard */}
      {adminTab === 'ai_governance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Metrics: 7 Core Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Total Complaints */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalComplaints}</div>
              <div className="text-[10px] text-slate-400 mt-1">Logged grievances</div>
            </div>

            {/* Valid Complaints */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs bg-gradient-to-b from-emerald-50/30 to-white">
              <div className="flex items-center justify-between text-emerald-700 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Valid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{validComplaints}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">
                {totalComplaints > 0 ? Math.round((validComplaints / totalComplaints) * 100) : 0}% genuine civic
              </div>
            </div>

            {/* Invalid Complaints */}
            <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-xs bg-gradient-to-b from-rose-50/30 to-white">
              <div className="flex items-center justify-between text-rose-700 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Invalid</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700">{invalidComplaints}</div>
              <div className="text-[10px] text-rose-600 font-medium mt-1">Non-civic / filtered</div>
            </div>

            {/* Needs Review */}
            <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs bg-gradient-to-b from-amber-50/30 to-white">
              <div className="flex items-center justify-between text-amber-800 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Review</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">{needsReviewComplaints}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">Needs verification</div>
            </div>

            {/* High Priority */}
            <div className="bg-white rounded-2xl p-4 border border-orange-200/80 shadow-xs bg-gradient-to-b from-orange-50/30 to-white">
              <div className="flex items-center justify-between text-orange-700 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">High</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-700">{highPriorityComplaints}</div>
              <div className="text-[10px] text-orange-600 font-medium mt-1">Accelerated SLA</div>
            </div>

            {/* Critical Priority */}
            <div className="bg-white rounded-2xl p-4 border border-red-300 shadow-xs bg-gradient-to-b from-red-50/40 to-white">
              <div className="flex items-center justify-between text-red-700 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Critical</span>
                <Flame className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-black text-red-700">{criticalPriorityComplaints}</div>
              <div className="text-[10px] text-red-600 font-bold mt-1">Immediate dispatch</div>
            </div>

            {/* Duplicate Complaints */}
            <div className="bg-white rounded-2xl p-4 border border-purple-200/80 shadow-xs bg-gradient-to-b from-purple-50/30 to-white">
              <div className="flex items-center justify-between text-purple-700 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Duplicates</span>
                <Copy className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700">{duplicateComplaints}</div>
              <div className="text-[10px] text-purple-600 font-medium mt-1">Clustered reports</div>
            </div>
          </div>

          {/* Analytical Distribution Grids: Category Distribution & Smart Department Routing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Category Distribution</h3>
                    <p className="text-[11px] text-slate-500">Autonomous civic domain classification across Smart City</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {Object.keys(categoryCounts).length} Categories
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => (Number(b) || 0) - (Number(a) || 0))
                  .map(([cat, countVal]) => {
                    const count = Number(countVal) || 0;
                    const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                            {cat}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Department Smart Routing Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Department Routing Distribution</h3>
                    <p className="text-[11px] text-slate-500">Targeted municipal dispatch based on AI smart routing</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {Object.keys(departmentCounts).length} Departments
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {Object.entries(departmentCounts)
                  .sort(([, a], [, b]) => (Number(b) || 0) - (Number(a) || 0))
                  .map(([dept, countVal]) => {
                    const count = Number(countVal) || 0;
                    const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                            {dept}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Filtering Controls Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Filter AI Verification Registry</h3>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{filteredAIComplaints.length}</strong> of {complaints.length} grievances
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* Search Bar */}
              <div className="lg:col-span-2 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Search ID, title, ward, keyword..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Validity Filter */}
              <div>
                <select
                  value={validityFilter}
                  onChange={(e) => setValidityFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="all">All Validity</option>
                  <option value="VALID">Valid Civic Issues</option>
                  <option value="INVALID">Invalid / Non-Civic</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="CRITICAL">Critical (Immediate)</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="all">All Departments</option>
                  <option value="roads">Roads Department</option>
                  <option value="health">Public Health & Sanitation</option>
                  <option value="water">Water Works Department</option>
                  <option value="drainage">Drainage & Sewerage</option>
                  <option value="electric">Electrical Department</option>
                  <option value="administration">Municipal Administration</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {(validityFilter !== 'all' || priorityFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || complaintSearch) && (
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setValidityFilter('all');
                    setPriorityFilter('all');
                    setDepartmentFilter('all');
                    setStatusFilter('all');
                    setComplaintSearch('');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear all active filters
                </button>
              </div>
            )}
          </div>

          {/* Detailed Table with AI Verification Results */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket & Date</th>
                    <th className="py-3 px-3">AI Validity</th>
                    <th className="py-3 px-3">AI Category / Subcategory</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Location & Status</th>
                    <th className="py-3 px-3">Smart Routing Dept</th>
                    <th className="py-3 px-3">Duplicate Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredAIComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6 text-slate-300" />
                          <span>No complaints found matching the active filter criteria.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAIComplaints.map((c) => {
                      const validity = c.aiValidity || (c.status === 'Rejected' ? 'INVALID' : 'VALID');
                      const priority = c.aiPriority || (c.priority?.includes('P1') || c.severity === 'Critical' ? 'CRITICAL' : c.priority?.includes('P2') || c.severity === 'High' ? 'HIGH' : 'MEDIUM');
                      const confidence = c.aiConfidence || 92;
                      const locationStatus = c.locationStatus || (c.location?.address ? 'PROVIDED' : 'MISSING');
                      const isDuplicate = c.duplicateStatus === true || c.duplicateMatchId !== undefined;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Ticket & Date */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs font-bold text-slate-900">
                              #{c.id.slice(-6)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-800 line-clamp-1 max-w-[180px] mt-0.5">
                              {c.title}
                            </div>
                          </td>

                          {/* AI Validity */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                validity === 'VALID'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : validity === 'INVALID'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {validity === 'VALID' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : validity === 'INVALID' ? (
                                <XCircle className="w-3 h-3 text-rose-600" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              )}
                              <span>{validity}</span>
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {confidence}% confidence
                            </div>
                          </td>

                          {/* Category & Subcategory */}
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900 line-clamp-1 max-w-[160px]">
                              {c.aiCategory || c.category}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[160px]">
                              {c.aiSubcategory || 'General Civic Issue'}
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                priority === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                  : priority === 'HIGH'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                  : priority === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {priority === 'CRITICAL' && <Flame className="w-3 h-3 text-red-600" />}
                              <span>{priority}</span>
                            </span>
                          </td>

                          {/* Location & Status */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1 text-slate-800 font-medium line-clamp-1 max-w-[180px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{c.location?.address || 'No landmark specified'}</span>
                            </div>
                            <div className="mt-0.5">
                              {locationStatus === 'PROVIDED' ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                  Provided
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                  ⚠️ Missing
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 ml-1.5">
                                Ward: {c.location?.ward || 'Unassigned'}
                              </span>
                            </div>
                          </td>

                          {/* Smart Routing Dept */}
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800 line-clamp-1 max-w-[160px]">
                              {c.recommendedDepartment || c.department || 'Requires Review'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Status: <span className="font-medium text-slate-600">{c.status}</span>
                            </div>
                          </td>

                          {/* Duplicate Status */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {isDuplicate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                <Copy className="w-3 h-3 text-purple-600" />
                                <span>Duplicate</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Unique
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectComplaint(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect AI</span>
                              </button>
                              <button
                                onClick={() => setSelectedComplaint(c)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                              >
                                Timeline
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Complaint Inspection Modal */}
      {inspectComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Verification Dossier</h3>
                  <p className="text-xs text-slate-500 font-mono">Ticket #{inspectComplaint.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">{inspectComplaint.title}</div>
              <div className="text-xs text-slate-600">{inspectComplaint.description}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t mt-2">
                <span>📍 {inspectComplaint.location?.address || 'No address'}</span>
                <span>•</span>
                <span>Ward {inspectComplaint.location?.ward || 'Unassigned'}</span>
              </div>
            </div>

            {/* AI Verdict Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Validity</div>
                <div className={`text-xs font-black mt-0.5 ${
                  inspectComplaint.aiValidity === 'VALID' ? 'text-emerald-700' :
                  inspectComplaint.aiValidity === 'INVALID' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {inspectComplaint.aiValidity || 'VALID'}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Confidence</div>
                <div className="text-xs font-black text-indigo-700 mt-0.5">
                  {inspectComplaint.aiConfidence || 94}%
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Priority</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">
                  {inspectComplaint.aiPriority || inspectComplaint.priority}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Location</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">
                  {inspectComplaint.locationStatus || 'PROVIDED'}
                </div>
              </div>
            </div>

            {/* AI Rationale & Explanation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Verification Rationale:</label>
              <div className="text-xs text-slate-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 leading-relaxed">
                {inspectComplaint.aiReason || 'This grievance has been evaluated as an actionable civic service request in Smart City.'}
              </div>
            </div>

            {/* Recommended Department & Action */}
            <div className="space-y-2">
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 space-y-1">
                <div className="text-[11px] font-bold text-emerald-900 uppercase">
                  Smart Municipal Routing:
                </div>
                <div className="text-xs font-bold text-emerald-950">
                  {inspectComplaint.recommendedDepartment || inspectComplaint.department}
                </div>
                {inspectComplaint.recommendedAction && (
                  <div className="text-xs text-emerald-800 pt-1">
                    <strong>Recommended Action:</strong> {inspectComplaint.recommendedAction}
                  </div>
                )}
              </div>
            </div>

            {/* Duplicate Flagging Details */}
            {inspectComplaint.duplicateStatus && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-purple-700" />
                  <span>Duplicate Issue Detected</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  {inspectComplaint.duplicateSummary || `Matched existing active complaint #${inspectComplaint.duplicateMatchId} in this ward.`}
                </p>
              </div>
            )}

            {/* Legal Advisory Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Official Advisory:</strong> Smart Civic AI operates strictly as an automated administrative support tool for Smart City Municipal Corporation (City Corp). It does not hold statutory authority; all work orders require field officer verification.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setInspectComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = inspectComplaint;
                  setInspectComplaint(null);
                  setSelectedComplaint(target);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                View Full Ticket Lifecycle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: User & Staff Approvals */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Municipal User & Staff Directory</h2>
                <p className="text-xs text-slate-500">
                  Manage role permissions and verify municipal staff credentials for operational portals.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'worker', 'higher_official', 'citizen'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      userRoleFilter === r
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'all' ? 'All' : getRoleDisplayName(r)}
                  </button>
                ))}
              </div>
            </div>

            {/* User Cards Grid */}
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isPending = user.approvalStatus === 'pending';
                return (
                  <div key={user.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'higher_official'
                                ? 'bg-indigo-100 text-indigo-700'
                                : user.role === 'worker'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {getRoleDisplayName(user.role)}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isPending ? 'Pending Approval' : 'Approved Active'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>{user.email}</span>
                          <span>•</span>
                          <span>{user.phone || 'Phone: N/A'}</span>
                          {user.employeeId && (
                            <>
                              <span>•</span>
                              <span className="font-mono font-semibold text-slate-700">
                                ID: {user.employeeId}
                              </span>
                            </>
                          )}
                          {user.department && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600">{user.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <button
                          onClick={() => approveStaffUser(user.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          Approve Staff Access
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chronological Audit Trail */}
      {adminTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Tamper-Evident Municipal Audit Trail
                </h2>
                <p className="text-xs text-slate-500">
                  Chronological record of all state transitions, dispatch assignments, and verification decisions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-8 pr-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleExportAuditCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Action Type</th>
                    <th className="pb-3">User & Role</th>
                    <th className="pb-3">Complaint</th>
                    <th className="pb-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 font-semibold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {log.userRole}
                        </div>
                      </td>
                      <td className="py-3 font-mono font-bold text-indigo-600">
                        {log.complaintId ? (
                          <button
                            onClick={() => {
                              const c = complaints.find((x) => x.id === log.complaintId);
                              if (c) setSelectedComplaint(c);
                            }}
                            className="hover:underline"
                          >
                            {log.complaintId}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 max-w-md">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Citywide Complaints */}
      {adminTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Citywide Real-Time Grievance Feed</h2>
            <p className="text-xs text-slate-500">
              Live monitoring of all citizen issues across all departments and wards.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.priority === 'P1-Critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{c.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{c.location.address}</span>
                    <span>•</span>
                    <span>Ward: {c.location.ward}</span>
                    <span>•</span>
                    <span>Dept: {c.department}</span>
                    {c.photoAnalysis && (
                      <>
                        <span>•</span>
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                            c.photoAnalysis.verdict === 'GENUINE_EVIDENCE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : c.photoAnalysis.verdict === 'AI_GENERATED_DETECTED'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          Photo: {c.photoAnalysis.verdict.replace(/_/g, ' ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReportComplaint(c);
                      setIsReportModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Inspection Dossier</span>
                  </button>

                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    View Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Municipal Inspection Report Modal */}
      {selectedReportComplaint && (
        <OfficialInspectionReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReportComplaint(null);
          }}
          complaint={selectedReportComplaint}
        />
      )}
    </div>
  );
};
