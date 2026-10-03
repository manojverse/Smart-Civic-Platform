import React, { useState, useEffect } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  Crosshair,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Building2,
  ThumbsUp,
  X,
  Share2,
  Printer,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  FileCheck2,
  ShieldCheck,
  Image as ImageIcon,
  User,
  Phone,
  Mail,
  Map as MapIcon,
  Check,
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
} from '../types';
import { WARDS, ZONES, CITIES } from '../data/seedData';
import { classifyComplaint, findPotentialDuplicates, DuplicateMatch } from '../services/aiClassifier';
import { verifyComplaint, OFFICIAL_TEST_CASES } from '../services/aiVerificationService';
import { analyzePhotoAuthenticity } from '../services/imageAuthenticityService';
import { AIVerificationCard } from './AIVerificationCard';
import { PhotoAuthenticityCard } from './PhotoAuthenticityCard';

const CATEGORIES: { name: ComplaintCategory; icon: string; desc: string }[] = [
  { name: 'Pothole', icon: '🕳️', desc: 'Road craters, dips & damaged tarmac' },
  { name: 'Garbage', icon: '🗑️', desc: 'Overflowing bins & uncollected waste' },
  { name: 'Water Leakage', icon: '💧', desc: 'Pipe bursts, gushing potable mains' },
  { name: 'Drainage', icon: '🌊', desc: 'Clogged storm drains & sewage overflow' },
  { name: 'Streetlight', icon: '💡', desc: 'Dead lampposts, exposed wires & dark roads' },
  { name: 'Road Damage', icon: '🚧', desc: 'Cracked surfaces, caved-in road dividers' },
  { name: 'Traffic', icon: '🚦', desc: 'Faulty signals, illegal parking, blockades' },
  { name: 'Pollution', icon: '🏭', desc: 'Garbage burning, industrial toxic fumes' },
  { name: 'Public Property Damage', icon: '🏛️', desc: 'Damaged bus stops, railings, benches' },
  { name: 'Park Issue', icon: '🌳', desc: 'Broken playground swings, fallen branches' },
  { name: 'Sanitation', icon: '🚻', desc: 'Unhygienic public toilets, pest breeding' },
  { name: 'Other', icon: '📋', desc: 'General municipal infrastructure problems' },
];

interface ReportIssueProps {
  onTrackComplaint: (complaint: Complaint) => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({ onTrackComplaint }) => {
  const { createComplaint, complaints, currentUser } = useCivic();
  const { t } = useLanguage();

  // 4-Step Registration Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1 — Resident Details
  const [residentName, setResidentName] = useState(currentUser?.name || '');
  const [residentMobile, setResidentMobile] = useState(currentUser?.phone || '');
  const [residentEmail, setResidentEmail] = useState(currentUser?.email || '');

  // STEP 2 — Location
  const [city, setCity] = useState(CITIES[0] || 'Chennai');
  const [zone, setZone] = useState(ZONES[1] || 'Zone 8 - Anna Nagar & Kilpauk');
  const [ward, setWard] = useState(WARDS[0] || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [lat, setLat] = useState(13.0850);
  const [lng, setLng] = useState(80.2101);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // STEP 3 — Complaint Details
  const [category, setCategory] = useState<ComplaintCategory>('Pothole');
  const [subtype, setSubtype] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [photos, setPhotos] = useState<string[]>([]);
  const [mediaNotes, setMediaNotes] = useState('');

  // AI Triage & Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAuthenticityAnalysis | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);

  // Submission Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Sample Photos for testing
  const SAMPLE_EVIDENCE_PHOTOS = [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80',
  ];

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
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
        // Fallback to Chennai Anna Nagar coordinate
        setLat(13.0850 + (Math.random() - 0.5) * 0.01);
        setLng(80.2101 + (Math.random() - 0.5) * 0.01);
        setIsLocating(false);
        setLocationSuccess(true);
      },
      { timeout: 7000 }
    );
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      setPhotos((prev) => [...prev, base64Url]);
      // Trigger photo authenticity audit
      setIsAnalyzingPhoto(true);
      analyzePhotoAuthenticity(base64Url, category, title, description)
        .then((analysis) => setPhotoAnalysis(analysis))
        .catch(() => {})
        .finally(() => setIsAnalyzingPhoto(false));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (url: string) => {
    setPhotos([url]);
    setIsAnalyzingPhoto(true);
    analyzePhotoAuthenticity(url, category, title, description)
      .then((analysis) => setPhotoAnalysis(analysis))
      .catch(() => {})
      .finally(() => setIsAnalyzingPhoto(false));
  };

  // AI Verification trigger when moving into Step 3 / Step 4
  const triggerAiTriage = async () => {
    if (!title && !description) return;
    setIsVerifying(true);
    try {
      const fullAddress = `${street || ''}, ${landmark || ''}, ${ward}, ${city}`;
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

      // Check duplicates
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

  // Submit Final Grievance to Firestore
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) {
      alert('Please provide a title or description for your complaint.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${street || 'Street not specified'}, ${landmark ? `Near ${landmark}, ` : ''}${ward}, ${city}`;

      const created = await createComplaint({
        title: title || `${category} issue in ${ward}`,
        description: description || `Reported ${category} grievance near ${landmark || street || ward}.`,
        category,
        severity,
        address: fullAddress,
        landmark,
        ward,
        lat,
        lng,
        photos: photos.length > 0 ? photos : [SAMPLE_EVIDENCE_PHOTOS[0]],
        aiResult: aiResult || undefined,
        verificationResult: verificationResult || undefined,
        photoAnalysis: photoAnalysis || undefined,
      });

      setSubmittedComplaint(created);
    } catch (err: any) {
      alert(`Submission error: ${err.message || 'Could not record complaint.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION RECEIPT VIEW
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white text-center relative">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto mb-4 text-white">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/15 border border-white/20 text-emerald-100">
              Grievance Registered Successfully
            </span>
            <h2 className="text-2xl font-black mt-2 text-white">
              SMART CIVIC RESOLUTION RECEIPT
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Your grievance has been stored in Cloud Firestore and auto-routed to the municipal response department.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-8 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Unique Complaint Number</div>
              <div className="text-3xl font-black font-mono text-emerald-700 mt-1 tracking-tight">
                {submittedComplaint.id}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Keep this complaint number to track live status updates or verify completion.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Resident Name</span>
                <span className="text-slate-800 font-bold text-sm">{residentName || currentUser?.name}</span>
                <span className="text-slate-500 block">{residentMobile || currentUser?.phone || 'Mobile provided'}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Assigned Department</span>
                <span className="text-slate-800 font-bold text-sm">{submittedComplaint.department}</span>
                <span className="text-emerald-700 font-semibold block">SLA Target: {submittedComplaint.slaHours} Hours</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Location &amp; Ward</span>
                <span className="text-slate-800 font-semibold">{submittedComplaint.location.ward}</span>
                <span className="text-slate-500 block truncate">{submittedComplaint.location.address}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Category &amp; Priority</span>
                <span className="text-slate-800 font-semibold">{submittedComplaint.category}</span>
                <span className="text-amber-700 font-semibold block">{submittedComplaint.priority} Priority</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => onTrackComplaint(submittedComplaint)}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Track this Complaint Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setCurrentStep(1);
                  setTitle('');
                  setDescription('');
                  setPhotos([]);
                }}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
              >
                File Another Report
              </button>
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
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Municipal Public Grievance Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Report Civic Issue
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Follow our 4-step verified grievance flow to log public defects directly to Chennai and Tamil Nadu municipal response teams.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Resident', desc: 'Contact Info' },
            { step: 2, title: 'Location', desc: 'City, Ward & Map' },
            { step: 3, title: 'Details', desc: 'Category & Photo' },
            { step: 4, title: 'Review', desc: 'Summary & Submit' },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div
                key={item.step}
                className={`p-2.5 rounded-xl border transition-all text-center ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-xs ring-1 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 text-emerald-700'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                  ) : (
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>{item.step}</span>
                  )}
                  <span className="hidden sm:inline">{item.title}</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 hidden sm:block">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* ============================================================== */}
        {/* STEP 1: Resident Details */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Step 1 — Resident Contact Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official grievance status updates and resolution notifications will be sent to these verified details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={residentEmail}
                    onChange={(e) => setResidentEmail(e.target.value)}
                    placeholder="resident@example.com"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!residentName.trim()) {
                    alert('Please enter your full name.');
                    return;
                  }
                  if (!residentMobile.trim()) {
                    alert('Please enter your mobile number.');
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <span>Proceed to Step 2: Location</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: Location & Map */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Step 2 — Geographic Location Selection</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify city, zone, ward, and pin the exact defect coordinates on the interactive GIS map.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 2nd Avenue, Opp Metro Gate A"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Prominent Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Roundtana Junction / Tower Park"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* GPS Pin Locator & Interactive Map */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4 text-emerald-600" />
                  <span>Pinpoint Defect on Map (Click map to adjust pin)</span>
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Crosshair className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 h-64">
                <LeafletMap
                  center={[lat, lng]}
                  zoom={14}
                  height="256px"
                  isPicker={true}
                  selectedLocation={{ lat, lng }}
                  onLocationSelect={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                <span>Selected Coordinates: <strong className="font-mono text-slate-800">{lat.toFixed(4)}, {lng.toFixed(4)}</strong></span>
                <span className="text-emerald-700 font-semibold">Leaflet GIS Precision Active</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <span>Proceed to Step 3: Complaint Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: Complaint Details & Photos */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Step 3 — Grievance Details &amp; Photographic Evidence</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Categorize the defect, describe the hazard, and attach photographic proof for automated verification.
              </p>
            </div>

            {/* Category Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      category === cat.name
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{cat.icon}</div>
                    <div className="font-bold text-xs text-slate-800">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint Subtype
                </label>
                <input
                  type="text"
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  placeholder="e.g. Deep asphalt crater / Pipeline fracture"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Severity / Hazard Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Critical">Critical (Immediate danger to life / limb)</option>
                  <option value="High">High (Major road disruption / severe hazard)</option>
                  <option value="Medium">Medium (Moderate civic service defect)</option>
                  <option value="Low">Low (Minor aesthetic or routine wear)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grievance Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue (e.g. Hazardous deep pothole near Roundtana Metro)"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe size, traffic impact, duration of defect, and exact location markers..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Photo Evidence Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Photo Evidence Upload
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
                <input
                  type="file"
                  id="evidence-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Camera className="w-8 h-8 text-emerald-600 mb-0.5" />
                  <span className="text-xs font-bold text-slate-800">Upload Photo from Device or Camera</span>
                  <span className="text-[11px] text-slate-400">JPG, PNG supported (auto-audited for authenticity)</span>
                </label>
              </div>

              {/* Quick sample photos for fast demo testing */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demo Presets:</span>
                {SAMPLE_EVIDENCE_PHOTOS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(url)}
                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 font-semibold border border-slate-200 transition"
                  >
                    Sample #{i + 1}
                  </button>
                ))}
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={p}
                        alt="Evidence preview"
                        className="w-full h-24 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full text-xs transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Optional Video / Audio Notes
              </label>
              <input
                type="text"
                value={mediaNotes}
                onChange={(e) => setMediaNotes(e.target.value)}
                placeholder="Additional notes about noise levels, CCTV footage, or video link"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!title.trim()) {
                    alert('Please enter a brief complaint title.');
                    return;
                  }
                  if (!description.trim()) {
                    alert('Please provide a complaint description.');
                    return;
                  }
                  await triggerAiTriage();
                  setCurrentStep(4);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <span>Proceed to Step 4: Review &amp; Submit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: Review & Submit */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Step 4 — Review Summary &amp; Confirm Submission</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify all resident, location, and grievance details prior to generating your official complaint number.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {/* Resident summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">1. Resident Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div><strong className="text-slate-700">Name:</strong> {residentName}</div>
                  <div><strong className="text-slate-700">Mobile:</strong> {residentMobile}</div>
                  <div><strong className="text-slate-700">Email:</strong> {residentEmail || 'Not provided'}</div>
                </div>
              </div>

              {/* Location summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">2. Geographic Location</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong className="text-slate-700">City / Zone:</strong> {city} • {zone}</div>
                  <div><strong className="text-slate-700">Ward:</strong> {ward}</div>
                  <div><strong className="text-slate-700">Street / Address:</strong> {street || 'Pin on map'}</div>
                  {landmark && <div><strong className="text-slate-700">Landmark:</strong> {landmark}</div>}
                  <div className="sm:col-span-2 text-slate-500 font-mono text-[11px]">
                    GPS Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Grievance summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">3. Grievance Details</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">{title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {severity} Priority
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Uploaded Photos Preview */}
              {photos.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Photographic Proof</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                      <img key={i} src={p} alt="Thumbnail" className="w-24 h-20 object-cover rounded-xl border border-slate-200" />
                    ))}
                  </div>
                </div>
              )}

              {/* AI Verification Card Preview */}
              {verificationResult && (
                <div className="mt-2">
                  <AIVerificationCard result={verificationResult} />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting to SMART CIVIC...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Register Grievance</span>
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
