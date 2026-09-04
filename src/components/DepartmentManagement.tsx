import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Search,
  Award,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { DEPARTMENTS, FIELD_OFFICERS } from '../data/seedData';
import { MunicipalDepartment } from '../types';

export const DepartmentManagement: React.FC = () => {
  const { complaints } = useCivic();

  const [searchStaff, setSearchStaff] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);

  // New officer form
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerDept, setNewOfficerDept] = useState<MunicipalDepartment>(DEPARTMENTS[0]);
  const [newOfficerPhone, setNewOfficerPhone] = useState('');

  // Department profiles
  const DEPARTMENT_PROFILES = [
    {
      name: 'Public Works Department (PWD)' as MunicipalDepartment,
      head: 'Er. Sandeep Joshi, Superintending Engineer',
      email: 'pwd.exec@civicsense.gov',
      phone: '+91 80 2297 5501',
      description: 'Pothole restoration, arterial road surfacing, stormwater drains, culverts & bridge safety.',
    },
    {
      name: 'Solid Waste Management' as MunicipalDepartment,
      head: 'Dr. Radhika Kulkarni, Chief Health Officer',
      email: 'swm.ops@civicsense.gov',
      phone: '+91 80 2297 5502',
      description: 'Daily door-to-door collection, commercial waste bins, secondary segregators, landfill logistics.',
    },
    {
      name: 'Water Supply & Sewerage Board' as MunicipalDepartment,
      head: 'Er. Vigneshwaran N., Chief Hydraulic Engineer',
      email: 'waterboard@civicsense.gov',
      phone: '+91 80 2297 5503',
      description: 'Potable water pipelines, major main leakage, sewage overflows, wastewater treatment pumping.',
    },
    {
      name: 'Electrical & Street Lighting' as MunicipalDepartment,
      head: 'Er. Manjunath Swamy, Chief Electrical Inspector',
      email: 'electrical@civicsense.gov',
      phone: '+91 80 2297 5504',
      description: 'LED streetlights, automated photo-sensors, damaged transformer poles, high-voltage insulation.',
    },
    {
      name: 'Traffic & Road Safety' as MunicipalDepartment,
      head: 'ACP Ramesh Balaji, Traffic Enforcement',
      email: 'traffic.cell@civicsense.gov',
      phone: '+91 80 2297 5505',
      description: 'Pedestrian crossings, speed breaker markings, signal timers, no-parking encroachment clearing.',
    },
    {
      name: 'Health & Sanitation' as MunicipalDepartment,
      head: 'Dr. Fatima Begum, Senior Medical Officer',
      email: 'sanitation@civicsense.gov',
      phone: '+91 80 2297 5506',
      description: 'Vector-borne epidemic prevention, public toilet maintenance, chemical fumigation spraying.',
    },
    {
      name: 'Urban Forestry & Parks' as MunicipalDepartment,
      head: 'P. N. Hegde, Horticulture Director',
      email: 'parks@civicsense.gov',
      phone: '+91 80 2297 5507',
      description: 'Storm-damaged tree trimming, playground swing repairs, municipal park landscaping & walkways.',
    },
  ];

  // Officers list
  const [officers, setOfficers] = useState(FIELD_OFFICERS);

  const filteredOfficers = officers.filter((off) => {
    const matchSearch =
      off.name.toLowerCase().includes(searchStaff.toLowerCase()) ||
      off.badgeNumber.toLowerCase().includes(searchStaff.toLowerCase()) ||
      off.phone.includes(searchStaff);

    const matchDept = selectedDeptFilter === 'All' || off.department === selectedDeptFilter;

    return matchSearch && matchDept;
  });

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName.trim()) return;

    const newOff = {
      id: `FO-${Date.now()}`,
      name: newOfficerName,
      badgeNumber: `BBMP-FO-9${Math.floor(100 + Math.random() * 900)}`,
      department: newOfficerDept,
      phone: newOfficerPhone || '+91 98800 00000',
    };

    setOfficers((prev) => [newOff, ...prev]);
    setShowAddOfficerModal(false);
    setNewOfficerName('');
    setNewOfficerPhone('');
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
              Municipal Departments & Field Operations
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Departmental hierarchy, service boundaries, field staff rosters, and operational dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowAddOfficerModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Field Officer</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Municipal Operational Wings ({DEPARTMENT_PROFILES.length})
          </h2>
          <span className="text-xs text-slate-400">BBMP Central Command Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENT_PROFILES.map((dept) => {
            const activeComplaints = complaints.filter(
              (c) => c.department === dept.name && c.status !== 'Resolved' && c.status !== 'Closed'
            ).length;
            const staffCount = officers.filter((o) => o.department === dept.name).length;

            return (
              <div
                key={dept.name}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{dept.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {staffCount} Officers
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {dept.description}
                  </p>

                  <div className="text-[11px] space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <strong>Head:</strong> {dept.head}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{dept.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Open Tickets:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      activeComplaints > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {activeComplaints} Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Staff Roster Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registered Field Officers & Engineers</h3>
            <p className="text-xs text-slate-500">Active municipal crew deployed across administrative wards</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
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
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
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
                <th className="px-6 py-3 text-center">Active Assigned Tasks</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOfficers.map((officer) => {
                const assignedCount = complaints.filter(
                  (c) => c.assignedOfficer?.id === officer.id && c.status !== 'Resolved'
                ).length;

                return (
                  <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {officer.badgeNumber}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {officer.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {officer.department}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">
                      {officer.phone}
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        {assignedCount}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        On Duty
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Field Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register Municipal Field Officer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add authorized field crew personnel to receive complaint dispatch tickets.
            </p>

            <form onSubmit={handleAddOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Officer Full Name</label>
                <input
                  type="text"
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  placeholder="e.g. Suresh Gowda"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newOfficerDept}
                  onChange={(e) => setNewOfficerDept(e.target.value as MunicipalDepartment)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
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
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
