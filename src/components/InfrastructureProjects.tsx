import React, { useEffect, useMemo, useState } from 'react';
import {
  HardHat,
  PlusCircle,
  Search,
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  CircleDashed,
  Gauge,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { LeafletMap } from './LeafletMap';
import {
  Complaint,
  InfrastructureProject,
  InfrastructureProjectInput,
  InfrastructureProjectStatus,
  InfrastructureProjectType,
  MunicipalDepartment,
} from '../types';
import { DEPARTMENTS, WARDS } from '../data/seedData';

const PROJECT_TYPES: InfrastructureProjectType[] = [
  'Road',
  'Drainage',
  'Streetlight',
  'Park',
  'Bus Stop',
  'School',
  'Public Building',
];

const PROJECT_STATUSES: InfrastructureProjectStatus[] = [
  'Planned',
  'In Progress',
  'Delayed',
  'Completed',
];

const DEFAULT_LAT = 18.1124;
const DEFAULT_LNG = 83.3978;

const emptyForm = (): InfrastructureProjectInput => ({
  name: '',
  type: 'Road',
  department: DEPARTMENTS[1],
  contractor: '',
  location: '',
  ward: WARDS[0],
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  budget: 0,
  startDate: '',
  expectedCompletionDate: '',
  progressPercent: 0,
  status: 'Planned',
  description: '',
});

const statusClass = (status: InfrastructureProjectStatus) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'In Progress':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Delayed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
};

const formatBudget = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

const formatDate = (isoDate: string) => {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getProjectRelatedComplaints = (project: InfrastructureProject, complaints: Complaint[]) => {
  const exactMatches = complaints.filter((complaint) => complaint.projectId === project.id);
  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const projectNameTokens = project.name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3);

  const normalizedProjectLocation = project.location.toLowerCase();
  const filteredByWard = complaints.filter((complaint) => complaint.location.ward === project.ward);

  return filteredByWard.filter((complaint) => {
    const text = `${complaint.title} ${complaint.description} ${complaint.location.address} ${complaint.location.landmark ?? ''} ${complaint.category} ${complaint.department ?? ''}`.toLowerCase();
    const typeSignals: Record<string, string[]> = {
      Road: ['road', 'pothole', 'asphalt', 'carriageway', 'lane'],
      Drainage: ['drain', 'storm', 'sewer', 'water overflow', 'clogged'],
      Streetlight: ['streetlight', 'lamp', 'light', 'electricity', 'pole'],
      Park: ['park', 'garden', 'pathway', 'tree', 'play'],
      'Bus Stop': ['bus', 'shelter', 'stop', 'transit'],
      School: ['school', 'classroom', 'education', 'campus'],
      'Public Building': ['building', 'office', 'citizen centre', 'facility'],
    };

    const relatedByType = (typeSignals[project.type] ?? []).some((signal) => text.includes(signal));
    const relatedByKeywords = projectNameTokens.some((token) => text.includes(token));
    const relatedByLocation = normalizedProjectLocation.includes('road') || text.includes('road') ? text.includes('road') : false;

    return (
      complaint.department === project.department ||
      relatedByType ||
      relatedByKeywords ||
      relatedByLocation
    );
  });
};

const getProjectHealthState = (project: InfrastructureProject, relatedComplaints: Complaint[]) => {
  const unresolved = relatedComplaints.filter(
    (complaint) => !['Resolved', 'Closed', 'Rejected'].includes(complaint.status)
  ).length;
  const overdue = new Date(project.expectedCompletionDate).getTime() < Date.now() && project.status !== 'Completed';

  let score = 100;
  if (project.status === 'Delayed') score -= 28;
  if (project.status === 'Planned') score -= 10;
  if (project.status === 'In Progress' && project.progressPercent < 40) score -= 12;
  if (project.progressPercent < 35) score -= 18;
  if (overdue) score -= 20;
  if (unresolved >= 3) score -= 22;
  if (unresolved >= 1) score -= 8;

  score = Math.max(0, Math.min(100, score));

  if (score >= 80) {
    return { label: 'Healthy', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (score >= 60) {
    return { label: 'Monitor', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (score >= 40) {
    return { label: 'At Risk', tone: 'bg-orange-50 text-orange-700 border-orange-200' };
  }
  return { label: 'Critical', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
};

const getProjectInsights = (project: InfrastructureProject, relatedComplaints: Complaint[]) => {
  const insights: string[] = [];
  const unresolved = relatedComplaints.filter(
    (complaint) => !['Resolved', 'Closed', 'Rejected'].includes(complaint.status)
  );
  const inProgress = relatedComplaints.filter((complaint) => complaint.status === 'In Progress').length;

  if (relatedComplaints.length >= 2) {
    insights.push('Multiple complaints reported near this project.');
  }
  if (project.status === 'Delayed' && unresolved.length > 0) {
    insights.push('Project is delayed and has unresolved complaints.');
  }
  if (project.progressPercent < 50 && new Date(project.expectedCompletionDate).getTime() < Date.now()) {
    insights.push('Project progress is low compared with its expected completion.');
  }
  if (inProgress > 0) {
    insights.push('Field activity is active and the project is still being worked on.');
  }
  if (unresolved.length === 0 && relatedComplaints.length > 0) {
    insights.push('No major unresolved complaints currently associated.');
  }
  if (insights.length === 0) {
    insights.push('Project monitoring is stable with no immediate issue flags.');
  }

  return insights.slice(0, 3);
};

interface InfrastructureProjectsProps {
  onOpenComplaint?: (complaint: Complaint) => void;
}

export const InfrastructureProjects: React.FC<InfrastructureProjectsProps> = ({ onOpenComplaint }) => {
  const {
    currentUser,
    complaints,
    infrastructureProjects,
    selectedProject,
    setSelectedProject,
    createInfrastructureProject,
    updateInfrastructureProject,
  } = useCivic();

  const isStaff = currentUser.role !== 'citizen';
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InfrastructureProjectInput>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'progress' | 'budget' | 'completion'>('default');

  useEffect(() => {
    if (selectedProject && view !== 'form') {
      setView('details');
    }
  }, [selectedProject?.id, view]);

  const total = infrastructureProjects.length;
  const plannedCount = infrastructureProjects.filter((p) => p.status === 'Planned').length;
  const activeCount = infrastructureProjects.filter((p) => p.status === 'In Progress').length;
  const delayedCount = infrastructureProjects.filter((p) => p.status === 'Delayed').length;
  const completedCount = infrastructureProjects.filter((p) => p.status === 'Completed').length;
  const overallProgress =
    total > 0
      ? Math.round(
          infrastructureProjects.reduce((sum, p) => sum + (p.progressPercent || 0), 0) / total
        )
      : 0;
  const totalAllocatedBudget = infrastructureProjects.reduce((sum, p) => sum + p.budget, 0);

  const projectSummary = useMemo(() => {
    return infrastructureProjects.map((project) => {
      const relatedComplaints = getProjectRelatedComplaints(project, complaints);
      const unresolved = relatedComplaints.filter(
        (complaint) => !['Resolved', 'Closed', 'Rejected'].includes(complaint.status)
      ).length;
      const highActivity = relatedComplaints.length >= 2 || unresolved >= 2;
      const health = getProjectHealthState(project, relatedComplaints);
      const insights = getProjectInsights(project, relatedComplaints);
      return { project, relatedComplaints, unresolved, highActivity, health, insights };
    });
  }, [complaints, infrastructureProjects]);

  const projectDashboardSummary = useMemo(() => {
    const projectsWithUnresolvedComplaints = projectSummary.filter((entry) => entry.unresolved > 0).length;
    const delayedProjects = projectSummary.filter((entry) => entry.project.status === 'Delayed').length;
    const projectsWithHighComplaintActivity = projectSummary.filter((entry) => entry.highActivity).length;

    return {
      projectsWithUnresolvedComplaints,
      delayedProjects,
      projectsWithHighComplaintActivity,
    };
  }, [projectSummary]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const sorted = [...infrastructureProjects].filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchType = typeFilter === 'All' || p.type === typeFilter;
      const matchDepartment = departmentFilter === 'All' || p.department === departmentFilter;
      const matchWard = wardFilter === 'All' || p.ward === wardFilter;
      return matchSearch && matchStatus && matchType && matchDepartment && matchWard;
    });

    switch (sortBy) {
      case 'progress':
        return sorted.sort((a, b) => b.progressPercent - a.progressPercent);
      case 'budget':
        return sorted.sort((a, b) => b.budget - a.budget);
      case 'completion':
        return sorted.sort(
          (a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime()
        );
      default:
        return sorted;
    }
  }, [departmentFilter, infrastructureProjects, searchTerm, sortBy, statusFilter, typeFilter, wardFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setSelectedProject(null);
    setView('form');
  };

  const openEdit = (project: InfrastructureProject) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      type: project.type,
      department: project.department,
      contractor: project.contractor,
      location: project.location,
      ward: project.ward,
      lat: project.lat,
      lng: project.lng,
      budget: project.budget,
      startDate: project.startDate,
      expectedCompletionDate: project.expectedCompletionDate,
      progressPercent: project.progressPercent,
      status: project.status,
      description: project.description,
    });
    setErrors({});
    setSelectedProject(project);
    setView('form');
  };

  const openDetails = (project: InfrastructureProject) => {
    setSelectedProject(project);
    setView('details');
  };

  const validate = (data: InfrastructureProjectInput): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!data.name.trim()) next.name = 'Project name is required.';
    if (!data.contractor.trim()) next.contractor = 'Contractor is required.';
    if (!data.location.trim()) next.location = 'Location is required.';
    if (!data.ward) next.ward = 'Ward / area is required.';
    if (!data.department) next.department = 'Department is required.';
    if (!data.type) next.type = 'Project type is required.';
    if (!data.status) next.status = 'Status is required.';
    if (!data.description.trim()) next.description = 'Description is required.';
    if (!data.startDate) next.startDate = 'Start date is required.';
    if (!data.expectedCompletionDate) next.expectedCompletionDate = 'Expected completion date is required.';
    if (data.startDate && data.expectedCompletionDate && data.expectedCompletionDate < data.startDate) {
      next.expectedCompletionDate = 'Completion date cannot be earlier than the start date.';
    }
    if (!(data.budget > 0)) next.budget = 'Budget must be greater than zero.';
    if (Number.isNaN(data.progressPercent) || data.progressPercent < 0 || data.progressPercent > 100) {
      next.progressPercent = 'Progress must be between 0 and 100.';
    }
    if (!data.lat || !data.lng) next.locationMap = 'Pin the project location on the map.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateInfrastructureProject(editingId, form);
      } else {
        await createInfrastructureProject(form);
      }
      setView('details');
    } finally {
      setSaving(false);
    }
  };

  const activeProject =
    selectedProject ||
    (editingId ? infrastructureProjects.find((p) => p.id === editingId) : null) ||
    null;

  const activeProjectRelatedComplaints = activeProject
    ? getProjectRelatedComplaints(activeProject, complaints)
    : [];
  const activeProjectResolvedComplaints = activeProjectRelatedComplaints.filter((complaint) =>
    ['Resolved', 'Closed', 'Rejected'].includes(complaint.status)
  ).length;
  const activeProjectOpenComplaints = activeProjectRelatedComplaints.filter(
    (complaint) => !['Resolved', 'Closed', 'Rejected'].includes(complaint.status)
  ).length;
  const activeProjectInProgressComplaints = activeProjectRelatedComplaints.filter(
    (complaint) => complaint.status === 'In Progress'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {view === 'list' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                  <HardHat className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Infrastructure Project Monitoring
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Track municipal capital works, contractors, budgets and on-ground progress.
              </p>
            </div>
            {isStaff && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Project
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
            <MetricCard label="Total Projects" value={String(total)} icon={<Layers className="w-4 h-4 text-slate-400" />} />
            <MetricCard label="Planned" value={String(plannedCount)} icon={<CircleDashed className="w-4 h-4 text-indigo-500" />} />
            <MetricCard label="In Progress" value={String(activeCount)} icon={<Clock className="w-4 h-4 text-orange-500" />} />
            <MetricCard label="Delayed" value={String(delayedCount)} icon={<AlertTriangle className="w-4 h-4 text-rose-500" />} />
            <MetricCard label="Completed" value={String(completedCount)} icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} />
            <MetricCard label="Avg Progress" value={`${overallProgress}%`} icon={<TrendingUp className="w-4 h-4 text-teal-600" />} />
            <MetricCard label="Budget" value={formatBudget(totalAllocatedBudget)} icon={<IndianRupee className="w-4 h-4 text-slate-500" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Projects with unresolved complaints</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{projectDashboardSummary.projectsWithUnresolvedComplaints}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Projects marked delayed</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{projectDashboardSummary.delayedProjects}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">High complaint activity</span>
                <Gauge className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{projectDashboardSummary.projectsWithHighComplaintActivity}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ID, name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="All">All Types</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="All">All Statuses</option>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'progress' | 'budget' | 'completion')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="default">Sort: Default</option>
                <option value="progress">Sort: Progress</option>
                <option value="budget">Sort: Budget</option>
                <option value="completion">Sort: Expected Completion</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
                No infrastructure projects match the current filters.
              </div>
            ) : (
              filtered.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openDetails(project)}
                  className="w-full text-left bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-slate-500">{project.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass(project.status)}`}>
                          {project.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {project.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getProjectHealthState(project, getProjectRelatedComplaints(project, complaints)).tone}`}>
                          {getProjectHealthState(project, getProjectRelatedComplaints(project, complaints)).label}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{project.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {project.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.ward.split('-')[0]}
                        </span>
                        <span>{project.contractor}</span>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0 space-y-1">
                      <div className="text-sm font-extrabold text-slate-900">{formatBudget(project.budget)}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatDate(project.startDate)} → {formatDate(project.expectedCompletionDate)}
                      </div>
                      <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-auto">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${project.progressPercent}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-teal-700">{project.progressPercent}% complete</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {view === 'details' && activeProject && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => {
                setView('list');
                setSelectedProject(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to projects
            </button>
            {isStaff && (
              <button
                onClick={() => openEdit(activeProject)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Project
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-slate-500">{activeProject.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass(activeProject.status)}`}>
                {activeProject.status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                {activeProject.type}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{activeProject.name}</h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeProject.description}</p>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span className="font-bold text-teal-700">{activeProject.progressPercent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${activeProject.progressPercent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusClass(activeProject.status)}`}>
                  {activeProject.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getProjectHealthState(activeProject, activeProjectRelatedComplaints).tone}`}>
                  {getProjectHealthState(activeProject, activeProjectRelatedComplaints).label} health
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Related Complaints</div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">{activeProjectRelatedComplaints.length}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Open</div>
                <div className="mt-1 text-xl font-extrabold text-amber-600">{activeProjectOpenComplaints}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In Progress</div>
                <div className="mt-1 text-xl font-extrabold text-orange-600">{activeProjectInProgressComplaints}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resolved</div>
                <div className="mt-1 text-xl font-extrabold text-emerald-600">{activeProjectResolvedComplaints}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                <h2 className="text-sm font-bold text-slate-900">Smart Project Insights</h2>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {getProjectInsights(activeProject, activeProjectRelatedComplaints).map((insight) => (
                  <li key={insight} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-teal-600 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 text-sm">
              <DetailItem label="Department" value={activeProject.department} />
              <DetailItem label="Contractor" value={activeProject.contractor} />
              <DetailItem label="Ward / Area" value={activeProject.ward} />
              <DetailItem label="Location" value={activeProject.location} />
              <DetailItem label="Budget" value={formatBudget(activeProject.budget)} />
              <DetailItem label="Start Date" value={formatDate(activeProject.startDate)} />
              <DetailItem label="Expected Completion" value={formatDate(activeProject.expectedCompletionDate)} />
              <DetailItem
                label="Coordinates"
                value={`${activeProject.lat.toFixed(5)}, ${activeProject.lng.toFixed(5)}`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-700" />
              Related Complaints
            </h2>
            {activeProjectRelatedComplaints.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                No related complaints are linked to this project in the current demo data.
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjectRelatedComplaints.map((complaint) => (
                  <button
                    key={complaint.id}
                    type="button"
                    onClick={() => onOpenComplaint?.(complaint)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-white p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{complaint.id}</div>
                        <div className="mt-1 font-semibold text-slate-900 text-sm">{complaint.title}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass(complaint.status === 'In Progress' ? 'In Progress' : complaint.status === 'Resolved' ? 'Completed' : 'Planned')}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">{complaint.priority}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">{complaint.category}</span>
                      <span>{complaint.location.ward}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Reported {formatDate(complaint.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-700" />
              Project location
            </h2>
            <LeafletMap
              height="320px"
              center={[activeProject.lat, activeProject.lng]}
              zoom={15}
              infrastructureProjects={[activeProject]}
            />
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="space-y-5">
          <button
            onClick={() => {
              setView(editingId ? 'details' : 'list');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              {editingId ? 'Edit Infrastructure Project' : 'Add Infrastructure Project'}
            </h1>
            {editingId && (
              <p className="text-xs font-mono text-slate-500">Project ID: {editingId}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project Name" error={errors.name} required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-civic"
                  placeholder="e.g. Fort Road Bituminous Overlay"
                />
              </Field>
              <Field label="Project Type" error={errors.type} required>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as InfrastructureProjectType })}
                  className="input-civic"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Department" error={errors.department} required>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value as MunicipalDepartment })}
                  className="input-civic"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Contractor" error={errors.contractor} required>
                <input
                  value={form.contractor}
                  onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                  className="input-civic"
                  placeholder="Executing agency / contractor"
                />
              </Field>
              <Field label="Location" error={errors.location} required>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-civic"
                  placeholder="Street, landmark or site description"
                />
              </Field>
              <Field label="Ward / Area" error={errors.ward} required>
                <select
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  className="input-civic"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Budget (INR)" error={errors.budget} required>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={1}
                    value={form.budget || ''}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="input-civic pl-8"
                    placeholder="e.g. 18500000"
                  />
                </div>
              </Field>
              <Field label="Progress %" error={errors.progressPercent} required>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progressPercent}
                  onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })}
                  className="input-civic"
                />
              </Field>
              <Field label="Start Date" error={errors.startDate} required>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-civic"
                />
              </Field>
              <Field label="Expected Completion Date" error={errors.expectedCompletionDate} required>
                <input
                  type="date"
                  value={form.expectedCompletionDate}
                  onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
                  className="input-civic"
                />
              </Field>
              <Field label="Status" error={errors.status} required>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as InfrastructureProjectStatus })}
                  className="input-civic"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description" error={errors.description} required>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="input-civic resize-y"
                placeholder="Scope of work, current stage and any site constraints."
              />
            </Field>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Project location on map <span className="text-rose-500">*</span>
              </label>
              {errors.locationMap && <p className="text-[11px] text-rose-600 mb-1">{errors.locationMap}</p>}
              <LeafletMap
                isPicker
                height="280px"
                center={[form.lat, form.lng]}
                selectedLocation={{ lat: form.lat, lng: form.lng }}
                onLocationSelect={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Click or drag the pin. Current: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView(editingId ? 'details' : 'list')}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-extrabold text-slate-900">{value}</div>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
    <div className="text-sm font-medium text-slate-800 mt-0.5">{value}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, error, required, children }) => (
  <label className="block">
    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    <div className="[&_input]:w-full [&_select]:w-full [&_textarea]:w-full [&_input]:bg-slate-50 [&_select]:bg-slate-50 [&_textarea]:bg-slate-50 [&_input]:border [&_select]:border [&_textarea]:border [&_input]:border-slate-200 [&_select]:border-slate-200 [&_textarea]:border-slate-200 [&_input]:rounded-xl [&_select]:rounded-xl [&_textarea]:rounded-xl [&_input]:px-3 [&_select]:px-3 [&_textarea]:px-3 [&_input]:py-2 [&_select]:py-2 [&_textarea]:py-2 [&_input]:text-xs [&_select]:text-xs [&_textarea]:text-xs [&_input]:text-slate-800 [&_select]:text-slate-800 [&_textarea]:text-slate-800">
      {children}
    </div>
    {error && <span className="text-[11px] text-rose-600 mt-1 block">{error}</span>}
  </label>
);
