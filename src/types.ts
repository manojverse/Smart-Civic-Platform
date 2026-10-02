export type UserRole =
  | 'citizen'
  | 'staff'
  | 'admin'
  | 'worker'
  | 'field_officer'
  | 'higher_official'
  | 'department_officer'
  | 'super_admin';

export const normalizeUserRole = (role?: string | UserRole): UserRole => {
  const normalizedRole = String(role || 'citizen').toLowerCase();

  if (['worker', 'field_officer', 'higher_official', 'department_officer', 'staff'].includes(normalizedRole)) {
    return 'staff';
  }

  if (['admin', 'super_admin'].includes(normalizedRole)) {
    return 'admin';
  }

  return 'citizen';
};

export const getRoleDisplayName = (role: UserRole | string): string => {
  const normalizedRole = normalizeUserRole(role);

  switch (normalizedRole) {
    case 'citizen':
      return 'Citizen';
    case 'staff':
      return 'Staff / Officer';
    case 'admin':
      return 'Admin';
    default:
      return 'Citizen';
  }
};

// ─── Three-Portal Role System ───────────────────────────────────────────────
// Maps all internal roles to exactly 3 portal categories
export type PortalRole = 'citizen' | 'staff' | 'admin';

export const getPortalRole = (role: UserRole | string | undefined): PortalRole => {
  const r = String(role || 'citizen').toLowerCase();
  if (r === 'admin' || r === 'super_admin') return 'admin';
  if (r === 'worker' || r === 'field_officer' || r === 'higher_official' || r === 'department_officer') return 'staff';
  return 'citizen';
};

export const isAdminPortalRole = (role: UserRole | string | undefined): boolean =>
  getPortalRole(role) === 'admin';

export const isStaffPortalRole = (role: UserRole | string | undefined): boolean =>
  getPortalRole(role) === 'staff';

export const PORTAL_ROLE_LABELS: Record<PortalRole, string> = {
  citizen: 'Citizen',
  staff: 'Staff / Officer',
  admin: 'Admin',
};

export type ComplaintCategory =
  | 'Garbage'
  | 'Pothole'
  | 'Road Damage'
  | 'Water Leakage'
  | 'Drainage'
  | 'Streetlight'
  | 'Traffic'
  | 'Pollution'
  | 'Public Property Damage'
  | 'Park Issue'
  | 'Sanitation'
  | 'Public Toilet'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Work Completed'
  | 'Pending Verification'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  | 'On Hold'
  | 'Escalated'
  | 'Reopened';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Priority = 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low';

export type MunicipalDepartment =
  | 'Solid Waste Management'
  | 'Public Works Department (PWD)'
  | 'Water Supply & Sewerage Board'
  | 'Electricity & Streetlighting'
  | 'Traffic & Transport Planning'
  | 'Environmental Control Board'
  | 'Horticulture & Parks'
  | 'Public Health & Sanitation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  ward?: string;
  department?: MunicipalDepartment;
  avatar?: string;
  employeeId?: string;
  designation?: string;
  workArea?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
  lastLoginAt?: string;
  loginCount?: number;
  lastActiveTab?: string;
  isOnline?: boolean;
}

export interface RegisteredUserRecord extends User {
  firebaseUid?: string;
  authProvider?: 'password' | 'anonymous' | 'google';
  registeredDate?: string;
  lastVisitedComplaintId?: string;
  submittedComplaintsCount?: number;
}

export interface StatusHistoryItem {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  updatedBy: string;
  role: UserRole;
  remarks?: string;
  evidenceUrl?: string;
}

export interface CitizenFeedback {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
  timelinessSatisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied';
}

export type AIValidity = 'VALID' | 'INVALID' | 'NEEDS_REVIEW';
export type AIPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AILocationStatus = 'PROVIDED' | 'MISSING' | 'UNCLEAR';

export interface AIVerificationResult {
  validity: AIValidity;
  confidence: number;
  category: string;
  subcategory: string;
  priority: AIPriority;
  location: string;
  location_status: AILocationStatus;
  reason: string;
  recommended_department: string;
  recommended_action: string;
  duplicate: boolean;
  duplicate_complaint_id?: string;
  duplicate_summary?: string;
}

export interface AIClassificationResult {
  category: ComplaintCategory;
  subcategory: string;
  severity: Severity;
  priority: Priority;
  suggestedDepartment: MunicipalDepartment;
  safetyRisk: string;
  suggestedAction: string;
  confidence: number; // 0 - 100
  reasoning: string;
  estimatedResolutionHours: number;
}

export interface ComplaintLocation {
  address: string;
  landmark?: string;
  ward: string;
  lat: number;
  lng: number;
}

export interface AssignedOfficer {
  id: string;
  name: string;
  phone: string;
  badgeNumber: string;
  department: MunicipalDepartment;
  distanceKm?: number;
  assignmentScore?: number;
}

export interface WorkerProof {
  beforePhoto?: string;
  beforePhotoTimestamp?: string;
  afterPhoto?: string;
  afterPhotoTimestamp?: string;
  completionNotes?: string;
  completedAt?: string;
  workerId?: string;
  workerName?: string;
  locationVerified?: boolean;
}

export interface VerificationDetails {
  verifiedBy: string;
  verifiedAt: string;
  officialNotes?: string;
  decision: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface Complaint {
  id: string; // e.g. CS-VZM-2026-000101
  title: string;
  description: string;
  category: ComplaintCategory;
  subcategory?: string;
  severity: Severity;
  priority: Priority;
  status: ComplaintStatus;
  location: ComplaintLocation;
  photos: string[];
  reportedBy: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  department?: MunicipalDepartment;
  projectId?: string;
  assignedOfficer?: AssignedOfficer;
  workerProof?: WorkerProof;
  verificationDetails?: VerificationDetails;
  internalNotes?: {
    id: string;
    author: string;
    role: UserRole;
    text: string;
    timestamp: string;
  }[];
  resolutionDetails?: {
    resolvedAt: string;
    notes: string;
    proofPhotos: string[];
    resolvedBy: string;
  };
  slaHours: number;
  slaDeadline: string; // ISO string
  isOverdue?: boolean;
  isEscalated?: boolean;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  upvotedBy: string[]; // user IDs who supported this issue
  timeline: StatusHistoryItem[];
  aiAnalysis?: AIClassificationResult;
  feedback?: CitizenFeedback;
  // AI Verification & Smart Routing Fields
  aiValidity?: AIValidity;
  aiConfidence?: number;
  aiCategory?: string;
  aiSubcategory?: string;
  aiPriority?: AIPriority;
  aiLocation?: string;
  aiLocationStatus?: AILocationStatus;
  aiReason?: string;
  recommendedDepartment?: string;
  recommendedAction?: string;
  duplicateStatus?: boolean;
  aiVerifiedAt?: string;
  aiVerification?: AIVerificationResult;
  photoAnalysis?: PhotoAuthenticityAnalysis;
}

export type Language = 'en' | 'te' | 'hi';

export type ImageFraudVerdict = 
  | 'AUTHENTIC_FIELD_CAPTURE' 
  | 'SUSPECTED_AI_GENERATED' 
  | 'STOCK_PHOTO_OR_EDITED' 
  | 'MISMATCHED_IMAGE';

export interface PhotoAuthenticityAnalysis {
  photoUrl: string;
  authenticityScore: number; // 0 - 100% (higher = genuine real photo)
  isAiGenerated: boolean;
  aiLikelihood: 'LOW' | 'MEDIUM' | 'HIGH' | 'SUSPECTED_AI';
  tamperRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageFraudVerdict: ImageFraudVerdict;
  detectedCivicFeature: string;
  detectedFeatureSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  relevanceToCivicIssue: 'RELEVANT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCHED_OR_NON_CIVIC';
  relevanceExplanation: string;
  estimatedDimensions?: string;
  detectedHazards: string[];
  detectionMarkers: string[];
  exifIntegrity: 'VERIFIED_VALID' | 'STRIPPED_OR_MISSING' | 'TAMPERED';
  analyzedAt: string;
}

export interface AuditLog {
  id: string;
  complaintId?: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface SmartServiceItem {
  id: string;
  name: string;
  category: 
    | 'Water Services'
    | 'Waste Management'
    | 'Roads & Infrastructure'
    | 'Streetlights'
    | 'Sanitation'
    | 'Public Facilities'
    | 'Emergency Services'
    | 'Municipal Services';
  address: string;
  phone: string;
  lat: number;
  lng: number;
  timings?: string;
  emergencyContact?: boolean;
  description: string;
}

export interface MunicipalAnnouncement {
  id: string;
  title: string;
  message: string;
  department: string;
  priority: 'low' | 'normal' | 'urgent';
  timestamp: string;
  actionLabel?: string;
  actionTab?: string;
}

export interface CivicNotification {
  id: string;
  complaintId?: string;
  title: string;
  message: string;
  type: 
    | 'new_complaint'
    | 'status_change'
    | 'officer_assigned'
    | 'resolved'
    | 'reopened'
    | 'sla_breach'
    | 'authority_message'
    | 'escalation'
    | 'feedback';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole;
  targetUserId?: string;
}

export interface DepartmentInfo {
  name: MunicipalDepartment;
  headName: string;
  email: string;
  phone: string;
  activeOfficersCount: number;
  openComplaints: number;
  avgResolutionDays: number;
  slaComplianceRate: number; // percentage
}

export type InfrastructureProjectType =
  | 'Road'
  | 'Drainage'
  | 'Streetlight'
  | 'Park'
  | 'Bus Stop'
  | 'School'
  | 'Public Building';

export type InfrastructureProjectStatus =
  | 'Planned'
  | 'In Progress'
  | 'Delayed'
  | 'Completed';

export interface InfrastructureProject {
  id: string;
  name: string;
  type: InfrastructureProjectType;
  department: MunicipalDepartment;
  contractor: string;
  location: string;
  ward: string;
  lat: number;
  lng: number;
  budget: number;
  startDate: string;
  expectedCompletionDate: string;
  progressPercent: number;
  status: InfrastructureProjectStatus;
  description: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type InfrastructureProjectInput = {
  name: string;
  type: InfrastructureProjectType;
  department: MunicipalDepartment;
  contractor: string;
  location: string;
  ward: string;
  lat: number;
  lng: number;
  budget: number;
  startDate: string;
  expectedCompletionDate: string;
  progressPercent: number;
  status: InfrastructureProjectStatus;
  description: string;
  photos?: string[];
};
