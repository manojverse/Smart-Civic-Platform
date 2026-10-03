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
  Filter,
  X,
  Camera,
  Image as ImageIcon,
  Activity,
  Award,
  AlertCircle,
  Landmark,
  PieChart,
  BarChart3,
  ListFilter,
  Compass,
  FileText,
  UserCheck,
  Eye,
  Trash2,
  ExternalLink,
  Sparkles,
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
  ProjectMilestone,
} from '../types';
import { DEPARTMENTS, WARDS, CITIES, ZONES } from '../data/seedData';

// All 18 Civic Infrastructure Categories
const PROJECT_CATEGORIES: InfrastructureProjectType[] = [
  'Road Development',
  'Road Resurfacing',
  'Pothole Repair',
  'Storm Water Drain',
  'Drainage Development',
  'Street Light Installation',
  'Street Light Upgrade',
  'Bus Stop Development',
  'Footpath Development',
  'Park Development',
  'Public Toilet Development',
  'School Infrastructure',
  'Water Supply Infrastructure',
  'Waste Management Infrastructure',
  'Traffic Infrastructure',
  'Bridge Development',
  'Public Building Development',
  'Road Safety Improvement',
];

const CONSTITUENCIES = [
  'Anna Nagar',
  'T. Nagar',
  'Mylapore',
  'Velachery',
  'Adyar',
  'Saidapet',
  'Virugambakkam',
  'Thousand Lights',
  'Ambattur',
  'Perambur',
  'Harbour',
  'Chepauk-Thiruvallikeni',
  'Sholinganallur',
];

const PROJECT_STATUS_OPTIONS: { value: InfrastructureProjectStatus; label: string; color: string }[] = [
  { value: 'PLANNED', label: 'PLANNED', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'APPROVED', label: 'APPROVED', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'TENDERING', label: 'TENDERING', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'NOT_STARTED', label: 'NOT STARTED', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'IN_PROGRESS', label: 'IN PROGRESS', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'ON_HOLD', label: 'ON HOLD', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'DELAYED', label: 'DELAYED', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'COMPLETED', label: 'COMPLETED', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'CANCELLED', label: 'CANCELLED', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const DEFAULT_LAT = 13.0827;
const DEFAULT_LNG = 80.2707;

// Currency formatting helpers (INR)
export const formatINR = (amount: number): string => {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatFullINR = (amount: number): string => {
  if (!amount || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const emptyForm = (): InfrastructureProjectInput => ({
  name: '',
  type: 'Road Development',
  department: DEPARTMENTS[1],
  contractor: '',
  city: 'Chennai',
  zone: ZONES[0],
  constituency: CONSTITUENCIES[0],
  location: '',
  ward: WARDS[0],
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  budget: 10000000,
  estimatedBudget: 10000000,
  sanctionedBudget: 10000000,
  releasedBudget: 8000000,
  utilizedBudget: 4000000,
  startDate: new Date().toISOString().split('T')[0],
  expectedCompletionDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
  progressPercent: 25,
  status: 'IN_PROGRESS',
  description: '',
  milestones: [
    { id: 'M1', name: 'Site Survey & Clearance', plannedDate: new Date().toISOString().split('T')[0], status: 'COMPLETED', progress: 100 },
    { id: 'M2', name: 'Main Civil Execution', plannedDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'IN_PROGRESS', progress: 30 },
  ],
});

interface InfrastructureProjectsProps {
  onOpenComplaint?: (complaint: Complaint) => void;
}

export const InfrastructureProjects: React.FC<InfrastructureProjectsProps> = ({ onOpenComplaint }) => {
  const {
    infrastructureProjects,
    complaints,
    currentUser,
    createInfrastructureProject,
    updateInfrastructureProject,
    setSelectedProject: setContextSelectedProject,
  } = useCivic();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'higher_official' || currentUser?.role === 'super_admin';
  const isOfficer = currentUser?.role === 'officer' || currentUser?.role === 'staff' || currentUser?.role === 'field_officer';

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'directory' | 'overview' | 'map' | 'ward_hub'>('directory');
  const [selectedProject, setSelectedProject] = useState<InfrastructureProject | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'financials' | 'milestones' | 'media' | 'map' | 'complaints'>('overview');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('All');
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [progressRange, setProgressRange] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'progress_desc' | 'budget_desc' | 'date_desc' | 'status'>('progress_desc');

  // Ward Hub View State
  const [hubCity, setHubCity] = useState('Chennai');
  const [hubZone, setHubZone] = useState('All');
  const [hubConstituency, setHubConstituency] = useState('All');
  const [hubWard, setHubWard] = useState('All');

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InfrastructureProjectInput>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected project with context if needed
  useEffect(() => {
    if (selectedProject) {
      setContextSelectedProject(selectedProject);
    }
  }, [selectedProject, setContextSelectedProject]);

  // Filtered Projects Logic
  const filteredProjects = useMemo(() => {
    return infrastructureProjects.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = `${p.id} ${p.name} ${p.ward} ${p.constituency ?? ''} ${p.city ?? ''} ${p.location} ${p.contractor} ${p.department} ${p.type}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      // City
      if (selectedCity !== 'All' && p.city !== selectedCity) return false;
      // Zone
      if (selectedZone !== 'All' && p.zone !== selectedZone) return false;
      // Constituency
      if (selectedConstituency !== 'All' && p.constituency !== selectedConstituency) return false;
      // Ward
      if (selectedWard !== 'All' && p.ward !== selectedWard) return false;
      // Category
      if (selectedCategory !== 'All' && p.type !== selectedCategory && p.category !== selectedCategory) return false;
      // Status
      if (selectedStatus !== 'All') {
        const normStatus = String(p.status).toUpperCase().replace(/\s+/g, '_');
        if (normStatus !== selectedStatus) return false;
      }
      // Progress
      if (progressRange > 0 && p.progressPercent < progressRange) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'progress_desc') return b.progressPercent - a.progressPercent;
      if (sortBy === 'budget_desc') return (b.sanctionedBudget || b.budget) - (a.sanctionedBudget || a.budget);
      if (sortBy === 'date_desc') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      return a.status.localeCompare(b.status);
    });
  }, [infrastructureProjects, searchQuery, selectedCity, selectedZone, selectedConstituency, selectedWard, selectedCategory, selectedStatus, progressRange, sortBy]);

  // Executive Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalProjects = infrastructureProjects.length;
    const completed = infrastructureProjects.filter((p) => p.progressPercent === 100 || String(p.status).toUpperCase() === 'COMPLETED').length;
    const inProgress = infrastructureProjects.filter((p) => String(p.status).toUpperCase() === 'IN_PROGRESS' || p.status === 'In Progress').length;
    const delayed = infrastructureProjects.filter((p) => String(p.status).toUpperCase() === 'DELAYED' || p.status === 'Delayed' || p.delayStatus === 'Delayed').length;
    const planned = infrastructureProjects.filter((p) => String(p.status).toUpperCase() === 'PLANNED' || p.status === 'Planned').length;

    const totalSanctioned = infrastructureProjects.reduce((sum, p) => sum + (p.sanctionedBudget || p.budget || 0), 0);
    const totalReleased = infrastructureProjects.reduce((sum, p) => sum + (p.releasedBudget || p.budget || 0), 0);
    const totalUtilized = infrastructureProjects.reduce((sum, p) => sum + (p.utilizedBudget || 0), 0);
    const totalRemaining = totalReleased - totalUtilized;
    const avgProgress = totalProjects > 0 ? Math.round(infrastructureProjects.reduce((sum, p) => sum + p.progressPercent, 0) / totalProjects) : 0;
    const overallUtilizationRate = totalReleased > 0 ? Math.round((totalUtilized / totalReleased) * 100) : 0;

    return {
      totalProjects,
      completed,
      inProgress,
      delayed,
      planned,
      totalSanctioned,
      totalReleased,
      totalUtilized,
      totalRemaining: Math.max(0, totalRemaining),
      avgProgress,
      overallUtilizationRate,
    };
  }, [infrastructureProjects]);

  // Ward Hub Filtered Data
  const wardHubProjects = useMemo(() => {
    return infrastructureProjects.filter((p) => {
      if (hubCity !== 'All' && p.city && p.city !== hubCity) return false;
      if (hubZone !== 'All' && p.zone && p.zone !== hubZone) return false;
      if (hubConstituency !== 'All' && p.constituency && p.constituency !== hubConstituency) return false;
      if (hubWard !== 'All' && p.ward !== hubWard) return false;
      return true;
    });
  }, [infrastructureProjects, hubCity, hubZone, hubConstituency, hubWard]);

  // Related Complaints Helper
  const getRelatedComplaints = (project: InfrastructureProject): Complaint[] => {
    return complaints.filter((c) => {
      if (c.projectId === project.id) return true;
      if (c.location.ward === project.ward) {
        const text = `${c.title} ${c.description} ${c.category}`.toLowerCase();
        const pName = project.name.toLowerCase();
        return text.includes('road') || text.includes('drain') || pName.split(' ')[0].length > 3;
      }
      return false;
    });
  };

  const handleOpenAddModal = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: InfrastructureProject) => {
    setEditingId(proj.id);
    setForm({
      name: proj.name,
      type: proj.type,
      department: proj.department,
      contractor: proj.contractor,
      city: proj.city || 'Chennai',
      zone: proj.zone || ZONES[0],
      constituency: proj.constituency || CONSTITUENCIES[0],
      location: proj.location,
      ward: proj.ward,
      lat: proj.lat,
      lng: proj.lng,
      budget: proj.budget,
      estimatedBudget: proj.estimatedBudget || proj.budget,
      sanctionedBudget: proj.sanctionedBudget || proj.budget,
      releasedBudget: proj.releasedBudget || proj.budget,
      utilizedBudget: proj.utilizedBudget || 0,
      announcementDate: proj.announcementDate || '',
      startDate: proj.startDate,
      expectedCompletionDate: proj.expectedCompletionDate,
      actualCompletionDate: proj.actualCompletionDate || '',
      progressPercent: proj.progressPercent,
      status: proj.status,
      currentPhase: proj.currentPhase || '',
      delayStatus: proj.delayStatus || 'On Track',
      description: proj.description,
      milestones: proj.milestones || [],
      photos: proj.photos || [],
      beforePhotos: proj.beforePhotos || [],
      duringPhotos: proj.duringPhotos || [],
      afterPhotos: proj.afterPhotos || [],
      responsibleOfficer: proj.responsibleOfficer || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Project Name is required';
    if (!form.location.trim()) errors.location = 'Location description is required';
    if (!form.contractor.trim()) errors.contractor = 'Contractor name is required';
    if (!form.budget || form.budget <= 0) errors.budget = 'Valid budget amount required';
    if (!form.startDate) errors.startDate = 'Start date required';
    if (!form.expectedCompletionDate) errors.expectedCompletionDate = 'Expected completion date required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const remainingBudget = Math.max(0, (form.releasedBudget || form.budget) - (form.utilizedBudget || 0));
      const payload: InfrastructureProjectInput = {
        ...form,
        sanctionedBudget: form.sanctionedBudget || form.budget,
        releasedBudget: form.releasedBudget || form.budget,
        utilizedBudget: form.utilizedBudget || 0,
        remainingBudget,
      };

      if (editingId) {
        await updateInfrastructureProject(editingId, payload);
      } else {
        await createInfrastructureProject(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedZone('All');
    setSelectedConstituency('All');
    setSelectedWard('All');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setProgressRange(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <HardHat className="w-3.5 h-3.5" />
              Infrastructure Development &amp; Monitoring Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Public Infrastructure Development Monitoring
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Monitor civic development projects, physical &amp; financial progress, sanctioned budgets, ward allocations, and delay indicators across cities and constituencies in Tamil Nadu.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-amber-300">
                <Sparkles className="w-3 h-3" />
                Demo / Simulated Civic Development Data
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition duration-200 shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create New Project</span>
            </button>
          )}
        </div>

        {/* Quick Executive Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Projects</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{summaryMetrics.totalProjects}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{summaryMetrics.inProgress}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{summaryMetrics.completed}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Delayed</span>
            <span className="text-xl font-extrabold text-rose-400 mt-0.5 block">{summaryMetrics.delayed}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Sanctioned Budget</span>
            <span className="text-base font-extrabold text-white mt-0.5 block truncate">{formatINR(summaryMetrics.totalSanctioned)}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Utilized Budget</span>
            <span className="text-base font-extrabold text-sky-400 mt-0.5 block truncate">{formatINR(summaryMetrics.totalUtilized)}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('directory'); setSelectedProject(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'directory'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Projects Directory ({filteredProjects.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('overview'); setSelectedProject(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics &amp; Zone Overview</span>
        </button>

        <button
          onClick={() => { setActiveTab('map'); setSelectedProject(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'map'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Unified GIS Civic Map</span>
        </button>

        <button
          onClick={() => { setActiveTab('ward_hub'); setSelectedProject(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeTab === 'ward_hub'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Ward &amp; Constituency Hub</span>
        </button>
      </div>

      {/* SELECTED PROJECT DETAIL MODAL / VIEW */}
      {selectedProject ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
          {/* Detail Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <button
                onClick={() => setSelectedProject(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => handleOpenEditModal(selectedProject)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Project</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                  {selectedProject.id}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
                  {selectedProject.type || selectedProject.category}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                  selectedProject.status === 'COMPLETED' || selectedProject.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : selectedProject.status === 'DELAYED' || selectedProject.status === 'Delayed'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {selectedProject.status}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedProject.name}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-2 pt-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedProject.location} • {selectedProject.ward} • {selectedProject.constituency || 'Central Constituency'} • {selectedProject.city || 'Chennai'}</span>
              </p>
            </div>
          </div>

          {/* Detail Tabs Header */}
          <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'financials', label: 'Financials & Budget' },
              { id: 'milestones', label: `Milestones (${selectedProject.milestones?.length || 0})` },
              { id: 'media', label: 'Photos & Proofs' },
              { id: 'map', label: 'GIS Map Location' },
              { id: 'complaints', label: `Related Complaints (${getRelatedComplaints(selectedProject).length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDetailTab(t.id as any)}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
                  detailTab === t.id
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Detail Tab Content */}
          <div className="p-6 sm:p-8">
            {detailTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Description</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{selectedProject.description}</p>
                  </div>

                  {/* Physical Progress & Phase Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Physical Completion Progress</span>
                      <span className="text-2xl font-black text-slate-900">{selectedProject.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedProject.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Current Phase: <strong>{selectedProject.currentPhase || 'Execution'}</strong></span>
                      <span>Delay Indicator: <strong>{selectedProject.delayStatus || 'On Track'}</strong></span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Responsible Department</span>
                      <p className="text-xs font-bold text-slate-900">{selectedProject.department}</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Assigned Contractor</span>
                      <p className="text-xs font-bold text-slate-900">{selectedProject.contractor}</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Start Date</span>
                      <p className="text-xs font-bold text-slate-900">{formatDate(selectedProject.startDate)}</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Expected Completion</span>
                      <p className="text-xs font-bold text-slate-900">{formatDate(selectedProject.expectedCompletionDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Health & Quick Financials */}
                <div className="space-y-6">
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Project Health &amp; Insights</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      System-generated analytical assessment based on physical milestone velocity, financial utilization, and nearby citizen complaint density.
                    </p>
                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-900">Health Indicator:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px]">
                        {selectedProject.projectHealth || 'Healthy'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Sanctioned Financials</span>
                    <div>
                      <span className="text-2xl font-black text-white block">{formatINR(selectedProject.sanctionedBudget || selectedProject.budget)}</span>
                      <span className="text-xs text-slate-400">{formatFullINR(selectedProject.sanctionedBudget || selectedProject.budget)} Total</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Utilized Budget:</span>
                        <span className="font-bold text-emerald-400">{formatINR(selectedProject.utilizedBudget || 0)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Remaining Balance:</span>
                        <span className="font-bold text-sky-400">{formatINR((selectedProject.releasedBudget || selectedProject.budget) - (selectedProject.utilizedBudget || 0))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'financials' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Estimated Budget</span>
                    <span className="text-xl font-black text-slate-900 block">{formatINR(selectedProject.estimatedBudget || selectedProject.budget)}</span>
                    <span className="text-[11px] font-mono text-slate-500 mt-1 block">{formatFullINR(selectedProject.estimatedBudget || selectedProject.budget)}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Sanctioned Budget</span>
                    <span className="text-xl font-black text-emerald-700 block">{formatINR(selectedProject.sanctionedBudget || selectedProject.budget)}</span>
                    <span className="text-[11px] font-mono text-slate-500 mt-1 block">{formatFullINR(selectedProject.sanctionedBudget || selectedProject.budget)}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Utilized Budget</span>
                    <span className="text-xl font-black text-sky-700 block">{formatINR(selectedProject.utilizedBudget || 0)}</span>
                    <span className="text-[11px] font-mono text-slate-500 mt-1 block">{formatFullINR(selectedProject.utilizedBudget || 0)}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Remaining Balance</span>
                    <span className="text-xl font-black text-slate-800 block">{formatINR((selectedProject.releasedBudget || selectedProject.budget) - (selectedProject.utilizedBudget || 0))}</span>
                    <span className="text-[11px] font-mono text-slate-500 mt-1 block">{formatFullINR((selectedProject.releasedBudget || selectedProject.budget) - (selectedProject.utilizedBudget || 0))}</span>
                  </div>
                </div>

                {/* Utilization Analysis */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-sm text-white">Financial Utilization Rate vs Physical Completion</h4>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Physical Progress:</span>
                        <span className="font-bold text-emerald-400">{selectedProject.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedProject.progressPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Budget Utilization Rate:</span>
                        <span className="font-bold text-sky-400">
                          {selectedProject.releasedBudget ? Math.round(((selectedProject.utilizedBudget || 0) / selectedProject.releasedBudget) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{
                            width: `${selectedProject.releasedBudget ? Math.min(100, Math.round(((selectedProject.utilizedBudget || 0) / selectedProject.releasedBudget) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'milestones' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">Project Milestones Timeline</h4>
                </div>

                <div className="space-y-4">
                  {(selectedProject.milestones || []).map((m, idx) => (
                    <div key={m.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">M{idx + 1}</span>
                          <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            m.status === 'COMPLETED' || m.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'IN_PROGRESS' || m.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        {m.remarks && <p className="text-xs text-slate-600">{m.remarks}</p>}
                        <p className="text-[11px] text-slate-400 font-mono">Planned: {formatDate(m.plannedDate)} {m.actualDate ? `• Completed: ${formatDate(m.actualDate)}` : ''}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">{m.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'media' && (
              <div className="space-y-6">
                <h4 className="font-extrabold text-slate-900 text-sm">Project Photographic Proofs</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  {(selectedProject.photos || [
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=80',
                  ]).map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs group relative">
                      <img src={url} alt={`Proof ${i}`} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex items-end">
                        <span className="text-white text-xs font-semibold">Site Progress Photo #{i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'map' && (
              <div className="space-y-4">
                <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <LeafletMap
                    center={[selectedProject.lat, selectedProject.lng]}
                    zoom={14}
                    height="100%"
                    infrastructureProjects={[selectedProject]}
                    complaints={getRelatedComplaints(selectedProject)}
                  />
                </div>
              </div>
            )}

            {detailTab === 'complaints' && (
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">Nearby / Related Citizen Complaints</h4>
                {getRelatedComplaints(selectedProject).length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No active citizen complaints reported near this project location.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getRelatedComplaints(selectedProject).map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700">{c.id}</span>
                            <span className="text-xs font-bold text-slate-900">{c.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{c.location.address}</p>
                        </div>
                        {onOpenComplaint && (
                          <button
                            onClick={() => onOpenComplaint(c)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                          >
                            View Complaint
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: DIRECTORY & FILTERING */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Filter Panel */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Project ID, Name, Ward, Constituency, Contractor, or Department..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="progress_desc">Sort by Progress (High to Low)</option>
                      <option value="budget_desc">Sort by Sanctioned Budget (High to Low)</option>
                      <option value="date_desc">Sort by Start Date (Newest)</option>
                      <option value="status">Sort by Status</option>
                    </select>

                    <button
                      onClick={resetFilters}
                      className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-2xl transition"
                      title="Clear All Filters"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hierarchy Filter Selects */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="All">All Cities</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Zone</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="All">All Zones</option>
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Constituency</label>
                    <select
                      value={selectedConstituency}
                      onChange={(e) => setSelectedConstituency(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="All">All Constituencies</option>
                      {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ward</label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="All">All Wards</option>
                      {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="All">All Categories</option>
                      {PROJECT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="All">All Statuses</option>
                      {PROJECT_STATUS_OPTIONS.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">No Matching Projects Found</h3>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    No infrastructure development projects match your selected filter criteria. Try adjusting or clearing your filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {p.id}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            p.status === 'COMPLETED' || p.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'DELAYED' || p.status === 'Delayed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-emerald-700 transition">
                          {p.name}
                        </h3>

                        <div className="space-y-1 text-xs text-slate-500">
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{p.ward.split('-')[0]} • {p.constituency || 'Central'}</span>
                          </p>
                          <p className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{p.department}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">Physical Progress</span>
                            <span className="text-slate-900 font-extrabold">{p.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${p.progressPercent}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Sanctioned</span>
                            <span className="font-black text-slate-900">{formatINR(p.sanctionedBudget || p.budget)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected End</span>
                            <span className="font-bold text-slate-700">{formatDate(p.expectedCompletionDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANALYTICS & ZONE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Category Breakdown Cards */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Projects Distribution by Infrastructure Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {PROJECT_CATEGORIES.map((cat) => {
                    const count = infrastructureProjects.filter((p) => p.type === cat || p.category === cat).length;
                    return (
                      <div key={cat} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                        <span className="text-lg font-black text-slate-900 block">{count}</span>
                        <span className="text-[11px] font-bold text-slate-600 line-clamp-1 block">{cat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Zone Overview Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Zone-wise Infrastructure Execution Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-extrabold text-[10px]">
                      <tr>
                        <th className="p-3">Zone</th>
                        <th className="p-3">Total Projects</th>
                        <th className="p-3">Completed</th>
                        <th className="p-3">In Progress</th>
                        <th className="p-3">Delayed</th>
                        <th className="p-3">Avg Progress</th>
                        <th className="p-3">Total Budget</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {ZONES.map((zone) => {
                        const zProjects = infrastructureProjects.filter((p) => p.zone === zone);
                        if (zProjects.length === 0) return null;
                        const comp = zProjects.filter((p) => p.progressPercent === 100 || String(p.status).toUpperCase() === 'COMPLETED').length;
                        const inp = zProjects.filter((p) => String(p.status).toUpperCase() === 'IN_PROGRESS' || p.status === 'In Progress').length;
                        const del = zProjects.filter((p) => String(p.status).toUpperCase() === 'DELAYED' || p.status === 'Delayed').length;
                        const avgP = Math.round(zProjects.reduce((s, p) => s + p.progressPercent, 0) / zProjects.length);
                        const totB = zProjects.reduce((s, p) => s + (p.sanctionedBudget || p.budget), 0);

                        return (
                          <tr key={zone} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-bold text-slate-900">{zone}</td>
                            <td className="p-3 font-bold">{zProjects.length}</td>
                            <td className="p-3 text-emerald-700 font-bold">{comp}</td>
                            <td className="p-3 text-amber-700 font-bold">{inp}</td>
                            <td className="p-3 text-rose-700 font-bold">{del}</td>
                            <td className="p-3 font-bold">{avgP}%</td>
                            <td className="p-3 font-mono font-bold">{formatINR(totB)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNIFIED CIVIC GIS MAP */}
          {activeTab === 'map' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Unified Civic GIS Infrastructure Map</h3>
                  <p className="text-xs text-slate-500">Interactive spatial tracking for infrastructure projects and nearby citizen grievances.</p>
                </div>
              </div>

              <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <LeafletMap
                  center={[13.0827, 80.2707]}
                  zoom={12}
                  height="100%"
                  infrastructureProjects={filteredProjects}
                  complaints={complaints}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onSelectComplaint={(c) => onOpenComplaint && onOpenComplaint(c)}
                />
              </div>
            </div>
          )}

          {/* TAB 4: WARD & CONSTITUENCY HUB */}
          {activeTab === 'ward_hub' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Ward &amp; Constituency Development Drilldown</h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City</label>
                    <select value={hubCity} onChange={(e) => setHubCity(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold">
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Zone</label>
                    <select value={hubZone} onChange={(e) => setHubZone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold">
                      <option value="All">All Zones</option>
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Constituency</label>
                    <select value={hubConstituency} onChange={(e) => setHubConstituency(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold">
                      <option value="All">All Constituencies</option>
                      {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ward</label>
                    <select value={hubWard} onChange={(e) => setHubWard(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold">
                      <option value="All">All Wards</option>
                      {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtered Ward Hub Results */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wardHubProjects.map((p) => (
                  <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer space-y-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{p.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.ward} • {p.type}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-emerald-700">{p.progressPercent}% Complete</span>
                      <span className="font-mono font-bold text-slate-900">{formatINR(p.sanctionedBudget || p.budget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT PROJECT MODAL (ADMIN / OFFICER) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-fadeIn">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">{editingId ? 'Edit Infrastructure Project' : 'Create Infrastructure Project'}</h3>
                <p className="text-xs text-slate-400">Maintain civic development project parameters, budgets, and milestone schedules.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Anna Nagar 2nd Avenue Bituminous Re-carpeting & Stormwater Drain"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.name && <span className="text-[11px] text-rose-600 font-bold">{formErrors.name}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as InfrastructureProjectType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {PROJECT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as MunicipalDepartment })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Contractor *</label>
                  <input
                    type="text"
                    value={form.contractor}
                    onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                    placeholder="Contractor Firm Name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Constituency</label>
                  <select value={form.constituency} onChange={(e) => setForm({ ...form, constituency: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ward *</label>
                  <select value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Specific Location / Street Address *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. 2nd Avenue, from Roundtana to 12th Main Road"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sanctioned Budget (INR) *</label>
                  <input
                    type="number"
                    value={form.sanctionedBudget || form.budget}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setForm({ ...form, budget: v, sanctionedBudget: v, estimatedBudget: v });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Utilized Budget (INR)</label>
                  <input
                    type="number"
                    value={form.utilizedBudget || 0}
                    onChange={(e) => setForm({ ...form, utilizedBudget: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected Completion Date *</label>
                  <input
                    type="date"
                    value={form.expectedCompletionDate}
                    onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Physical Completion % ({form.progressPercent}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.progressPercent}
                    onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as InfrastructureProjectStatus })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {PROJECT_STATUS_OPTIONS.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description & Scope of Work</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  {isSubmitting ? 'Saving Project...' : editingId ? 'Update Project' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
