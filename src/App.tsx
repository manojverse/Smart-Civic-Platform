import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { CivicHome } from './components/CivicHome';
import { ReportIssue } from './components/ReportIssue';
import { MyComplaints } from './components/MyComplaints';
import { ComplaintTracker } from './components/ComplaintTracker';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { DepartmentManagement } from './components/DepartmentManagement';
import { CivicAnalytics } from './components/CivicAnalytics';
import { CivicMapView } from './components/CivicMapView';
import { CivicTips } from './components/CivicTips';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { UserDatabaseView } from './components/UserDatabaseView';
import { OfficerDashboard } from './components/OfficerDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { HigherOfficialDashboard } from './components/HigherOfficialDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SmartCityServices } from './components/SmartCityServices';
import { FutureScope } from './components/FutureScope';
import { CivicSenseAI } from './components/CivicSenseAI';
import { InfrastructureProjects } from './components/InfrastructureProjects';
import { BottomNav } from './components/BottomNav';
import { Complaint } from './types';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X, MapPin, BarChart3, Building2, Shield, Lock, ArrowLeft } from 'lucide-react';

const CivicApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const {
    currentUser,
    setSelectedComplaint,
    setSelectedProject,
    activeToast,
    clearToast,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    recordComplaintVisit,
    isAuthenticated,
    signOutUser,
  } = useCivic();

  const normalizedRole = (() => {
    const role = String(currentUser?.role || 'citizen').toLowerCase();
    if (['worker', 'field_officer', 'higher_official', 'department_officer', 'staff', 'officer'].includes(role)) return 'staff';
    if (['admin', 'super_admin'].includes(role)) return 'admin';
    if (role === 'unconfigured') return 'unconfigured';
    return 'citizen';
  })();

  // Synchronize route navigation with browser history
  const navigateTo = useCallback((path: string, tab?: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
    if (tab) {
      setCurrentTab(tab);
    }
  }, []);

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p);
      if (p === '/officer') setCurrentTab('officer');
      else if (p === '/admin') setCurrentTab('admin-portal');
      else if (p === '/citizen') setCurrentTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial redirect upon login based on authoritative role from Firestore
  const prevAuthRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current) {
      prevAuthRef.current = true;
      const initialPath = window.location.pathname;

      if (initialPath === '/admin') {
        setCurrentTab('admin-portal');
      } else if (initialPath === '/officer') {
        setCurrentTab('officer');
      } else if (initialPath === '/citizen') {
        setCurrentTab('home');
      } else {
        // Default landing route based on authoritative role
        if (normalizedRole === 'admin') {
          navigateTo('/admin', 'admin-portal');
        } else if (normalizedRole === 'staff') {
          navigateTo('/officer', 'officer');
        } else {
          navigateTo('/citizen', 'home');
        }
      }
    }
    if (!isAuthenticated) prevAuthRef.current = false;
  }, [isAuthenticated, normalizedRole, navigateTo]);

  const handleTrackComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    if (recordComplaintVisit) {
      recordComplaintVisit(complaint.id);
    }
    setCurrentTab('tracking');
    if (normalizedRole === 'citizen') {
      navigateTo('/citizen', 'tracking');
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'officer' || tab === 'worker-portal' || tab === 'official-portal') {
      navigateTo('/officer', tab);
    } else if (tab === 'admin' || tab === 'admin-portal') {
      navigateTo('/admin', tab);
    } else {
      navigateTo('/citizen', tab);
    }
  };

  // If user is authenticated but role is unconfigured
  if (isAuthenticated && (currentUser?.role === 'unconfigured' || !currentUser?.role)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Account Role Not Configured</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Your account role is not configured. Please contact the administrator.
          </p>
          <div className="mt-6">
            <button
              onClick={() => signOutUser()}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Sign Out &amp; Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = !isAuthenticated ? (
    <LoginPage />
  ) : (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Real-time Event Toast Banner */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
            {activeToast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : activeToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-slate-100">{activeToast.title}</h4>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{activeToast.message}</p>
          </div>
          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Main Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        {currentTab === 'home' && (
          <CivicHome
            onNavigate={(tab) => handleTabChange(tab)}
            onSelectComplaint={handleTrackComplaint}
          />
        )}
        {currentTab === 'report' && (
          <ReportIssue onTrackComplaint={handleTrackComplaint} />
        )}
        {currentTab === 'my-complaints' && (
          <MyComplaints
            onTrackComplaint={handleTrackComplaint}
            onNavigateToReport={() => handleTabChange('report')}
          />
        )}
        {currentTab === 'tracking' && <ComplaintTracker />}
        {currentTab === 'authority' && <AuthorityDashboard />}
        {currentTab === 'users-db' && (
          <UserDatabaseView onSelectComplaint={handleTrackComplaint} />
        )}
        {currentTab === 'departments' && <DepartmentManagement />}
        {currentTab === 'analytics' && <CivicAnalytics />}
        {currentTab === 'map' && (
          <CivicMapView
            onSelectComplaint={handleTrackComplaint}
            onSelectProject={(project) => {
              setSelectedProject(project);
              handleTabChange('projects');
            }}
          />
        )}
        {currentTab === 'projects' && (
          <InfrastructureProjects
            onOpenComplaint={(complaint) => {
              setSelectedComplaint(complaint);
              handleTabChange('tracking');
            }}
          />
        )}
        {currentTab === 'tips' && <CivicTips />}
        {currentTab === 'services' && (
          <SmartCityServices onReportIssue={() => handleTabChange('report')} />
        )}
        {currentTab === 'future' && <FutureScope />}
        {(currentTab === 'officer' || currentTab === 'worker-portal' || currentTab === 'official-portal' || currentTab === 'staff-portal') && (
          normalizedRole === 'staff' || normalizedRole === 'admin' ? (
            <OfficerDashboard />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center animate-in fade-in">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-5 shadow-xs">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied</h1>
              <p className="text-sm text-slate-600 max-w-md mt-2 leading-relaxed">
                Field Officer credentials are required to access the Officer Portal. Your current account does not have officer privileges.
              </p>
              <button
                onClick={() => handleTabChange('home')}
                className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Citizen Portal</span>
              </button>
            </div>
          )
        )}
        {(currentTab === 'admin' || currentTab === 'admin-portal') && (
          normalizedRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center animate-in fade-in">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-5 shadow-xs">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied</h1>
              <p className="text-sm text-slate-600 max-w-md mt-2 leading-relaxed">
                Administrator credentials are required to access the Admin Portal. Your current account does not have municipal administration privileges.
              </p>
              <button
                onClick={() => {
                  if (normalizedRole === 'staff') {
                    handleTabChange('officer');
                  } else {
                    handleTabChange('home');
                  }
                }}
                className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                  {normalizedRole === 'staff'
                    ? 'Return to Officer Portal'
                    : 'Return to Citizen Portal'}
                </span>
              </button>
            </div>
          )
        )}
        {currentTab === 'citizen-portal' && (
          <CivicHome
            onNavigate={(tab) => handleTabChange(tab)}
            onSelectComplaint={handleTrackComplaint}
          />
        )}
      </main>

      {/* Floating Bilingual AI Assistant */}
      <CivicSenseAI onNavigate={(tab) => setCurrentTab(tab)} />

      {/* Mobile Responsive Bottom Navigation */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Smart Civic Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-10 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Brand + Quick Links */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Brand identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="11" width="3" height="9" rx="0.5" fill="white" opacity="0.9" />
                    <rect x="6" y="8" width="3" height="12" rx="0.5" fill="white" />
                    <rect x="10" y="5" width="4" height="15" rx="0.5" fill="white" />
                    <rect x="15" y="9" width="3" height="11" rx="0.5" fill="white" opacity="0.9" />
                    <rect x="19" y="12" width="3" height="8" rx="0.5" fill="white" opacity="0.7" />
                    <line x1="1" y1="20" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight">SMART CIVIC</span>
                  <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    v2.0
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                A unified digital platform for monitoring public infrastructure, managing citizen complaints, and supporting data-driven civic services.
              </p>
            </div>

            {/* Quick navigation links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400 text-xs">
              <button onClick={() => setCurrentTab('home')} className="hover:text-emerald-400 transition-colors">Dashboard</button>
              <button onClick={() => setCurrentTab('report')} className="hover:text-emerald-400 transition-colors">Report Issue</button>
              <button onClick={() => setCurrentTab('my-complaints')} className="hover:text-emerald-400 transition-colors">My Complaints</button>
              <button onClick={() => setCurrentTab('tracking')} className="hover:text-emerald-400 transition-colors">Track Issues</button>
              <button onClick={() => setCurrentTab('map')} className="hover:text-emerald-400 transition-colors">Civic Map</button>
              <button onClick={() => setCurrentTab('projects')} className="hover:text-emerald-400 transition-colors">Projects</button>
              <button onClick={() => setCurrentTab('analytics')} className="hover:text-emerald-400 transition-colors">Analytics</button>
              <button onClick={() => setCurrentTab('authority')} className="hover:text-emerald-400 transition-colors">Authority Portal</button>
              <button onClick={() => setCurrentTab('users-db')} className="hover:text-emerald-400 transition-colors">User Directory</button>
            </div>
          </div>

          {/* Platform feature tags */}
          <div className="flex flex-wrap gap-2">
            {['AI-Assisted Triage', 'GIS Civic Mapping', 'Real-time Tracking', 'SLA Compliance', 'Photo Verification', 'Duplicate Detection', 'Multi-role Workflow'].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
                {tag}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-slate-900 text-slate-600 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 Smart Civic Platform. All rights reserved.</span>
            <span className="text-slate-700">Development &amp; Complaint Resolution Platform · v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
      {content}
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <CivicProvider>
        <CivicApp />
      </CivicProvider>
    </LanguageProvider>
  );
}
