import React from 'react';
import {
  Home,
  PlusCircle,
  Clock,
  Compass,
  Building2,
  MapPin
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser } = useCivic();
  const { t } = useLanguage();

  const getPortalLabel = () => {
    if (currentUser.role === 'worker') return 'Worker';
    if (currentUser.role === 'higher_official') return 'Official';
    if (currentUser.role === 'admin') return 'Admin';
    return t.navAuthority;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg pb-safe">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => setCurrentTab('home')}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            currentTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">{t.navOverview}</span>
        </button>

        {/* Smart Services */}
        <button
          onClick={() => setCurrentTab('services')}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            currentTab === 'services' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
          aria-label="Services"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">{t.navServices}</span>
        </button>

        {/* Report (Hero Action) */}
        <button
          onClick={() => setCurrentTab('report')}
          className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white w-14 h-14 rounded-full shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all shrink-0"
          aria-label="Report Issue"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[9px] font-bold mt-0.5 leading-none">{t.navReport}</span>
        </button>

        {/* Track */}
        <button
          onClick={() => setCurrentTab('my-complaints')}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            currentTab === 'my-complaints' || currentTab === 'tracking'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500'
          }`}
          aria-label="Track Complaints"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">{t.navMyReports}</span>
        </button>

        {/* Authority / Role Portal */}
        <button
          onClick={() => setCurrentTab('authority')}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            currentTab === 'authority' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
          aria-label="Portal"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">{getPortalLabel()}</span>
        </button>
      </div>
    </div>
  );
};
