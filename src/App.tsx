import React, { useState } from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
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
import { ApGovtLogo, VizianagaramCorpLogo, CollegeEmblemLogo } from './components/Logos';
import { Complaint } from './types';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

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
      <main className="flex-1">
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
      </main>

      {/* Municipal CivicSense Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Institutional Emblems Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-800/80">
            {/* 1. Government of Andhra Pradesh */}
            <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <ApGovtLogo className="w-12 h-12 shrink-0 filter drop-shadow-md" />
              <div>
                <div className="text-xs font-bold text-white tracking-wide">
                  ఆంధ్ర ప్రదేశ్ ప్రభుత్వం
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Government of Andhra Pradesh
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Municipal Administration & Urban Development (MA&UD)
                </div>
              </div>
            </div>

            {/* 2. Vizianagaram Municipal Corporation */}
            <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <VizianagaramCorpLogo className="w-12 h-12 shrink-0 filter drop-shadow-md" />
              <div>
                <div className="text-xs font-bold text-white tracking-wide">
                  విజయనగరం నగరపాలక సంస్థ
                </div>
                <div className="text-[11px] text-amber-400 font-semibold">
                  Vizianagaram Municipal Corporation
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  సదా మీ సేవలో • Public Grievance Redressal Cell
                </div>
              </div>
            </div>

            {/* 3. Academic Capstone & Research Partner */}
            <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <CollegeEmblemLogo className="w-12 h-12 shrink-0 filter drop-shadow-md" />
              <div>
                <div className="text-xs font-bold text-white tracking-wide">
                  పండితాః సమదర్శినః
                </div>
                <div className="text-[11px] text-rose-400 font-semibold">
                  CSE Department • Estd. 1996
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Final-Year Capstone Project • Academic Year 2025–2026
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">CIVICSENSE VIZIANAGARAM</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SMART GOVTECH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                Citizen-centric AI municipal grievance redressal, GIS duplicate triage, SLA compliance, and transparent public governance.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
              <button onClick={() => setCurrentTab('home')} className="hover:text-emerald-400 transition-colors">
                Home
              </button>
              <button onClick={() => setCurrentTab('report')} className="hover:text-emerald-400 transition-colors">
                Report Issue
              </button>
              <button onClick={() => setCurrentTab('my-complaints')} className="hover:text-emerald-400 transition-colors">
                My Reports
              </button>
              <button onClick={() => setCurrentTab('tracking')} className="hover:text-emerald-400 transition-colors">
                Audit Timeline
              </button>
              <button onClick={() => setCurrentTab('map')} className="hover:text-emerald-400 transition-colors">
                GIS Map
              </button>
              <button onClick={() => setCurrentTab('authority')} className="hover:text-emerald-400 transition-colors">
                Authority Portal
              </button>
              <button onClick={() => setCurrentTab('users-db')} className="hover:text-emerald-400 transition-colors">
                User Database
              </button>
              <button onClick={() => setCurrentTab('analytics')} className="hover:text-emerald-400 transition-colors">
                Analytics
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 CivicSense • Vizianagaram Municipal Corporation & Govt. of Andhra Pradesh. All rights reserved.</span>
            <span>Developed for CSE Capstone Defense 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CivicProvider>
      <CivicApp />
    </CivicProvider>
  );
}
