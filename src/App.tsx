import React, { useState } from 'react';
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
import { UserDatabaseView } from './components/UserDatabaseView';
import { WorkerDashboard } from './components/WorkerDashboard';
import { HigherOfficialDashboard } from './components/HigherOfficialDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SmartCityServices } from './components/SmartCityServices';
import { FutureScope } from './components/FutureScope';
import { CivicSenseAI } from './components/CivicSenseAI';
import { BottomNav } from './components/BottomNav';
import { Complaint } from './types';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X, MapPin, BarChart3, Building2 } from 'lucide-react';

const CivicApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const {
    setSelectedComplaint,
    activeToast,
    clearToast,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    recordComplaintVisit,
  } = useCivic();

  const handleTrackComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    if (recordComplaintVisit) {
      recordComplaintVisit(complaint.id);
    }
    setCurrentTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Real-Time User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

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
        setCurrentTab={setCurrentTab}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        {currentTab === 'home' && (
          <CivicHome
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectComplaint={handleTrackComplaint}
          />
        )}
        {currentTab === 'report' && (
          <ReportIssue onTrackComplaint={handleTrackComplaint} />
        )}
        {currentTab === 'my-complaints' && (
          <MyComplaints
            onTrackComplaint={handleTrackComplaint}
            onNavigateToReport={() => setCurrentTab('report')}
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
          <CivicMapView onSelectComplaint={handleTrackComplaint} />
        )}
        {currentTab === 'tips' && <CivicTips />}
        {currentTab === 'services' && (
          <SmartCityServices onReportIssue={() => setCurrentTab('report')} />
        )}
        {currentTab === 'future' && <FutureScope />}
        {currentTab === 'worker-portal' && <WorkerDashboard />}
        {currentTab === 'official-portal' && <HigherOfficialDashboard />}
        {currentTab === 'admin-portal' && <AdminDashboard />}
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
