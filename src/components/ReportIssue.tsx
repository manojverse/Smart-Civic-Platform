import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Crosshair,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  X,
  Printer,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Image as ImageIcon,
  User,
  Phone,
  Mail,
  Map as MapIcon,
  Download,
  Eye,
  LayoutDashboard,
  ShieldCheck,
  FileUp,
} from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ComplaintCategory,
  Severity,
  AIClassificationResult,
  Complaint,
  AIVerificationResult,
  PhotoAuthenticityAnalysis,
  MunicipalDepartment,
} from '../types';
import { WARDS, ZONES, CITIES } from '../data/seedData';
import { findPotentialDuplicates, DuplicateMatch } from '../services/aiClassifier';
import { verifyComplaint } from '../services/aiVerificationService';
import { analyzePhotoAuthenticity } from '../services/imageAuthenticityService';
import { AIVerificationCard } from './AIVerificationCard';
import { downloadComplaintAcknowledgement, printComplaintAcknowledgement } from '../utils/acknowledgementHelper';

const TN_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thoothukudi',
  'Thanjavur',
  'Chengalpattu',
  'Kancheepuram',
  'Tiruvallur',
  'Dindigul',
  'Cuddalore',
  'Kanyakumari',
];

const CATEGORIES: {
  name: ComplaintCategory;
  icon: string;
  desc: string;
  defaultDept: MunicipalDepartment;
  subcategories: string[];
}[] = [
  {
    name: 'Pothole',
    icon: '🕳️',
    desc: 'Road craters, dips & damaged tarmac',
    defaultDept: 'Public Works Department (PWD)',
    subcategories: ['Deep Asphalt Crater', 'Waterlogged Road Pothole', 'Junction Surface Dip', 'Manhole Surround Damage'],
  },
  {
    name: 'Garbage',
    icon: '🗑️',
    desc: 'Overflowing bins & uncollected waste',
    defaultDept: 'Solid Waste Management',
    subcategories: ['Overflowing Community Bin', 'Uncollected Street Waste', 'Illegal Construction Dumping', 'Dead Animal / Bio-Waste'],
  },
  {
    name: 'Water Leakage',
    icon: '💧',
    desc: 'Pipe bursts, gushing potable mains',
    defaultDept: 'Water Supply & Sewerage Board',
    subcategories: ['Main Supply Pipeline Burst', 'Valve Chamber Leakage', 'Contaminated Drinking Water', 'Low Pressure / No Supply'],
  },
  {
    name: 'Drainage',
    icon: '🌊',
    desc: 'Clogged storm drains & sewage overflow',
    defaultDept: 'Water Supply & Sewerage Board',
    subcategories: ['Sewage Overflow on Road', 'Blocked Stormwater Drain', 'Broken Drain Slab / Open Manhole', 'Stagnant Flood Water'],
  },
  {
    name: 'Streetlight',
    icon: '💡',
    desc: 'Dead lampposts, exposed wires & dark roads',
    defaultDept: 'Electricity & Streetlighting',
    subcategories: ['Non-Functional LED Streetlight', 'Entire Street Dark / Feeder Fault', 'Exposed Live Electrical Box', 'Damaged Light Pole'],
  },
  {
    name: 'Road Damage',
    icon: '🚧',
    desc: 'Cracked surfaces, caved-in road dividers',
    defaultDept: 'Public Works Department (PWD)',
    subcategories: ['Damaged Footpath / Pedestrian Slab', 'Road Cave-In / Sinkhole', 'Broken Median / Speed Breaker', 'Unfinished Road Excavation'],
  },
  {
    name: 'Traffic',
    icon: '🚦',
    desc: 'Faulty signals, illegal parking, blockades',
    defaultDept: 'Traffic & Transport Planning',
    subcategories: ['Malfunctioning Traffic Signal', 'Missing Road Safety Signage', 'Faded Zebra Crossing', 'Footpath Encroachment'],
  },
  {
    name: 'Pollution',
    icon: '🏭',
    desc: 'Garbage burning, industrial toxic fumes',
    defaultDept: 'Public Health & Sanitation',
    subcategories: ['Open Garbage Burning', 'Construction Dust Hazard', 'Illegal Effluent Discharge', 'Severe Noise Pollution'],
  },
  {
    name: 'Public Property Damage',
    icon: '🏛️',
    desc: 'Damaged bus stops, railings, benches',
    defaultDept: 'Public Works Department (PWD)',
    subcategories: ['Damaged Bus Shelter Roof', 'Broken Culvert Railing', 'Vandalized Public Signboard', 'Damaged Community Center'],
  },
  {
    name: 'Park Issue',
    icon: '🌳',
    desc: 'Broken playground swings, fallen branches',
    defaultDept: 'Horticulture & Parks',
    subcategories: ['Fallen Tree / Hazardous Branch', 'Broken Children Play Equipment', 'Unmaintained Walking Track', 'Park Lighting Failure'],
  },
  {
    name: 'Sanitation',
    icon: '🚻',
    desc: 'Unhygienic public toilets, pest breeding',
    defaultDept: 'Public Health & Sanitation',
    subcategories: ['Unhygienic Public Restroom', 'Mosquito Breeding / Fogging Needed', 'Open Defecation / Urination Spot', 'Stray Cattle / Dog Menace'],
  },
  {
    name: 'Other',
    icon: '📋',
    desc: 'General municipal infrastructure problems',
    defaultDept: 'Public Works Department (PWD)',
    subcategories: ['General Municipal Grievance', 'Civic Amenity Request', 'Public Safety Hazard'],
  },
];

const DEPARTMENTS: MunicipalDepartment[] = [
  'Public Works Department (PWD)',
  'Solid Waste Management',
  'Water Supply & Sewerage Board',
  'Electricity & Streetlighting',
  'Traffic & Transport Planning',
  'Public Health & Sanitation',
  'Horticulture & Parks',
];

interface ReportIssueProps {
  onTrackComplaint: (complaint: Complaint) => void;
  onNavigate?: (tab: string) => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({ onTrackComplaint, onNavigate }) => {
  const { createComplaint, complaints, currentUser } = useCivic();
  const { t, language } = useLanguage();

  // 4-Step Structured Registration Wizard (covering Sections A, B, C, D, E)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // SECTION A — Citizen Details
  const [residentName, setResidentName] = useState(currentUser?.name || '');
  const [residentMobile, setResidentMobile] = useState(currentUser?.phone || '');
  const [residentEmail, setResidentEmail] = useState(currentUser?.email || '');
  const [district, setDistrict] = useState('Chennai');
  const [city, setCity] = useState(CITIES[0] || 'Chennai');
  const [zone, setZone] = useState(ZONES[1] || 'Zone 8 - Anna Nagar & Kilpauk');
  const [ward, setWard] = useState(currentUser?.ward || WARDS[0] || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');

  // SECTION B — Complaint Details
  const [category, setCategory] = useState<ComplaintCategory>('Pothole');
  const [subtype, setSubtype] = useState('Deep Asphalt Crater');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [suggestedDept, setSuggestedDept] = useState<MunicipalDepartment>('Public Works Department (PWD)');

  // SECTION C — Location Details
  const [lat, setLat] = useState(13.085);
  const [lng, setLng] = useState(80.2101);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // SECTION D — Supporting Evidence
  const [photos, setPhotos] = useState<string[]>([]);
  const [supportingDocName, setSupportingDocName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mediaNotes, setMediaNotes] = useState('');

  // SECTION E — Citizen Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // AI Triage & Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);
  const [aiResult] = useState<AIClassificationResult | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAuthenticityAnalysis | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);

  // Submission Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const selectedCategoryMeta = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];

  const handleCategoryChange = (newCat: ComplaintCategory) => {
    setCategory(newCat);
    const meta = CATEGORIES.find((c) => c.name === newCat);
    if (meta) {
      setSuggestedDept(meta.defaultDept);
      setSubtype(meta.subcategories[0] || '');
    }
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setLat(uLat);
        setLng(uLng);
        setIsLocating(false);
        setLocationSuccess(true);
        if (!street) {
          setStreet(`GPS Pin [${uLat.toFixed(4)}, ${uLng.toFixed(4)}]`);
        }
      },
      () => {
        setLat(13.085 + (Math.random() - 0.5) * 0.01);
        setLng(80.2101 + (Math.random() - 0.5) * 0.01);
        setIsLocating(false);
        setLocationSuccess(true);
      },
      { timeout: 7000 }
    );
  };

  // Image upload with file type and size validation (Section 13)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      setUploadError('Unsupported file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5 MB limit. Please upload a compressed image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      setPhotos((prev) => [...prev, base64Url]);
      setIsAnalyzingPhoto(true);
      analyzePhotoAuthenticity(base64Url, category, title, description)
        .then((analysis) => setPhotoAnalysis(analysis))
        .catch(() => {})
        .finally(() => setIsAnalyzingPhoto(false));
    };
    reader.readAsDataURL(file);
  };

  // Optional supporting document upload (PDF/JPG/PNG)
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Supporting document exceeds 10 MB limit.');
      return;
    }
    setSupportingDocName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  // AI Verification trigger when moving into Step 4
  const triggerAiTriage = async () => {
    if (!title && !description) return;
    setIsVerifying(true);
    try {
      const fullAddress = `${street || ''}, ${landmark || ''}, ${ward}, ${district}`;
      const vr = await verifyComplaint({
        title,
        description,
        category,
        address: fullAddress,
        landmark,
        ward,
        existingComplaints: complaints,
      });
      setVerificationResult(vr);

      const dups = findPotentialDuplicates(
        { title, description, category, location: { address: fullAddress, ward, lat, lng } },
        complaints
      );
      setDuplicateMatches(dups);
    } catch (e) {
      console.warn('AI verification fallback active:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit Final Grievance
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() && !description.trim()) {
      setFormError('Please provide a complaint title and detailed description.');
      return;
    }
    if (!declarationAccepted) {
      setFormError('Please accept the Citizen Declaration confirming the accuracy of your grievance details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${street || 'Street location pinned'}, ${landmark ? `Near ${landmark}, ` : ''}${ward}, ${district}`;
      const cleanPhotos = photos.filter(Boolean);

      const created = await createComplaint({
        title: title.trim() || `${category} issue in ${ward}`,
        description: description.trim() || `Reported ${category} grievance near ${landmark || street || ward}.`,
        category,
        subcategory: subtype || selectedCategoryMeta.subcategories[0],
        severity,
        department: suggestedDept,
        district,
        city,
        zone,
        address: fullAddress,
        landmark,
        ward,
        lat,
        lng,
        photos: cleanPhotos,
        supportingDocName: supportingDocName || undefined,
        declarationAccepted,
        aiResult: aiResult || undefined,
        verificationResult: verificationResult || undefined,
        photoAnalysis: cleanPhotos.length > 0 ? photoAnalysis || undefined : undefined,
      });

      setSubmittedComplaint(created);
    } catch (err: any) {
      setFormError(`Submission error: ${err.message || 'Could not record complaint.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // UNIQUE GRIEVANCE ACKNOWLEDGEMENT VIEW (Section 6)
  // ============================================================================
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-8 text-white text-center relative">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto mb-4 text-white">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/15 border border-white/20 text-emerald-100">
              {t('acknowledgementGenerated')}
            </span>
            <h2 className="text-2xl font-black mt-2 text-white">
              SMART CIVIC PLATFORM — OFFICIAL ACKNOWLEDGEMENT
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-lg mx-auto">
              Your grievance has been formally registered with a unique tracking number and routed to the concerned municipal department.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Unique Complaint ID Banner */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-2xl p-5 text-center">
              <div className="text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-bold">
                {t('uniqueComplaintId')}
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1 tracking-tight">
                {submittedComplaint.id}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                Save or download this acknowledgement receipt to track live status updates, SLA compliance, and resolution proof.
              </div>
            </div>

            {/* Structured Summary Fields (Section 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Complaint Title &amp; Summary
                </span>
                <span className="text-slate-900 dark:text-white font-bold text-sm block">
                  {submittedComplaint.title}
                </span>
                <span className="text-slate-600 dark:text-slate-300 block leading-relaxed">
                  {submittedComplaint.description}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Citizen Details
                </span>
                <span className="text-slate-800 dark:text-slate-100 font-bold text-sm block">
                  {residentName || currentUser?.name}
                </span>
                <span className="text-slate-500 block">
                  {residentMobile || currentUser?.phone || 'Contact on file'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Submission Date &amp; Current Status
                </span>
                <span className="text-slate-800 dark:text-slate-100 font-bold text-sm block">
                  {new Date(submittedComplaint.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Status: {submittedComplaint.status}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Category &amp; Subcategory
                </span>
                <span className="text-slate-800 dark:text-slate-100 font-bold text-sm block">
                  {submittedComplaint.category}
                </span>
                <span className="text-slate-500 block">
                  {submittedComplaint.subcategory || subtype} · {submittedComplaint.priority}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Assigned Municipal Department
                </span>
                <span className="text-slate-800 dark:text-slate-100 font-bold text-sm block">
                  {submittedComplaint.department}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Resolution SLA: {submittedComplaint.slaHours} Hours
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  District &amp; Ward
                </span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold block">
                  {submittedComplaint.district || district} — {submittedComplaint.location.ward}
                </span>
                <span className="text-slate-500 block truncate">
                  {submittedComplaint.location.address}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Supporting Evidence Status
                </span>
                {submittedComplaint.photos && submittedComplaint.photos.length > 0 ? (
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">
                      {submittedComplaint.photos.length} Supporting Photo(s) Uploaded
                    </span>
                    <span className="text-slate-500">Attached to permanent grievance record</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold block">
                      No Image Uploaded
                    </span>
                    <span className="text-slate-500">Scheduled for physical on-site field inspection</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Required Post-Submission Actions (Section 6) */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onTrackComplaint(submittedComplaint)}
                className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>{t('viewComplaint')} &amp; {t('trackComplaintBtn')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => downloadComplaintAcknowledgement(submittedComplaint)}
                className="py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{t('downloadAcknowledgement')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('my-complaints');
                  } else {
                    onTrackComplaint(submittedComplaint);
                  }
                }}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>{t('returnToDashboard')} (My Complaints)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printComplaintAcknowledgement(submittedComplaint)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedComplaint(null);
                    setCurrentStep(1);
                    setTitle('');
                    setDescription('');
                    setPhotos([]);
                    setSupportingDocName('');
                    setPhotoAnalysis(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition"
                >
                  Raise Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>SMART CIVIC PLATFORM · Structured Grievance Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'ta' ? 'புதிய புகார் பதிவு (Raise a Complaint)' : 'Raise a Civic Grievance'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Complete the structured 5-section citizen grievance form below. Every submission receives a unique tracking ID (<span className="font-mono font-bold">SCP-2026-XXXXXX</span>) and formal departmental SLA assignment.
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Sec A: Citizen', desc: 'Profile & District' },
            { step: 2, title: 'Sec B & C: Location', desc: 'Ward, Street & GPS' },
            { step: 3, title: 'Sec B & D: Grievance', desc: 'Details & Evidence' },
            { step: 4, title: 'Sec E: Declaration', desc: 'Review & Submit' },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step as 1 | 2 | 3 | 4);
                }}
                className={`p-2.5 rounded-xl border transition-all text-center ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 text-emerald-700 dark:text-emerald-400 cursor-pointer'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.step}
                    </span>
                  )}
                  <span className="hidden sm:inline">{item.title}</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 hidden sm:block">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {formError && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{formError}</span>
          </div>
          <button type="button" onClick={() => setFormError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        {/* ============================================================== */}
        {/* STEP 1: Section A — Citizen Details & District */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>{t('sectionCitizenDetails')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Auto-filled from your signed-in citizen profile. You may update contact or district details for this grievance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                    placeholder="e.g. S. Karthikeyan"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={residentMobile}
                    onChange={(e) => setResidentMobile(e.target.value)}
                    placeholder="+91 98401 22334"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={residentEmail}
                    onChange={(e) => setResidentEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('districtLabel')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setCity(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!residentName.trim()) {
                    setFormError('Please enter your full name.');
                    return;
                  }
                  if (!residentMobile.trim()) {
                    setFormError('Please enter your mobile number.');
                    return;
                  }
                  setFormError(null);
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <span>Proceed to Step 2: Location &amp; GIS Pin</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: Section C — Location Details & Interactive Map */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>{t('sectionLocationDetails')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select City/Town, Zone, Ward/Locality, Street Address, Landmark, and confirm GPS coordinates on the interactive map.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  City / Municipality
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from(new Set([district, ...CITIES])).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Municipal Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ward / Locality <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Street / Area Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 2nd Avenue Main Road, Opp Metro Pillar 42"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Anna Nagar Roundtana / Tower Park"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* GPS Pin Locator & Interactive Map */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapIcon className="w-4 h-4 text-red-600" />
                    <span>Interactive GIS Map Pin (Click map to place exact location pin)</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Crosshair className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting GPS...' : 'Use Current GPS Location'}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md h-72 relative">
                <LeafletMap
                  center={[lat, lng]}
                  zoom={15}
                  height="288px"
                  isPicker={true}
                  selectedLocation={{ lat, lng }}
                  onLocationSelect={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                    setLocationSuccess(true);
                  }}
                />
                <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-xl text-xs shadow-lg flex items-center gap-2 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    GPS: {lat.toFixed(5)}°N, {lng.toFixed(5)}°E {locationSuccess ? '(Confirmed)' : ''}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Confirmed Location Summary:</span>{' '}
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {street || 'Pinned Location'}, {ward}, {district}
                  </span>
                  <span className="block font-mono text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Latitude: {lat.toFixed(6)} | Longitude: {lng.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!street.trim()) {
                    setFormError('Please enter the street or area address.');
                    return;
                  }
                  setFormError(null);
                  setCurrentStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <span>Proceed to Step 3: Grievance &amp; Evidence</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: Section B & D — Complaint Details & Supporting Evidence */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{t('sectionComplaintDetails')} &amp; {t('sectionEvidence')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select complaint category, subcategory, urgency level, department routing, and upload optional supporting photo(s) or documents.
              </p>
            </div>

            {/* Category Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      category === cat.name
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="text-lg mb-1">{cat.icon}</div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('subcategoryLabel')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {selectedCategoryMeta.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Urgency / Severity Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Critical">Critical (Immediate Safety Hazard - 12h SLA)</option>
                  <option value="High">High (Major Disruption - 24h SLA)</option>
                  <option value="Medium">Medium (Standard Civic Defect - 48h SLA)</option>
                  <option value="Low">Low (Routine Maintenance - 72h SLA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Suggested Department
                </label>
                <select
                  value={suggestedDept}
                  onChange={(e) => setSuggestedDept(e.target.value as MunicipalDepartment)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the grievance (e.g. Deep waterlogged pothole near Roundtana junction)"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Detailed Grievance Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide clear details about the issue, public impact, duration, and any safety concerns..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* SECTION D — Supporting Evidence Upload */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('sectionEvidence')} (Optional)
                </label>
                <span className="text-[11px] text-slate-500">Max 5 MB per photo · JPG, PNG, WEBP</span>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button type="button" onClick={() => setUploadError(null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Photo Upload Box */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-400 transition">
                  <input
                    type="file"
                    id="evidence-upload"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="evidence-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Camera className="w-7 h-7 text-emerald-600 mb-0.5" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Upload Issue Photo(s)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click to select image from device or camera
                    </span>
                  </label>
                </div>

                {/* Optional Supporting Document Box */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400 transition">
                  <input
                    type="file"
                    id="doc-upload"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <FileUp className="w-7 h-7 text-blue-600 mb-0.5" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('supportingDocLabel')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {supportingDocName || 'Petition PDF or supporting document (Optional)'}
                    </span>
                  </label>
                </div>
              </div>

              {supportingDocName && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Attached Document: {supportingDocName}</span>
                  <button
                    type="button"
                    onClick={() => setSupportingDocName('')}
                    className="text-rose-600 hover:underline font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {photos.length === 0 ? (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>No image uploaded yet (Optional).</strong> You can submit your complaint without a photo—no placeholder image will be attached, and a field officer will inspect the site directly.
                  </span>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Uploaded Supporting Photo(s) ({photos.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotos([]);
                        setPhotoAnalysis(null);
                      }}
                      className="text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
                    >
                      Remove All Photos
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((p, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={p}
                          alt="Uploaded complaint evidence"
                          className="w-full h-24 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = photos.filter((_, i) => i !== idx);
                            setPhotos(remaining);
                            if (remaining.length === 0) setPhotoAnalysis(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full text-xs transition"
                          title="Remove this photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {isAnalyzingPhoto && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Verifying uploaded image relevance...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!title.trim()) {
                    setFormError('Please enter a brief complaint title.');
                    return;
                  }
                  if (!description.trim()) {
                    setFormError('Please provide a detailed description of the issue.');
                    return;
                  }
                  setFormError(null);
                  await triggerAiTriage();
                  setCurrentStep(4);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <span>Proceed to Step 4: Declaration &amp; Submit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: Section E — Review, Citizen Declaration & Submit */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{t('sectionDeclaration')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review your structured grievance details and confirm the Citizen Declaration to generate your Unique Acknowledgement ID.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {/* Section A summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Section A — Citizen Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Name:</strong> {residentName}
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Mobile:</strong> {residentMobile}
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Email:</strong> {residentEmail || 'Not provided'}
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">District:</strong> {district}
                  </div>
                </div>
              </div>

              {/* Section C summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Section C — Location &amp; GIS Coordinates
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">District / City / Zone:</strong> {district} • {city} • {zone}
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Ward:</strong> {ward}
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300">Street Address:</strong> {street}
                  </div>
                  {landmark && (
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Landmark:</strong> {landmark}
                    </div>
                  )}
                  <div className="sm:col-span-2 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                    Confirmed GPS Coordinates: {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
                  </div>
                </div>
              </div>

              {/* Section B summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Section B — Grievance Classification &amp; Department
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {category} · {subtype}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {severity} Urgency
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {suggestedDept}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Section D summary */}
              {photos.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Section D — Supporting Evidence ({photos.length} Photo{photos.length > 1 ? 's' : ''})
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt="Evidence preview"
                        className="w-24 h-20 object-cover rounded-xl border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      No Image Uploaded (Text &amp; GPS Grievance)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Your complaint will be registered without any placeholder image and assigned for direct on-site inspection.
                    </div>
                  </div>
                </div>
              )}

              {duplicateMatches.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Similar Active Grievance Detected in {ward}</span>
                  </div>
                  <p className="text-[11px] mt-1">
                    Existing ticket <strong>{duplicateMatches[0].existingComplaint.id}</strong> ({duplicateMatches[0].existingComplaint.title}) is already being tracked nearby. You may still submit your independent report.
                  </p>
                </div>
              )}

              {/* AI Verification Card Preview */}
              {verificationResult && (
                <div className="mt-2">
                  <AIVerificationCard result={verificationResult} />
                </div>
              )}

              {/* Section E: Citizen Declaration Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {t('declarationText')}
                </span>
              </label>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isVerifying}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Acknowledgement ID...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('submitComplaint')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
