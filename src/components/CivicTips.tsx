import React from 'react';
import {
  BookOpen,
  PhoneCall,
  Sparkles,
  Camera,
  MapPin,
  Trash2,
  Droplet,
  Zap,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const CivicTips: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Civic Handbook & Protocols</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Essential guides on emergency contacts, effective issue reporting, waste segregation, and how our AI verification operates.
        </p>
      </div>

      {/* Emergency Helpline Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span>Municipal & Emergency Helpline Directory</span>
        </h2>
        <p className="text-xs text-slate-500">
          For immediate life hazards, call national dispatch. For civil maintenance, use Smart Civic.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
            <div className="text-2xl font-mono font-extrabold text-rose-700">112</div>
            <div className="text-xs font-bold mt-1">National Emergency</div>
            <div className="text-[11px] text-rose-800 mt-0.5">Police, Fire, Ambulance & Life Safety</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
            <div className="text-2xl font-mono font-extrabold text-amber-700">1912</div>
            <div className="text-xs font-bold mt-1">Electricity Board (BESCOM)</div>
            <div className="text-[11px] text-amber-800 mt-0.5">High-voltage sparking & transformer faults</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
            <div className="text-2xl font-mono font-extrabold text-blue-700">1916</div>
            <div className="text-xs font-bold mt-1">Water Board (BWSSB)</div>
            <div className="text-[11px] text-blue-800 mt-0.5">Major pipeline bursts & contaminated mains</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <div className="text-2xl font-mono font-extrabold text-emerald-700">Smart Civic</div>
            <div className="text-xs font-bold mt-1">Smart Grievance Portal</div>
            <div className="text-[11px] text-emerald-800 mt-0.5">Potholes, garbage heaps, broken lights & drains</div>
          </div>
        </div>
      </div>

      {/* How to Report Effectively */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-600" />
          <span>Best Practices for Faster Redressal</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Clear Photographic Evidence</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Take 1 wide angle photo showing the landmark or street context, and 1 close-up photo showing the depth or hazard of the defect.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Precise Geolocation Pin</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Always click "Use My Live GPS" while standing near the issue, or drag the map pin to match the exact lane or building pillar.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Check for Existing Issues</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If a neighbor has already reported the pothole, click "Support Existing". Every upvote bumps the ticket priority without cluttering municipal queues.
            </p>
          </div>
        </div>
      </div>

      {/* AI Intelligence Explanation */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>How Smart Civic AI Triage Works</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Smart Civic incorporates a dual-mode classification engine powered by Google Gemini and offline deterministic NLP rules. When you draft an issue:
        </p>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li><strong>Text & Hazard Analysis:</strong> Evaluates keywords and safety impact (e.g., deep craters on high-speed corridors are flagged P1-Critical).</li>
          <li><strong>Department Routing:</strong> Directs tasks to Public Works, Solid Waste, Water Board, Electrical, or Traffic automatically.</li>
          <li><strong>Geospatial Deduplication:</strong> Computes the Haversine distance between new pins and active complaints within 400 meters.</li>
          <li><strong>SLA Monitoring:</strong> Assigns resolution deadlines (12h for Critical, 24h for High, 48h for Medium) and flags overdue tickets for administrative escalation.</li>
        </ul>
      </div>
    </div>
  );
};
