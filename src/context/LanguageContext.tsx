import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

export interface Translations {
  // Navigation & Branding
  brandTitle: string;
  brandSubtitle: string;
  govtName: string;
  corpName: string;
  deptName: string;
  navOverview: string;
  navReport: string;
  navMyReports: string;
  navComplaints: string;
  navServices: string;
  navMap: string;
  navAuthority: string;
  navDepartments: string;
  navAnalytics: string;
  navWorker: string;
  navOfficial: string;
  navAdmin: string;
  switchUserRole: string;
  resetSeed: string;

  // Report Form
  reportTitle: string;
  reportSubtitle: string;
  testSuiteTitle: string;
  testSuiteDesc: string;
  fieldTitle: string;
  fieldTitlePlaceholder: string;
  fieldDesc: string;
  fieldDescPlaceholder: string;
  fieldWard: string;
  fieldSeverity: string;
  fieldAddress: string;
  fieldAddressPlaceholder: string;
  fieldLandmark: string;
  fieldLandmarkPlaceholder: string;
  fieldPhotos: string;
  addPhotoBtn: string;
  verifyAiBtn: string;
  verifyingBtn: string;
  submitComplaintBtn: string;
  submittingBtn: string;
  photoTip: string;
  attachSamplePothole: string;

  // Severities
  sevLow: string;
  sevMedium: string;
  sevHigh: string;
  sevCritical: string;

  // AI Verification Card
  verificationCardTitle: string;
  verdictValid: string;
  verdictInvalid: string;
  verdictNeedsReview: string;
  confidenceLabel: string;
  aiCategoryLabel: string;
  aiPriorityLabel: string;
  locationStatusLabel: string;
  locationProvided: string;
  locationMissing: string;
  locationUnclear: string;
  smartRoutingLabel: string;
  rationaleLabel: string;
  recommendedActionLabel: string;
  duplicateDetected: string;
  nonPretenceAdvisory: string;
  confirmSubmissionBtn: string;
  addLocationPrompt: string;
  addLocationPlaceholder: string;
  updateLocationBtn: string;

  // Photo Authenticity & Fake AI Detection
  photoAuthTitle: string;
  photoAuthSubtitle: string;
  testPhotosTitle: string;
  testPhotoRealPothole: string;
  testPhotoAiFake: string;
  testPhotoMismatched: string;
  testPhotoLiveWire: string;
  testPhotoGarbage: string;
  authenticityScore: string;
  aiLikelihood: string;
  fraudVerdictLabel: string;
  verdictAuthentic: string;
  verdictAiGenerated: string;
  verdictStockOrEdited: string;
  verdictMismatched: string;
  detectedVisualProblem: string;
  visualSeverity: string;
  relevanceCheck: string;
  relevanceMatch: string;
  relevanceMismatch: string;
  estimatedExtents: string;
  detectedHazardsTitle: string;
  tamperIntegrityTitle: string;
  inspectPhotoBtn: string;
  aiPhotoWarningAlert: string;

  // Official Report
  officialReportTitle: string;
  officialReportSubtitle: string;
  dossierRefNo: string;
  grievanceDate: string;
  reportingCitizen: string;
  targetSla: string;
  inspectionChecklist: string;
  officerSignoff: string;
  printReportBtn: string;
  downloadDossierBtn: string;
  viewOfficialReportBtn: string;
  closeBtn: string;

  // Tracker & Statuses
  trackerTitle: string;
  statusSubmitted: string;
  statusVerified: string;
  statusAssigned: string;
  statusInProgress: string;
  statusResolved: string;

  // Civic Home & Stats
  heroTitle: string;
  heroSubtitle: string;
  heroReportCta: string;
  heroTrackCta: string;
  totalComplaints: string;
  resolved: string;
  inProgress: string;
  slaHours: string;
  recentIssues: string;
  viewAll: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandTitle: 'CIVICSENSE',
    brandSubtitle: 'Vizianagaram Municipal Corporation',
    govtName: 'Government of Andhra Pradesh',
    corpName: 'Vizianagaram Municipal Corporation',
    deptName: 'Municipal Administration & Urban Development (MA&UD)',
    navOverview: 'Overview',
    navReport: 'Report Issue',
    navMyReports: 'My Reports',
    navComplaints: 'Complaints',
    navServices: 'Smart Services',
    navMap: 'Civic Map',
    navAuthority: 'Authority Portal',
    navDepartments: 'Departments',
    navAnalytics: 'Analytics',
    navWorker: 'Worker Portal',
    navOfficial: 'Official Portal',
    navAdmin: 'Admin Dashboard',
    switchUserRole: 'Switch User Role',
    resetSeed: 'Reset Seed',

    reportTitle: 'File a Civic Complaint',
    reportSubtitle: 'AI Verification & Smart Municipal Routing for Vizianagaram',
    testSuiteTitle: 'Official Verification Test Scenarios',
    testSuiteDesc: 'One-click load official scenarios to test instantaneous AI authenticity, priority, and smart routing.',
    fieldTitle: 'Complaint Title',
    fieldTitlePlaceholder: 'e.g. Massive pothole near RTC Complex causing skidding',
    fieldDesc: 'Detailed Description',
    fieldDescPlaceholder: 'Provide specific dimensions, hazard impact on commuters, timeline of neglect, and any immediate public safety danger...',
    fieldWard: 'Administrative Ward',
    fieldSeverity: 'Reported Severity',
    fieldAddress: 'Street Address / Corridor',
    fieldAddressPlaceholder: 'e.g. RTC Complex Road, Near Station',
    fieldLandmark: 'Nearby Landmark',
    fieldLandmarkPlaceholder: 'e.g. Opposite Main Bus Stand Gate 2',
    fieldPhotos: 'Visual Evidence Photos (Multiple allowed)',
    addPhotoBtn: 'Add Photo',
    verifyAiBtn: 'Verify with AI',
    verifyingBtn: 'Verifying with AI...',
    submitComplaintBtn: 'Register Grievance',
    submittingBtn: 'Registering Grievance...',
    photoTip: 'Photographic evidence accelerates field inspection by 3.5x',
    attachSamplePothole: 'Attach Real Pothole Photo',

    sevLow: 'Low',
    sevMedium: 'Medium',
    sevHigh: 'High',
    sevCritical: 'Critical',

    verificationCardTitle: 'AI Complaint Verification & Smart Routing',
    verdictValid: 'VALID',
    verdictInvalid: 'INVALID',
    verdictNeedsReview: 'NEEDS REVIEW',
    confidenceLabel: 'Confidence',
    aiCategoryLabel: 'AI Category',
    aiPriorityLabel: 'AI Priority',
    locationStatusLabel: 'Location Status',
    locationProvided: 'PROVIDED',
    locationMissing: 'MISSING',
    locationUnclear: 'UNCLEAR',
    smartRoutingLabel: 'Smart Routing Department',
    rationaleLabel: 'Verification Rationale',
    recommendedActionLabel: 'Recommended Action',
    duplicateDetected: 'Duplicate Notice: A similar complaint exists in this ward.',
    nonPretenceAdvisory: 'Official Advisory: AI verification results are automated advisory recommendations for municipal workflow triage and do not constitute statutory final administrative orders.',
    confirmSubmissionBtn: 'Proceed & Register Grievance',
    addLocationPrompt: 'Please specify the street address or nearby landmark before registering:',
    addLocationPlaceholder: 'e.g. Beside RTC Bus Stand Depot Gate, Vizianagaram',
    updateLocationBtn: 'Update Location & Proceed',

    photoAuthTitle: 'Photo Authenticity & AI Deepfake Detection',
    photoAuthSubtitle: 'Computer Vision tamper check, synthetic AI image inspection & civic damage classification',
    testPhotosTitle: 'Test Photo Fraud Engine',
    testPhotoRealPothole: 'Real Road Pothole (Authentic 96%)',
    testPhotoAiFake: 'AI-Generated Pothole (Fake 94%)',
    testPhotoMismatched: 'Cute Cat (Mismatched Image)',
    testPhotoLiveWire: 'Live Wire Hazard (Critical)',
    testPhotoGarbage: 'Garbage Heap (Authentic)',
    authenticityScore: 'Authenticity Score',
    aiLikelihood: 'AI Generation Risk',
    fraudVerdictLabel: 'Image Integrity Verdict',
    verdictAuthentic: 'Authentic Field Capture',
    verdictAiGenerated: 'Suspected AI-Generated / Synthetic',
    verdictStockOrEdited: 'Stock Photo / Digitally Manipulated',
    verdictMismatched: 'Mismatched / Non-Civic Image',
    detectedVisualProblem: 'Detected Civic Feature',
    visualSeverity: 'Visual Severity',
    relevanceCheck: 'Civic Relevance Check',
    relevanceMatch: 'Visual Evidence Matches Report',
    relevanceMismatch: 'Evidence Mismatch: Photo does not depict reported civic issue',
    estimatedExtents: 'Estimated Extents',
    detectedHazardsTitle: 'Identified Public Hazards',
    tamperIntegrityTitle: 'Sensor / EXIF Integrity',
    inspectPhotoBtn: 'Inspect Image AI Fraud Report',
    aiPhotoWarningAlert: 'Warning: Uploaded image shows strong markers of synthetic generation or relevance mismatch. Municipal officers will conduct physical verification.',

    officialReportTitle: 'Official Municipal Inspection & Verification Dossier',
    officialReportSubtitle: 'Vizianagaram Municipal Corporation • Department of Urban Grievance Redressal',
    dossierRefNo: 'Official Dossier Ref No',
    grievanceDate: 'Date of Registration',
    reportingCitizen: 'Complainant',
    targetSla: 'Target Resolution SLA',
    inspectionChecklist: 'Field Verification Checklist',
    officerSignoff: 'Municipal Officer Sign-off & Seal',
    printReportBtn: 'Print Official Report',
    downloadDossierBtn: 'Export Report (.JSON)',
    viewOfficialReportBtn: 'View Official Inspection Report',
    closeBtn: 'Close',

    trackerTitle: 'Grievance Tracking & Audit Timeline',
    statusSubmitted: 'Submitted',
    statusVerified: 'Verified',
    statusAssigned: 'Assigned',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',

    heroTitle: 'Smart Civic Care. Intelligent Redressal.',
    heroSubtitle: 'Official grievance redressal portal connecting citizens of Vizianagaram with municipal engineers. Equipped with Gemini AI hazard triage, GPS geotagged verification, 400m duplicate detection, and real-time field crew dispatch.',
    heroReportCta: 'Report Civic Defect',
    heroTrackCta: 'Track Status',
    totalComplaints: 'Total Registered',
    resolved: 'Resolved & Verified',
    inProgress: 'In Active Field Repair',
    slaHours: 'Target Resolution SLA',
    recentIssues: 'Recent Community Issues',
    viewAll: 'View All',
  },

  te: {
    brandTitle: 'సివిక్‌సెన్స్',
    brandSubtitle: 'విజయనగరం నగరపాలక సంస్థ',
    govtName: 'ఆంధ్ర ప్రదేశ్ ప్రభుత్వం',
    corpName: 'విజయనగరం నగరపాలక సంస్థ',
    deptName: 'పురపాలక పరిపాలన మరియు పట్టణాభివృద్ధి శాఖ (MA&UD)',
    navOverview: 'ముఖ్యాంశాలు',
    navReport: 'సమస్యను నివేదించండి',
    navMyReports: 'నా ఫిర్యాదులు',
    navComplaints: 'ఫిర్యాదుల జాబితా',
    navServices: 'స్మార్ట్ సేవలు',
    navMap: 'పౌర పటం',
    navAuthority: 'అధికార పోర్టల్',
    navDepartments: 'విభాగాలు',
    navAnalytics: 'గణాంకాలు',
    navWorker: 'కార్మిక పోర్టల్',
    navOfficial: 'ఉన్నతాధికారి పోర్టల్',
    navAdmin: 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    switchUserRole: 'వినియోగదారుని మార్చండి',
    resetSeed: 'డేటా రీసెట్',

    reportTitle: 'పౌర సమస్యను నివేదించండి',
    reportSubtitle: 'విజయనగరం కోసం AI ధృవీకరణ & స్మార్ట్ మున్సిపల్ రూటింగ్',
    testSuiteTitle: 'అధికారిక ధృవీకరణ పరీక్షా దృశ్యాలు',
    testSuiteDesc: 'తక్షణ AI ప్రామాణికత, ప్రాధాన్యత మరియు స్మార్ట్ రూటింగ్‌ను పరీక్షించడానికి అధికారిక దృశ్యాలను ఎంచుకోండి.',
    fieldTitle: 'ఫిర్యాదు శీర్షిక',
    fieldTitlePlaceholder: 'ఉదా: RTC కాంప్లెక్స్ సమీపంలో వాహనాలు జారేలా ఉన్న పెద్ద గుంత',
    fieldDesc: 'వివరణాత్మక వివరణ',
    fieldDescPlaceholder: 'గుంత పరిమాణం, ప్రయాణికులపై ప్రభావం, మరియు ఏదైనా తక్షణ ప్రమాదం గురించి వివరాలు రాయండి...',
    fieldWard: 'పరిపాలనా వార్డు',
    fieldSeverity: 'తీవ్రత స్థాయి',
    fieldAddress: 'వీధి చిరునామా / ప్రాంతం',
    fieldAddressPlaceholder: 'ఉదా: ఆర్టీసీ కాంప్లెక్స్ రోడ్డు, స్టేషన్ దగ్గర',
    fieldLandmark: 'సమీప మైలురాయి (ల్యాండ్‌మార్క్)',
    fieldLandmarkPlaceholder: 'ఉదా: ప్రధాన బస్ స్టాండ్ గేట్ 2 ఎదురుగా',
    fieldPhotos: 'సాక్ష్యంగా ఫోటోలు (బహుళ ఫోటోలు అనుమతించబడతాయి)',
    addPhotoBtn: 'ఫోటో జోడించండి',
    verifyAiBtn: 'AI తో ధృవీకరించండి',
    verifyingBtn: 'AI ధృవీకరిస్తోంది...',
    submitComplaintBtn: 'ఫిర్యాదును నమోదు చేయండి',
    submittingBtn: 'ఫిర్యాదు నమోదు అవుతోంది...',
    photoTip: 'ఫోటో సాక్ష్యం మున్సిపల్ తనిఖీని 3.5 రెట్లు వేగవంతం చేస్తుంది',
    attachSamplePothole: 'నమూనా రోడ్డు గుంత ఫోటో జోడించండి',

    sevLow: 'తక్కువ',
    sevMedium: 'మధ్యస్థం',
    sevHigh: 'అధికం',
    sevCritical: 'అత్యవసరం',

    verificationCardTitle: 'AI ఫిర్యాదు ధృవీకరణ & స్మార్ట్ రూటింగ్',
    verdictValid: 'సరైనది (VALID)',
    verdictInvalid: 'చెల్లనిది (INVALID)',
    verdictNeedsReview: 'సమీక్ష అవసరం (NEEDS REVIEW)',
    confidenceLabel: 'ఖచ్చితత్వం (Confidence)',
    aiCategoryLabel: 'AI వర్గం',
    aiPriorityLabel: 'AI ప్రాధాన్యత',
    locationStatusLabel: 'స్థాన స్థితి',
    locationProvided: 'అందించబడింది (PROVIDED)',
    locationMissing: 'లేదు (MISSING)',
    locationUnclear: 'అస్పష్టం (UNCLEAR)',
    smartRoutingLabel: 'స్మార్ట్ రూటింగ్ విభాగం',
    rationaleLabel: 'ధృవీకరణ హేతుబద్ధత',
    recommendedActionLabel: 'సిఫార్సు చేసిన చర్య',
    duplicateDetected: 'నకిలీ గమనిక: ఈ వార్డులో ఇప్పటికే ఇలాంటి ఫిర్యాదు నమోదై ఉంది.',
    nonPretenceAdvisory: 'అధికారిక సూచన: AI ధృవీకరణ ఫలితాలు మున్సిపల్ పని క్రమబద్ధీకరణ కోసం అందించే స్వయంచాలిత సలహాలు మాత్రమే, చట్టబద్ధమైన తుది ఉత్తర్వులు కావు.',
    confirmSubmissionBtn: 'ఫిర్యాదును అధికారికంగా నమోదు చేయండి',
    addLocationPrompt: 'ఫిర్యాదు నమోదు చేసే ముందు దయచేసి వీధి చిరునామా లేదా సమీప గుర్తును తెలపండి:',
    addLocationPlaceholder: 'ఉదా: RTC బస్ స్టాండ్ డిపో గేట్ పక్కన, విజయనగరం',
    updateLocationBtn: 'స్థానాన్ని నవీకరించి కొనసాగించండి',

    photoAuthTitle: 'ఫోటో ప్రామాణికత & AI డీప్‌ఫేక్ గుర్తింపు',
    photoAuthSubtitle: 'కంప్యూటర్ విజన్ ద్వారా నకిలీ AI చిత్రాల గుర్తింపు & పౌర నష్టం విశ్లేషణ',
    testPhotosTitle: 'ఫోటో పరీక్షా నమూనాలు',
    testPhotoRealPothole: 'నిజమైన రోడ్డు గుంత (ప్రామాణికత 96%)',
    testPhotoAiFake: 'AI రూపొందించిన గుంత (నకిలీ 94%)',
    testPhotoMismatched: 'పిల్లి ఫోటో (అసంగతమైన చిత్రం)',
    testPhotoLiveWire: 'లైవ్ వైర్ ప్రమాదం (అత్యవసరం)',
    testPhotoGarbage: 'చెత్త కుప్ప (ప్రామాణికం)',
    authenticityScore: 'ప్రామాణికత స్కోరు',
    aiLikelihood: 'AI ఉత్పత్తి ప్రమాదం',
    fraudVerdictLabel: 'చిత్ర సమగ్రత తీర్పు',
    verdictAuthentic: 'వాస్తవ ఫీల్డ్ ఫోటో (Authentic)',
    verdictAiGenerated: 'అనుమానాస్పద AI ఉత్పత్తి (Synthetic AI)',
    verdictStockOrEdited: 'స్టాక్ ఫోటో / ఎడిట్ చేయబడిన చిత్రం',
    verdictMismatched: 'అసంగతమైన / పౌర సమస్య కాని చిత్రం',
    detectedVisualProblem: 'గుర్తించిన పౌర సమస్య',
    visualSeverity: 'దృశ్య తీవ్రత',
    relevanceCheck: 'సమస్యతో సరిపోలిక',
    relevanceMatch: 'ఫోటో సాక్ష్యం ఫిర్యాదుతో సరిపోలింది',
    relevanceMismatch: 'సాక్ష్యం అసంగతం: ఫోటో ఫిర్యాదుతో సరిపోలలేదు',
    estimatedExtents: 'అంచనా వేయబడిన పరిమాణం',
    detectedHazardsTitle: 'గుర్తించబడిన ప్రమాదాలు',
    tamperIntegrityTitle: 'సెన్సార్ / EXIF సమగ్రత',
    inspectPhotoBtn: 'ఫోటో AI విశ్లేషణ నివేదిక చూడండి',
    aiPhotoWarningAlert: 'హెచ్చరిక: అప్‌లోడ్ చేసిన చిత్రం కృత్రిమ AI తయారీ లేదా అసంగత లక్షణాలను చూపుతోంది. మున్సిపల్ అధికారులు భౌతిక తనిఖీ చేస్తారు.',

    officialReportTitle: 'అధికారిక మున్సిపల్ తనిఖీ & ధృవీకరణ పత్రం',
    officialReportSubtitle: 'విజయనగరం నగరపాలక సంస్థ • పౌర సమస్యల పరిష్కార విభాగం',
    dossierRefNo: 'అధికారిక డాసియర్ సంఖ్య',
    grievanceDate: 'నమోదు తేదీ',
    reportingCitizen: 'ఫిర్యాదుదారుడు',
    targetSla: 'పరిష్కార లక్ష్య సమయం (SLA)',
    inspectionChecklist: 'ఫీల్డ్ తనిఖీ జాబితా',
    officerSignoff: 'మున్సిపల్ అధికారి సంతకం & ముద్ర',
    printReportBtn: 'నివేదికను ప్రింట్ చేయండి',
    downloadDossierBtn: 'డాసియర్ డౌన్‌లోడ్ (.JSON)',
    viewOfficialReportBtn: 'అధికారిక తనిఖీ నివేదికను చూడండి',
    closeBtn: 'మూసివేయండి',

    trackerTitle: 'ఫిర్యాదు ట్రాకింగ్ & ఆడిట్ కాలక్రమం',
    statusSubmitted: 'నమోదైంది',
    statusVerified: 'ధృవీకరించబడింది',
    statusAssigned: 'కేటాయించబడింది',
    statusInProgress: 'పురోగతిలో ఉంది',
    statusResolved: 'పరిష్కరించబడింది',

    heroTitle: 'స్మార్ట్ పౌర సంరక్షణ. తెలివైన పరిష్కారం.',
    heroSubtitle: 'విజయనగరం పౌరులను మున్సిపల్ ఇంజనీర్లతో అనుసంధానించే అధికారిక ప్రజా ఫిర్యాదుల పరిష్కార పోర్టల్. జెమినీ AI ప్రమాద విశ్లేషణ, GPS జియోట్యాగింగ్ ధృవీకరణ మరియు తక్షణ ఫీల్డ్ సిబ్బంది కేటాయింపుతో కూడినది.',
    heroReportCta: 'పౌర సమస్యను నివేదించండి',
    heroTrackCta: 'స్థితిని ట్రాక్ చేయండి',
    totalComplaints: 'మొత్తం నమోదైనవి',
    resolved: 'పరిష్కరించబడినవి',
    inProgress: 'క్షేత్రస్థాయి మరమ్మతులో',
    slaHours: 'లక్ష్య పరిష్కార సమయం',
    recentIssues: 'ఇటీవలి సమాజ సమస్యలు',
    viewAll: 'అన్నీ చూడండి',
  },

  hi: {
    brandTitle: 'सिविकसेंस',
    brandSubtitle: 'विजयनगरम नगर निगम',
    govtName: 'आंध्र प्रदेश सरकार',
    corpName: 'विजयनगरम नगर निगम',
    deptName: 'नगर प्रशासन एवं शहरी विकास विभाग (MA&UD)',
    navOverview: 'सिंहावलोकन',
    navReport: 'समस्या दर्ज करें',
    navMyReports: 'मेरी शिकायतें',
    navComplaints: 'शिकायतें',
    navServices: 'स्मार्ट सेवाएं',
    navMap: 'नागरिक मानचित्र',
    navAuthority: 'अधिकारी पोर्टल',
    navDepartments: 'विभाग',
    navAnalytics: 'विश्लेषण',
    navWorker: 'कर्मचारी पोर्टल',
    navOfficial: 'उच्च अधिकारी पोर्टल',
    navAdmin: 'व्यवस्थापक डैशबोर्ड',
    switchUserRole: 'भूमिका बदलें',
    resetSeed: 'डेटा रीसेट',

    reportTitle: 'नागरिक शिकायत दर्ज करें',
    reportSubtitle: 'विजयनगरम के लिए AI सत्यापन एवं स्मार्ट म्यूनिसिपल रूटिंग',
    testSuiteTitle: 'आधिकारिक सत्यापन परीक्षण परिदृश्य',
    testSuiteDesc: 'त्वरित AI प्रामाणिकता, प्राथमिकता और स्मार्ट रूटिंग जांचने हेतु आधिकारिक परिदृश्य चुनें।',
    fieldTitle: 'शिकायत का शीर्षक',
    fieldTitlePlaceholder: 'उदा: आरटीसी कॉम्प्लेक्स के पास बड़ा गड्ढा जिससे वाहन फिसल रहे हैं',
    fieldDesc: 'विस्तृत विवरण',
    fieldDescPlaceholder: 'गड्ढे का आकार, यात्रियों पर प्रभाव, उपेक्षा की समयसीमा, एवं किसी तात्कालिक खतरे का विवरण दें...',
    fieldWard: 'प्रशासनिक वार्ड',
    fieldSeverity: 'गंभीरता स्तर',
    fieldAddress: 'सड़क का पता / क्षेत्र',
    fieldAddressPlaceholder: 'उदा: आरटीसी कॉम्प्लेक्स रोड, स्टेशन के पास',
    fieldLandmark: 'निकटतम पहचान चिन्ह (लैंडमार्क)',
    fieldLandmarkPlaceholder: 'उदा: मुख्य बस स्टैंड गेट 2 के सामने',
    fieldPhotos: 'साक्ष्य फोटो (एकाधिक फोटो अनुमत हैं)',
    addPhotoBtn: 'फोटो जोड़ें',
    verifyAiBtn: 'AI से सत्यापित करें',
    verifyingBtn: 'AI सत्यापन कर रहा है...',
    submitComplaintBtn: 'शिकायत पंजीकृत करें',
    submittingBtn: 'शिकायत दर्ज हो रही है...',
    photoTip: 'फोटो साक्ष्य से म्यूनिसिपल निरीक्षण 3.5 गुना तेजी से होता है',
    attachSamplePothole: 'सड़क गड्ढे का वास्तविक फोटो जोड़ें',

    sevLow: 'कम',
    sevMedium: 'मध्यम',
    sevHigh: 'उच्च',
    sevCritical: 'अति-गंभीर',

    verificationCardTitle: 'AI शिकायत सत्यापन एवं स्मार्ट रूटिंग',
    verdictValid: 'वैध (VALID)',
    verdictInvalid: 'अमान्य (INVALID)',
    verdictNeedsReview: 'समीक्षा आवश्यक (NEEDS REVIEW)',
    confidenceLabel: 'विश्वास स्तर (Confidence)',
    aiCategoryLabel: 'AI श्रेणी',
    aiPriorityLabel: 'AI प्राथमिकता',
    locationStatusLabel: 'स्थान की स्थिति',
    locationProvided: 'उपलब्ध (PROVIDED)',
    locationMissing: 'लापता (MISSING)',
    locationUnclear: 'अस्पष्ट (UNCLEAR)',
    smartRoutingLabel: 'स्मार्ट रूटिंग विभाग',
    rationaleLabel: 'सत्यापन का तर्क',
    recommendedActionLabel: 'अनुशंसित कार्रवाई',
    duplicateDetected: 'डुप्लिकेट सूचना: इस वार्ड में पहले से मिलती-जुलती शिकायत दर्ज है।',
    nonPretenceAdvisory: 'आधिकारिक सलाह: AI सत्यापन परिणाम कार्यप्रवाह सुविधा हेतु स्वचालित सुझाव हैं, यह कोई वैधानिक अंतिम आदेश नहीं हैं।',
    confirmSubmissionBtn: 'शिकायत आधिकारिक रूप से दर्ज करें',
    addLocationPrompt: 'कृपया शिकायत दर्ज करने से पहले सड़क का पता या नजदीकी लैंडमार्क दर्ज करें:',
    addLocationPlaceholder: 'उदा: आरटीसी बस स्टैंड डिपो गेट के पास, विजयनगरम',
    updateLocationBtn: 'स्थान अपडेट करें व आगे बढ़ें',

    photoAuthTitle: 'फोटो प्रामाणिकता एवं AI डीपफेक पहचान',
    photoAuthSubtitle: 'कंप्यूटर विजन द्वारा नकली AI फोटो की पहचान एवं नागरिक क्षति वर्गीकरण',
    testPhotosTitle: 'फोटो परीक्षण नमूने',
    testPhotoRealPothole: 'सड़क का वास्तविक गड्ढा (प्रामाणिक 96%)',
    testPhotoAiFake: 'AI जनित गड्ढा (नकली 94%)',
    testPhotoMismatched: 'बिल्ली की फोटो (असंगत चित्र)',
    testPhotoLiveWire: 'टूटा हुआ बिजली का तार (अति-गंभीर)',
    testPhotoGarbage: 'कचरे का ढेर (प्रामाणिक)',
    authenticityScore: 'प्रामाणिकता स्कोर',
    aiLikelihood: 'AI जनरेशन जोखिम',
    fraudVerdictLabel: 'चित्र सत्यता निर्णय',
    verdictAuthentic: 'वास्तविक फ़ील्ड कैप्चर (Authentic)',
    verdictAiGenerated: 'संदिग्ध AI जनित / सिंथेटिक (Fake AI)',
    verdictStockOrEdited: 'स्टॉक फोटो / डिजिटल रूप से संपादित',
    verdictMismatched: 'असंगत / गैर-नागरिक चित्र',
    detectedVisualProblem: 'पहचाना गया नागरिक मुद्दा',
    visualSeverity: 'दृश्य गंभीरता',
    relevanceCheck: 'शिकायत से अनुकूलता',
    relevanceMatch: 'फोटो साक्ष्य शिकायत से मेल खाता है',
    relevanceMismatch: 'साक्ष्य असंगत: फोटो दी गई शिकायत से मेल नहीं खाता',
    estimatedExtents: 'अनुमानित माप',
    detectedHazardsTitle: 'पहचाने गए सार्वजनिक खतरे',
    tamperIntegrityTitle: 'सेंसर / EXIF अखंडता',
    inspectPhotoBtn: 'फोटो AI रिपोर्ट देखें',
    aiPhotoWarningAlert: 'चेतावनी: अपलोड किया गया चित्र कृत्रिम रूप से बनाए जाने या असंगत होने के संकेत दे रहा है। म्यूनिसिपल अधिकारी भौतिक सत्यापन करेंगे।',

    officialReportTitle: 'आधिकारिक म्यूनिसिपल निरीक्षण एवं सत्यापन डोजियर',
    officialReportSubtitle: 'विजयनगरम नगर निगम • नागरिक शिकायत निवारण विभाग',
    dossierRefNo: 'आधिकारिक डोजियर संदर्भ संख्या',
    grievanceDate: 'पंजीकरण तिथि',
    reportingCitizen: 'शिकायतकर्ता',
    targetSla: 'लक्षित समाधान समय (SLA)',
    inspectionChecklist: 'फ़ील्ड सत्यापन चेकलिस्ट',
    officerSignoff: 'म्यूनिसिपल अधिकारी हस्ताक्षर व मुहर',
    printReportBtn: 'रिपोर्ट प्रिंट करें',
    downloadDossierBtn: 'डोजियर डाउनलोड (.JSON)',
    viewOfficialReportBtn: 'आधिकारिक निरीक्षण रिपोर्ट देखें',
    closeBtn: 'बंद करें',

    trackerTitle: 'शिकायत ट्रैकिंग एवं ऑडिट समयरेखा',
    statusSubmitted: 'दर्ज हुई',
    statusVerified: 'सत्यापित',
    statusAssigned: 'आवंटित',
    statusInProgress: 'प्रगति पर',
    statusResolved: 'समाधान हुआ',

    heroTitle: 'स्मार्ट नागरिक सेवा। त्वरित समाधान।',
    heroSubtitle: 'विजयनगरम के नागरिकों को नगरपालिका इंजीनियरों से जोड़ने वाला आधिकारिक शिकायत निवारण पोर्टल। जेमिनी AI जोखिम विश्लेषण, GPS जियोटैगिंग और त्वरित फील्ड टीम डिस्पैच से सुसज्जित।',
    heroReportCta: 'नागरिक समस्या दर्ज करें',
    heroTrackCta: 'स्थिति ट्रैक करें',
    totalComplaints: 'कुल पंजीकृत',
    resolved: 'समाधान एवं सत्यापित',
    inProgress: 'सक्रिय मरम्मत में',
    slaHours: 'लक्षित समाधान समय',
    recentIssues: 'हाल की सामुदायिक समस्याएं',
    viewAll: 'सभी देखें',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_LANG = 'civicsense_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG) as Language;
    if (saved === 'en' || saved === 'te' || saved === 'hi') {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
