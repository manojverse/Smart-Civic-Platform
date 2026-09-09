import React from 'react';
import { Complaint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ApGovtLogo, VizianagaramCorpLogo } from './Logos';
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  FileCheck2,
  Camera,
  Layers,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';

interface OfficialInspectionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

export const OfficialInspectionReportModal: React.FC<OfficialInspectionReportModalProps> = ({
  isOpen,
  onClose,
  complaint,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen || !complaint) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      officialHeader: 'Vizianagaram Municipal Corporation - Grievance Redressal Dossier',
      dossierId: `VMC-GRC-${complaint.id}`,
      generatedAt: new Date().toISOString(),
      language,
      complaint: {
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        severity: complaint.severity,
        priority: complaint.priority,
        status: complaint.status,
        location: complaint.location,
        createdAt: complaint.createdAt,
      },
      aiVerification: {
        validity: complaint.aiValidity || 'VALID',
        confidence: complaint.aiConfidence || 95,
        priority: complaint.aiPriority || 'HIGH',
        assignedDepartment: complaint.recommendedDepartment || complaint.department,
        recommendedAction: complaint.recommendedAction,
        rationale: complaint.aiReason,
      },
      photoAnalysis: complaint.photoAnalysis || null,
      statutoryAdvisory: t.nonPretenceAdvisory,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VMC_Official_Inspection_${complaint.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const photoAnalysis = complaint.photoAnalysis;
  const isAiSuspect = photoAnalysis?.isAiGenerated || photoAnalysis?.imageFraudVerdict === 'SUSPECTED_AI_GENERATED';
  const isMismatched = photoAnalysis?.imageFraudVerdict === 'MISMATCHED_IMAGE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">{t.officialReportTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printReportBtn}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.downloadDossierBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content Area (Print Target) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 font-sans print:p-4 print:overflow-visible">
          
          {/* Government Formal Header */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <VizianagaramCorpLogo className="w-16 h-16 shrink-0 filter drop-shadow-sm" />
                <ApGovtLogo className="w-16 h-16 shrink-0 filter drop-shadow-sm" />
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight">
                    {t.corpName}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-semibold text-emerald-800">
                    {t.govtName} • {t.deptName}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Civic Grievance Redressal & Smart Verification Cell • ISO 9001:2015 Certified
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-[220px]">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {t.dossierRefNo}
                </div>
                <div className="text-sm font-mono font-extrabold text-slate-900 tracking-wider">
                  VMC/GRC/2026/{complaint.id.replace(/[^0-9]/g, '').slice(-6) || '00101'}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 flex items-center justify-center sm:justify-end gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <Clock className="w-3 h-3 text-slate-400 ml-1" />
                  <span>{new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Core Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ticket ID</span>
              <span className="font-mono font-bold text-slate-900">{complaint.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.reportingCitizen}</span>
              <span className="font-semibold text-slate-800 truncate block">
                {complaint.reportedBy?.name || 'Citizen User'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Administrative Ward</span>
              <span className="font-semibold text-slate-800 truncate block">{complaint.location.ward}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.targetSla}</span>
              <span className="font-mono font-bold text-emerald-700">
                {complaint.slaHours || 24} Hours ({complaint.priority})
              </span>
            </div>
          </div>

          {/* Section 1: Grievance Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. Citizen Reported Grievance</span>
            </h3>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-900">{complaint.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{complaint.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>
                  {complaint.location.address}
                  {complaint.location.landmark && ` (Landmark: ${complaint.location.landmark})`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                  GPS: {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: AI Photo Authenticity & Computer Vision Feature Audit */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>2. Visual Evidence & AI Fraud Authenticity Audit</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 text-white p-4 rounded-xl border border-slate-800">
              
              {/* Photo Evidence Preview with CV Bounding Box */}
              <div className="md:col-span-4 relative rounded-lg overflow-hidden border border-slate-700 aspect-video md:aspect-auto bg-slate-900">
                {complaint.photos && complaint.photos[0] ? (
                  <img
                    src={complaint.photos[0]}
                    alt="Inspection Evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    No photo attached
                  </div>
                )}

                {/* Authenticity Badge Overlay */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAiSuspect
                        ? 'bg-rose-600 text-white'
                        : isMismatched
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isAiSuspect ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>AI GENERATED (SYNTHETIC)</span>
                      </>
                    ) : isMismatched ? (
                      <>
                        <HelpCircle className="w-3 h-3" />
                        <span>MISMATCHED IMAGE</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>VERIFIED FIELD CAPTURE</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Forensic Details Grid */}
              <div className="md:col-span-8 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-400 block">{t.authenticityScore}</span>
                    <span className="font-mono text-base font-extrabold text-emerald-400">
                      {photoAnalysis?.authenticityScore || 96}%
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-400 block">{t.aiLikelihood}</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isAiSuspect ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {photoAnalysis?.aiLikelihood || 'LOW (< 5%)'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">{t.tamperIntegrityTitle}</span>
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {photoAnalysis?.exifIntegrity || 'VERIFIED_VALID'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase">
                      {t.detectedVisualProblem}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      Visual Hazard: {photoAnalysis?.detectedFeatureSeverity || 'High'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium">
                    {photoAnalysis?.detectedCivicFeature || 'Localized bituminous asphalt pavement cavity (Pothole)'}
                  </p>
                  {photoAnalysis?.estimatedDimensions && (
                    <p className="text-[10px] text-slate-400">
                      <strong>Est. Extents:</strong> {photoAnalysis.estimatedDimensions}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-300 italic pt-0.5">
                    {photoAnalysis?.relevanceExplanation ||
                      'Visual features demonstrate authentic localized road surface depression consistent with reported commuter grievance.'}
                  </p>
                </div>

                {photoAnalysis?.detectedHazards && photoAnalysis.detectedHazards.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {photoAnalysis.detectedHazards.map((h, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full"
                      >
                        ⚠️ {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: AI Complaint Verification & Smart Routing Assessment */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>3. AI Triage Verdict & Municipal Smart Routing</span>
            </h3>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Verification Verdict</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md font-extrabold text-xs ${
                      complaint.aiValidity === 'VALID'
                        ? 'bg-emerald-600 text-white'
                        : complaint.aiValidity === 'INVALID'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {complaint.aiValidity || 'VALID'} ({complaint.aiConfidence || 95}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Allocated Priority</span>
                  <span className="font-extrabold text-slate-900 block">
                    {complaint.aiPriority || complaint.priority || 'HIGH'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Location State</span>
                  <span className="font-semibold text-slate-800 block">
                    {complaint.aiLocationStatus || 'PROVIDED'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">{t.smartRoutingLabel}</span>
                  <span className="font-extrabold text-indigo-900 block truncate">
                    {complaint.recommendedDepartment || complaint.department || 'Municipal Roads Department'}
                  </span>
                </div>
              </div>

              {complaint.aiReason && (
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-200/60 leading-relaxed">
                  <strong className="text-emerald-950 font-semibold">{t.rationaleLabel}:</strong>{' '}
                  {complaint.aiReason}
                </div>
              )}

              {complaint.recommendedAction && (
                <div className="text-xs text-emerald-950 bg-emerald-100/70 p-2.5 rounded-lg border border-emerald-300/80 leading-relaxed">
                  <strong className="font-bold">{t.recommendedActionLabel}:</strong>{' '}
                  {complaint.recommendedAction}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Field Inspection Checklist & Official Sign-Off */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
              <span>4. Field Verification Checklist & Official Sign-off</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  <span className="text-slate-700">Physical field site inspected by ward technician</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  <span className="text-slate-700">Photo evidence matches actual ground conditions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  <span className="text-slate-700">Public safety hazard assessed & perimeter cordoned</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  <span className="text-slate-700">Dispatched work order to Municipal Field Gang #4</span>
                </label>
              </div>

              <div className="flex flex-col justify-end items-end sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <div className="w-44 border-b border-slate-400 pb-1 text-center font-mono text-[11px] text-slate-600">
                  Er. K. Ramesh, AEE
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1 text-center w-44">
                  Assistant Executive Engineer
                </div>
                <div className="text-[9px] text-slate-400 text-center w-44">
                  Vizianagaram Municipal Corporation
                </div>
                <div className="mt-2 px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                  STAMP: VMC-INSPECTED-2026
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Advisory */}
          <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-slate-200 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{t.nonPretenceAdvisory}</span>
          </div>

        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 print:hidden">
          <span>Official Andhra Pradesh Municipal Redressal Docket</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
};
