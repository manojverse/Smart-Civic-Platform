export type UserRole = 
  | 'citizen' 
  | 'field_officer' 
  | 'department_officer' 
  | 'admin' 
  | 'super_admin';

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
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
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
}

export interface Complaint {
  id: string; // e.g. CIVIC-2026-8812
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
  assignedOfficer?: AssignedOfficer;
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
