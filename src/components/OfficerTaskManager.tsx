import React, { useState } from 'react';
import {
  ListTodo,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  X,
  ChevronRight,
  Filter,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Sliders,
  Building2,
  Eye,
  Map as MapIcon,
  Play,
  Check,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { OfficerTask, OfficerTaskStatus, Priority } from '../types';
import { ZONES, WARDS, CONSTITUENCIES, FIELD_OFFICERS } from '../data/seedData';
import { LeafletMap } from './LeafletMap';

const TASK_STATUS_CONFIG: Record<OfficerTaskStatus, { label: string; bg: string; text: string; border: string }> = {
  PENDING: { label: 'PENDING', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  ASSIGNED: { label: 'ASSIGNED', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  IN_PROGRESS: { label: 'IN PROGRESS', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  ON_HOLD: { label: 'ON HOLD', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  COMPLETED: { label: 'COMPLETED', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  OVERDUE: { label: 'OVERDUE', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
};

export const OfficerTaskManager: React.FC = () => {
  const { officerTasks, createOfficerTask, updateOfficerTask, currentUser } = useCivic();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OfficerTask | null>(null);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedComplaintId, setRelatedComplaintId] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState(currentUser.name || 'Field Officer');
  const [zone, setZone] = useState(ZONES[0]);
  const [ward, setWard] = useState(WARDS[0]);
  const [constituency, setConstituency] = useState(CONSTITUENCIES[0]);
  const [priority, setPriority] = useState<Priority>('P2-High');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState<OfficerTaskStatus>('ASSIGNED');
  const [progress, setProgress] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [lat, setLat] = useState(13.0850);
  const [lng, setLng] = useState(80.2101);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit task form state
  const [editStatus, setEditStatus] = useState<OfficerTaskStatus>('IN_PROGRESS');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editRemarks, setEditRemarks] = useState<string>('');

  const filteredTasks = officerTasks.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (zoneFilter !== 'All' && t.zone !== zoneFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${t.id} ${t.title} ${t.assignedOfficer} ${t.relatedComplaintId || ''} ${t.relatedProjectId || ''} ${t.remarks || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setTitle('');
    setDescription('');
    setRelatedComplaintId('');
    setRelatedProjectId('');
    setAssignedOfficer(currentUser.name || 'Field Officer');
    setZone(ZONES[0]);
    setWard(WARDS[0]);
    setConstituency(CONSTITUENCIES[0]);
    setPriority('P2-High');
    setDueDate(new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setStatus('ASSIGNED');
    setProgress(0);
    setRemarks('');
    setLat(13.0850);
    setLng(80.2101);
    setIsModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createOfficerTask({
        title: title.trim(),
        description: description.trim(),
        relatedComplaintId: relatedComplaintId.trim() || undefined,
        relatedProjectId: relatedProjectId.trim() || undefined,
        assignedOfficer: assignedOfficer.trim(),
        zone,
        ward,
        constituency,
        priority,
        dueDate,
        status,
        progress,
        remarks: remarks.trim(),
        lat,
        lng,
        location: `${ward.split('-')[0]}, ${zone.split('-')[0]}`,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (task: OfficerTask) => {
    setEditingTask(task);
    setEditStatus(task.status);
    setEditProgress(task.progress);
    setEditRemarks(task.remarks || '');
  };

  const handleSaveTaskUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      const isComplete = editStatus === 'COMPLETED';
      await updateOfficerTask(editingTask.id, {
        status: editStatus,
        progress: isComplete ? 100 : editProgress,
        remarks: editRemarks.trim(),
      });
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operational Officer Task Center</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Officer Tasks &amp; Workload Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track, assign, and execute field inspection tasks, maintenance assignments, and municipal action items.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Officer Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Task ID, title, officer name..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="ON_HOLD">ON HOLD</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Priorities</option>
            <option value="P1-Critical">P1 - Critical</option>
            <option value="P2-High">P2 - High</option>
            <option value="P3-Medium">P3 - Medium</option>
            <option value="P4-Low">P4 - Low</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Zones</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const cfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.PENDING;
          return (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{task.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">📍 {task.zone?.split('-')[0] || 'Zone'}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">{task.priority}</span>
                  {task.relatedComplaintId && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-semibold">
                      Ref: {task.relatedComplaintId}
                    </span>
                  )}
                  {task.relatedProjectId && (
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono font-semibold">
                      Proj: {task.relatedProjectId}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Execution Progress</span>
                    <span className="text-emerald-700">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned: <strong className="text-slate-800">{task.assignedOfficer}</strong></span>
                  <span>Due: <strong className="text-slate-800">{task.dueDate}</strong></span>
                </div>

                {task.remarks && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic">
                    "{task.remarks}"
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition text-center shadow-xs"
                  >
                    Update Progress / Status
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No officer tasks match your active filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or create a new officer task above.</p>
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Create New Operational Task</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inspect Ward 101 PWD Drain Clearing"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed work instructions or inspection parameters..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Related Complaint ID (Optional)</label>
                  <input
                    type="text"
                    value={relatedComplaintId}
                    onChange={(e) => setRelatedComplaintId(e.target.value)}
                    placeholder="e.g. CS-VZM-2026-000101"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Related Project ID (Optional)</label>
                  <input
                    type="text"
                    value={relatedProjectId}
                    onChange={(e) => setRelatedProjectId(e.target.value)}
                    placeholder="e.g. PRJ-CHN-2026-001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Officer</label>
                  <input
                    type="text"
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="P1-Critical">P1 - Critical</option>
                    <option value="P2-High">P2 - High</option>
                    <option value="P3-Medium">P3 - Medium</option>
                    <option value="P4-Low">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    {ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Map location picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pinpoint Task Site on Map</label>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200">
                  <LeafletMap
                    center={[lat, lng]}
                    zoom={13}
                    height="192px"
                    isPicker={true}
                    selectedLocation={{ lat, lng }}
                    onLocationSelect={(nLat, nLng) => {
                      setLat(nLat);
                      setLng(nLng);
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{editingTask.id}</span>
                <h3 className="font-bold text-sm">Update Task Progress &amp; Status</h3>
              </div>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as OfficerTaskStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="ON_HOLD">ON HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Work Progress %</span>
                  <span className="text-emerald-700">{editProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Officer Remarks &amp; Updates</label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="Enter remarks on site inspection, work completed, or next steps..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Task Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
