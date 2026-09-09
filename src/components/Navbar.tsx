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
  Sparkles,
  ChevronDown,
  Building2,
  Home,
  BookOpen,
  X,
  ExternalLink,
  LogIn,
  UserPlus,
  LogOut,
  Database,
  Compass,
} from 'lucide-react';
import { ApGovtLogo, VizianagaramCorpLogo, CollegeEmblemLogo, OfficialGovTechHeader } from './Logos';
import { useCivic } from '../context/CivicContext';
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

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAuthority = currentUser.role !== 'citizen';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Official Government of AP & Vizianagaram Municipal Corporation Masthead */}
      <OfficialGovTechHeader />

      {/* Top Notification / Role Switcher Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
            AI Civic Governance • CSE 2026
          </span>
          <span className="hidden sm:inline text-slate-400">
            Vizianagaram Municipal Corporation • Smart Citizen Redressal & GIS Triage
          </span>
        </div>

        {/* Quick Role Switcher Bar */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden md:inline">Demo Persona:</span>
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{currentUser.name}</span>
              <span className="text-slate-400 text-[10px]">({currentUser.role.replace('_', ' ')})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch User Role
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchRole(u.role as UserRole);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.role === u.role ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{u.role.replace('_', ' ')}</div>
                    </div>
                    {currentUser.role === u.role && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}

                <div className="p-1.5 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md font-medium flex items-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sign In to Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      openAuthModal('signup');
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md font-medium flex items-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Register New User</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      signOutUser();
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={resetDemoData}
            title="Reset database to initial seed state for fresh demo"
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded text-[11px] hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Municipal & Project Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('home')}>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-xl bg-slate-50 border border-slate-200 shadow-xs group-hover:border-emerald-400 transition-colors">
                <VizianagaramCorpLogo className="w-10 h-10 shrink-0" />
              </div>
              <div className="p-1 rounded-xl bg-slate-50 border border-slate-200 shadow-xs hidden sm:block group-hover:border-emerald-400 transition-colors">
                <ApGovtLogo className="w-10 h-10 shrink-0" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  CIVICSENSE
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  VIZIANAGARAM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
                <span>విజయనగరం నగరపాలక సంస్థ</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">Govt. of Andhra Pradesh</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'report'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold ring-1 ring-emerald-200'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => setCurrentTab('my-complaints')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'my-complaints'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </button>

            <button
              onClick={() => setCurrentTab('tracking')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'tracking'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Complaints</span>
            </button>

            <button
              onClick={() => setCurrentTab('services')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'services'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Smart Services</span>
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

            {/* Authority View Links */}
            <div className="h-5 w-px bg-slate-200 mx-1"></div>

            <button
              onClick={() => setCurrentTab('authority')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'authority'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Authority Portal</span>
            </button>

            <button
              onClick={() => setCurrentTab('departments')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'departments'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Staff & Depts</span>
            </button>

            {/* Real-Time User Database Tab for Admin & Capstone Review */}
            <button
              onClick={() => setCurrentTab('users-db')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'users-db'
                  ? 'bg-purple-50 text-purple-700 font-semibold ring-1 ring-purple-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-purple-600" />
              <span>User Database</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                {registeredUsers.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'analytics'
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentTab('tips')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'tips'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Civic Guide</span>
            </button>

            <button
              onClick={() => setCurrentTab('future')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'future'
                  ? 'bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Roadmap</span>
            </button>
          </nav>

          {/* Action Area (Notifications & CTA) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sign In / Sign Up Trigger Button */}
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sign In / Register</span>
              <span className="sm:hidden">Auth</span>
            </button>

            {/* User Profile Avatar Trigger */}
            <button
              onClick={onOpenProfile}
              title="Open User Profile"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
            >
              {currentUser.name.charAt(0)}
            </button>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
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
                              <span>Track {notif.complaintId}</span>
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

            {/* Quick Report Button */}
            <button
              onClick={() => setCurrentTab('report')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-slate-100 px-3 py-2 flex items-center justify-around text-xs bg-slate-50/90 overflow-x-auto gap-2">
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'home' ? 'font-bold text-emerald-700' : 'text-slate-600'}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab('report')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'report' ? 'font-bold text-emerald-700' : 'text-slate-600'}`}
        >
          Report
        </button>
        <button
          onClick={() => setCurrentTab('my-complaints')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'my-complaints' ? 'font-bold text-emerald-700' : 'text-slate-600'}`}
        >
          My Reports
        </button>
        <button
          onClick={() => setCurrentTab('tracking')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'tracking' ? 'font-bold text-emerald-700' : 'text-slate-600'}`}
        >
          All Complaints
        </button>
        <button
          onClick={() => setCurrentTab('services')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'services' ? 'font-bold text-emerald-700' : 'text-slate-600'}`}
        >
          Services
        </button>
        <button
          onClick={() => setCurrentTab('map')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'map' ? 'font-bold text-emerald-700' : 'text-slate-600'}`}
        >
          Map
        </button>
        <button
          onClick={() => setCurrentTab('authority')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'authority' ? 'font-bold text-blue-700' : 'text-slate-600'}`}
        >
          Authority
        </button>
        <button
          onClick={() => setCurrentTab('departments')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'departments' ? 'font-bold text-blue-700' : 'text-slate-600'}`}
        >
          Staff & Depts
        </button>
        <button
          onClick={() => setCurrentTab('users-db')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'users-db' ? 'font-bold text-purple-700 bg-purple-50' : 'text-slate-600'}`}
        >
          <span>User Database</span>
          <span className="text-[10px] px-1 bg-purple-100 text-purple-800 rounded-full font-bold">
            {registeredUsers.length}
          </span>
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'analytics' ? 'font-bold text-purple-700' : 'text-slate-600'}`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
