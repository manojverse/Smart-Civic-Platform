import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { DEPARTMENTS, FIELD_OFFICERS } from '../data/seedData';
import { MunicipalDepartment } from '../types';

export interface DepartmentProfile {
  id: string;
  name: string;
  head: string;
  email: string;
  phone: string;
  description: string;
  isDemoPersonnel?: boolean;
}

const INITIAL_DEPARTMENT_PROFILES: DepartmentProfile[] = [
  {
    id: 'DEPT-PWD',
    name: 'Public Works Department (PWD)',
    head: 'Er. Sandeep Joshi, Superintending Engineer',
    email: 'pwd.exec@smartcivic.gov.in',
    phone: '+91 44 2561 9501',
    description: 'Pothole restoration, arterial road surfacing, stormwater drains, culverts & bridge safety.',
    isDemoPersonnel: true,
  },
  {
    id: 'DEPT-SWM',
    name: 'Solid Waste Management',
    head: 'Dr. Radhika Kulkarni, Chief Health Officer',
    email: 'swm.ops@smartcivic.gov.in',
    phone: '+91 44 2561 9502',
    description: 'Daily door-to-door collection, commercial waste bins, secondary segregators, landfill logistics.',
    isDemoPersonnel: true,
  },
  {
    id: 'DEPT-WSSB',
    name: 'Water Supply & Sewerage Board',
    head: 'Er. Vigneshwaran N., Chief Hydraulic Engineer',
    email: 'waterboard@smartcivic.gov.in',
    phone: '+91 44 2561 9503',
    description: 'Potable water pipelines, major main leakage, sewage overflows, wastewater treatment pumping.',
    isDemoPersonnel: true,
  },
  {
    id: 'DEPT-ELEC',
    name: 'Electricity & Streetlighting',
    head: 'Er. Manjunath Swamy, Chief Electrical Inspector',
    email: 'electrical@smartcivic.gov.in',
    phone: '+91 44 2561 9504',
    description: 'LED streetlights, automated photo-sensors, damaged transformer poles, high-voltage insulation.',
    isDemoPersonnel: true,
  },
  {
    id: 'DEPT-TRAF',
    name: 'Traffic & Transport Planning',
    head: 'ACP Ramesh Balaji, Traffic Enforcement',
    email: 'traffic.cell@smartcivic.gov.in',
    phone: '+91 44 2561 9505',
    description: 'Pedestrian crossings, speed breaker markings, signal timers, no-parking encroachment clearing.',
    isDemoPersonnel: true,
  },
  {
    id: 'DEPT-HLTH',
    name: 'Public Health & Sanitation',
    head: 'Dr. Fatima Begum, Senior Medical Officer',
    email: 'sanitation@smartcivic.gov.in',
    phone: '+91 44 2561 9506',
    description: 'Vector-borne epidemic prevention, public toilet maintenance, chemical fumigation spraying.',
    isDemoPersonnel: true,
  },
  {
    id: 'DEPT-HORT',
    name: 'Horticulture & Parks',
    head: 'P. N. Hegde, Horticulture & Environment Director',
    email: 'parks@smartcivic.gov.in',
    phone: '+91 44 2561 9507',
    description: 'Storm-damaged tree trimming, playground swing repairs, municipal park landscaping & environmental control.',
    isDemoPersonnel: true,
  },
];

const DEPT_STORAGE_KEY = 'Smart Civic_departments_v4';
const OFFICERS_STORAGE_KEY = 'Smart Civic_officers_roster_v4';

export const DepartmentManagement: React.FC = () => {
  const { complaints, currentUser, addAuditLog } = useCivic();
  const isAdmin = currentUser?.role === 'admin';

  const [departments, setDepartments] = useState<DepartmentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(DEPT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_DEPARTMENT_PROFILES;
  });

  const [officers, setOfficers] = useState(() => {
    try {
      const saved = localStorage.getItem(OFFICERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return FIELD_OFFICERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEPT_STORAGE_KEY, JSON.stringify(departments));
    } catch {
      // ignore
    }
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(officers));
    } catch {
      // ignore
    }
  }, [officers]);

  const [searchStaff, setSearchStaff] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Officer Modals
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficerId, setEditingOfficerId] = useState<string | null>(null);
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerDept, setNewOfficerDept] = useState<string>(departments[0]?.name || DEPARTMENTS[0]);
  const [newOfficerPhone, setNewOfficerPhone] = useState('');
  const [newOfficerBadge, setNewOfficerBadge] = useState('');

  // Department Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [deptDescription, setDeptDescription] = useState('');

  const matchesDept = (complaintDept: string | undefined, targetDeptName: string) => {
    if (!complaintDept) return false;
    const a = complaintDept.toLowerCase();
    const b = targetDeptName.toLowerCase();
    if (a === b) return true;
    if (b.includes('electricity') && a.includes('electric')) return true;
    if (b.includes('traffic') && a.includes('traffic')) return true;
    if (b.includes('health') && a.includes('health')) return true;
    if (b.includes('horticulture') && (a.includes('horticulture') || a.includes('forestry') || a.includes('parks') || a.includes('environment'))) return true;
    return false;
  };

  const filteredOfficers = officers.filter((off) => {
    const q = (searchStaff || '').toLowerCase();
    const matchSearch =
      (off.name || '').toLowerCase().includes(q) ||
      (off.badgeNumber || '').toLowerCase().includes(q) ||
      (off.phone && off.phone.includes(searchStaff));

    const matchDept =
      selectedDeptFilter === 'All' || matchesDept(off.department, selectedDeptFilter);

    return matchSearch && matchDept;
  });

  const openAddDeptModal = () => {
    setEditingDeptId(null);
    setDeptName('');
    setDeptHead('');
    setDeptEmail('');
    setDeptPhone('');
    setDeptDescription('');
    setShowDeptModal(true);
  };

  const openEditDeptModal = (dept: DepartmentProfile) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptHead(dept.head);
    setDeptEmail(dept.email);
    setDeptPhone(dept.phone);
    setDeptDescription(dept.description);
    setShowDeptModal(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptHead.trim()) return;

    if (editingDeptId) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDeptId
            ? {
                ...d,
                name: deptName.trim(),
                head: deptHead.trim(),
                email: deptEmail.trim() || 'dept@smartcivic.gov.in',
                phone: deptPhone.trim() || '+91 44 2561 9500',
                description: deptDescription.trim(),
              }
            : d
        )
      );
      addAuditLog({
        action: 'STATUS_UPDATED',
        user: currentUser.name,
        role: currentUser.role,
        userName: currentUser.name,
        userRole: currentUser.role,
        details: `Updated Municipal Department "${deptName.trim()}" (Head: ${deptHead.trim()})`,
      });
      setFeedbackBanner({ type: 'success', text: `Department "${deptName.trim()}" updated.` });
    } else {
      const newDept: DepartmentProfile = {
        id: `DEPT-${Date.now()}`,
        name: deptName.trim(),
        head: deptHead.trim(),
        email: deptEmail.trim() || 'dept@smartcivic.gov.in',
        phone: deptPhone.trim() || '+91 44 2561 9500',
        description: deptDescription.trim() || 'Municipal operational and grievance resolution wing.',
        isDemoPersonnel: false,
      };
      setDepartments((prev) => [...prev, newDept]);
      addAuditLog({
        action: 'STATUS_UPDATED',
        user: currentUser.name,
        role: currentUser.role,
        userName: currentUser.name,
        userRole: currentUser.role,
        details: `Created new Municipal Department "${newDept.name}"`,
      });
      setFeedbackBanner({ type: 'success', text: `Department "${newDept.name}" added.` });
    }
    setShowDeptModal(false);
  };

  const handleDeleteDepartment = (dept: DepartmentProfile) => {
    const linkedComplaints = complaints.filter((c) => matchesDept(c.department, dept.name));
    if (linkedComplaints.length > 0) {
      setFeedbackBanner({
        type: 'error',
        text: `Cannot delete "${dept.name}" because ${linkedComplaints.length} complaint record(s) are linked to it. Reassign complaints before removing the department.`,
      });
      return;
    }
    setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
    addAuditLog({
      action: 'STATUS_UPDATED',
      user: currentUser.name,
      role: currentUser.role,
      userName: currentUser.name,
      userRole: currentUser.role,
      details: `Removed Municipal Department "${dept.name}"`,
    });
    setFeedbackBanner({ type: 'success', text: `Department "${dept.name}" removed.` });
  };

  const openAddOfficerModal = () => {
    setEditingOfficerId(null);
    setNewOfficerName('');
    setNewOfficerDept(departments[0]?.name || DEPARTMENTS[0]);
    setNewOfficerPhone('');
    setNewOfficerBadge(`GCC-DO-${Math.floor(100 + Math.random() * 900)}`);
    setShowOfficerModal(true);
  };

  const openEditOfficerModal = (off: any) => {
    setEditingOfficerId(off.id);
    setNewOfficerName(off.name);
    setNewOfficerDept(off.department);
    setNewOfficerPhone(off.phone || '');
    setNewOfficerBadge(off.badgeNumber || '');
    setShowOfficerModal(true);
  };

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName.trim()) return;

    if (editingOfficerId) {
      setOfficers((prev) =>
        prev.map((o) =>
          o.id === editingOfficerId
            ? {
                ...o,
                name: newOfficerName.trim(),
                department: newOfficerDept as MunicipalDepartment,
                phone: newOfficerPhone.trim() || '+91 94440 00000',
                badgeNumber: newOfficerBadge.trim() || o.badgeNumber,
              }
            : o
        )
      );
      setFeedbackBanner({ type: 'success', text: `Officer "${newOfficerName.trim()}" updated.` });
    } else {
      const newOff = {
        id: `FO-${Date.now()}`,
        name: newOfficerName.trim(),
        badgeNumber: newOfficerBadge.trim() || `GCC-DO-${Math.floor(100 + Math.random() * 900)}`,
        department: newOfficerDept as MunicipalDepartment,
        phone: newOfficerPhone.trim() || '+91 94440 00000',
        dutyStatus: 'ON_DUTY' as const,
      };
      setOfficers((prev) => [newOff, ...prev]);
      setFeedbackBanner({ type: 'success', text: `Department Officer "${newOff.name}" registered.` });
    }

    setShowOfficerModal(false);
  };

  const toggleOfficerDuty = (officerId: string) => {
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === officerId
          ? { ...o, dutyStatus: o.dutyStatus === 'OFF_DUTY' ? 'ON_DUTY' : 'OFF_DUTY' }
          : o
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Municipal Departments &amp; Officer Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
              Sample / Demo Personnel
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Departmental hierarchy, responsible officers, live complaint metrics, and staff roster management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={openAddDeptModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
          <button
            onClick={openAddOfficerModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Department Officer</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            feedbackBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Department Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Municipal Operational Wings ({departments.length})
          </h2>
          <span className="text-xs text-slate-500">
            Complaint counts derived dynamically from live platform records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const deptComplaints = complaints.filter((c) => matchesDept(c.department, dept.name));
            const totalAssigned = deptComplaints.length;
            const resolvedCount = deptComplaints.filter(
              (c) => c.status === 'Resolved' || c.status === 'Closed'
            ).length;
            const openCount = totalAssigned - resolvedCount;
            const staffCount = officers.filter((o) => matchesDept(o.department, dept.name)).length;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{dept.name}</h3>
                      {dept.isDemoPersonnel !== false && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Demo Personnel Profile
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {staffCount} Officers
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{dept.description}</p>

                  <div className="text-[11px] space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <strong className="text-slate-800">Responsible Officer:</strong> {dept.head}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{dept.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{dept.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamically computed complaint metrics */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Assigned</div>
                      <div className="text-sm font-black text-slate-900 font-mono">{totalAssigned}</div>
                    </div>
                    <div className="bg-amber-50/70 rounded-xl p-2 border border-amber-100">
                      <div className="text-[10px] text-amber-800 font-semibold uppercase">Open</div>
                      <div className="text-sm font-black text-amber-900 font-mono">{openCount}</div>
                    </div>
                    <div className="bg-emerald-50/70 rounded-xl p-2 border border-emerald-100">
                      <div className="text-[10px] text-emerald-800 font-semibold uppercase">Resolved</div>
                      <div className="text-sm font-black text-emerald-900 font-mono">{resolvedCount}</div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditDeptModal(dept)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDepartment(dept)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Officers Roster Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Registered Department Officers &amp; Operational Engineers ({filteredOfficers.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Authorized department personnel handling inspections, field work, and resolution verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search officers..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Badge ID</th>
                <th className="px-6 py-3">Officer Name</th>
                <th className="px-6 py-3">Assigned Department</th>
                <th className="px-6 py-3">Contact Phone</th>
                <th className="px-6 py-3 text-center">Active Assigned Complaints</th>
                <th className="px-6 py-3 text-center">Duty Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOfficers.map((officer) => {
                const assignedCount = complaints.filter(
                  (c) =>
                    (c.assignedOfficer?.id === officer.id ||
                      c.assignedOfficer?.badgeNumber === officer.badgeNumber ||
                      c.assignedOfficer?.name === officer.name) &&
                    c.status !== 'Resolved' &&
                    c.status !== 'Closed'
                ).length;

                return (
                  <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {officer.badgeNumber}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{officer.name}</td>
                    <td className="px-6 py-3.5 text-slate-700">{officer.department}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{officer.phone}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-900">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {assignedCount}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleOfficerDuty(officer.id)}
                        className="inline-flex items-center"
                        title="Click to toggle duty status"
                      >
                        {officer.dutyStatus === 'OFF_DUTY' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>OFF DUTY</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>ON DUTY</span>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openEditOfficerModal(officer)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingDeptId ? 'Edit Municipal Department' : 'Add Municipal Department'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure department details, responsible officer, and official contact channels.
            </p>

            <form onSubmit={handleSaveDepartment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Stormwater & Flood Control"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Responsible Department Head
                </label>
                <input
                  type="text"
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  placeholder="e.g. Er. K. Subramanian, Chief Engineer"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={deptEmail}
                    onChange={(e) => setDeptEmail(e.target.value)}
                    placeholder="dept@smartcivic.gov.in"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={deptPhone}
                    onChange={(e) => setDeptPhone(e.target.value)}
                    placeholder="+91 44 2561 9500"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Scope &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Key responsibilities and civic categories handled..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
                >
                  {editingDeptId ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Department Officer Modal */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingOfficerId ? 'Edit Department Officer' : 'Register Municipal Department Officer'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assign authorized personnel to a municipal department for complaint inspection and resolution.
            </p>

            <form onSubmit={handleSaveOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Officer Full Name</label>
                <input
                  type="text"
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  placeholder="e.g. Er. Suresh Gowda"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge / Employee ID</label>
                <input
                  type="text"
                  value={newOfficerBadge}
                  onChange={(e) => setNewOfficerBadge(e.target.value)}
                  placeholder="GCC-DO-901"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newOfficerDept}
                  onChange={(e) => setNewOfficerDept(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={newOfficerPhone}
                  onChange={(e) => setNewOfficerPhone(e.target.value)}
                  placeholder="+91 98800 12345"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfficerModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  {editingOfficerId ? 'Save Officer' : 'Register Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
