import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Award,
  ChevronRight,
  Search,
  Download,
  RotateCcw,
  Star,
  Eye,
  LayoutGrid,
  List,
  ArrowUpDown,
  Calendar,
  Printer,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { Complaint } from '../types';
import {
  downloadComplaintAcknowledgement,
  printComplaintAcknowledgement,
  downloadComplaintStatusReport,
} from '../utils/acknowledgementHelper';

interface MyComplaintsProps {
  onTrackComplaint: (complaint: Complaint) => void;
  onNavigateToReport: () => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  onTrackComplaint,
  onNavigateToReport,
}) => {
  const { myComplaints, currentUser } = useCivic();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D' | '90D'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Strict account-specific personal complaints list (filtered by unique citizen ID in CivicContext)
  const baseList = myComplaints;

  // Detailed status counters (Section 7)
  const counts = useMemo(() => {
    const total = baseList.length;
    const submitted = baseList.filter((c) => c.status === 'Submitted').length;
    const underReview = baseList.filter(
      (c) => c.status === 'Under Review' || c.status === 'Pending Verification'
    ).length;
    const assigned = baseList.filter((c) => c.status === 'Assigned' || c.status === 'Accepted').length;
    const planned = baseList.filter((c) => c.status === 'Work Planned').length;
    const inProgress = baseList.filter(
      (c) => c.status === 'In Progress' || c.status === 'Work Completed'
    ).length;
    const resolved = baseList.filter((c) => c.status === 'Resolved' || c.status === 'Verified').length;
    const closed = baseList.filter((c) => c.status === 'Closed').length;
    const reopened = baseList.filter(
      (c) => c.status === 'Reopened' || c.status === 'Escalated'
    ).length;
    return {
      total,
      submitted,
      underReview,
      assigned,
      planned,
      inProgress,
      resolved,
      closed,
      reopened,
    };
  }, [baseList]);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    baseList.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [baseList]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return baseList
      .filter((c) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = c.id?.toLowerCase().includes(q);
          const matchTitle = c.title?.toLowerCase().includes(q);
          const matchDept = c.department?.toLowerCase().includes(q);
          const matchWard = c.location?.ward?.toLowerCase().includes(q);
          const matchDistrict = (c.district || c.location?.city || '').toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchDept && !matchWard && !matchDistrict) return false;
        }

        if (statusFilter !== 'ALL') {
          if (statusFilter === 'Submitted' && c.status !== 'Submitted') return false;
          if (
            statusFilter === 'Under Review' &&
            c.status !== 'Under Review' &&
            c.status !== 'Verified' &&
            c.status !== 'Pending Verification'
          )
            return false;
          if (
            statusFilter === 'Assigned' &&
            c.status !== 'Assigned' &&
            c.status !== 'Accepted'
          )
            return false;
          if (statusFilter === 'Planned' && c.status !== 'Work Planned') return false;
          if (
            statusFilter === 'In Progress' &&
            c.status !== 'In Progress' &&
            c.status !== 'Work Completed'
          )
            return false;
          if (statusFilter === 'Resolved' && c.status !== 'Resolved') return false;
          if (statusFilter === 'Closed' && c.status !== 'Closed') return false;
          if (
            statusFilter === 'Reopened' &&
            c.status !== 'Reopened' &&
            c.status !== 'Escalated'
          )
            return false;
        }

        if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
          return false;
        }

        if (dateFilter !== 'ALL' && c.createdAt) {
          const createdMs = new Date(c.createdAt).getTime();
          const days = dateFilter === '7D' ? 7 : dateFilter === '30D' ? 30 : 90;
          if (now - createdMs > days * 86400 * 1000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'newest' ? tB - tA : tA - tB;
      });
  }, [baseList, searchQuery, statusFilter, categoryFilter, dateFilter, sortOrder]);

  const civicImpactPoints = counts.total * 25 + (counts.resolved + counts.closed) * 50;

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'In Progress':
      case 'Work Completed':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Reopened':
      case 'Escalated':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Assigned':
      case 'Accepted':
      case 'Work Planned':
        return 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Citizen Profile & Grievance Management Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SMART CIVIC PLATFORM · Personal Account History
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Account ID: {currentUser.id}
            </span>
            <span className="text-xs text-slate-400">
              {currentUser.ward || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'ta'
              ? `${currentUser.name} — எனது புகார்கள்`
              : `${currentUser.name} — My Complaints Dashboard`}
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl">
            Monitor all your registered grievances, download official acknowledgement receipts, track 11-stage departmental resolution timelines, file appeals on unsatisfactory closures, and submit citizen satisfaction ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-800/90 px-4 py-3 rounded-2xl border border-slate-700">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Civic Contribution Score
              </div>
              <div className="text-lg font-extrabold text-white">{civicImpactPoints} pts</div>
            </div>
          </div>

          <button
            onClick={onNavigateToReport}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('reportIssue')}</span>
          </button>
        </div>
      </div>

      {/* 9-Stage Status Summary Counters (Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {[
          { key: 'ALL', label: 'Total Complaints', count: counts.total, color: 'text-slate-900 dark:text-white border-slate-200 dark:border-slate-800' },
          { key: 'Submitted', label: t('statusSubmitted'), count: counts.submitted, color: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60' },
          { key: 'Under Review', label: t('statusUnderReview'), count: counts.underReview, color: 'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/60' },
          { key: 'Assigned', label: t('statusAssignedOfficer'), count: counts.assigned, color: 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60' },
          { key: 'Planned', label: t('statusWorkPlanned'), count: counts.planned, color: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60' },
          { key: 'In Progress', label: t('statusInProgress'), count: counts.inProgress, color: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60' },
          { key: 'Resolved', label: t('statusResolved'), count: counts.resolved, color: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60' },
          { key: 'Closed', label: t('statusClosed'), count: counts.closed, color: 'text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/60' },
          { key: 'Reopened', label: t('statusReopened'), count: counts.reopened, color: 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60' },
        ].map((stat) => {
          const isSelected = statusFilter === stat.key;
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => setStatusFilter(stat.key)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30 shadow-xs'
                  : `bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 ${stat.color}`
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 line-clamp-1">
                {stat.label}
              </div>
              <div className={`text-xl font-black mt-1 ${stat.color.split(' ')[0]}`}>
                {stat.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search, Filter & View Mode Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Complaint ID, Title, Ward, or Dept..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="md:col-span-2 relative">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full pl-8 pr-2 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="ALL">All Dates</option>
                <option value="7D">Last 7 Days</option>
                <option value="30D">Last 30 Days</option>
                <option value="90D">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="md:col-span-2 flex items-center justify-end gap-1.5">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs'
                    : 'text-slate-500'
                }`}
                title="Structured Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs'
                    : 'text-slate-500'
                }`}
                title="Card List View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {baseList.length === 0
              ? "No complaints found. You haven't submitted any complaints yet."
              : 'No complaints match the current filter criteria.'}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {baseList.length === 0
              ? 'Your personal complaint history is strictly isolated to your Citizen account. Submit a new civic grievance to track its live resolution.'
              : 'Try clearing your search or status filter, or register a new civic grievance.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {baseList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setDateFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateToReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Raise a New Complaint →
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ================================================================ */
        /* STRUCTURED MY COMPLAINTS TABLE (Section 7)                       */
        /* ================================================================ */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Complaint ID</th>
                  <th className="py-3.5 px-4">Title &amp; District / Ward</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((comp) => {
                  const isResolvedOrClosed =
                    comp.status === 'Resolved' || comp.status === 'Closed';
                  return (
                    <tr
                      key={comp.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 inline-block">
                          {comp.id}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {comp.priority}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {comp.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>
                            {comp.district || comp.location?.city || 'Chennai'} ·{' '}
                            {comp.location?.ward || 'Ward 101'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {comp.category}
                        </span>
                        {comp.subcategory && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {comp.subcategory}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                          {comp.department}
                        </span>
                        {comp.assignedOfficer && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                            Officer: {comp.assignedOfficer.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {comp.createdAt
                          ? new Date(comp.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(
                            comp.status
                          )}`}
                        >
                          {comp.status}
                        </span>
                        {comp.appeals && comp.appeals.length > 0 && (
                          <span className="block text-[10px] text-rose-600 font-bold mt-1">
                            Appeal: {comp.appeals[0].status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {comp.updatedAt
                          ? new Date(comp.updatedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'Recent'}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onTrackComplaint(comp)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                            title="View Details & Live 11-Stage Timeline"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Track / View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadComplaintAcknowledgement(comp)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="Download Official Acknowledgement Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => printComplaintAcknowledgement(comp)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="Print / Save Acknowledgement as PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadComplaintStatusReport(comp)}
                            className="px-2 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] transition inline-flex items-center gap-1"
                            title="Download Complete Status Report & History Timeline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Status Report</span>
                          </button>

                          {isResolvedOrClosed && (
                            <>
                              <button
                                type="button"
                                onClick={() => onTrackComplaint(comp)}
                                className="px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-[10px] transition inline-flex items-center gap-1"
                                title="Appeal or Reopen this Complaint"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Appeal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onTrackComplaint(comp)}
                                className="px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-[10px] transition inline-flex items-center gap-1"
                                title="Rate Resolution & Submit Citizen Feedback"
                              >
                                <Star className="w-3 h-3" />
                                <span>{comp.feedback ? `${comp.feedback.rating}★` : 'Feedback'}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================================================================ */
        /* CARD VIEW                                                        */
        /* ================================================================ */
        <div className="space-y-4">
          {filtered.map((comp) => {
            const isResolvedOrClosed =
              comp.status === 'Resolved' || comp.status === 'Closed';
            return (
              <div
                key={comp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  {comp.photos && comp.photos[0] ? (
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                      <img
                        src={comp.photos[0]}
                        alt={comp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-5 h-5 opacity-60" />
                      <span className="text-[9px] mt-0.5 font-medium">No image</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {comp.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClasses(
                          comp.status
                        )}`}
                      >
                        {comp.status}
                      </span>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                        {comp.priority}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {comp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {comp.district || 'Chennai'} · {comp.location?.ward || 'Unassigned Ward'}
                      </span>
                      <span>
                        • Dept:{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {comp.department || 'Under Review'}
                        </strong>
                      </span>
                      <span>
                        • Submitted:{' '}
                        {comp.createdAt ? new Date(comp.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => downloadComplaintAcknowledgement(comp)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Acknowledgement</span>
                  </button>

                  {isResolvedOrClosed && (
                    <button
                      type="button"
                      onClick={() => onTrackComplaint(comp)}
                      className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Appeal / Feedback</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onTrackComplaint(comp)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                  >
                    <span>Track &amp; View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
