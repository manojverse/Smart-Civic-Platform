import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Smart Civic — Neutral Civic Technology Icon
 * A generic civic platform identity — no government seal, no institutional emblem.
 */
export const SmartCivicLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Smart Civic Platform Logo"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="96" fill="#0F172A" stroke="#10b981" strokeWidth="4" />
      <circle cx="100" cy="100" r="88" fill="#0F172A" stroke="#064e3b" strokeWidth="1" strokeDasharray="4 3" />

      {/* City skyline silhouette */}
      <g fill="#1e293b" stroke="#10b981" strokeWidth="1.5">
        {/* Building 1 */}
        <rect x="30" y="105" width="20" height="45" rx="1" fill="#10b981" opacity="0.8" />
        <rect x="34" y="99" width="12" height="10" rx="1" fill="#10b981" />
        {/* Building 2 */}
        <rect x="55" y="95" width="18" height="55" rx="1" fill="#0d9488" opacity="0.7" />
        <rect x="60" y="87" width="8" height="12" rx="1" fill="#0d9488" />
        {/* Building 3 — tallest */}
        <rect x="79" y="72" width="22" height="78" rx="1" fill="#059669" opacity="0.9" />
        <rect x="84" y="63" width="12" height="13" rx="1" fill="#059669" />
        {/* Antenna on tallest */}
        <line x1="90" y1="63" x2="90" y2="50" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        <circle cx="90" cy="48" r="3" fill="#34d399" />
        {/* Building 4 */}
        <rect x="106" y="88" width="18" height="62" rx="1" fill="#0d9488" opacity="0.7" />
        <rect x="110" y="80" width="10" height="12" rx="1" fill="#0d9488" />
        {/* Building 5 */}
        <rect x="130" y="102" width="20" height="48" rx="1" fill="#10b981" opacity="0.8" />
        <rect x="134" y="95" width="12" height="11" rx="1" fill="#10b981" />
        {/* Building 6 */}
        <rect x="156" y="112" width="14" height="38" rx="1" fill="#059669" opacity="0.6" />
      </g>

      {/* Ground line */}
      <line x1="22" y1="150" x2="178" y2="150" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      {/* Map pin / location icon at center */}
      <g transform="translate(90, 28)">
        <path
          d="M10 0 C4.477 0 0 4.477 0 10 C0 17.5 10 28 10 28 C10 28 20 17.5 20 10 C20 4.477 15.523 0 10 0 Z"
          fill="#34d399"
          stroke="#059669"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="10" r="4" fill="#0F172A" />
      </g>

      {/* Bottom label band */}
      <rect x="28" y="156" width="144" height="22" rx="4" fill="#064e3b" />
      <text
        x="100"
        y="171"
        fill="#34d399"
        fontSize="11"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="2"
        fontFamily="system-ui, sans-serif"
      >
        SMART CIVIC
      </text>
    </svg>
  );
};

/**
 * Compact inline wordmark for navbar use
 */
export const SmartCivicWordmark: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* City buildings */}
          <rect x="2" y="11" width="3" height="9" rx="0.5" fill="white" opacity="0.9" />
          <rect x="6" y="8" width="3" height="12" rx="0.5" fill="white" />
          <rect x="10" y="5" width="4" height="15" rx="0.5" fill="white" />
          <rect x="15" y="9" width="3" height="11" rx="0.5" fill="white" opacity="0.9" />
          <rect x="19" y="12" width="3" height="8" rx="0.5" fill="white" opacity="0.7" />
          {/* Ground */}
          <line x1="1" y1="20" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* Pin dot on tallest */}
          <circle cx="12" cy="3" r="1.5" fill="#34d399" />
        </svg>
      </div>
      <div>
        <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
          SMART CIVIC
        </div>
        <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
          Civic Platform
        </div>
      </div>
    </div>
  );
};

/**
 * Smart Civic header banner — neutral, professional, no government or institutional branding
 */
export const SmartCivicHeader: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Platform identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="11" width="3" height="9" rx="0.5" fill="white" opacity="0.9" />
              <rect x="6" y="8" width="3" height="12" rx="0.5" fill="white" />
              <rect x="10" y="5" width="4" height="15" rx="0.5" fill="white" />
              <rect x="15" y="9" width="3" height="11" rx="0.5" fill="white" opacity="0.9" />
              <rect x="19" y="12" width="3" height="8" rx="0.5" fill="white" opacity="0.7" />
              <line x1="1" y1="20" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-extrabold text-emerald-400 tracking-widest uppercase">
              Smart Civic
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              Development &amp; Complaint Resolution Platform
            </div>
          </div>
        </div>

        {/* Center: Status strip */}
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            AI-Assisted Triage
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
            GIS Civic Map
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            Real-time Tracking
          </span>
        </div>

        {/* Right: Platform version */}
        <div className="text-[9px] text-slate-500 font-mono hidden md:block">
          v2.0 · 2026
        </div>
      </div>
    </div>
  );
};

// ─── Legacy export aliases (used by other components) ──────────────────────────
// These ensure existing imports continue to work without mass-refactoring all consumers.
export const StateGovtLogo = SmartCivicLogo;
export const CityCorpLogo = SmartCivicLogo;
export const CollegeEmblemLogo = SmartCivicLogo;
export const OfficialGovTechHeader = SmartCivicHeader;
