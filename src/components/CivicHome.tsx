import React from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Camera,
  Layers,
  ThumbsUp,
  Award,
  ShieldCheck,
  CheckCircle,
  Activity,
  FileCheck,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { Complaint } from '../types';

interface CivicHomeProps {
  onNavigate: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CivicHome: React.FC<CivicHomeProps> = ({ onNavigate, onSelectComplaint }) => {
  const { complaints, myComplaints, infrastructureProjects, currentUser, isAuthenticated } = useCivic();
  const { t, language } = useLanguage();

  const total = complaints.length;
  const resolved = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Verified' || c.status === 'Closed'
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Work Completed' || c.status === 'Work Planned'
  ).length;
  const pending = Math.max(0, total - resolved - inProgress);
  const departmentsCount = 8;
  const projectsCount = infrastructureProjects.length;

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Col: Headings & CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SMART CIVIC PLATFORM — CITIZEN PORTAL</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Municipal Grievance Resolution System
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t.heroTitle.split('.')[0]}. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  {t.heroTitle.split('.')[1] || 'Intelligent Resolution'}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Main Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('report')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t.heroReportCta}</span>
                </button>

                <button
                  onClick={() => onNavigate('tracking')}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-slate-700 transition-colors"
                >
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{t.heroTrackCta}</span>
                </button>

                <button
                  onClick={() => onNavigate('map')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white font-medium text-xs sm:text-sm px-3.5 py-3 sm:py-3.5 rounded-xl transition-colors hover:bg-white/5"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{t.navMap}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigate('projects')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white font-medium text-xs sm:text-sm px-3.5 py-3 sm:py-3.5 rounded-xl transition-colors hover:bg-white/5"
                >
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>Projects</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Right Col: Platform Overview Highlights */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Platform Key Features</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Operational
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">AI-Assisted Triage & Priority</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Automated classification, duplicate check, and department dispatching.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Dual Photo Verification</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Before &amp; After photo proof captured directly by department engineers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">GIS Mapping & Analytics</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Real-time spatial visualization and SLA tracking dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="text-[11px] font-medium text-slate-400">
                    Empowering transparent, efficient, data-driven municipal governance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Platform-Level Municipal Summary vs Personal Account Summary */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 sm:-mt-10 relative z-20 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-150 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-300">
                City-Wide Platform Statistics
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Overall municipal grievance &amp; infrastructure metrics across all wards
              </span>
            </div>
            {isAuthenticated && currentUser.role === 'citizen' && (
              <button
                type="button"
                onClick={() => onNavigate('my_complaints')}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition"
              >
                <span>My Personal Complaints ({currentUser.name}): {myComplaints.length}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="border-r border-slate-100 dark:border-slate-800 last:border-none pr-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Complaints</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{total}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Platform-Wide</span>
            </div>

            <div className="border-r border-slate-100 dark:border-slate-800 last:border-none pr-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Resolved Complaints</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{resolved}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Verified &amp; Closed</span>
            </div>

            <div className="border-r border-slate-100 dark:border-slate-800 last:border-none pr-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pending Complaints</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{pending}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Intake &amp; Assigned</span>
            </div>

            <div className="border-r border-slate-100 dark:border-slate-800 last:border-none pr-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{inProgress}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Active Field Work</span>
            </div>

            <div className="border-r border-slate-100 dark:border-slate-800 last:border-none pr-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Municipal Departments</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{departmentsCount}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Active Divisions</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Infrastructure Projects</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">{projectsCount}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Civic Works Tracked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Quick-Access Portal Grid (Section 3) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {language === 'ta' ? 'குடிமக்கள் சேவை மையம்' : 'Citizen Grievance Services'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {language === 'ta' ? 'உடனடி குடிமை சேவைகள்' : 'Quick Access Citizen Portal'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ta'
              ? 'புகார் பதிவு, ஒப்புகை சீட்டு, நிலை கண்காணிப்பு மற்றும் மேல்முறையீடு'
              : 'Submit grievances, download acknowledgements, track SLA status, or submit appeals'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('report')}
            className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {language === 'ta' ? 'புகார் பதிவு செய்க' : 'Raise a Complaint'}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'ta'
                  ? 'புகைப்படம் மற்றும் இருப்பிடத்துடன் புதிய குடிமை புகாரை பதிவு செய்து உடனடி ஒப்புகை எண் பெறுக.'
                  : 'Submit a structured grievance with GPS pin and supporting evidence to receive a unique SCP ID.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('tracking')}
            className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'ta' ? 'புகார் நிலையை அறிய' : 'Track a Complaint'}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'ta'
                  ? 'புகார் எண்ணை உள்ளிட்டு 11-நிலை முன்னேற்றம், அதிகாரி பதில் மற்றும் இலக்கு தேதியை காண்க.'
                  : 'Enter your Complaint ID to inspect the 11-stage timeline, SLA target date, and officer remarks.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('my-complaints')}
            className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {language === 'ta' ? 'எனது புகார்கள் (My Dashboard)' : 'My Complaints Dashboard'}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'ta'
                  ? 'நீங்கள் அளித்த அனைத்து புகார்கள், ஒப்புகை பதிவிறக்கம், மேல்முறையீடு மற்றும் கருத்துப்பதிவு.'
                  : 'View all your submitted grievances, download acknowledgements, file appeals, or rate resolutions.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('departments')}
            className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {language === 'ta' ? 'துறைகள் & SLA விவரம்' : 'Departments & SLA Directory'}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'ta'
                  ? 'துறைவாரியான பொறுப்பு அதிகாரிகள், SLA காலக்கெடு மற்றும் தீர்வு விகிதங்களை பார்வையிடுக.'
                  : 'Explore responsible municipal departments, SLA timelines, and departmental resolution metrics.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {language === 'ta' ? 'உள்கட்டமைப்பு திட்டங்கள்' : 'Infrastructure Projects'}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'ta'
                  ? 'நடைபெற்று வரும் சாலை, மழைநீர் வடிகால் மற்றும் தெருவிளக்கு திட்டங்களின் முன்னேற்றம்.'
                  : 'Monitor ongoing ward-level civic capital works, budgets, milestones, and completion progress.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('tips')}
            className="group text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {language === 'ta' ? 'உதவி மற்றும் வழிகாட்டுதல்கள்' : 'Help and Guidelines'}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'ta'
                  ? 'புகார் அளிக்கும் முறை, நிலை விளக்கம், மேல்முறையீடு மற்றும் அடிக்கடி கேட்கப்படும் கேள்விகள்.'
                  : 'Step-by-step instructions on registration, grievance filing, status meanings, appeals, and FAQs.'}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Public Announcements & Advisories Section */}
      {announcements && announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  {language === 'ta' ? 'பொது அறிவிப்புகள் (Announcements)' : 'Public Civic Announcements & Advisories'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">{announcements.length} Active Notices</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white">{ann.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ann.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                    <span>{ann.department}</span>
                    <span>{new Date(ann.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Civic Reports Feed */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.recentIssues}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live feed of civic issues logged across the city</p>
          </div>

          <button
            onClick={() => onNavigate('tracking')}
            className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>{t.viewAll} ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Complaints Recorded Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your municipal jurisdiction currently has zero pending issues. Help keep Chennai and Tamil Nadu clean by reporting defects!
            </p>
            <div className="pt-1">
              <button
                onClick={() => onNavigate('report')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                Report a Civic Issue Now
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentComplaints.map((comp) => (
              <div
                key={comp.id}
                onClick={() => {
                  onSelectComplaint(comp);
                  onNavigate('tracking');
                }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between p-4"
              >
                <div>
                  {/* Photo Thumbnail or Clean Placeholder */}
                  {comp.photos && comp.photos[0] ? (
                    <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                      <img src={comp.photos[0]} alt={comp.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl mb-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-slate-400 gap-1">
                      <ImageIcon className="w-5 h-5 opacity-60 text-slate-400" />
                      <span className="text-[10px] font-medium text-slate-400">No image attached</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200">{comp.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        comp.status === 'Resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : comp.status === 'In Progress'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mb-1">{comp.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed mb-3">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>📍 {comp.location?.ward ? comp.location.ward.split('-')[0].trim() : 'Ward Unassigned'}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {comp.upvotes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Emergency Notice Card */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">Is this a life-threatening emergency?</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                For active fires, gas leaks, medical emergencies, or downed power lines, please call
                <strong> 112 (Emergency Services)</strong> immediately. Smart Civic handles municipal public infrastructure issues.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tips')}
            className="shrink-0 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800/80 px-3.5 py-2 rounded-xl transition-colors"
          >
            Read Civic Guide →
          </button>
        </div>
      </section>
    </div>
  );
};
