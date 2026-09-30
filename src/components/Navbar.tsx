import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  PlusCircle,
  MapPin,
  BarChart3,
  Users,
  FileText,
  RotateCcw,
  ChevronDown,
  Building2,
  Home,
  X,
  ExternalLink,
  LogIn,
  UserPlus,
  LogOut,
  Database,
  Compass,
  Settings,
  User,
  ShieldCheck,
  LayoutDashboard,
  FolderOpen,
} from 'lucide-react';
import { SmartCivicHeader } from './Logos';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenProfile }) => {
  const {
    currentUser,
    switchRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    setSelectedComplaint,
    complaints,
    registeredUsers,
    openAuthModal,
    signOutUser,
  } = useCivic();

  const { t } = useLanguage();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isStaff = currentUser.role !== 'citizen';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  const roleColor = isAdmin
    ? 'text-purple-600 bg-purple-50 border-purple-200'
    : isStaff
    ? 'text-blue-600 bg-blue-50 border-blue-200'
    : 'text-emerald-600 bg-emerald-50 border-emerald-200';

  const roleLabel = currentUser.role.replace(/_/g, ' ');

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Smart Civic platform header strip */}
      <SmartCivicHeader />

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* Brand wordmark */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => setCurrentTab('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setCurrentTab('home')}
            aria-label="Smart Civic Home"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="11" width="3" height="9" rx="0.5" fill="white" opacity="0.9" />
                <rect x="6" y="8" width="3" height="12" rx="0.5" fill="white" />
                <rect x="10" y="5" width="4" height="15" rx="0.5" fill="white" />
                <rect x="15" y="9" width="3" height="11" rx="0.5" fill="white" opacity="0.9" />
                <rect x="19" y="12" width="3" height="8" rx="0.5" fill="white" opacity="0.7" />
                <line x1="1" y1="20" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                SMART CIVIC
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                Civic Platform
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {/* Citizen-facing tabs (always visible) */}
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-current={currentTab === 'home' ? 'page' : undefined}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.navOverview}</span>
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'report'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold ring-1 ring-emerald-200'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
              aria-current={currentTab === 'report' ? 'page' : undefined}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.navReport}</span>
            </button>

            <button
              onClick={() => setCurrentTab('my-complaints')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'my-complaints'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-current={currentTab === 'my-complaints' ? 'page' : undefined}
            >
              <FileText className="w-4 h-4" />
              <span>{t.navMyReports}</span>
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'map'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-current={currentTab === 'map' ? 'page' : undefined}
            >
              <MapPin className="w-4 h-4" />
              <span>Civic Map</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'analytics'
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-current={currentTab === 'analytics' ? 'page' : undefined}
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Analytics</span>
            </button>

            {/* Staff/Admin-only divider and links */}
            {isStaff && (
              <>
                <div className="h-5 w-px bg-slate-200 mx-1" />

                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'tracking'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'tracking' ? 'page' : undefined}
                >
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>Complaints</span>
                </button>

                <button
                  onClick={() => setCurrentTab('authority')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'authority'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'authority' ? 'page' : undefined}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Authority</span>
                </button>

                <button
                  onClick={() => setCurrentTab('departments')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'departments'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'departments' ? 'page' : undefined}
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Departments</span>
                </button>
              </>
            )}

            {/* Admin-only links */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setCurrentTab('users-db')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'users-db'
                      ? 'bg-purple-50 text-purple-700 font-semibold ring-1 ring-purple-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'users-db' ? 'page' : undefined}
                >
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>Users</span>
                  <span className="px-1.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    {registeredUsers.length}
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-100 text-rose-700 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.complaintId) {
                              const found = complaints.find((c) => c.id === notif.complaintId);
                              if (found) {
                                setSelectedComplaint(found);
                                setCurrentTab('tracking');
                                setNotifOpen(false);
                              }
                            }
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                          {notif.complaintId && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                              <span>View {notif.complaintId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User/Profile menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-700 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  {/* User info header */}
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</div>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${roleColor}`}>
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { onOpenProfile(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { openAuthModal('signin'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sign In to Account</span>
                    </button>
                    <button
                      onClick={() => { openAuthModal('signup'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Create Account</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={() => { signOutUser(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Developer/Demo controls — collapsed in a sub-section */}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={() => setDevMenuOpen(!devMenuOpen)}
                      className="w-full text-left px-3 py-2 text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Settings className="w-3 h-3" />
                        Developer / Demo
                      </span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${devMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {devMenuOpen && (
                      <div className="bg-slate-50/80 border-t border-slate-100 py-1">
                        <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Switch Demo User
                        </div>
                        {DEMO_USERS.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchRole(u.role as UserRole);
                              setUserMenuOpen(false);
                              setDevMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                              currentUser.role === u.role ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                            }`}
                          >
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{u.role.replace(/_/g, ' ')}</div>
                            </div>
                            {currentUser.role === u.role && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>
                        ))}
                        <div className="border-t border-slate-200 mt-1 pt-1 px-3 pb-1">
                          <button
                            onClick={() => { resetDemoData(); setUserMenuOpen(false); }}
                            className="flex items-center gap-1.5 text-[11px] text-amber-600 hover:text-amber-700 font-medium"
                            title="Reset application data to initial seed state"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Demo Data</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Report CTA */}
            <button
              onClick={() => setCurrentTab('report')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md shrink-0"
              aria-label="Report an issue"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.navReport}</span>
              <span className="sm:hidden text-[11px] font-bold">Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-slate-100 px-3 py-2 flex items-center justify-start text-xs bg-slate-50/95 overflow-x-auto gap-1 scrollbar-none">
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'home' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {t.navOverview}
        </button>
        <button
          onClick={() => setCurrentTab('report')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'report' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {t.navReport}
        </button>
        <button
          onClick={() => setCurrentTab('my-complaints')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'my-complaints' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {t.navMyReports}
        </button>
        <button
          onClick={() => setCurrentTab('map')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'map' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Civic Map
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'analytics' ? 'font-bold text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Analytics
        </button>
        {isStaff && (
          <>
            <button
              onClick={() => setCurrentTab('authority')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'authority' ? 'font-bold text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Authority
            </button>
            <button
              onClick={() => setCurrentTab('departments')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'departments' ? 'font-bold text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Departments
            </button>
          </>
        )}
        {isAdmin && (
          <button
            onClick={() => setCurrentTab('users-db')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 transition-colors ${currentTab === 'users-db' ? 'font-bold text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span>Users</span>
            <span className="text-[10px] px-1 bg-purple-100 text-purple-800 rounded-full font-bold">
              {registeredUsers.length}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
