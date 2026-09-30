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
  FileCheck
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { Complaint } from '../types';

interface CivicHomeProps {
  onNavigate: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CivicHome: React.FC<CivicHomeProps> = ({ onNavigate, onSelectComplaint }) => {
  const { complaints } = useCivic();
  const { t } = useLanguage();

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;

  const recentComplaints = complaints.slice(0, 4);

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
                  <span>SMART CIVIC PLATFORM</span>
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
                        Before &amp; After photo proof captured directly by field engineers.
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

      {/* Real-time Civic Metrics Bar */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="border-r border-slate-100 last:border-none pr-3 sm:pr-4">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">{t.totalComplaints}</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{total}</div>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium">100% Digital Trail</span>
          </div>

          <div className="border-r border-slate-100 last:border-none pr-3 sm:pr-4">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">{t.resolved}</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{resolved}</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500">Verified photos</span>
          </div>

          <div className="border-r border-slate-100 last:border-none pr-3 sm:pr-4">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">{t.inProgress}</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{inProgress}</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500">Field engineers</span>
          </div>

          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">{t.slaHours}</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">&lt; 24h</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500">Priority triage</span>
          </div>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            System Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
            How Smart Civic Resolution Works
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            End-to-end automated transparency from citizen reporting to verified resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Snap & Geotag</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizens capture photos and pinpoint exact GPS coordinates on the interactive map.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Triage & Deduplication</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI classifies issue severity, checks for nearby duplicate complaints, and routes to the relevant department.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Field Crew Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assigned municipal officers receive ticket details with SLA deadlines and resolution targets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Citizen Audit & Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizens view photographic proof of completion, rate satisfaction, or reopen unresolved issues.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Civic Reports Feed */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.recentIssues}</h2>
            <p className="text-xs text-slate-500">Live feed of civic issues logged across the city</p>
          </div>

          <button
            onClick={() => onNavigate('tracking')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
          >
            <span>{t.viewAll} ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentComplaints.map((comp) => (
            <div
              key={comp.id}
              onClick={() => {
                onSelectComplaint(comp);
                onNavigate('tracking');
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between p-4"
            >
              <div>
                {/* Photo Thumbnail */}
                {comp.photos && comp.photos[0] && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img src={comp.photos[0]} alt={comp.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-mono font-bold text-[11px] text-slate-800">{comp.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      comp.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : comp.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {comp.status}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">{comp.title}</h3>
                <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed mb-3">
                  {comp.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>📍 {comp.location.ward.split('-')[0]}</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {comp.upvotes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Notice Card */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-950">Is this a life-threatening emergency?</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                For active fires, gas leaks, medical emergencies, or downed power lines, please call
                <strong> 112 (Emergency Services)</strong> immediately. Smart Civic handles municipal public infrastructure issues.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tips')}
            className="shrink-0 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            Read Civic Guide →
          </button>
        </div>
      </section>
    </div>
  );
};
