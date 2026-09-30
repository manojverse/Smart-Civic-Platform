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
  RefreshCw,
  FileCheck2,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { ComplaintCategory, Severity, AIClassificationResult, Complaint, AIVerificationResult, PhotoAuthenticityAnalysis } from '../types';
import { WARDS } from '../data/seedData';
import { classifyComplaint, findPotentialDuplicates, DuplicateMatch } from '../services/aiClassifier';
import { verifyComplaint, OFFICIAL_TEST_CASES } from '../services/aiVerificationService';
import { analyzePhotoAuthenticity } from '../services/imageAuthenticityService';
import { AIVerificationCard } from './AIVerificationCard';
import { PhotoAuthenticityCard } from './PhotoAuthenticityCard';
import { OfficialInspectionReportModal } from './OfficialInspectionReportModal';

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
  const { createComplaint, complaints, upvoteComplaint } = useCivic();
  const { t, language } = useLanguage();

  // Form State
  const [category, setCategory] = useState<ComplaintCategory>('Pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [ward, setWard] = useState(WARDS[0]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Coordinates (default: Central City HQ)
  const [lat, setLat] = useState(18.1067);
  const [lng, setLng] = useState(83.3956);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // AI & Duplicate State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [supportedDuplicate, setSupportedDuplicate] = useState<string | null>(null);

  // AI Verification State (Smart Civic Smart Routing & Verification)
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);

  // Photo Authenticity & Synthetic AI Detection State
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAuthenticityAnalysis | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  // Inspection Dossier Report Modal State
  const [isInspectionReportOpen, setIsInspectionReportOpen] = useState(false);
  const [inspectionTargetComplaint, setInspectionTargetComplaint] = useState<Complaint | null>(null);

  // Submission / Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Default sample images for quick demo testing
  const SAMPLE_EVIDENCE_PHOTOS = [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
  ];

  // Geolocation detection using browser API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setIsLocating(false);
        setLocationSuccess(true);
        if (!address) {
          setAddress(`Geo-Location [${userLat.toFixed(4)}, ${userLng.toFixed(4)}]`);
        }
      },
      (error) => {
        console.warn('GPS location lookup failed or permission denied:', error.message);
        // Fallback to nearby metropolitan demo coordinate
        setLat(12.9716 + (Math.random() - 0.5) * 0.02);
        setLng(77.5946 + (Math.random() - 0.5) * 0.02);
        setIsLocating(false);
        setLocationSuccess(true);
      },
      { timeout: 8000 }
    );
  };

  // Image Upload handler (supports base64 conversion & automatic forensic AI photo analysis)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Please upload images under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (loadEvt) => {
        if (loadEvt.target?.result) {
          const base64Data = loadEvt.target.result as string;
          setPhotos((prev) => [...prev, base64Data]);

          // Trigger forensic AI analysis immediately
          setIsAnalyzingPhoto(true);
          try {
            const analysis = await analyzePhotoAuthenticity({
              photoUrl: base64Data,
              reportedCategory: category,
              reportedTitle: title,
              reportedDescription: description,
            });
            setPhotoAnalysis(analysis);
          } catch (err) {
            console.error('Error analyzing photo authenticity:', err);
          } finally {
            setIsAnalyzingPhoto(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Run AI Triage & Duplicate check
  const handleRunAiAnalysis = async () => {
    if (!title && !description) {
      alert('Please enter at least a title or description before running AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await classifyComplaint({
        title,
        description,
        category,
        address,
        landmark,
        ward,
        hasImage: photos.length > 0,
      });

      setAiResult(result);
      if (result.category) {
        setCategory(result.category);
      }
      if (result.severity) {
        setSeverity(result.severity);
      }

      // Check duplicates
      const dupes = findPotentialDuplicates(
        { title, description, category: result.category, lat, lng },
        complaints
      );
      setDuplicateMatches(dupes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger analysis when title or description changes with debounce
  useEffect(() => {
    if (title.length > 8 || description.length > 20) {
      const timer = setTimeout(() => {
        handleRunAiAnalysis();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [title, description, category]);

  // AI Verification Handlers
  const handleVerifyComplaint = async (
    customTitle?: string,
    customDesc?: string,
    customAddress?: string,
    customLandmark?: string,
    customWard?: string
  ) => {
    const t = customTitle !== undefined ? customTitle : title;
    const d = customDesc !== undefined ? customDesc : description;
    const a = customAddress !== undefined ? customAddress : address;
    const l = customLandmark !== undefined ? customLandmark : landmark;
    const w = customWard !== undefined ? customWard : ward;

    if (!t.trim() && !d.trim()) {
      alert('Please enter a complaint title or description to verify.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyComplaint({
        title: t,
        description: d,
        category,
        address: a,
        landmark: l,
        ward: w,
        existingComplaints: complaints,
      });

      setVerificationResult(result);

      // Auto-update category if valid and recognized
      if (result.validity === 'VALID' && result.category) {
        const catLower = result.category.toLowerCase();
        const matchingCategory = CATEGORIES.find((c) =>
          catLower.includes(c.name.toLowerCase().slice(0, 4))
        );
        if (matchingCategory) {
          setCategory(matchingCategory.name);
        }
      }

      // Auto-update severity based on priority
      if (result.priority === 'CRITICAL') {
        setSeverity('Critical');
      } else if (result.priority === 'HIGH') {
        setSeverity('High');
      } else if (result.priority === 'MEDIUM') {
        setSeverity('Medium');
      } else if (result.priority === 'LOW') {
        setSeverity('Low');
      }
      return result;
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectTestCase = async (testCaseId: string) => {
    const testCase = OFFICIAL_TEST_CASES.find((tc) => tc.id === testCaseId);
    if (!testCase) return;

    setSelectedTestCaseId(testCaseId);
    setTitle(testCase.title);
    setDescription(testCase.description);

    let testAddr = '';
    let testLandmark = '';
    let testWard = WARDS[0];

    if (testCase.id === 'test-1') {
      testAddr = 'Central Avenue, Sector 4';
      testLandmark = 'Near RTC Bus Stand Entrance';
      testWard = 'Ward 3 - Balaji Nagar & RTC Complex';
      setCategory('Pothole');
      setSeverity('High');
      setPhotos([SAMPLE_EVIDENCE_PHOTOS[0]]);
      setLat(18.1124);
      setLng(83.4018);
    } else if (testCase.id === 'test-2') {
      // Test 2 has missing location intentionally!
      testAddr = '';
      testLandmark = '';
      testWard = 'Ward 1 - Fort Road & Royal Palace Quarter';
      setCategory('Garbage');
      setSeverity('Medium');
      setPhotos([SAMPLE_EVIDENCE_PHOTOS[1]]);
      setLat(18.1067);
      setLng(83.3956);
    } else if (testCase.id === 'test-3') {
      testAddr = 'Main Bazaar Road, Downtown';
      testLandmark = 'Beside Old Electric Substation';
      testWard = 'Ward 1 - Fort Road & Royal Palace Quarter';
      setCategory('Other');
      setSeverity('Critical');
      setPhotos([SAMPLE_EVIDENCE_PHOTOS[2]]);
      setLat(18.1089);
      setLng(83.3972);
    } else if (testCase.id === 'test-4') {
      testAddr = '';
      testLandmark = '';
      testWard = 'Ward 12 - City Center & Clock Tower';
      setPhotos([]);
    } else if (testCase.id === 'test-5') {
      testAddr = '';
      testLandmark = '';
      testWard = 'Ward 12 - City Center & Clock Tower';
      setPhotos([]);
    } else if (testCase.id === 'test-6') {
      testAddr = 'Near Municipal Park, Downtown';
      testLandmark = 'Opposite Heritage Park Gate 2';
      testWard = 'Ward 6 - Phool Bagh Heritage Garden Zone';
      setCategory('Streetlight');
      setSeverity('Medium');
      setPhotos([SAMPLE_EVIDENCE_PHOTOS[3]]);
      setLat(18.115);
      setLng(83.405);
    } else if (testCase.id === 'test-7') {
      testAddr = 'Near Zilla Parishad High School Road';
      testLandmark = 'Near School Main Playground Gate';
      testWard = 'Ward 2 - Cantonment Area & Collectorate';
      setCategory('Drainage');
      setSeverity('High');
      setPhotos([SAMPLE_EVIDENCE_PHOTOS[2]]);
      setLat(18.103);
      setLng(83.391);
    }

    setAddress(testAddr);
    setLandmark(testLandmark);
    setWard(testWard);

    // Immediately run verification so user gets instant output
    await handleVerifyComplaint(
      testCase.title,
      testCase.description,
      testAddr,
      testLandmark,
      testWard
    );
  };

  const handleConfirmSubmit = async (vrToUse?: AIVerificationResult) => {
    const vr = vrToUse || verificationResult;
    if (!title.trim()) {
      alert('Please enter a brief complaint title.');
      return;
    }
    if (!description.trim()) {
      alert('Please describe the civic issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createComplaint({
        title,
        description,
        category,
        severity,
        address: address || (vr?.location ? vr.location : `Near ${landmark || ward}`),
        landmark,
        ward,
        lat,
        lng,
        photos: photos.length > 0 ? photos : [SAMPLE_EVIDENCE_PHOTOS[0]],
        aiResult: aiResult || undefined,
        verificationResult: vr || undefined,
        photoAnalysis: photoAnalysis || undefined,
      });

      setSubmittedComplaint(created);
      setInspectionTargetComplaint(created);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error submitting complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a brief complaint title.');
      return;
    }
    if (!description.trim()) {
      alert('Please describe the civic issue.');
      return;
    }

    // If verification has not been run yet, run it now!
    if (!verificationResult) {
      const vr = await handleVerifyComplaint();
      if (vr && vr.validity === 'VALID') {
        if (vr.location_status !== 'MISSING') {
          await handleConfirmSubmit(vr);
        }
      }
      return;
    }

    if (verificationResult.validity === 'INVALID') {
      alert(
        `This submission was evaluated as INVALID: ${verificationResult.reason}. Please revise your complaint.`
      );
      return;
    }

    await handleConfirmSubmit(verificationResult);
  };

  // Quick Demo fill buttons to showcase fast viva grading
  const fillSamplePothole = () => {
    setTitle('Dangerous Pothole on 100ft Road Right Lane');
    setDescription(
      'Deep crater approx 8 inches deep in the middle of 100ft Road. Water accumulated after rain makes it invisible. Multiple two-wheelers have almost lost balance.'
    );
    setCategory('Pothole');
    setSeverity('Critical');
    setWard(WARDS[2]);
    setAddress('Opposite Metro Pillar 188, 100ft Road, Indiranagar');
    setLandmark('Near Fabindia & Sony Center');
    setPhotos([SAMPLE_EVIDENCE_PHOTOS[0]]);
    setLat(12.9716);
    setLng(77.6412);
  };

  const fillSampleGarbage = () => {
    setTitle('Massive Commercial Garbage Pile Behind Fish Market');
    setDescription(
      'Solid waste compactor hasn’t visited for 5 days. Wet organic waste, plastic containers, and rotten vegetables blocking pedestrian pathway. Stray dogs and cows scattering trash.'
    );
    setCategory('Garbage');
    setSeverity('High');
    setWard(WARDS[1]);
    setAddress('8th Cross, Malleswaram Market Lane');
    setLandmark('Behind Government Maternity Hospital');
    setPhotos([SAMPLE_EVIDENCE_PHOTOS[1]]);
    setLat(13.0031);
    setLng(77.5645);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title & Quick Fill Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Civic Issue</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Submit photo evidence with GPS coordinates. Smart Civic AI will verify validity, assign priority, and route to the correct municipal department.
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={fillSamplePothole}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors"
          >
            🕳️ Pothole
          </button>
          <button
            type="button"
            onClick={fillSampleGarbage}
            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            🗑️ Garbage
          </button>
        </div>
      </div>

      {/* Official AI Verification Test Suite (Tests 1 - 7) */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white border border-indigo-500/30 shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Official AI Verification Test Suite
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium">
                  7 Official Cases
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any test case to populate complaint data and trigger AI verification & smart municipal routing:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Municipal Scope:</span>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-700/60 px-2 py-0.5 rounded">
              Smart Civic Platform
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {OFFICIAL_TEST_CASES.map((tc) => {
            const isSelected = selectedTestCaseId === tc.id;
            const isInvalid = tc.expected.includes('INVALID');
            const isCritical = tc.expected.includes('CRITICAL');
            const isHigh = tc.expected.includes('HIGH');
            return (
              <button
                key={tc.id}
                type="button"
                onClick={() => handleSelectTestCase(tc.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400 ring-1 ring-indigo-400 shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-indigo-200 font-mono">
                    {tc.id.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isInvalid
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isHigh
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isInvalid ? 'INVALID' : isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'VALID'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white line-clamp-1 group-hover:text-indigo-200">
                  {tc.label.split(':')[1]?.trim() || tc.title}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {tc.expected}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Category Selection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <label className="block text-sm font-bold text-slate-900 mb-1">
            1. Select Civic Category <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Pick the closest match. Smart Civic AI will automatically refine the category and sub-service.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30 text-emerald-950 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{cat.icon}</div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Issue Details & AI Analysis Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form Fields */}
          <div className="lg:col-span-2 space-y-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Describe the Problem
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Massive pothole near school gate causing skidding"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyComplaint()}
                    disabled={isVerifying}
                    className="inline-flex items-center text-[11px] font-bold text-indigo-700 hover:text-indigo-800 gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors shadow-xs"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'Verifying...' : 'Verify with AI'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzing}
                    className="inline-flex items-center text-[11px] font-medium text-slate-600 hover:text-slate-800 gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200"
                  >
                    <Sparkles className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Quick Triage'}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific dimensions, hazard impact on commuters, timeline of neglect, and any immediate public safety danger..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            {/* Ward & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Administrative Ward <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reported Severity <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Low', 'Medium', 'High', 'Critical'] as Severity[]).map((s) => {
                    const active = severity === s;
                    const colors = {
                      Low: 'hover:border-emerald-400 active:bg-emerald-50',
                      Medium: 'hover:border-amber-400 active:bg-amber-50',
                      High: 'hover:border-orange-400 active:bg-orange-50',
                      Critical: 'hover:border-rose-400 active:bg-rose-50',
                    };
                    const activeStyles = {
                      Low: 'bg-emerald-600 text-white font-bold',
                      Medium: 'bg-amber-500 text-white font-bold',
                      High: 'bg-orange-500 text-white font-bold',
                      Critical: 'bg-rose-600 text-white font-bold',
                    };
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverity(s)}
                        className={`py-2 text-xs rounded-lg border transition-all ${
                          active
                            ? activeStyles[s]
                            : `bg-slate-50 border-slate-200 text-slate-600 ${colors[s]}`
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Address & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Street Address / Corridor
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Feet Road, HAL 2nd Stage"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Metro Pillar 188, beside Cafe"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Visual Evidence Photos (Multiple allowed, max 5MB each)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {photos.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
                    <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Upload Trigger */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl aspect-video cursor-pointer transition-colors p-2 text-center">
                  <Camera className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-600">Add Photo</span>
                  <span className="text-[9px] text-slate-400">JPG, PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length === 0 && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>💡 Tip: Photographic evidence speeds up municipal inspection by 3.5x</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const sampleUrl = SAMPLE_EVIDENCE_PHOTOS[0];
                      setPhotos([sampleUrl]);
                      setIsAnalyzingPhoto(true);
                      try {
                        const analysis = await analyzePhotoAuthenticity({
                          photoUrl: sampleUrl,
                          reportedCategory: category,
                          reportedTitle: title || 'Pothole on Main Road',
                          reportedDescription: description,
                        });
                        setPhotoAnalysis(analysis);
                      } catch (err) {
                        console.error('Error analyzing sample photo:', err);
                      } finally {
                        setIsAnalyzingPhoto(false);
                      }
                    }}
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Attach Real Pothole Photo
                  </button>
                </div>
              )}

              {/* AI Image Fraud & Fake Detection Card */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <PhotoAuthenticityCard
                  analysis={photoAnalysis}
                  isAnalyzing={isAnalyzingPhoto}
                  onTestPreset={async (preset) => {
                    setPhotos([preset.photoUrl]);
                    setIsAnalyzingPhoto(true);
                    try {
                      const analysis = await analyzePhotoAuthenticity({
                        photoUrl: preset.photoUrl,
                        reportedCategory: category,
                        reportedTitle: title || preset.label,
                        reportedDescription: description,
                      });
                      setPhotoAnalysis(analysis);
                    } catch (err) {
                      console.error('Preset analysis failed:', err);
                    } finally {
                      setIsAnalyzingPhoto(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right 1 Col: Live AI Triage Card & Duplicate Warnings */}
          <div className="space-y-4">
            {/* AI Classification Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-28 h-28" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">AI Classification Layer</h3>
                    <p className="text-[10px] text-slate-400">Gemini 3.8 Flash & Rule-Based NLP</p>
                  </div>
                </div>

                {aiResult && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {aiResult.confidence}% match
                  </span>
                )}
              </div>

              {aiResult ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 text-[11px]">Recommended Priority:</span>
                      <span className="font-bold text-amber-400">{aiResult.priority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Target SLA Window:</span>
                      <span className="font-bold text-emerald-400">{aiResult.estimatedResolutionHours} Hours</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">Assigned Department:</div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{aiResult.suggestedDepartment}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">Identified Public Safety Risk:</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/50 p-2 rounded-lg border border-slate-700/60">
                      {aiResult.safetyRisk}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">Automated Action Protocol:</div>
                    <p className="text-[11px] text-emerald-300 font-medium">
                      {aiResult.suggestedAction}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                  <p className="text-xs">Type your complaint details to trigger live automated triage and priority calculation.</p>
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Analyze Draft Now →
                  </button>
                </div>
              )}
            </div>

            {/* Duplicate Complaints Warning Card */}
            {duplicateMatches.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 shadow-xs">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950">Similar Issue Detected Nearby!</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      An active complaint matches this location and issue. Support it instead of creating duplicates to boost municipal urgency:
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  {duplicateMatches.slice(0, 2).map(({ existingComplaint, distanceMeters, similarityScore }) => (
                    <div
                      key={existingComplaint.id}
                      className="p-2.5 bg-white rounded-xl border border-amber-200 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] text-slate-800">
                          {existingComplaint.id}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {distanceMeters}m away • {similarityScore}% match
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium line-clamp-1 text-[11px]">
                        {existingComplaint.title}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500">
                          Status: <strong className="text-emerald-700">{existingComplaint.status}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            upvoteComplaint(existingComplaint.id);
                            setSupportedDuplicate(existingComplaint.id);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            supportedDuplicate === existingComplaint.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{supportedDuplicate === existingComplaint.id ? 'Supported! (+1)' : `Support (${existingComplaint.upvotes})`}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Interactive Location Selection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                3. Pin Exact Map Coordinates (GIS Geotagging)
              </h2>
              <p className="text-xs text-slate-500">
                Use your device GPS or click/drag the pin on the map to pinpoint where municipal work is required.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Use My Live GPS'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <LeafletMap
              height="340px"
              isPicker={true}
              selectedLocation={{ lat, lng }}
              onLocationSelect={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected Coordinates: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E</span>
              </div>
              <span className="text-[10px] text-slate-400">OpenStreetMap Carto Layer</span>
            </div>
          </div>
        </div>

        {/* Step 3.5: AI Verification & Smart Routing Result Card */}
        {isVerifying && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-700 flex flex-col items-center justify-center py-8 text-center space-y-2 animate-in fade-in">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-sm font-bold text-white">Running AI Citizen Complaint Verification...</div>
            <div className="text-xs text-slate-400 max-w-md">
              Validating civic issue authenticity, extracting Smart City landmarks, assessing public safety risk, and routing to the designated municipal department.
            </div>
          </div>
        )}

        {verificationResult && !isVerifying && (
          <AIVerificationCard
            result={verificationResult}
            onConfirmSubmit={() => handleConfirmSubmit(verificationResult)}
            onRevise={() => {
              setVerificationResult(null);
            }}
            onAddLocation={(locData) => {
              setAddress(locData.address);
              setLandmark(locData.landmark);
              setVerificationResult((prev) =>
                prev
                  ? {
                      ...prev,
                      location: locData.address,
                      location_status: 'PROVIDED',
                    }
                  : null
              );
            }}
            onSubmitForManualReview={() => {
              handleConfirmSubmit({
                ...verificationResult,
                validity: 'NEEDS_REVIEW',
              });
            }}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isVerifying || (verificationResult?.validity === 'INVALID')}
            className={`flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 ${
              verificationResult?.validity === 'INVALID'
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Official Complaint Ticket...</span>
              </>
            ) : verificationResult?.validity === 'INVALID' ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Non-Civic Issue (Revise to Submit)</span>
              </>
            ) : verificationResult?.validity === 'VALID' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Register Grievance Ticket</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <span>Verify with AI & Submit Grievance</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation & Printable Receipt Modal */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
            {/* Official Municipal Authority Letterhead Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CityCorpLogo className="w-12 h-12 shrink-0" />
                <div className="leading-tight">
                  <div className="text-xs font-black text-slate-900">
                    Smart Civic Platform
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600">
                    Smart City Municipal Corporation
                  </div>
                  <div className="text-[9px] text-amber-600 font-bold">
                    Always at your service • Grievance Cell
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div className="leading-tight hidden sm:block">
                  <div className="text-xs font-black text-emerald-800">
                    State Government
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Municipal Administration
                  </div>
                </div>
                <StateGovtLogo className="w-11 h-11 shrink-0" />
              </div>
            </div>

            <div className="text-center mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Official Grievance Receipt & Acknowledgement
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Complaint Successfully Registered!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged into Smart City Municipal Corporation e-Redressal Portal.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Complaint Reference ID:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">{submittedComplaint.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Assigned Department:</span>
                <span className="font-semibold text-slate-900">{submittedComplaint.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Category & Priority:</span>
                <span className="font-semibold text-slate-900">
                  {submittedComplaint.category} • <span className="text-rose-600">{submittedComplaint.priority}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">SLA Resolution Target:</span>
                <span className="font-bold text-slate-900">{submittedComplaint.slaHours} Hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Location Ward:</span>
                <span className="text-slate-900">{submittedComplaint.location.ward}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setInspectionTargetComplaint(submittedComplaint);
                  setIsInspectionReportOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                <FileCheck2 className="w-4 h-4 text-indigo-200" />
                <span>{t.viewOfficialReportBtn}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onTrackComplaint(submittedComplaint);
                    setSubmittedComplaint(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <span>Track Complaint Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Municipal Inspection & Verification Dossier Modal */}
      <OfficialInspectionReportModal
        isOpen={isInspectionReportOpen}
        onClose={() => setIsInspectionReportOpen(false)}
        complaint={inspectionTargetComplaint || submittedComplaint}
      />
    </div>
  );
};
