import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Complaint,
  CivicNotification,
  User,
  UserRole,
  ComplaintStatus,
  MunicipalDepartment,
  AssignedOfficer,
  CitizenFeedback,
  AIClassificationResult,
  Severity,
  Priority,
  RegisteredUserRecord,
  SmartServiceItem,
  MunicipalAnnouncement,
  AuditLog,
  WorkerProof,
  VerificationDetails,
  ComplaintCategory,
  AIVerificationResult,
} from '../types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS,
  FIELD_OFFICERS,
  SMART_SERVICES,
  MUNICIPAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import { classifyComplaint } from '../services/aiClassifier';
import { findBestWorkerForComplaint, WorkerCandidate } from '../services/workerAssignment';
import {
  db,
  auth,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '../services/firebase';

interface CivicContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  complaints: Complaint[];
  notifications: CivicNotification[];
  selectedComplaint: Complaint | null;
  setSelectedComplaint: (complaint: Complaint | null) => void;

  // Real-time Database Collections
  registeredUsers: RegisteredUserRecord[];
  services: SmartServiceItem[];
  announcements: MunicipalAnnouncement[];
  auditLogs: AuditLog[];
  recordComplaintVisit: (complaintId: string) => Promise<void>;

  // Authentication & Modal State
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  isAuthLoading: boolean;
  authError: string | null;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    profile: {
      name: string;
      phone?: string;
      ward?: string;
      role: UserRole;
      department?: MunicipalDepartment;
      employeeId?: string;
      designation?: string;
      workArea?: string;
    }
  ) => Promise<void>;
  signInWithDemoUser: (
    demoRole: 'citizen' | 'worker' | 'higher_official' | 'admin' | 'field_officer' | 'department_officer'
  ) => Promise<void>;
  signOutUser: () => Promise<void>;

  // Core Actions
  createComplaint: (data: {
    title: string;
    description: string;
    category: any;
    severity: Severity;
    address: string;
    landmark?: string;
    ward: string;
    lat: number;
    lng: number;
    photos: string[];
    aiResult?: AIClassificationResult;
    verificationResult?: AIVerificationResult;
  }) => Promise<Complaint>;

  updateComplaintStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks?: string,
    evidenceUrl?: string
  ) => void;

  assignOfficer: (
    complaintId: string,
    department: MunicipalDepartment,
    officer: AssignedOfficer,
    remarks?: string
  ) => void;

  // Worker Specialized Actions
  workerAcceptTask: (complaintId: string) => void;
  workerStartWork: (complaintId: string, beforePhotoUrl: string) => void;
  workerCompleteTask: (
    complaintId: string,
    afterPhotoUrl: string,
    completionNotes: string
  ) => void;

  // Higher Official Specialized Actions
  officialVerifyComplaint: (
    complaintId: string,
    decision: 'approved' | 'rejected',
    notes?: string,
    rejectReason?: string
  ) => void;
  reassignComplaint: (
    complaintId: string,
    newOfficer: AssignedOfficer,
    remarks?: string
  ) => void;
  broadcastAnnouncement: (
    announcement: Omit<MunicipalAnnouncement, 'id' | 'timestamp'>
  ) => void;

  // Admin Management Actions
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  toggleUserActiveStatus: (userId: string) => void;
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;

  // Shared Actions
  updatePriority: (complaintId: string, priority: Priority) => void;
  addInternalNote: (complaintId: string, noteText: string) => void;
  submitFeedback: (complaintId: string, feedback: CitizenFeedback) => void;
  reopenComplaint: (complaintId: string, reason: string) => void;
  upvoteComplaint: (complaintId: string) => void;

  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  activeToast: { title: string; message: string; type: string } | null;
  clearToast: () => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

const STORAGE_KEY_COMPLAINTS = 'civicsense_complaints_v2';
const STORAGE_KEY_NOTIFS = 'civicsense_notifs_v2';
const STORAGE_KEY_USER = 'civicsense_user_v2';
const STORAGE_KEY_AUDIT = 'civicsense_audit_v2';
const STORAGE_KEY_ANNOUNCEMENTS = 'civicsense_announcements_v2';

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEMO_USERS[0]; // Default: Citizen Deepika Rao
  });

  // 2. Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_COMPLAINTS;
  });

  // 3. Registered Users Database
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>(() => {
    return DEMO_USERS.map((u, i) => ({
      ...u,
      createdAt: '2026-01-10T10:00:00.000Z',
      lastLoginAt: new Date(Date.now() - i * 3600000).toISOString(),
      loginCount: 5 + i * 3,
      isOnline: i === 0,
      approvalStatus: u.role === 'citizen' ? 'approved' : 'approved', // Pre-seeded users are approved
      submittedComplaintsCount: i === 0 ? 3 : 1,
      lastVisitedComplaintId: i === 0 ? 'CS-VZM-2026-000101' : undefined,
    }));
  });

  // 4. Notifications state
  const [notifications, setNotifications] = useState<CivicNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 5. Smart Services
  const [services] = useState<SmartServiceItem[]>(SMART_SERVICES);

  // 6. Municipal Announcements
  const [announcements, setAnnouncements] = useState<MunicipalAnnouncement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return MUNICIPAL_ANNOUNCEMENTS;
  });

  // 7. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: string } | null>(null);

  // Auth UI modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const showToast = useCallback((title: string, message: string, type: string = 'info') => {
    setActiveToast({ title, message, type });
    setTimeout(() => {
      setActiveToast((prev) => (prev?.title === title ? null : prev));
    }, 4500);
  }, []);

  const clearToast = () => setActiveToast(null);

  // Helper to add an audit log
  const addAuditLog = useCallback(
    (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
      const newLog: AuditLog = {
        id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        ...entry,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      // Persist to local storage
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_AUDIT) || '[]');
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify([newLog, ...existing]));
      } catch (e) {}

      // Optionally persist to Firestore audit_logs collection
      try {
        setDoc(doc(db, 'audit_logs', newLog.id), newLog);
      } catch (e) {}
    },
    []
  );

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  // Real-time Cloud Firestore synchronization for Users
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const usersColRef = collection(db, 'users');
      unsubscribe = onSnapshot(
        usersColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: RegisteredUserRecord[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as RegisteredUserRecord);
            });
            setRegisteredUsers(list);
          } else {
            // Seed demo users to Firestore if collection is empty
            DEMO_USERS.forEach(async (u, idx) => {
              const seedRecord: RegisteredUserRecord = {
                ...u,
                createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
                lastLoginAt: new Date(Date.now() - idx * 3600000).toISOString(),
                loginCount: idx === 0 ? 8 : 4,
                isOnline: idx === 0,
                approvalStatus: 'approved',
                submittedComplaintsCount: idx === 0 ? 3 : 1,
                lastVisitedComplaintId: idx === 0 ? 'CS-VZM-2026-000101' : undefined,
              };
              try {
                await setDoc(doc(db, 'users', u.id), seedRecord);
              } catch (e) {}
            });
          }
        },
        (err) => {
          console.warn('Firestore users snapshot skipped:', err.message);
        }
      );
    } catch (e) {
      console.warn('Firestore connection inactive, using offline memory state.');
    }
    return () => unsubscribe();
  }, []);

  // Real-time Cloud Firestore synchronization for Complaints
  useEffect(() => {
    let unsubscribeComplaints: () => void = () => {};
    try {
      const complaintsColRef = collection(db, 'complaints');
      unsubscribeComplaints = onSnapshot(
        complaintsColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Complaint[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Complaint);
            });
            // Merge with local complaints to preserve pre-seeded rich entries
            setComplaints((prev) => {
              const mergedMap = new Map<string, Complaint>();
              prev.forEach((c) => mergedMap.set(c.id, c));
              list.forEach((c) => mergedMap.set(c.id, c));
              return Array.from(mergedMap.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          } else {
            // Seed complaints to Firestore if empty
            INITIAL_COMPLAINTS.forEach(async (complaint) => {
              try {
                await setDoc(doc(db, 'complaints', complaint.id), complaint);
              } catch (e) {}
            });
          }
        },
        (err) => {
          console.warn('Firestore complaints snapshot skipped:', err.message);
        }
      );
    } catch (e) {
      console.warn('Firestore complaints live connection skipped.');
    }
    return () => unsubscribeComplaints();
  }, []);

  // Sync user record to Firestore helper
  const syncUserToFirestore = async (userRecord: RegisteredUserRecord) => {
    try {
      await setDoc(doc(db, 'users', userRecord.id), userRecord, { merge: true });
    } catch (e) {
      console.warn('Could not sync user to Firestore:', e);
    }
  };

  // Record user visit to a specific complaint
  const recordComplaintVisit = async (complaintId: string) => {
    if (!currentUser?.id) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        lastVisitedComplaintId: complaintId,
        lastActiveAt: new Date().toISOString(),
      });
      setCurrentUser((prev) => ({ ...prev, lastVisitedComplaintId: complaintId }));
    } catch (e) {}
  };

  // Sign Up with Email and Password
  const signUpWithEmail = async (
    email: string,
    pass: string,
    profile: {
      name: string;
      phone?: string;
      ward?: string;
      role: UserRole;
      department?: MunicipalDepartment;
      employeeId?: string;
      designation?: string;
      workArea?: string;
    }
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      let uid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      let isFirebaseAuthSuccessful = false;

      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        uid = cred.user.uid;
        isFirebaseAuthSuccessful = true;
      } catch (authErr: any) {
        console.warn(
          'Firebase Auth provider fallback to direct database record:',
          authErr.code || authErr.message
        );
      }

      const nowIso = new Date().toISOString();
      const isStaffRole = profile.role === 'worker' || profile.role === 'higher_official';
      const approvalStatus = isStaffRole ? 'pending' : 'approved';

      const newUser: RegisteredUserRecord = {
        id: uid,
        firebaseUid: isFirebaseAuthSuccessful ? uid : undefined,
        name: profile.name.trim(),
        email: cleanEmail,
        phone: profile.phone?.trim() || '+91 8922 245000',
        ward: profile.ward || 'Ward 1 - Fort Road & Royal Palace Quarter',
        role: profile.role,
        department: profile.department,
        employeeId: profile.employeeId,
        designation: profile.designation,
        workArea: profile.workArea,
        approvalStatus,
        authProvider: 'password',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        loginCount: 1,
        isOnline: true,
        submittedComplaintsCount: 0,
      };

      setCurrentUser(newUser);
      await syncUserToFirestore(newUser);

      setRegisteredUsers((prev) => {
        const index = prev.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newUser;
          return updated;
        }
        return [newUser, ...prev];
      });

      addAuditLog({
        user: newUser.name,
        role: newUser.role,
        action: 'USER_REGISTERED',
        details: `New account registered as ${newUser.role}. Status: ${approvalStatus}.`,
      });

      if (isStaffRole) {
        showToast(
          'Account Registered (Pending Approval)',
          `Your ${profile.role === 'worker' ? 'Worker' : 'Official'} registration is pending administrator verification.`,
          'info'
        );
      } else {
        showToast(
          'Account Registered',
          `Welcome to CivicSense Vizianagaram, ${newUser.name}!`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      throw new Error(err.message || 'Could not register user account.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign In with Email and Password
  const signInWithEmail = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      let uid = '';
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        uid = cred.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth email sign-in fallback:', authErr.code || authErr.message);
      }

      let existing = registeredUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail || (uid && u.id === uid)
      );

      if (!existing) {
        try {
          const directDoc = await getDocs(
            query(collection(db, 'users'), where('email', '==', cleanEmail))
          );
          if (!directDoc.empty) {
            existing = { id: directDoc.docs[0].id, ...directDoc.docs[0].data() } as RegisteredUserRecord;
          }
        } catch (e) {}
      }

      if (existing) {
        const updatedUser: RegisteredUserRecord = {
          ...existing,
          lastLoginAt: new Date().toISOString(),
          loginCount: (existing.loginCount || 1) + 1,
          isOnline: true,
        };
        setCurrentUser(updatedUser);
        await syncUserToFirestore(updatedUser);
        setRegisteredUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );

        addAuditLog({
          user: updatedUser.name,
          role: updatedUser.role,
          action: 'USER_LOGIN',
          details: `User signed in with password authentication.`,
        });

        showToast(
          'Welcome Back',
          `Logged in as ${updatedUser.name} (${updatedUser.role.replace('_', ' ')}).`,
          'success'
        );
        return;
      }

      // Auto-initialize new user if valid email entered
      const nowIso = new Date().toISOString();
      const detectedRole: UserRole = cleanEmail.includes('admin') || cleanEmail.includes('commissioner')
        ? 'admin'
        : cleanEmail.includes('official') || cleanEmail.includes('engineer')
        ? 'higher_official'
        : cleanEmail.includes('worker') || cleanEmail.includes('technician')
        ? 'worker'
        : 'citizen';

      const autoRegisteredUser: RegisteredUserRecord = {
        id: uid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
        firebaseUid: uid || undefined,
        name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
        email: cleanEmail,
        phone: '+91 94401 00000',
        ward: 'Ward 1 - Fort Road & Royal Palace Quarter',
        role: detectedRole,
        approvalStatus: detectedRole === 'citizen' ? 'approved' : 'pending',
        authProvider: 'password',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        loginCount: 1,
        isOnline: true,
        submittedComplaintsCount: 0,
      };

      setCurrentUser(autoRegisteredUser);
      await syncUserToFirestore(autoRegisteredUser);
      setRegisteredUsers((prev) => [autoRegisteredUser, ...prev]);

      showToast(
        'Account Initialized',
        `Logged in as ${autoRegisteredUser.name} (${autoRegisteredUser.role}).`,
        'success'
      );
    } catch (err: any) {
      console.error('Sign in error:', err);
      const demo = DEMO_USERS[0];
      setCurrentUser(demo);
      showToast('Signed In as Citizen', 'Connected using demo profile.', 'info');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Quick Demo Sign In
  const signInWithDemoUser = async (
    demoRole: 'citizen' | 'worker' | 'higher_official' | 'admin' | 'field_officer' | 'department_officer'
  ) => {
    // Map backwards-compatible aliases
    const targetRole: UserRole =
      demoRole === 'field_officer'
        ? 'worker'
        : demoRole === 'department_officer'
        ? 'higher_official'
        : (demoRole as UserRole);

    const matched =
      DEMO_USERS.find((u) => u.role === targetRole) ||
      registeredUsers.find((u) => u.role === targetRole) ||
      DEMO_USERS[0];

    const updated: RegisteredUserRecord = {
      ...matched,
      lastLoginAt: new Date().toISOString(),
      loginCount: (matched.loginCount || 5) + 1,
      isOnline: true,
    };
    setCurrentUser(updated);
    await syncUserToFirestore(updated);

    addAuditLog({
      user: updated.name,
      role: updated.role,
      action: 'DEMO_LOGIN',
      details: `Active session switched to ${updated.name} (${updated.role}).`,
    });

    showToast('Signed In as Demo', `Active session: ${updated.name} (${updated.role.replace('_', ' ')})`, 'info');
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      if (currentUser?.id) {
        await updateDoc(doc(db, 'users', currentUser.id), { isOnline: false });
      }
      await signOut(auth);
    } catch (e) {}
    const guestUser: User = {
      id: `GUEST-${Date.now().toString().slice(-4)}`,
      name: 'Vizianagaram Visitor',
      email: 'visitor@vizianagaram.gov.in',
      role: 'citizen',
      ward: 'Ward 1 - Fort Road & Royal Palace Quarter',
    };
    setCurrentUser(guestUser);
    showToast('Signed Out', 'You have been signed out. Browsing as guest visitor.', 'info');
  };

  // Switch role helper for testing
  const switchRole = async (role: UserRole) => {
    const matched =
      DEMO_USERS.find((u) => u.role === role) ||
      registeredUsers.find((u) => u.role === role) || {
        id: `USR-${role.toUpperCase()}`,
        name: `${role.replace('_', ' ').toUpperCase()} Officer`,
        email: `${role}@vmc.ap.gov.in`,
        role,
        approvalStatus: 'approved',
      };
    const updated: RegisteredUserRecord = {
      ...matched,
      lastLoginAt: new Date().toISOString(),
      loginCount: (matched.loginCount || 1) + 1,
      isOnline: true,
    };
    setCurrentUser(updated);
    await syncUserToFirestore(updated);
    showToast('Role Switched', `Active User: ${updated.name} (${updated.role.replace('_', ' ')})`, 'info');
  };

  // Create complaint action with Location-Aware Auto-Assignment
  const createComplaint = async (data: {
    title: string;
    description: string;
    category: any;
    severity: Severity;
    address: string;
    landmark?: string;
    ward: string;
    lat: number;
    lng: number;
    photos: string[];
    aiResult?: AIClassificationResult;
    verificationResult?: AIVerificationResult;
  }): Promise<Complaint> => {
    let ai = data.aiResult;
    const vr = data.verificationResult;
    if (!ai) {
      ai = await classifyComplaint({
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.address,
        landmark: data.landmark,
        ward: data.ward,
        hasImage: data.photos.length > 0,
      });
    }

    const uniqueNum = Math.floor(100 + Math.random() * 900);
    const complaintId = `CS-VZM-2026-000${uniqueNum}`;
    const nowIso = new Date().toISOString();
    const slaHours =
      ai?.estimatedResolutionHours ||
      (data.severity === 'Critical' ? 12 : data.severity === 'High' ? 24 : 48);
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const targetDept = (vr?.recommended_department as MunicipalDepartment) || ai?.suggestedDepartment || 'Public Works Department (PWD)';

    // Multi-factor auto-assignment: Score and find best field officer/worker
    const getDepartmentSkills = (dept: MunicipalDepartment): ComplaintCategory[] => {
      switch (dept) {
        case 'Public Works Department (PWD)':
          return ['Pothole', 'Road Damage', 'Public Property Damage'];
        case 'Solid Waste Management':
          return ['Garbage', 'Sanitation'];
        case 'Water Supply & Sewerage Board':
          return ['Water Leakage', 'Drainage'];
        case 'Electricity & Streetlighting':
          return ['Streetlight'];
        case 'Traffic & Transport Planning':
          return ['Traffic'];
        case 'Public Health & Sanitation':
          return ['Sanitation', 'Public Toilet', 'Drainage'];
        case 'Horticulture & Parks':
          return ['Park Issue'];
        default:
          return ['Other'];
      }
    };

    const workerCandidates: WorkerCandidate[] = FIELD_OFFICERS.map((fo) => ({
      id: fo.id,
      name: fo.name,
      badgeNumber: fo.badgeNumber,
      phone: fo.phone,
      department: fo.department,
      ward: fo.ward,
      lat: fo.lat || 18.1142,
      lng: fo.lng || 83.3995,
      activeTasksCount: fo.activeTasksCount || 1,
      isAvailable: fo.isAvailable !== false,
      skills: getDepartmentSkills(fo.department),
    }));

    const bestMatch = findBestWorkerForComplaint(
      workerCandidates,
      targetDept,
      ai?.category || data.category,
      data.lat,
      data.lng,
      data.ward,
      complaints
    );

    const assignedOfficer: AssignedOfficer | undefined = bestMatch?.officer
      ? {
          id: bestMatch.officer.id,
          name: bestMatch.officer.name,
          phone: bestMatch.officer.phone,
          badgeNumber: bestMatch.officer.badgeNumber,
          department: bestMatch.officer.department,
          distanceKm: bestMatch.distanceKm,
        }
      : undefined;

    const newComplaint: Complaint = {
      id: complaintId,
      title: data.title,
      description: data.description,
      category: ai?.category || data.category,
      subcategory: ai?.subcategory,
      severity: ai?.severity || data.severity,
      priority: ai?.priority || (data.severity === 'Critical' ? 'P1-Critical' : 'P2-High'),
      status: assignedOfficer ? 'Assigned' : 'Submitted',
      location: {
        address: data.address,
        landmark: data.landmark,
        ward: data.ward,
        lat: data.lat,
        lng: data.lng,
      },
      photos: data.photos,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
      },
      department: targetDept,
      assignedOfficer,
      slaHours,
      slaDeadline,
      isOverdue: false,
      isEscalated: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      upvotes: 1,
      upvotedBy: [currentUser.id],
      timeline: [
        {
          id: `TL-${Date.now()}-1`,
          status: 'Submitted',
          timestamp: nowIso,
          updatedBy: `${currentUser.name} (Citizen)`,
          role: 'citizen',
          remarks: 'Citizen registered complaint with GPS coordinates and photographic evidence.',
        },
        {
          id: `TL-${Date.now()}-2`,
          status: 'Verified',
          timestamp: new Date(Date.now() + 1000).toISOString(),
          updatedBy: 'CivicSense AI Assistant',
          role: 'admin',
          remarks: `AI auto-classified issue under ${targetDept} with ${ai?.confidence}% confidence. Safety Risk: ${ai?.safetyRisk}`,
        },
      ],
      aiAnalysis: ai,
      // AI Verification and Smart Routing Fields (Section 17)
      aiValidity: vr?.validity || 'VALID',
      aiConfidence: vr?.confidence || ai?.confidence || 95,
      aiCategory: vr?.category || ai?.category || data.category,
      aiSubcategory: vr?.subcategory || ai?.subcategory || 'General Civic Issue',
      aiPriority: vr?.priority || (data.severity === 'Critical' ? 'CRITICAL' : 'HIGH'),
      aiLocation: vr?.location || data.address || '',
      aiLocationStatus: vr?.location_status || 'PROVIDED',
      aiReason: vr?.reason || ai?.reasoning || 'Verified municipal public service report.',
      recommendedDepartment: vr?.recommended_department || targetDept,
      recommendedAction: vr?.recommended_action || ai?.suggestedAction || 'Inspect and execute repair.',
      duplicateStatus: vr?.duplicate || false,
      aiVerifiedAt: nowIso,
      aiVerification: vr,
    };

    if (assignedOfficer && bestMatch) {
      newComplaint.timeline.push({
        id: `TL-${Date.now()}-3`,
        status: 'Assigned',
        timestamp: new Date(Date.now() + 2000).toISOString(),
        updatedBy: 'System Auto-Assignment',
        role: 'admin',
        remarks: `Auto-assigned to ${assignedOfficer.name} based on multi-factor score (${bestMatch.totalScore}/100, ${bestMatch.distanceKm} km distance).`,
      });
    }

    try {
      await setDoc(doc(db, 'complaints', complaintId), newComplaint);
    } catch (e) {
      console.warn('Firestore write complaint error (using local state):', e);
    }

    setComplaints((prev) => [newComplaint, ...prev.filter((c) => c.id !== complaintId)]);

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: currentUser.role,
      action: 'COMPLAINT_CREATED',
      details: `Complaint ${complaintId} created in ${data.ward}. Assigned to: ${assignedOfficer?.name || 'Pending'}.`,
    });

    // Notify assigned worker or admin
    const newNotif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId: newComplaint.id,
      title: `New Report: ${newComplaint.title.slice(0, 30)}...`,
      message: `A new ${newComplaint.category} issue logged in ${newComplaint.location.ward}.`,
      type: 'new_complaint',
      timestamp: nowIso,
      read: false,
      targetRole: 'worker',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Complaint Filed & Assigned',
      `Registered ${complaintId}. ${assignedOfficer ? `Auto-assigned to ${assignedOfficer.name}.` : 'Pending review.'}`,
      'success'
    );

    return newComplaint;
  };

  // Update status
  const updateComplaintStatus = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks?: string,
    evidenceUrl?: string
  ) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const newTimelineItem = {
      id: `TL-${Date.now()}`,
      status: newStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
      role: currentUser.role,
      remarks: remarks || `Status updated to ${newStatus}`,
      evidenceUrl,
    };

    const updated: Complaint = {
      ...target,
      status: newStatus,
      updatedAt: nowIso,
      timeline: [...target.timeline, newTimelineItem],
    };

    if (newStatus === 'Resolved') {
      updated.resolutionDetails = {
        resolvedAt: nowIso,
        notes: remarks || 'Resolved and verified by municipal team.',
        proofPhotos: evidenceUrl ? [evidenceUrl] : target.photos,
        resolvedBy: `${currentUser.name} (${target.department || 'Municipal Dept'})`,
      };
    }

    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: currentUser.role,
      action: 'STATUS_UPDATED',
      details: `Status shifted to ${newStatus}. ${remarks || ''}`,
    });

    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `Status: ${complaintId} is now ${newStatus}`,
      message: remarks || `Municipal team updated status to ${newStatus}.`,
      type: newStatus === 'Resolved' ? 'resolved' : 'status_change',
      timestamp: nowIso,
      read: false,
      targetRole: 'citizen',
      targetUserId: target.reportedBy.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('Status Updated', `${complaintId} changed to ${newStatus}`, 'success');
  };

  // Worker Action 1: Accept Task
  const workerAcceptTask = async (complaintId: string) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const timelineItem = {
      id: `TL-${Date.now()}`,
      status: 'Accepted' as ComplaintStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (Worker)`,
      role: 'worker' as UserRole,
      remarks: 'Worker acknowledged and accepted the field repair task.',
    };

    const updated: Complaint = {
      ...target,
      status: 'Accepted',
      updatedAt: nowIso,
      timeline: [...target.timeline, timelineItem],
    };

    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: 'worker',
      action: 'TASK_ACCEPTED',
      details: `Worker ${currentUser.name} accepted assignment.`,
    });

    showToast('Task Accepted', `You have accepted complaint ${complaintId}.`, 'success');
  };

  // Worker Action 2: Start Work with Before-Photo
  const workerStartWork = async (complaintId: string, beforePhotoUrl: string) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const proof: WorkerProof = {
      ...target.workerProof,
      beforePhoto: beforePhotoUrl,
      beforePhotoTimestamp: nowIso,
      workerId: currentUser.id,
      workerName: currentUser.name,
      locationVerified: true,
    };

    const timelineItem = {
      id: `TL-${Date.now()}`,
      status: 'In Progress' as ComplaintStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (Worker)`,
      role: 'worker' as UserRole,
      remarks: 'Work started on-site. Before-work photo geotagged and uploaded.',
      evidenceUrl: beforePhotoUrl,
    };

    const updated: Complaint = {
      ...target,
      status: 'In Progress',
      workerProof: proof,
      updatedAt: nowIso,
      timeline: [...target.timeline, timelineItem],
    };

    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: 'worker',
      action: 'BEFORE_PHOTO_UPLOADED',
      details: `Before-work proof submitted. Work commenced.`,
    });

    showToast('Work In Progress', 'Before-work photo saved. Ticket marked In Progress.', 'success');
  };

  // Worker Action 3: Complete Task with After-Photo & Notes
  const workerCompleteTask = async (
    complaintId: string,
    afterPhotoUrl: string,
    completionNotes: string
  ) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const proof: WorkerProof = {
      ...target.workerProof,
      afterPhoto: afterPhotoUrl,
      afterPhotoTimestamp: nowIso,
      completionNotes,
      completedAt: nowIso,
      workerId: currentUser.id,
      workerName: currentUser.name,
      locationVerified: true,
    };

    const timelineItem = {
      id: `TL-${Date.now()}`,
      status: 'Work Completed' as ComplaintStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (Worker)`,
      role: 'worker' as UserRole,
      remarks: `Field execution completed: "${completionNotes}". Submitted for Higher Official verification.`,
      evidenceUrl: afterPhotoUrl,
    };

    const updated: Complaint = {
      ...target,
      status: 'Work Completed',
      workerProof: proof,
      updatedAt: nowIso,
      timeline: [...target.timeline, timelineItem],
    };

    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: 'worker',
      action: 'WORK_COMPLETED',
      details: `After-work proof uploaded. Forwarded to Higher Official for review.`,
    });

    // Notify higher officials
    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `Verification Required: ${complaintId}`,
      message: `Worker ${currentUser.name} submitted completion proof for "${target.title.slice(0, 35)}..."`,
      type: 'status_change',
      timestamp: nowIso,
      read: false,
      targetRole: 'higher_official',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      'Work Submitted for Verification',
      'Proof and notes uploaded. Higher Official will review and verify.',
      'success'
    );
  };

  // Higher Official Action 1: Verify & Resolve or Reject
  const officialVerifyComplaint = async (
    complaintId: string,
    decision: 'approved' | 'rejected',
    notes?: string,
    rejectReason?: string
  ) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    if (decision === 'approved') {
      const verDetails: VerificationDetails = {
        verifiedBy: currentUser.name,
        verifiedAt: nowIso,
        officialNotes: notes || 'Photographic proof inspected on-site and approved.',
        decision: 'approved',
      };

      const timelineItem = {
        id: `TL-${Date.now()}`,
        status: 'Resolved' as ComplaintStatus,
        timestamp: nowIso,
        updatedBy: `${currentUser.name} (Higher Official)`,
        role: 'higher_official' as UserRole,
        remarks: `Official verification passed. Issue marked Resolved. Notes: ${verDetails.officialNotes}`,
      };

      const updated: Complaint = {
        ...target,
        status: 'Resolved',
        verificationDetails: verDetails,
        resolutionDetails: {
          resolvedAt: nowIso,
          notes: notes || 'Verified and approved by Executive Municipal Official.',
          proofPhotos: target.workerProof?.afterPhoto
            ? [target.workerProof.afterPhoto]
            : target.photos,
          resolvedBy: `${currentUser.name} (${currentUser.designation || 'Higher Official'})`,
        },
        updatedAt: nowIso,
        timeline: [...target.timeline, timelineItem],
      };

      try {
        await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
      } catch (e) {}

      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

      addAuditLog({
        complaintId,
        user: currentUser.name,
        role: 'higher_official',
        action: 'OFFICIAL_VERIFIED',
        details: `Approved completion proof. Marked Resolved.`,
      });

      // Notify citizen to provide rating
      const notif: CivicNotification = {
        id: `NOTIF-${Date.now()}`,
        complaintId,
        title: `Resolved: ${target.title.slice(0, 30)}...`,
        message: `Your reported civic issue has been officially resolved! Please rate the service quality.`,
        type: 'resolved',
        timestamp: nowIso,
        read: false,
        targetRole: 'citizen',
        targetUserId: target.reportedBy.id,
      };
      setNotifications((prev) => [notif, ...prev]);

      showToast('Verified & Resolved', `Complaint ${complaintId} officially verified.`, 'success');
    } else {
      // Rejected: return to worker In Progress
      const verDetails: VerificationDetails = {
        verifiedBy: currentUser.name,
        verifiedAt: nowIso,
        rejectionReason: rejectReason || 'Work does not meet municipal standards. Rectification required.',
        decision: 'rejected',
      };

      const timelineItem = {
        id: `TL-${Date.now()}`,
        status: 'In Progress' as ComplaintStatus,
        timestamp: nowIso,
        updatedBy: `${currentUser.name} (Higher Official)`,
        role: 'higher_official' as UserRole,
        remarks: `Verification rejected. Sent back to worker: "${verDetails.rejectionReason}"`,
      };

      const updated: Complaint = {
        ...target,
        status: 'In Progress',
        verificationDetails: verDetails,
        updatedAt: nowIso,
        timeline: [...target.timeline, timelineItem],
      };

      try {
        await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
      } catch (e) {}

      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

      addAuditLog({
        complaintId,
        user: currentUser.name,
        role: 'higher_official',
        action: 'VERIFICATION_REJECTED',
        details: `Rejected proof. Sent back to worker. Reason: ${verDetails.rejectionReason}`,
      });

      // Notify worker
      const notif: CivicNotification = {
        id: `NOTIF-${Date.now()}`,
        complaintId,
        title: `Task Sent Back for Rectification`,
        message: `Higher Official rejected completion on ${complaintId}: "${verDetails.rejectionReason}"`,
        type: 'status_change',
        timestamp: nowIso,
        read: false,
        targetRole: 'worker',
      };
      setNotifications((prev) => [notif, ...prev]);

      showToast('Verification Rejected', `Returned ${complaintId} to field worker for re-work.`, 'warning');
    }
  };

  // Higher Official / Admin: Reassign Complaint
  const reassignComplaint = async (
    complaintId: string,
    newOfficer: AssignedOfficer,
    remarks?: string
  ) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const timelineItem = {
      id: `TL-${Date.now()}`,
      status: 'Assigned' as ComplaintStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
      role: currentUser.role,
      remarks: remarks || `Reassigned to ${newOfficer.name} (${newOfficer.badgeNumber}).`,
    };

    const updated: Complaint = {
      ...target,
      assignedOfficer: newOfficer,
      status: 'Assigned',
      updatedAt: nowIso,
      timeline: [...target.timeline, timelineItem],
    };

    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: currentUser.role,
      action: 'WORKER_REASSIGNED',
      details: `Reassigned from ${target.assignedOfficer?.name || 'unassigned'} to ${newOfficer.name}.`,
    });

    showToast('Worker Reassigned', `Reassigned to ${newOfficer.name}.`, 'success');
  };

  // Assign officer legacy wrapper
  const assignOfficer = async (
    complaintId: string,
    department: MunicipalDepartment,
    officer: AssignedOfficer,
    remarks?: string
  ) => {
    reassignComplaint(complaintId, { ...officer, department }, remarks);
  };

  // Broadcast Municipal Announcement
  const broadcastAnnouncement = (
    announcement: Omit<MunicipalAnnouncement, 'id' | 'timestamp'>
  ) => {
    const newAnn: MunicipalAnnouncement = {
      id: `ANN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...announcement,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    addAuditLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'ANNOUNCEMENT_POSTED',
      details: `Broadcasted advisory: "${newAnn.title}" under ${newAnn.department}.`,
    });

    showToast('Announcement Published', 'Citizens and staff notified across Vizianagaram.', 'success');
  };

  // Admin User Approval
  const approveUser = async (userId: string) => {
    const target = registeredUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: RegisteredUserRecord = {
      ...target,
      approvalStatus: 'approved',
    };

    setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    try {
      await updateDoc(doc(db, 'users', userId), { approvalStatus: 'approved' });
    } catch (e) {}

    addAuditLog({
      user: currentUser.name,
      role: 'admin',
      action: 'USER_APPROVED',
      details: `Approved account for ${target.name} (${target.role}).`,
    });

    showToast('User Approved', `${target.name} has been granted access.`, 'success');
  };

  // Admin User Rejection
  const rejectUser = async (userId: string) => {
    const target = registeredUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: RegisteredUserRecord = {
      ...target,
      approvalStatus: 'rejected',
    };

    setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    try {
      await updateDoc(doc(db, 'users', userId), { approvalStatus: 'rejected' });
    } catch (e) {}

    addAuditLog({
      user: currentUser.name,
      role: 'admin',
      action: 'USER_REJECTED',
      details: `Rejected account registration for ${target.name}.`,
    });

    showToast('User Rejected', `${target.name} registration declined.`, 'warning');
  };

  // Toggle user online/active
  const toggleUserActiveStatus = async (userId: string) => {
    const target = registeredUsers.find((u) => u.id === userId);
    if (!target) return;
    const isOnline = !target.isOnline;
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isOnline } : u))
    );
    try {
      await updateDoc(doc(db, 'users', userId), { isOnline });
    } catch (e) {}
  };

  // Priority Update
  const updatePriority = async (complaintId: string, priority: Priority) => {
    const nowIso = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, priority, updatedAt: nowIso } : c))
    );
    try {
      await updateDoc(doc(db, 'complaints', complaintId), { priority, updatedAt: nowIso });
    } catch (e) {}

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: currentUser.role,
      action: 'PRIORITY_CHANGED',
      details: `Priority adjusted to ${priority}.`,
    });

    showToast('Priority Changed', `${complaintId} priority set to ${priority}`, 'info');
  };

  // Add internal notes
  const addInternalNote = async (complaintId: string, noteText: string) => {
    const note = {
      id: `NOTE-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      text: noteText,
      timestamp: new Date().toISOString(),
    };

    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const internalNotes = [...(target.internalNotes || []), note];
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, internalNotes } : c))
    );

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        internalNotes,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {}

    showToast('Internal Note Recorded', 'Secure municipal record added.', 'success');
  };

  // Citizen feedback
  const submitFeedback = async (complaintId: string, feedback: CitizenFeedback) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId ? { ...c, feedback, updatedAt: new Date().toISOString() } : c
      )
    );

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        feedback,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {}

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: 'citizen',
      action: 'CITIZEN_FEEDBACK_SUBMITTED',
      details: `Citizen submitted ${feedback.rating}★ rating. Comment: "${feedback.comment}".`,
    });

    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `Feedback Received (${feedback.rating} ★)`,
      message: `Citizen rated resolution on ${complaintId}: "${feedback.comment.slice(0, 40)}..."`,
      type: 'feedback',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'admin',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      'Feedback Recorded',
      'Thank you for rating municipal resolution quality!',
      'success'
    );
  };

  // Reopen complaint: if citizen indicates "No, Still an Issue"
  const reopenComplaint = async (complaintId: string, reason: string) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const timelineItem = {
      id: `TL-${Date.now()}`,
      status: 'Reopened' as ComplaintStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (Citizen)`,
      role: 'citizen' as UserRole,
      remarks: `Citizen flagged incomplete resolution: "${reason}". Escalated to higher official.`,
    };

    const updated: Complaint = {
      ...target,
      status: 'Reopened',
      isEscalated: true,
      updatedAt: nowIso,
      timeline: [...target.timeline, timelineItem],
    };

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    addAuditLog({
      complaintId,
      user: currentUser.name,
      role: 'citizen',
      action: 'COMPLAINT_REOPENED',
      details: `Citizen reopened issue: "${reason}". Flagged for official inquiry.`,
    });

    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `⚠️ Complaint Reopened: ${complaintId}`,
      message: `Citizen marked issue as unresolved: "${reason.slice(0, 50)}..."`,
      type: 'reopened',
      timestamp: nowIso,
      read: false,
      targetRole: 'higher_official',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('Issue Reopened', 'Escalation sent to Municipal Executive Engineer.', 'warning');
  };

  // Upvote complaint
  const upvoteComplaint = async (complaintId: string) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const alreadyUpvoted = target.upvotedBy?.includes(currentUser.id);
    const upvotedBy = alreadyUpvoted
      ? target.upvotedBy.filter((id) => id !== currentUser.id)
      : [...(target.upvotedBy || []), currentUser.id];
    const upvotes = alreadyUpvoted ? Math.max(1, target.upvotes - 1) : target.upvotes + 1;

    const updated = { ...target, upvotes, upvotedBy };
    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    try {
      await updateDoc(doc(db, 'complaints', complaintId), { upvotes, upvotedBy });
    } catch (e) {}
  };

  // Notifications helpers
  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  // Reset demo data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENTS);
    setComplaints(INITIAL_COMPLAINTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAnnouncements(MUNICIPAL_ANNOUNCEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(DEMO_USERS[0]);
    setSelectedComplaint(null);
    showToast('Demo Database Reset', 'Restored to Vizianagaram Municipal presentation state.', 'info');
  };

  return (
    <CivicContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        complaints,
        notifications,
        selectedComplaint,
        setSelectedComplaint,
        registeredUsers,
        services,
        announcements,
        auditLogs,
        recordComplaintVisit,
        isAuthModalOpen,
        authModalMode,
        isAuthLoading,
        authError,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithDemoUser,
        signOutUser,
        createComplaint,
        updateComplaintStatus,
        assignOfficer,
        workerAcceptTask,
        workerStartWork,
        workerCompleteTask,
        officialVerifyComplaint,
        reassignComplaint,
        broadcastAnnouncement,
        approveUser,
        rejectUser,
        toggleUserActiveStatus,
        addAuditLog,
        updatePriority,
        addInternalNote,
        submitFeedback,
        reopenComplaint,
        upvoteComplaint,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        activeToast,
        clearToast,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = () => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
