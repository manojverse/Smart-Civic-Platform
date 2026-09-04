import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  CheckCircle2,
  Sparkles,
  Download,
  Building2,
  ArrowUpDown,
  Radio,
  FileText,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { RegisteredUserRecord, UserRole, Complaint } from '../types';
import { ApGovtLogo, VizianagaramCorpLogo } from './Logos';

interface UserDatabaseViewProps {
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const UserDatabaseView: React.FC<UserDatabaseViewProps> = ({ onSelectComplaint }) => {
  const { registeredUsers, currentUser, complaints, setSelectedComplaint } = useCivic();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<RegisteredUserRecord | null>(null);

  // Filtered users
  const filteredUsers = registeredUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesWard = wardFilter === 'all' || user.ward === wardFilter;

    return matchesSearch && matchesRole && matchesWard;
  });

  // Calculate stats
  const totalUsers = registeredUsers.length;
  const onlineCount = registeredUsers.filter((u) => u.isOnline).length;
  const citizenCount = registeredUsers.filter((u) => u.role === 'citizen').length;
  const officerCount = registeredUsers.filter((u) => u.role !== 'citizen').length;
  const usersVisitingComplaints = registeredUsers.filter((u) => u.lastVisitedComplaintId).length;

  // Export users database to JSON/CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Ward', 'Phone', 'Logins', 'Last Active', 'Last Visited Complaint'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.ward || 'N/A',
      u.phone || 'N/A',
      u.loginCount || 1,
      u.lastLoginAt || 'N/A',
      u.lastVisitedComplaintId || 'None',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VMC_Users_Database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInspectComplaint = (complaintId: string) => {
    const found = complaints.find((c) => c.id === complaintId);
    if (found) {
      setSelectedComplaint(found);
      if (onSelectComplaint) {
        onSelectComplaint(found);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-white/10 border border-white/20 shadow-md">
              <VizianagaramCorpLogo className="w-14 h-14 shrink-0" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Cloud Firestore • Live Sync</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Secured Municipal Authority Access
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Real-Time User & Visitor Database
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Vizianagaram Municipal Corporation (విజయనగరం నగరపాలక సంస్థ) centralized registry.
                Monitoring citizens, field officers, and administrators currently visiting and reporting complaints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Export Database (CSV)</span>
            </button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-black text-white mt-1">{totalUsers}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Firestore synced</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online Right Now</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{onlineCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              <span>Active sessions</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Citizens</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{citizenCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ward residents</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Municipal Staff</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{officerCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Admins & Engineers</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Viewing Complaints</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{usersVisitingComplaints}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Auditing defects</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="field_officer">Field Officers</option>
              <option value="department_officer">Dept Officers</option>
              <option value="admin">Municipal Admins</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Ward:</span>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Wards</option>
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i} value={`Ward ${i + 1}`}>
                  Ward {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Database Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900 text-sm">
              Live Registered Accounts ({filteredUsers.length})
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Real-time subscriber listening to cloud Firestore
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User & Contact</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Ward Location</th>
                <th className="py-3 px-4">Visits / Logins</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Currently Visiting / Inspecting</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    No users matching criteria in database.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const visitedComplaint = user.lastVisitedComplaintId
                    ? complaints.find((c) => c.id === user.lastVisitedComplaintId)
                    : null;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUserDetail(user)}
                    >
                      {/* Name, Avatar, Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {user.isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.id === currentUser.id && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.role === 'field_officer'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : user.role === 'department_officer'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span className="capitalize">{user.role.replace('_', ' ')}</span>
                        </span>
                        {user.department && (
                          <div className="text-[10px] text-slate-500 font-medium mt-1">
                            {user.department}
                          </div>
                        )}
                      </td>

                      {/* Ward */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {user.ward || 'Ward 1 - Fort Area'}
                        </div>
                        <div className="text-[10px] text-slate-400">Vizianagaram Corp</div>
                      </td>

                      {/* Logins Count */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{user.loginCount || 1} logins</div>
                        <div className="text-[10px] text-slate-400">
                          {user.submittedComplaintsCount || 0} complaints filed
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-medium text-slate-800">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Active today'}
                        </div>
                      </td>

                      {/* Currently Visiting / Last Visited Complaint */}
                      <td className="py-3.5 px-4">
                        {user.lastVisitedComplaintId ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectComplaint(user.lastVisitedComplaintId!);
                            }}
                            className="inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{user.lastVisitedComplaintId}</span>
                            <ExternalLink className="w-3 h-3 text-emerald-500" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Browsing Portal</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedUserDetail(user)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Inspect
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

      {/* User Detail Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedUserDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedUserDetail.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Role</div>
                  <div className="font-bold text-slate-800 capitalize mt-0.5">
                    {selectedUserDetail.role.replace('_', ' ')}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Assigned Ward</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedUserDetail.ward || 'Ward 1'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedUserDetail.phone || '+91 8922 245000'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Sessions</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedUserDetail.loginCount || 1} logins</div>
                </div>
              </div>

              {selectedUserDetail.lastVisitedComplaintId && (
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5 mb-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Complaint Visited</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Complaint ID: {selectedUserDetail.lastVisitedComplaintId}
                  </div>
                  <button
                    onClick={() => {
                      handleInspectComplaint(selectedUserDetail.lastVisitedComplaintId!);
                      setSelectedUserDetail(null);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
                  >
                    <span>Open Complaint in Tracker</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-500">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Database Document ID</div>
                <div className="font-mono text-[11px] text-slate-700 mt-0.5 select-all">{selectedUserDetail.id}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
