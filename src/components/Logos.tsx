import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Official Emblem of the Government of Andhra Pradesh (ఆంధ్ర ప్రదేశ్ ప్రభుత్వం)
 * Features: Outer green ring, Sun rays, Purna Kumbham (పూర్ణకుంభం), Ashoka Lion Capital, Satyameva Jayate
 */
export const ApGovtLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Government of Andhra Pradesh Official Emblem"
    >
      {/* Outer Green Border */}
      <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#0D7D4D" strokeWidth="6" />
      <circle cx="100" cy="100" r="90" fill="#F0FDF4" stroke="#0D7D4D" strokeWidth="2" strokeDasharray="3 2" />

      {/* Decorative Outer Bead Rim */}
      <circle cx="100" cy="100" r="85" stroke="#0D7D4D" strokeWidth="1.5" />

      {/* Text Path for Top: GOVERNMENT OF ANDHRA PRADESH */}
      <path id="apGovtTextPathTop" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
      <text fill="#0D7D4D" fontSize="10.5" fontWeight="800" letterSpacing="1.2">
        <textPath href="#apGovtTextPathTop" startOffset="50%" textAnchor="middle">
          GOVERNMENT OF ANDHRA PRADESH
        </textPath>
      </text>

      {/* Text Path for Bottom: ఆంధ్ర ప్రదేశ్ ప్రభుత్వం */}
      <path id="apGovtTextPathBottom" d="M 172 100 A 72 72 0 0 1 28 100" fill="none" />
      <text fill="#0D7D4D" fontSize="11" fontWeight="800" letterSpacing="0.8">
        <textPath href="#apGovtTextPathBottom" startOffset="50%" textAnchor="middle">
          ఆంధ్ర ప్రదేశ్ ప్రభుత్వం
        </textPath>
      </text>

      {/* Inner Ring with Radiance */}
      <circle cx="100" cy="100" r="60" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />

      {/* Radiant Sun Rays */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        return (
          <line
            key={i}
            x1="100"
            y1="100"
            x2={100 + 56 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 56 * Math.sin((angle * Math.PI) / 180)}
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Inner Central Medallion */}
      <circle cx="100" cy="100" r="42" fill="#FFFFFF" stroke="#0D7D4D" strokeWidth="3" />

      {/* Purna Kumbham (Sacred Kalasam / పూర్ణకుంభం) */}
      <g id="purnaKumbham" transform="translate(100, 88) scale(0.65)">
        {/* Mango Leaves (మామిడి ఆకులు) */}
        <path d="M 0 -32 C -12 -22 -14 -10 0 0 C 14 -10 12 -22 0 -32 Z" fill="#0D7D4D" stroke="#047857" />
        <path d="M -16 -24 C -26 -16 -24 -2 -6 2 C -4 -12 -8 -20 -16 -24 Z" fill="#10B981" />
        <path d="M 16 -24 C 26 -16 24 -2 6 2 C 4 -12 8 -20 16 -24 Z" fill="#10B981" />

        {/* Coconut (కొబ్బరికాయ) */}
        <ellipse cx="0" cy="-12" rx="9" ry="12" fill="#92400E" />
        <circle cx="0" cy="-18" r="2.5" fill="#78350F" />

        {/* Kalasam Pot (పూర్ణ కలశం) */}
        <path
          d="M -16 2 Q -22 8 -20 20 Q -18 32 0 34 Q 18 32 20 20 Q 22 8 16 2 Z"
          fill="#F59E0B"
          stroke="#B45309"
          strokeWidth="2"
        />
        {/* Pot Rim & Auspicious Band */}
        <rect x="-18" y="0" width="36" height="4" rx="2" fill="#B45309" />
        <circle cx="0" cy="18" r="7" fill="#EF4444" />
        <circle cx="0" cy="18" r="4" fill="#FDE047" />
        {/* Decorative Swirls */}
        <path d="M -12 18 Q -6 24 0 24 Q 6 24 12 18" stroke="#78350F" strokeWidth="1.5" fill="none" />
      </g>

      {/* Ashoka Lion Capital (నలుగురు సింహాల చిహ్నం) at Bottom Center */}
      <g id="ashokaLions" transform="translate(100, 138) scale(0.48)">
        {/* Pedestal with Ashoka Chakra */}
        <rect x="-30" y="8" width="60" height="8" rx="2" fill="#DC2626" />
        <circle cx="0" cy="12" r="3.5" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        {/* Three Visible Lions in Crimson */}
        <path d="M -22 -14 C -24 -4 -18 8 -12 8 C -8 8 -6 -2 -8 -14 Z" fill="#DC2626" />
        <path d="M 22 -14 C 24 -4 18 8 12 8 C 8 8 6 -2 8 -14 Z" fill="#DC2626" />
        {/* Center Main Lion */}
        <path
          d="M -10 -20 C -12 -12 -12 0 -6 8 L 6 8 C 12 0 12 -12 10 -20 Q 0 -24 -10 -20 Z"
          fill="#B91C1C"
          stroke="#991B1B"
          strokeWidth="1"
        />
        {/* Lion Mane & Face detail */}
        <circle cx="-4" cy="-14" r="1.5" fill="#FEE2E2" />
        <circle cx="4" cy="-14" r="1.5" fill="#FEE2E2" />
        <polygon points="0,-11 -2,-8 2,-8" fill="#FFFFFF" />
      </g>

      {/* Satyameva Jayate Banner */}
      <g transform="translate(100, 155)">
        <rect x="-36" y="-3" width="72" height="10" rx="3" fill="#0D7D4D" />
        <text
          x="0"
          y="4.5"
          fill="#FFFFFF"
          fontSize="6"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          सत्यमेव जयते
        </text>
      </g>
    </svg>
  );
};

/**
 * Official Emblem of Vizianagaram Municipal Corporation (విజయనగరం నగరపాలక సంస్థ)
 * Features: Clock Tower, Veena, Temple Gopuram, Royal Elephants, Horse Warrior, Red Motto Ribbon
 */
export const VizianagaramCorpLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Vizianagaram Municipal Corporation Official Seal"
    >
      {/* Outer Twisted Rope Border */}
      <circle cx="100" cy="92" r="82" fill="#FFFFFF" stroke="#DC2626" strokeWidth="6" strokeDasharray="5 3" />
      <circle cx="100" cy="92" r="76" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />

      {/* Gear Teeth / Sunwheel Ring */}
      <circle cx="100" cy="92" r="68" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3" />

      {/* Text Path for VIZIANAGARAM MUNICIPAL CORPORATION */}
      <path id="vmcTextPath" d="M 36 92 A 64 64 0 0 1 164 92" fill="none" />
      <text fill="#1E293B" fontSize="9" fontWeight="900" letterSpacing="0.8">
        <textPath href="#vmcTextPath" startOffset="50%" textAnchor="middle">
          VIZIANAGARAM MUNICIPAL CORPORATION
        </textPath>
      </text>

      {/* Sky Blue Inner Field */}
      <circle cx="100" cy="94" r="54" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />

      {/* Golden Crest Ribbon at Top with Horse Warrior */}
      <g transform="translate(100, 20)">
        <path d="M -30 4 Q 0 -4 30 4 L 26 12 Q 0 6 -26 12 Z" fill="#F59E0B" stroke="#B45309" />
        {/* Horse with Warrior Silhouette */}
        <circle cx="0" cy="3" r="3" fill="#1E293B" />
        <path d="M -8 10 C -6 2 4 2 8 8 L 4 12 L -4 12 Z" fill="#1E293B" />
      </g>

      {/* Historic Vizianagaram Fort Clock Tower (గంటస్తంభం) */}
      <g transform="translate(94, 52)">
        {/* Tower Body */}
        <path
          d="M 2 48 L 4 12 L 8 4 L 14 4 L 18 12 L 20 48 Z"
          fill="#FDE047"
          stroke="#854D0E"
          strokeWidth="1.5"
        />
        {/* Dome & Spire */}
        <path d="M 6 4 Q 11 -6 16 4 Z" fill="#DC2626" stroke="#991B1B" />
        <line x1="11" y1="-6" x2="11" y2="-10" stroke="#854D0E" strokeWidth="1.5" />
        {/* Clock Face */}
        <circle cx="11" cy="22" r="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
        <circle cx="11" cy="22" r="1" fill="#DC2626" />
        <line x1="11" y1="22" x2="11" y2="19" stroke="#1E293B" strokeWidth="1" />
        <line x1="11" y1="22" x2="13.5" y2="22" stroke="#1E293B" strokeWidth="1" />
        {/* Arched Windows */}
        <rect x="9" y="32" width="4" height="6" rx="2" fill="#1E293B" />
        <rect x="9" y="40" width="4" height="6" rx="2" fill="#1E293B" />
      </g>

      {/* Temple Gopuram Tower Silhouette on Right */}
      <g transform="translate(118, 64)">
        <polygon points="4,34 6,10 16,10 18,34" fill="#0F172A" />
        <polygon points="7,10 11,2 15,10" fill="#DC2626" />
      </g>

      {/* Royal Profile (Maharaja Ananda Gajapathi Raju) Silhouette on Left */}
      <g transform="translate(68, 64)">
        <ellipse cx="14" cy="18" rx="8" ry="12" fill="#F8FAFC" stroke="#334155" />
        {/* Turban */}
        <path d="M 6 12 Q 14 4 22 10 Q 24 16 18 16 Q 10 16 6 12 Z" fill="#DC2626" />
      </g>

      {/* Bobbili Veena (Cultural Musical Instrument) on Right */}
      <g transform="translate(126, 86) rotate(-35)">
        {/* Resonator Bowl */}
        <ellipse cx="0" cy="14" rx="10" ry="13" fill="#D97706" stroke="#78350F" strokeWidth="1" />
        {/* Fingerboard Neck */}
        <rect x="-2" y="-24" width="4" height="38" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />
        {/* Yali Head */}
        <circle cx="0" cy="-26" r="3.5" fill="#DC2626" />
        {/* Strings */}
        <line x1="-1" y1="-22" x2="-1" y2="20" stroke="#FDE047" strokeWidth="0.5" />
        <line x1="1" y1="-22" x2="1" y2="20" stroke="#FDE047" strokeWidth="0.5" />
      </g>

      {/* Royal Caparisoned Elephants on Left and Right Flanks */}
      {/* Left Elephant */}
      <g transform="translate(28, 110) scale(0.32)">
        <path
          d="M 10 30 Q 30 10 60 20 Q 80 30 75 70 L 60 70 L 55 50 L 40 70 L 25 70 L 30 45 Q 10 50 5 70 L -5 70 Q -2 40 10 30 Z"
          fill="#1E293B"
        />
        {/* Trunk & Tusk */}
        <path d="M 12 35 Q 2 45 4 60 Q 10 62 12 55" stroke="#1E293B" strokeWidth="5" fill="none" />
        <path d="M 10 52 L 20 48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        {/* Head Covering */}
        <path d="M 40 22 Q 55 18 65 28 L 50 35 Z" fill="#DC2626" />
      </g>

      {/* Right Elephant */}
      <g transform="translate(144, 110) scale(-0.32, 0.32)">
        <path
          d="M 10 30 Q 30 10 60 20 Q 80 30 75 70 L 60 70 L 55 50 L 40 70 L 25 70 L 30 45 Q 10 50 5 70 L -5 70 Q -2 40 10 30 Z"
          fill="#1E293B"
        />
        {/* Trunk & Tusk */}
        <path d="M 12 35 Q 2 45 4 60 Q 10 62 12 55" stroke="#1E293B" strokeWidth="5" fill="none" />
        <path d="M 10 52 L 20 48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        {/* Head Covering */}
        <path d="M 40 22 Q 55 18 65 28 L 50 35 Z" fill="#DC2626" />
      </g>

      {/* Blue Platform with Motto: సదా మీ సేవలో (Always in Your Service) */}
      <polygon points="65,138 135,138 128,148 72,148" fill="#1D4ED8" stroke="#1E40AF" />
      <text x="100" y="145.5" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle">
        సదా మీ సేవలో
      </text>

      {/* Red Ceremonial Bottom Ribbon: విజయనగరం నగరపాలక సంస్థ */}
      <g transform="translate(100, 168)">
        <path
          d="M -90 4 Q -45 -6 0 -6 Q 45 -6 90 4 L 84 18 Q 45 6 0 6 Q -45 6 -84 18 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="1"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          విజయనగరం నగరపాలక సంస్థ
        </text>
      </g>
    </svg>
  );
};

/**
 * Academic Institution / College Emblem
 * Features: Sun with pen nib, Open Book with eyes of wisdom, "పండితాః సమదర్శినః", "SINCE 1996"
 */
export const CollegeEmblemLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Engineering College Institution Emblem"
    >
      {/* Soft Background Plate */}
      <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

      {/* Flaming Sun of Knowledge */}
      <g transform="translate(100, 72)">
        {/* Sun Circle */}
        <circle cx="0" cy="0" r="32" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
        <circle cx="0" cy="0" r="24" fill="#FBBF24" />

        {/* Sun Flames & Rays */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i * 360) / 18;
          const r1 = 33;
          const r2 = 42;
          const x1 = r1 * Math.cos((angle * Math.PI) / 180);
          const y1 = r1 * Math.sin((angle * Math.PI) / 180);
          const x2 = r2 * Math.cos((angle * Math.PI) / 180);
          const y2 = r2 * Math.sin((angle * Math.PI) / 180);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${x2 + 4} ${y2 - 2} ${x2} ${y2}`}
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Vertical Fountain Pen Nib Axis (Intellect Spire) */}
        <path
          d="M -3.5 -54 L 3.5 -54 L 4 -20 L 0 -10 L -4 -20 Z"
          fill="#1E3A8A"
          stroke="#172554"
          strokeWidth="1.5"
        />
        <circle cx="0" cy="-26" r="1.5" fill="#FFFFFF" />
        <line x1="0" y1="-24" x2="0" y2="-10" stroke="#FFFFFF" strokeWidth="1" />

        {/* Auspicious Kumkum Tilak / Bindi */}
        <circle cx="0" cy="8" r="4" fill="#DC2626" />
      </g>

      {/* Open Book of Wisdom with Eyes of Vigilance (సరస్వతీ నేత్రాలు) */}
      <g transform="translate(100, 92)">
        {/* Book Layer Wings (Light Blue Pages) */}
        <path
          d="M 0 0 C -25 -12 -55 -6 -70 8 C -55 16 -25 10 0 16 C 25 10 55 16 70 8 C 55 -6 25 -12 0 0 Z"
          fill="#BAE6FD"
          stroke="#0284C7"
          strokeWidth="1.5"
        />
        <path
          d="M 0 6 C -24 -4 -52 0 -66 14 C -52 21 -24 16 0 21 C 24 16 52 21 66 14 C 52 0 24 -4 0 6 Z"
          fill="#E0F2FE"
          stroke="#0284C7"
          strokeWidth="1.2"
        />

        {/* Expressive Eyes of Knowledge (విజ్ఞాన నేత్రాలు) */}
        {/* Left Eye */}
        <g transform="translate(-26, 4)">
          <path d="M -16 0 Q 0 -8 16 0 Q 0 8 -16 0 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="4.5" fill="#0F172A" />
          <circle cx="1.5" cy="-1.5" r="1.5" fill="#FFFFFF" />
        </g>
        {/* Right Eye */}
        <g transform="translate(26, 4)">
          <path d="M -16 0 Q 0 -8 16 0 Q 0 8 -16 0 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="4.5" fill="#0F172A" />
          <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFFFFF" />
        </g>
        {/* Gentle Smile / Spine */}
        <path d="M -4 14 Q 0 17 4 14" stroke="#DC2626" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>

      {/* Crossed Wheat Sheaves & Sugarcane (వరి కంకులు, చెరకు గడలు) */}
      <g transform="translate(100, 118)">
        <path d="M -30 2 Q 0 -8 30 14" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 30 2 Q 0 -8 -30 14" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Central Maroon Medallion with Ornate "S" */}
        <circle cx="0" cy="8" r="18" fill="#991B1B" stroke="#FDE047" strokeWidth="2" />
        <text
          x="0"
          y="15"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="900"
          fontFamily="Georgia, serif"
          textAnchor="middle"
        >
          S
        </text>

        {/* Water Ripple Waves */}
        <path d="M -24 16 Q -12 24 0 20 Q 12 16 24 22" stroke="#0284C7" strokeWidth="2" fill="none" />
      </g>

      {/* Sanskrit Telugu Inscription: పండితాః సమదర్శినః (Bhagavad Gita 5.18) */}
      <g transform="translate(100, 160)">
        <text
          x="0"
          y="0"
          fill="#DC2626"
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          పండితాః సమదర్శినః
        </text>
      </g>

      {/* Foundation Year: S I N C E 1 9 9 6 */}
      <g transform="translate(100, 178)">
        <text
          x="0"
          y="0"
          fill="#1E3A8A"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="2.5"
        >
          SINCE 1996
        </text>
      </g>
    </svg>
  );
};

/**
 * Combined Official GovTech Masthead displaying all three partner emblems
 */
export const OfficialGovTechHeader: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Andhra Pradesh Government */}
        <div className="flex items-center gap-2.5">
          <ApGovtLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 filter drop-shadow-sm" />
          <div className="leading-tight">
            <div className="text-[10px] sm:text-xs font-extrabold text-emerald-400 tracking-wide uppercase">
              ఆంధ్ర ప్రదేశ్ ప్రభుత్వం
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-300 font-semibold">
              Government of Andhra Pradesh
            </div>
          </div>
        </div>

        {/* Center: Vizianagaram Municipal Corporation */}
        <div className="flex items-center gap-2.5">
          <VizianagaramCorpLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 filter drop-shadow-sm" />
          <div className="leading-tight">
            <div className="text-[10px] sm:text-xs font-extrabold text-amber-400 tracking-wide">
              విజయనగరం నగరపాలక సంస్థ
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-300 font-semibold">
              Vizianagaram Municipal Corporation • సదా మీ సేవలో
            </div>
          </div>
        </div>

        {/* Right: Academic CSE Capstone Partner */}
        <div className="flex items-center gap-2.5">
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-[10px] font-extrabold text-rose-400 tracking-wide">
              పండితాః సమదర్శినః
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              CSE AI Capstone • Estd. 1996
            </div>
          </div>
          <CollegeEmblemLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 filter drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
};
