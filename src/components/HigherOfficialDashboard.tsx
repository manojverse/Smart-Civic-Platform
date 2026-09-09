import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  UserCheck,
  Megaphone,
  Filter,
  ArrowRight,
  Send,
  Eye,
  AlertTriangle,
  RefreshCw,
  Users,
  Briefcase,
  Layers,
  FileText
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { Complaint, AssignedOfficer, MunicipalDepartment } from '../types';
import { FIELD_OFFICERS, WARDS } from '../data/seedData';

export const HigherOfficialDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    officialVerifyComplaint,
    reassignComplaint,
    broadcastAnnouncement,
    announcements,
    setSelectedComplaint,
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'verification' | 'complaints' | 'workers' | 'broadcast'>('verification');
  const [selectedDept, setSelectedDept] = useState<string>(currentUser.department || 'All Departments');
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [reassignModalTask, setReassignModalTask] = useState<Complaint | null>(null);

  // Rejection Dialog State
  const [rejectionModalTask, setRejectionModalTask] = useState<Complaint | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annDept, setAnnDept] = useState<MunicipalDepartment>(
    (currentUser.department as MunicipalDepartment) || 'Public Works Department (PWD)'
  );
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Filter complaints under official's purview
  const deptComplaints = complaints.filter((c) => {
    if (selectedDept !== 'All Departments' && c.department !== selectedDept) return false;
    if (selectedWard !== 'All' && c.location.ward !== selectedWard) return false;
    return true;
  });

  // Verification queue: tickets where field workers have submitted completion proof
  const verificationQueue = complaints.filter(
    (c) =>
      c.status === 'Work Completed' ||
      c.status === 'Pending Verification' ||
      (c.workerProof?.afterPhoto && c.status !== 'Resolved' && c.status !== 'Closed')
  );

  const escalatedCount = deptComplaints.filter((c) => c.isEscalated || c.status === 'Reopened').length;
  const inProgressCount = deptComplaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = deptComplaints.filter((c) => c.status === 'Resolved').length;

  const handleApprove = (complaintId: string) => {
    officialVerifyComplaint(complaintId, 'approved', 'Verified photographic proof on-site. Standards met.');
  };

  const handleOpenReject = (task: Complaint) => {
    setRejectionModalTask(task);
    setRejectionReason('Surface unevenness detected in photographic proof. Re-compaction required.');
  };

  const handleConfirmReject = () => {
    if (!rejectionModalTask || !rejectionReason.trim()) return;
    officialVerifyComplaint(rejectionModalTask.id, 'rejected', undefined, rejectionReason.trim());
    setRejectionModalTask(null);
    setRejectionReason('');
  };

  const handleConfirmReassign = (newOfficer: AssignedOfficer) => {
    if (!reassignModalTask) return;
    reassignComplaint(reassignModalTask.id, newOfficer, `Reassigned by ${currentUser.name} (${currentUser.designation || 'Higher Official'})`);
    setReassignModalTask(null);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    broadcastAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      department: annDept,
      priority: annPriority,
    });
    setAnnTitle('');
    setAnnMessage('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Official Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  {currentUser.designation || 'Executive Municipal Engineer'}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">
                Official ID: <span className="font-mono text-indigo-200">{currentUser.employeeId || 'VMC-OFF-102'}</span> • {currentUser.department || 'Public Works Department (PWD)'}
              </p>
              <div className="text-xs text-slate-400 mt-1">
                Supervisory Zone: All Wards (1 to 12) • High Authority Verification & Dispatch Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-center">
              <div className="text-xs text-amber-300 font-medium">Pending Verification</div>
              <div className="text-2xl font-bold text-amber-400">{verificationQueue.length}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-center">
              <div className="text-xs text-red-300 font-medium">Escalated / Reopened</div>
              <div className="text-2xl font-bold text-red-400">{escalatedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'verification'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Verification Queue</span>
          {verificationQueue.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {verificationQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'complaints'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Department Complaints ({deptComplaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'workers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Field Staff Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'broadcast'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast Advisory</span>
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                {verificationQueue.length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Proof Verification & Quality Audit Queue
                </h3>
                <p className="text-xs text-amber-700">
                  Workers have uploaded before & after photo evidence. Inspect carefully before official sign-off.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Municipal Compliance Standard
            </span>
          </div>

          {verificationQueue.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
              <h4 className="font-bold text-slate-800">Verification Queue is Clean</h4>
              <p className="text-xs text-slate-500 mt-1">
                No tickets currently waiting for official sign-off.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verificationQueue.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Complaint & Worker Notes */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {task.id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {task.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Ward: <strong className="text-slate-700">{task.location.ward}</strong>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                      <p className="text-xs text-slate-600">{task.description}</p>

                      {/* Worker Submission Details */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>
                            Worker:{' '}
                            <strong className="text-slate-800">
                              {task.workerProof?.workerName || task.assignedOfficer?.name || 'Assigned Field Tech'}
                            </strong>
                          </span>
                          <span>
                            Completed At:{' '}
                            <strong className="text-slate-700">
                              {task.workerProof?.completedAt
                                ? new Date(task.workerProof.completedAt).toLocaleTimeString()
                                : 'Just now'}
                            </strong>
                          </span>
                        </div>
                        {task.workerProof?.completionNotes && (
                          <div className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-xs italic">
                            "{task.workerProof.completionNotes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Before vs After Photo Proof Comparison */}
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span>Photographic Proof Evidence</span>
                        <span className="text-[11px] text-indigo-600 font-medium">Side-by-Side Comparison</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Before Photo */}
                        <div className="border border-amber-300 rounded-xl overflow-hidden bg-amber-50/50">
                          <div className="bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800 flex items-center justify-between">
                            <span>BEFORE REPAIR</span>
                            <Clock className="w-3 h-3 text-amber-600" />
                          </div>
                          {task.workerProof?.beforePhoto || task.photos[0] ? (
                            <img
                              src={task.workerProof?.beforePhoto || task.photos[0]}
                              alt="Before Work"
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                              No before photo
                            </div>
                          )}
                        </div>

                        {/* After Photo */}
                        <div className="border border-emerald-400 rounded-xl overflow-hidden bg-emerald-50/50">
                          <div className="bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                            <span>AFTER COMPLETION</span>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          </div>
                          {task.workerProof?.afterPhoto ? (
                            <img
                              src={task.workerProof.afterPhoto}
                              alt="After Work"
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                              Pending after photo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: High Official Decision Actions */}
                    <div className="lg:w-48 flex flex-col justify-center gap-2">
                      <button
                        onClick={() => handleApprove(task.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify & Resolve
                      </button>

                      <button
                        onClick={() => handleOpenReject(task)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject & Send Back
                      </button>

                      <button
                        onClick={() => setSelectedComplaint(task)}
                        className="w-full flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Department Complaints Management */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Complaints Dispatch</h2>
              <p className="text-xs text-slate-500">
                Filter and reassign complaints across Vizianagaram Municipal Corporation zones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
              >
                <option value="All">All Wards</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {deptComplaints.map((c) => (
              <div key={c.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : c.status === 'In Progress'
                          ? 'bg-orange-100 text-orange-700'
                          : c.status === 'Reopened'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{c.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{c.location.address}</span>
                    <span>•</span>
                    <span>
                      Officer:{' '}
                      <strong className="text-slate-700">
                        {c.assignedOfficer?.name || 'Unassigned'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReassignModalTask(c)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reassign
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Field Staff Roster */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Field Officers & Technicians</h2>
            <p className="text-xs text-slate-500">
              Real-time duty availability and assigned task load for field staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FIELD_OFFICERS.map((officer) => (
              <div
                key={officer.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{officer.badgeNumber}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Available
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{officer.name}</h4>
                <p className="text-xs text-slate-500">{officer.department}</p>
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Base: {officer.ward || 'Fort Road Zone'}</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t">
                  <span>Phone: {officer.phone}</span>
                  <span className="font-semibold text-slate-700">Tasks: {officer.activeTasksCount || 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Broadcast Advisory */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              Publish Advisory
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Post official notices, maintenance alerts, or monsoon warnings to all citizens.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Advisory Title</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g., Scheduled Water Valve Repair on MG Road"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={annDept}
                  onChange={(e) => setAnnDept(e.target.value as MunicipalDepartment)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
                  <option value="Solid Waste Management">Solid Waste Management</option>
                  <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
                  <option value="Electricity & Streetlighting">Electricity & Streetlighting</option>
                  <option value="Public Health & Sanitation">Public Health & Sanitation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnPriority('normal')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                      annPriority === 'normal'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnPriority('urgent')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                      annPriority === 'urgent'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Urgent Notice
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Provide schedule, impacted areas, tanker helpline..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast to Municipality
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Active Municipal Announcements</h3>
            <div className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <div key={ann.id} className="py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ann.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{ann.department}</span>
                    <span className="text-xs text-slate-400">• {new Date(ann.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Reject Completion Proof</h3>
              </div>
              <button
                onClick={() => setRejectionModalTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Specify why the photographic proof does not meet municipal standards. This message will be sent back to the worker.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason / Required Rectification
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Road shoulder leveling incomplete; asphalt mix not compacted smoothly..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectionModalTask(null)}
                className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Send Back to Worker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Reassignment Modal */}
      {reassignModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <RefreshCw className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Reassign Field Worker</h3>
              </div>
              <button
                onClick={() => setReassignModalTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select an available field officer for {reassignModalTask.id} ({reassignModalTask.category}).
            </p>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {FIELD_OFFICERS.map((fo) => (
                <div
                  key={fo.id}
                  onClick={() => handleConfirmReassign(fo)}
                  className="py-2.5 px-3 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{fo.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {fo.badgeNumber} • {fo.department}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">Assign</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setReassignModalTask(null)}
              className="w-full py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
