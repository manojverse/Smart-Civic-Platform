import React from 'react';
import {
  BookOpen,
  PhoneCall,
  Sparkles,
  Camera,
  MapPin,
  ShieldCheck,
  UserPlus,
  LogIn,
  FilePlus2,
  Clock,
  RotateCcw,
  Star,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CivicTipsProps {
  onNavigate?: (tab: string) => void;
}

export const CivicTips: React.FC<CivicTipsProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  const WORKFLOW_GUIDES = [
    {
      icon: UserPlus,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: language === 'ta' ? '1. பதிவு செய்வது எப்படி (How to Register)' : '1. How to Register as a Citizen',
      desc:
        language === 'ta'
          ? 'முதல் முறையாகப் பயன்படுத்துவோர் உள்நுழைவுப் பக்கத்தில் "Create Citizen Account" என்பதைத் தேர்ந்தெடுத்து பெயர், கைபேசி எண், மின்னஞ்சல் மற்றும் வார்டு விவரங்களை உள்ளிட்டு பதிவு செய்யலாம்.'
          : 'New citizens can click "Create Citizen Account" on the Sign-In portal and enter their Full Name, Mobile Number, Email Address, and Municipal Ward to create an instant verified citizen profile.',
    },
    {
      icon: LogIn,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      title: language === 'ta' ? '2. உள்நுழைவது எப்படி (How to Log In)' : '2. How to Log In',
      desc:
        language === 'ta'
          ? 'உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் மற்றும் கடவுச்சொல் அல்லது Google கணக்கு மூலம் உள்நுழையலாம். அதிகாரிகள் மற்றும் நிர்வாகிகளுக்கு தனித்தனி போர்டல்கள் உள்ளன.'
          : 'Sign in using your registered Email & Password or Google Sign-In. Your role (Citizen, Field Staff, Department Officer, or Admin) automatically routes you to your authorized workspace.',
    },
    {
      icon: FilePlus2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      title: language === 'ta' ? '3. புகார் அளிப்பது எப்படி (How to Submit a Complaint)' : '3. How to Submit a Structured Complaint',
      desc:
        language === 'ta'
          ? '"புகார் பதிவு" பக்கத்தில் குடிமக்கள் விவரம், மாவட்டம்/வார்டு, GPS இருப்பிடம், புகாரின் வகை மற்றும் புகைப்பட ஆதாரத்தை இணைத்து சமர்ப்பிக்கவும். உடனடியாக தனித்துவமான புகார் எண் (SCP-2026-XXXXXX) வழங்கப்படும்.'
          : 'Open "Raise a Complaint" and complete Sections A–E: Citizen Details, District & Ward, Interactive GPS Map Pin, Category & Subcategory, Optional Photo/Document Evidence, and Citizen Declaration to receive your unique ID (SCP-2026-XXXXXX).',
    },
    {
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: language === 'ta' ? '4. புகார் நிலையை கண்காணிப்பது எப்படி (How to Track)' : '4. How to Track a Complaint',
      desc:
        language === 'ta'
          ? '"புகார் நிலை" (Track Status) அல்லது "எனது புகார்கள்" (My Complaints) பகுதியில் உங்கள் புகார் எண்ணை உள்ளிட்டு 11-நிலை முன்னேற்றம் மற்றும் SLA காலக்கெடுவை அறியலாம்.'
          : 'Visit "Track Status" or "My Complaints" and search by your Unique Complaint ID (e.g., SCP-2026-104201) to view the 11-stage resolution pipeline, assigned field officer, and SLA deadlines.',
    },
    {
      icon: Camera,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      title: language === 'ta' ? '5. புகைப்பட ஆதாரம் பதிவேற்றுதல் (Uploading Evidence)' : '5. Uploading Supporting Images & Documents',
      desc:
        language === 'ta'
          ? 'JPG, PNG அல்லது WEBP வடிவத்தில் (அதிகபட்சம் 5 MB) தெளிவான புகைப்படங்களை இணைக்கலாம். புகைப்படம் இல்லாமலும் புகார் அளிக்கலாம் — கள அதிகாரி நேரில் ஆய்வு செய்வார்.'
          : 'Upload clear JPG, PNG, or WEBP photos (up to 5 MB) or a supporting PDF petition. Image upload is optional—if you do not have a photo, submit directly and a field officer will inspect on site.',
    },
    {
      icon: RotateCcw,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      title: language === 'ta' ? '6. மேல்முறையீடு / மீண்டும் திறத்தல் (How to Appeal)' : '6. How to Appeal a Resolution',
      desc:
        language === 'ta'
          ? 'புகார் தீர்வு திருப்தி அளிக்கவில்லை எனில், "மேல்முறையீடு / மீண்டும் திற" பொத்தானை அழுத்தி காரணத்தையும் புகைப்படத்தையும் சமர்ப்பிக்கலாம்.'
          : 'If a complaint marked Resolved or Closed was not satisfactorily fixed, click "Appeal / Reopen Complaint" on the tracker page, select the appeal reason, add details, and escalate to senior officers.',
    },
    {
      icon: Star,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      title: language === 'ta' ? '7. கருத்து மற்றும் மதிப்பீடு (Providing Feedback)' : '7. How to Provide Citizen Feedback',
      desc:
        language === 'ta'
          ? 'தீர்வு செய்யப்பட்ட புகார்களுக்கு 1 முதல் 5 நட்சத்திர மதிப்பீடு, பணியின் தரம் மற்றும் அதிகாரியின் செயல்பாடு குறித்து கருத்து தெரிவிக்கலாம்.'
          : 'Once your grievance is resolved, click "Rate & Provide Feedback" to submit a 1–5 star rating, evaluate Resolution Quality, Officer Responsiveness, and Timeliness.',
    },
    {
      icon: ShieldCheck,
      color: 'text-slate-700 bg-slate-100 border-slate-300',
      title: language === 'ta' ? '8. ஒப்புகை சீட்டு பதிவிறக்கம் (Acknowledgement Receipt)' : '8. Downloading Official Acknowledgement',
      desc:
        language === 'ta'
          ? 'புகார் பதிவு செய்தவுடன் அல்லது "எனது புகார்கள்" பக்கத்தில் எப்போது வேண்டுமானாலும் அதிகாரப்பூர்வ ஒப்புகை சீட்டை பதிவிறக்கம் செய்யலாம்.'
          : 'Download a printable HTML/PDF Acknowledgement Receipt immediately after submission or anytime from "My Complaints" and "Track Status".',
    },
  ];

  const STATUS_DEFINITIONS = [
    { stage: '1. Complaint Submitted', desc: 'Your grievance has been logged into the Smart Civic Platform.' },
    { stage: '2. Acknowledgement Generated', desc: 'A unique tracking number (SCP-2026-XXXXXX) and SLA timer have been assigned.' },
    { stage: '3. Under Review', desc: 'Department nodal officer is verifying category, jurisdiction, and urgency.' },
    { stage: '4. Assigned to Department', desc: 'Routed to the responsible municipal department (PWD, Water Board, SWM, etc.).' },
    { stage: '5. Assigned to Officer', desc: 'Dispatched to a designated Field Officer / Engineer in your ward.' },
    { stage: '6. Work Planned', desc: 'Inspection completed; materials and repair schedule finalized.' },
    { stage: '7. Work In Progress', desc: 'Field crew is actively executing repairs on site (Before-work photo logged).' },
    { stage: '8. Work Completed', desc: 'Field execution finished; After-work proof uploaded by field staff.' },
    { stage: '9. Verification Pending', desc: 'Department Officer is auditing field completion proof and quality.' },
    { stage: '10. Resolved', desc: 'Official verification passed; issue is resolved and open for citizen feedback.' },
    { stage: '11. Closed / Reopened', desc: 'Formally closed after citizen satisfaction, or Reopened if citizen files an appeal.' },
  ];

  const FAQS = [
    {
      q: 'Is uploading a photo mandatory to submit a complaint?',
      a: 'No. Uploading a photo is optional. While a photo helps speed up visual assessment, complaints submitted without photos are accepted without any placeholder images and scheduled for direct on-site inspection.',
    },
    {
      q: 'How are SLA resolution timelines calculated?',
      a: 'SLA timelines depend on urgency and category: Critical safety hazards have a 12–24 hour resolution SLA, High priority grievances have a 24–48 hour SLA, and standard maintenance requests have a 48–72 hour SLA.',
    },
    {
      q: 'What happens if I am not satisfied with the resolution?',
      a: 'You can click "Appeal / Reopen Complaint" on any Resolved or Closed ticket. Your appeal is logged with a unique Appeal ID, all prior timeline history is preserved, and the ticket is escalated to the Department Officer.',
    },
    {
      q: 'Can other citizens see my confidential administrative notes?',
      a: 'Internal administrative notes recorded by officers are strictly confidential and visible only to authorized municipal staff and administrators. Citizens only see official public status remarks.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SMART CIVIC PLATFORM · Citizen Help &amp; Guidelines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'ta'
              ? 'குடிமக்கள் உதவி மற்றும் வழிகாட்டுதல்கள்'
              : 'Citizen Help, SOPs & Grievance Guidelines'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Complete step-by-step instructions on registering, filing structured complaints, tracking 11-stage departmental progress, appealing unsatisfactory closures, and emergency helplines.
          </p>
        </div>

        {onNavigate && (
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <span>{t('reportIssue')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('tracking')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold transition"
            >
              {t('trackStatus')}
            </button>
          </div>
        )}
      </div>

      {/* Emergency Guidance Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-rose-600" />
          <span>Emergency &amp; Essential Civic Helpline Directory</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          For immediate life-threatening emergencies (fire, medical, police, live high-voltage wire), always call emergency dispatch first.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200">
            <div className="text-2xl font-mono font-extrabold text-rose-700 dark:text-rose-400">112</div>
            <div className="text-xs font-bold mt-1">National Emergency Response</div>
            <div className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
              Police, Fire &amp; Rescue, Ambulance (24x7)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200">
            <div className="text-2xl font-mono font-extrabold text-amber-700 dark:text-amber-400">1912</div>
            <div className="text-xs font-bold mt-1">Electricity Fault Helpline</div>
            <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Live wire hazards, transformer sparks &amp; outages
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200">
            <div className="text-2xl font-mono font-extrabold text-blue-700 dark:text-blue-400">1916</div>
            <div className="text-xs font-bold mt-1">Water Supply &amp; Sewerage</div>
            <div className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5">
              Main pipeline bursts &amp; sewage overflow
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
            <div className="text-2xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400">1913</div>
            <div className="text-xs font-bold mt-1">Municipal Civic Helpline</div>
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
              Civic roads, stormwater drains, sanitation &amp; parks
            </div>
          </div>
        </div>
      </div>

      {/* 8-Step Citizen Portal Guide */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>Step-by-Step Citizen Portal Guide</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKFLOW_GUIDES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex items-start gap-4"
              >
                <div className={`p-3 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Understanding the 11 Complaint Statuses */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Understanding Complaint Statuses (11-Stage Lifecycle)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {STATUS_DEFINITIONS.map((st) => (
            <div
              key={st.stage}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
            >
              <div className="font-bold text-emerald-700 dark:text-emerald-400">{st.stage}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions (FAQs) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Frequently Asked Questions (FAQs)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5"
            >
              <div className="font-bold text-slate-900 dark:text-white">{faq.q}</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
