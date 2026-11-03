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
  HardHat,
  Briefcase,
} from 'lucide-react';
import { SmartCivicHeader } from './Logos';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoleDisplayName } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenProfile }) => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedComplaint,
    complaints,
    registeredUsers,
    openAuthModal,
    signOutUser,
  } = useCivic();

  const { t, language, setLanguage } = useLanguage();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const isDepartmentOfficer =
    !isAdmin &&
    (currentUser.role === 'department_officer' ||
      currentUser.role === 'higher_official' ||
      currentUser.role === 'officer' ||
      currentUser.role === 'field_officer' ||
      currentUser.role === 'worker' ||
      currentUser.role === 'staff');
  const isStaff = isDepartmentOfficer;
  const isCitizen = !isDepartmentOfficer && !isAdmin;

  const roleColor = isAdmin
    ? 'text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
    : isDepartmentOfficer
    ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
    : 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';

  const roleLabel = getRoleDisplayName(currentUser.role);

  return (
    <header className="sticky top-0 z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-150">
      {/* Smart Civic platform header strip */}
      <SmartCivicHeader />

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* Brand wordmark */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => {
              if (isAdmin) setCurrentTab('admin-portal');
              else if (isDepartmentOfficer) setCurrentTab('official-portal');
              else setCurrentTab('home');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isAdmin) setCurrentTab('admin-portal');
                else if (isDepartmentOfficer) setCurrentTab('official-portal');
                else setCurrentTab('home');
              }
            }}
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
              <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight leading-none group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                SMART CIVIC
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                Civic Platform
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {/* CITIZEN PORTAL NAVIGATION */}
            {isCitizen && (
              <>
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
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'tracking'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'tracking' ? 'page' : undefined}
                >
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>Track Issue</span>
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
                  onClick={() => setCurrentTab('projects')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'projects'
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'projects' ? 'page' : undefined}
                >
                  <HardHat className="w-4 h-4 text-teal-600" />
                  <span>{language === 'ta' ? 'திட்டங்கள்' : 'Projects'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('departments')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'departments'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'departments' ? 'page' : undefined}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t.navDepartments}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('tips')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'tips'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={currentTab === 'tips' ? 'page' : undefined}
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ta' ? 'உதவி & வழிகாட்டி' : 'Help & Guidelines'}</span>
                </button>
              </>
            )}

            {/* DEPARTMENT OFFICER PORTAL NAVIGATION */}
            {isDepartmentOfficer && (
              <>
                <button
                  onClick={() => setCurrentTab('official-portal')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    currentTab === 'official-portal' || currentTab === 'officer'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Department Officer Portal</span>
                </button>

                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'tracking'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>Department Work</span>
                </button>

                <button
                  onClick={() => setCurrentTab('map')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'map'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Civic Map</span>
                </button>

                <button
                  onClick={() => setCurrentTab('projects')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'projects'
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <HardHat className="w-4 h-4 text-teal-600" />
                  <span>Projects</span>
                </button>

                <button
                  onClick={() => setCurrentTab('analytics')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'analytics'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
              </>
            )}

            {/* ADMIN PORTAL NAVIGATION */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setCurrentTab('admin-portal')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    currentTab === 'admin-portal' || currentTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>

                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'tracking'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>Complaints</span>
                </button>

                <button
                  onClick={() => setCurrentTab('departments')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'departments'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Departments</span>
                </button>

                <button
                  onClick={() => setCurrentTab('users-db')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'users-db'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>

                <button
                  onClick={() => setCurrentTab('projects')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'projects'
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <HardHat className="w-4 h-4 text-teal-600" />
                  <span>Projects</span>
                </button>

                <button
                  onClick={() => setCurrentTab('analytics')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'analytics'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => setCurrentTab('map')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'map'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Civic Map</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* Bilingual Language Selector (English / தமிழ்) */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'ta'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="தமிழில் மாற்றவும் (Switch to Tamil)"
              >
                தமிழ்
              </button>
            </div>

            {/* Global Theme Switcher */}
            <ThemeToggle variant="button" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">No notifications yet.</div>
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
                          className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{notif.message}</p>
                          {notif.complaintId && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
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
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  {/* User info header */}
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
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
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { openAuthModal('signin'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Sign In to Account</span>
                    </button>
                    <button
                      onClick={() => { openAuthModal('signup'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Create Account</span>
                    </button>
                  </div>

                  {/* Theme Switcher section inside dropdown */}
                  <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Theme</span>
                    <ThemeToggle variant="segmented" />
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                    <button
                      onClick={() => { signOutUser(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Quick Report CTA */}
            <button
              onClick={() => setCurrentTab('report')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs shadow-emerald-600/30 transition-all hover:shadow-md shrink-0"
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
      <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 px-3 py-2 flex items-center justify-between text-xs bg-slate-50/95 dark:bg-slate-900/95 overflow-x-auto gap-1 scrollbar-none">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'home' ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {t.navOverview}
          </button>
          <button
            onClick={() => setCurrentTab('report')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'report' ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {t.navReport}
          </button>
          <button
            onClick={() => setCurrentTab('my-complaints')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'my-complaints' ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {t.navMyReports}
          </button>
          <button
            onClick={() => setCurrentTab('tracking')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'tracking' ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'ta' ? 'புகார் நிலை' : 'Track'}
          </button>
          <button
            onClick={() => setCurrentTab('map')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'map' ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {t.navMap}
          </button>
          <button
            onClick={() => setCurrentTab('projects')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'projects' ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'ta' ? 'திட்டங்கள்' : 'Projects'}
          </button>
          <button
            onClick={() => setCurrentTab('departments')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'departments' ? 'font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {t.navDepartments}
          </button>
          <button
            onClick={() => setCurrentTab('tips')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'tips' ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'ta' ? 'உதவி' : 'Help'}
          </button>
          {isStaff && (
            <>
              <button
                onClick={() => setCurrentTab('authority')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'authority' ? 'font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Authority
              </button>
              <button
                onClick={() => setCurrentTab('departments')}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${currentTab === 'departments' ? 'font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Departments
              </button>
            </>
          )}
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('users-db')}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 transition-colors ${currentTab === 'users-db' ? 'font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <span>Users</span>
              <span className="text-[10px] px-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full font-bold">
                {registeredUsers.length}
              </span>
            </button>
          )}
        </div>

        {/* Quick mobile theme toggle icon */}
        <div className="shrink-0 pl-1 border-l border-slate-200 dark:border-slate-800">
          <ThemeToggle variant="compact" />
        </div>
      </div>
    </header>
  );
};
