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
  normalizeUserRole,
  SmartServiceItem,
  MunicipalAnnouncement,
  AuditLog,
  WorkerProof,
  VerificationDetails,
  ComplaintCategory,
  AIVerificationResult,
  PhotoAuthenticityAnalysis,
  InfrastructureProject,
  InfrastructureProjectInput,
  getRoleDisplayName,
} from '../types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS,
  FIELD_OFFICERS,
  SMART_SERVICES,
  MUNICIPAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PROJECTS,
} from '../data/seedData';
import { classifyComplaint } from '../services/aiClassifier';
import { findBestWorkerForComplaint, WorkerCandidate } from '../services/workerAssignment';
import {
  db,
  auth,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  googleProvider,
  isGoogleAuthConfigured,
  signInWithPopup,
  authenticateDemoAccount,
  normalizeEmailAlias,
  normalizePassword,
  validatePassword,
  DEMO_ACCOUNTS,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';

interface CivicContextType {
  currentUser: User;
  isAuthenticated: boolean;
  setCurrentUser: (user: User) => void;
  complaints: Complaint[];
  notifications: CivicNotification[];
  selectedComplaint: Complaint | null;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  infrastructureProjects: InfrastructureProject[];
  selectedProject: InfrastructureProject | null;
  setSelectedProject: (project: InfrastructureProject | null) => void;
  createInfrastructureProject: (data: InfrastructureProjectInput) => Promise<InfrastructureProject>;
  updateInfrastructureProject: (
    projectId: string,
    data: InfrastructureProjectInput
  ) => Promise<InfrastructureProject | null>;

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
  signInDemo: (role: 'citizen' | 'officer' | 'admin') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
    photoAnalysis?: PhotoAuthenticityAnalysis;
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
  activeToast: { title: string; message: string; type: string } | null;
  clearToast: () => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

const STORAGE_KEY_COMPLAINTS = 'Smart Civic_complaints_v3';
const STORAGE_KEY_NOTIFS = 'Smart Civic_notifs_v3';
const STORAGE_KEY_AUDIT = 'Smart Civic_audit_v3';
const STORAGE_KEY_ANNOUNCEMENTS = 'Smart Civic_announcements_v3';
const STORAGE_KEY_PROJECTS = 'Smart Civic_projects_v2';

const DEFAULT_GUEST_USER: User = {
  id: 'GUEST-DEFAULT',
  name: 'Citizen Resident',
  email: 'citizen@smartcivic.local',
  role: 'citizen',
  ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
};

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
      approvalStatus: 'approved',
      submittedComplaintsCount: i === 0 ? 3 : 1,
      lastVisitedComplaintId: i === 0 ? 'SC-2026-000001' : undefined,
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

  const [infrastructureProjects, setInfrastructureProjects] = useState<InfrastructureProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PROJECTS;
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedProject, setSelectedProject] = useState<InfrastructureProject | null>(null);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: string } | null>(null);

  // Auth UI modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(DEFAULT_GUEST_USER);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let profile: any;

        if (!profileDoc.exists()) {
          const nowIso = new Date().toISOString();
          const cleanEmail = (firebaseUser.email || '').toLowerCase();
          const matchedDemoRole =
            cleanEmail === DEMO_ACCOUNTS.citizen.email
              ? 'citizen'
              : cleanEmail === DEMO_ACCOUNTS.officer.email
              ? 'officer'
              : cleanEmail === DEMO_ACCOUNTS.admin.email
              ? 'admin'
              : 'citizen';

          let derivedName = firebaseUser.displayName;
          if (!derivedName && cleanEmail) {
            const prefix = cleanEmail.split('@')[0];
            derivedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          }
          if (!derivedName) derivedName = 'Resident';

          profile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: derivedName,
            email: cleanEmail,
            mobile: firebaseUser.phoneNumber || '',
            phone: firebaseUser.phoneNumber || '',
            role: matchedDemoRole,
            status: 'active',
            ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
            createdAt: nowIso,
            lastLoginAt: nowIso,
            loginCount: 1,
            isOnline: true,
            approvalStatus: 'approved',
          };
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
          } catch (e) {
            console.warn('Initial profile doc write note:', e);
          }
        } else {
          profile = { id: profileDoc.id, ...profileDoc.data() };
        }

        if (profile.status === 'inactive') {
          setAuthError('Your account is inactive. Please contact the administrator.');
          setCurrentUser(DEFAULT_GUEST_USER);
          setIsAuthenticated(false);
          await signOut(auth);
          setIsAuthLoading(false);
          return;
        }

        const safeUser: User = {
          id: profile.id || firebaseUser.uid,
          name: profile.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Resident'),
          email: profile.email || firebaseUser.email || '',
          role: normalizeUserRole(profile.role || 'citizen'),
          phone: profile.mobile || profile.phone,
          status: profile.status || 'active',
          ward: profile.ward,
          department: profile.department,
          employeeId: profile.employeeId,
          designation: profile.designation,
          workArea: profile.workArea,
          approvalStatus: profile.approvalStatus || 'approved',
          createdAt: profile.createdAt,
          lastLoginAt: profile.lastLoginAt || new Date().toISOString(),
          loginCount: profile.loginCount || 1,
          isOnline: true,
        };

        console.log('[AUTH LOGIN SUCCESS]');
        console.log('Firebase UID:', firebaseUser.uid);
        console.log('Firebase Email:', firebaseUser.email);
        console.log('Provider:', firebaseUser.providerData[0]?.providerId || 'password');

        console.log('[PROFILE LOOKUP]');
        console.log('Path: users/' + firebaseUser.uid);

        console.log('[PROFILE RESULT]');
        console.log('Name:', safeUser.name);
        console.log('Email:', safeUser.email);
        console.log('Role:', safeUser.role);
        console.log('Status:', safeUser.status);

        console.log('[FINAL SESSION USER]');
        console.log('UID:', safeUser.id);
        console.log('Email:', safeUser.email);
        console.log('Name:', safeUser.name);
        console.log('Role:', safeUser.role);

        setCurrentUser(safeUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Firebase auth profile load failed:', error);
        const fallbackUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Resident'),
          email: firebaseUser.email || '',
          role: 'citizen',
          ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
        };
        setCurrentUser(fallbackUser);
        setIsAuthenticated(true);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

      // Optionally persist to Firestore audit_logs collection if authenticated
      if (auth.currentUser) {
        try {
          setDoc(doc(db, 'audit_logs', newLog.id), newLog).catch(() => {});
        } catch (e) {}
      }
    },
    []
  );

  // Persistent UI state is allowed; authentication state must come from Firebase only.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(infrastructureProjects));
  }, [infrastructureProjects]);

  // Real-time Cloud Firestore synchronization for Users (ONLY Administrator has list permission)
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser || currentUser.role !== 'admin') {
      return;
    }
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
          }
        },
        (err) => {
          console.warn('Firestore users snapshot skipped:', err.message);
        }
      );
    } catch (e) {
      console.warn('Firestore connection inactive.');
    }
    return () => unsubscribe();
  }, [isAuthenticated, currentUser.role]);

  // Real-time Cloud Firestore synchronization for Complaints (requires signed-in user)
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) {
      return;
    }
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
            setComplaints(list.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
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
  }, [isAuthenticated]);

  // Real-time Cloud Firestore sync for infrastructure projects
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) {
      return;
    }
    let unsubscribeProjects: () => void = () => {};
    try {
      const projectsColRef = collection(db, 'infrastructure_projects');
      unsubscribeProjects = onSnapshot(
        projectsColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: InfrastructureProject[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as InfrastructureProject);
            });
            setInfrastructureProjects(list.sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ));
          }
        },
        (err) => {
          console.warn('Firestore projects snapshot skipped:', err.message);
        }
      );
    } catch (e) {
      console.warn('Firestore projects live connection skipped.');
    }
    return () => unsubscribeProjects();
  }, [isAuthenticated]);

  // Sync user record to Firestore helper (only for own user document)
  const syncUserToFirestore = async (userRecord: RegisteredUserRecord) => {
    if (!auth.currentUser || auth.currentUser.uid !== userRecord.id) return;
    try {
      await setDoc(doc(db, 'users', userRecord.id), userRecord, { merge: true });
    } catch (e) {
      console.warn('Could not sync user to Firestore:', e);
    }
  };

  // Record user visit to a specific complaint
  const recordComplaintVisit = async (complaintId: string) => {
    if (!auth.currentUser || !currentUser?.id || auth.currentUser.uid !== currentUser.id) return;
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
    const passCheck = validatePassword(pass);
    if (!passCheck.valid) {
      const errMsg = passCheck.error || 'Password does not meet requirements.';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
    const effectivePass = normalizePassword(cleanEmail, pass);

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, effectivePass);
      const firebaseUid = cred.user.uid;
      const nowIso = new Date().toISOString();
      const safeRole: UserRole = 'citizen';

      const newUser: RegisteredUserRecord = {
        id: firebaseUid,
        firebaseUid,
        name: profile.name.trim(),
        email: cleanEmail,
        phone: profile.phone?.trim() || '',
        ward: profile.ward || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
        role: safeRole,
        department: profile.department,
        employeeId: profile.employeeId,
        designation: profile.designation,
        workArea: profile.workArea,
        approvalStatus: 'approved',
        authProvider: 'password',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        loginCount: 1,
        isOnline: true,
        submittedComplaintsCount: 0,
      };

      try {
        await setDoc(
          doc(db, 'users', firebaseUid),
          {
            uid: firebaseUid,
            id: firebaseUid,
            name: newUser.name,
            email: newUser.email,
            mobile: newUser.phone,
            phone: newUser.phone,
            ward: newUser.ward,
            role: 'citizen',
            status: 'active',
            createdAt: nowIso,
            lastLoginAt: nowIso,
            loginCount: 1,
          },
          { merge: true }
        );
      } catch (firestoreErr: any) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${firebaseUid}`);
      }

      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setRegisteredUsers((prev) => {
        const next = prev.filter((u) => u.id !== firebaseUid);
        return [newUser, ...next];
      });

      addAuditLog({
        user: newUser.name,
        role: newUser.role,
        action: 'USER_REGISTERED',
        details: `New citizen account registered successfully.`,
      });

      showToast('Account Registered', `Welcome to SMART CIVIC, ${newUser.name}!`, 'success');
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        // Account already exists in Firebase Auth - attempt to sign in with password
        try {
          const effectivePass = normalizePassword(cleanEmail, pass);
          const signInCred = await signInWithEmailAndPassword(auth, cleanEmail, effectivePass);
          const firebaseUid = signInCred.user.uid;
          let profileDoc: any;
          try {
            profileDoc = await getDoc(doc(db, 'users', firebaseUid));
          } catch (fsErr: any) {
            handleFirestoreError(fsErr, OperationType.GET, `users/${firebaseUid}`);
          }

          let existingUser: RegisteredUserRecord;
          const nowIso = new Date().toISOString();
          if (profileDoc && profileDoc.exists()) {
            const data = profileDoc.data();
            existingUser = {
              id: firebaseUid,
              firebaseUid,
              name: data.name || profile.name.trim(),
              email: cleanEmail,
              phone: data.mobile || data.phone || profile.phone?.trim() || '',
              ward: data.ward || profile.ward || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
              role: (data.role as UserRole) || 'citizen',
              department: data.department || profile.department,
              employeeId: data.employeeId || profile.employeeId,
              designation: data.designation || profile.designation,
              workArea: data.workArea || profile.workArea,
              approvalStatus: 'approved',
              authProvider: 'password',
              createdAt: data.createdAt || nowIso,
              lastLoginAt: nowIso,
              loginCount: (data.loginCount || 0) + 1,
              isOnline: true,
              submittedComplaintsCount: 0,
            };
          } else {
            existingUser = {
              id: firebaseUid,
              firebaseUid,
              name: profile.name.trim(),
              email: cleanEmail,
              phone: profile.phone?.trim() || '',
              ward: profile.ward || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
              role: 'citizen',
              department: profile.department,
              employeeId: profile.employeeId,
              designation: profile.designation,
              workArea: profile.workArea,
              approvalStatus: 'approved',
              authProvider: 'password',
              createdAt: nowIso,
              lastLoginAt: nowIso,
              loginCount: 1,
              isOnline: true,
              submittedComplaintsCount: 0,
            };
            try {
              await setDoc(
                doc(db, 'users', firebaseUid),
                {
                  uid: firebaseUid,
                  id: firebaseUid,
                  name: existingUser.name,
                  email: existingUser.email,
                  mobile: existingUser.phone,
                  phone: existingUser.phone,
                  ward: existingUser.ward,
                  role: 'citizen',
                  status: 'active',
                  createdAt: nowIso,
                  lastLoginAt: nowIso,
                  loginCount: 1,
                },
                { merge: true }
              );
            } catch (fsWriteErr: any) {
              handleFirestoreError(fsWriteErr, OperationType.WRITE, `users/${firebaseUid}`);
            }
          }

          setCurrentUser(existingUser);
          setIsAuthenticated(true);
          showToast('Account Found', `Welcome back, ${existingUser.name}! Signed in to your Citizen account.`, 'success');
          return;
        } catch (signInErr: any) {
          console.warn('[AUTH INFO] Sign up note: account already registered');
          const message = 'An account with this email already exists. Please sign in with your password.';
          setAuthError(message);
          throw new Error(message);
        }
      }

      console.warn('[AUTH WARNING] Sign up:', err?.code, err?.message);
      const message =
        err?.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters long.'
          : err?.code === 'auth/password-does-not-meet-requirements'
            ? 'Password does not meet requirements. Please ensure it has at least 6 characters and an uppercase letter.'
            : err?.message || 'Could not register user account.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

const DEMO_PRESET_USERS: Record<
  string,
  {
    role: UserRole;
    name: string;
    department?: MunicipalDepartment;
    designation?: string;
    employeeId?: string;
    mobile?: string;
    ward?: string;
  }
> = {
  'citizen@smartcivic.org': {
    role: 'citizen',
    name: 'Citizen Resident',
    mobile: '+91 98401 22334',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'citizen@smartcivic.test': {
    role: 'citizen',
    name: 'Citizen Resident',
    mobile: '+91 98401 22334',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'officer@smartcivic.test': {
    role: 'officer',
    name: 'Field Officer',
    department: 'Public Works Department (PWD)',
    designation: 'Senior Municipal Engineer / Ward Officer',
    employeeId: 'SC-OFF-204',
    mobile: '+91 94441 23456',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'admin@smartcivic.test': {
    role: 'admin',
    name: 'Civic Administrator',
    department: 'Solid Waste Management',
    designation: 'Municipal Commissioner & Administrator',
    employeeId: 'SC-ADMIN-001',
    mobile: '+91 44 2561 9000',
    ward: 'City Headquarters',
  },
  'citizen@civic': {
    role: 'citizen',
    name: 'Citizen Resident',
    mobile: '+91 98401 22334',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'officer@civic': {
    role: 'officer',
    name: 'Field Officer',
    department: 'Public Works Department (PWD)',
    designation: 'Senior Municipal Engineer / Ward Officer',
    employeeId: 'SC-OFF-204',
    mobile: '+91 94441 23456',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'admin@civic': {
    role: 'admin',
    name: 'Civic Administrator',
    department: 'Solid Waste Management',
    designation: 'Municipal Commissioner & Administrator',
    employeeId: 'SC-ADMIN-001',
    mobile: '+91 44 2561 9000',
    ward: 'City Headquarters',
  },
  'citizen.demo@smartcivic.test': {
    role: 'citizen',
    name: 'Citizen Demo',
    mobile: '+91 98401 22334',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'officer.demo@smartcivic.test': {
    role: 'officer',
    name: 'Officer Demo',
    department: 'Public Works Department (PWD)',
    designation: 'Senior Municipal Engineer / Ward Officer',
    employeeId: 'SC-OFF-204',
    mobile: '+91 94441 23456',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'admin.demo@smartcivic.test': {
    role: 'admin',
    name: 'Admin Demo',
    department: 'Solid Waste Management',
    designation: 'Municipal Commissioner & Administrator',
    employeeId: 'SC-ADMIN-001',
    mobile: '+91 44 2561 9000',
    ward: 'City Headquarters',
  },
  'citizen@smartcivic.local': {
    role: 'citizen',
    name: 'Citizen Resident',
    mobile: '+91 98451 90022',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'field-officer@smartcivic.local': {
    role: 'officer',
    name: 'Field Officer',
    department: 'Public Works Department (PWD)',
    designation: 'Field Inspection & Works Officer',
    employeeId: 'SC-OFF-204',
    mobile: '+91 94441 23456',
    ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
  },
  'admin@smartcivic.local': {
    role: 'admin',
    name: 'Civic Administrator',
    designation: 'Municipal Commissioner',
    employeeId: 'SC-IAS-CHN-01',
    mobile: '+91 44 2561 9000',
    ward: 'City Headquarters',
  },
};

  // Sign In with Email and Password — strictly separated Authentication and Profile Retrieval
  const signInWithEmail = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    const rawIdentifier = email.trim();
    const cleanIdentifier = normalizeEmailAlias(rawIdentifier.toLowerCase());
    const effectivePass = normalizePassword(cleanIdentifier, pass);

    // ─────────────────────────────────────────────────────────────
    // PHASE 1: FIREBASE AUTHENTICATION
    // ─────────────────────────────────────────────────────────────
    let cred: any;
    try {
      cred = await signInWithEmailAndPassword(auth, cleanIdentifier, effectivePass);
    } catch (authErr: any) {
      console.warn('[AUTH INFO] signIn note:', authErr?.code);

      // If this is one of our designated demo accounts, attempt bootstrapping or fallback
      const demoConfig = DEMO_PRESET_USERS[cleanIdentifier] || DEMO_PRESET_USERS[rawIdentifier.toLowerCase()];
      if (
        demoConfig &&
        (authErr?.code === 'auth/user-not-found' ||
          authErr?.code === 'auth/invalid-credential' ||
          authErr?.code === 'auth/wrong-password')
      ) {
        try {
          cred = await createUserWithEmailAndPassword(auth, cleanIdentifier, effectivePass);
          const nowIso = new Date().toISOString();
          const demoProfile = {
            id: cred.user.uid,
            uid: cred.user.uid,
            name: demoConfig.name,
            email: cleanIdentifier,
            mobile: demoConfig.mobile || '',
            phone: demoConfig.mobile || '',
            ward: demoConfig.ward || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
            role: demoConfig.role,
            status: 'active',
            department: demoConfig.department,
            employeeId: demoConfig.employeeId,
            designation: demoConfig.designation,
            approvalStatus: 'approved',
            createdAt: nowIso,
            lastLoginAt: nowIso,
            loginCount: 1,
            isOnline: true,
          };
          await setDoc(doc(db, 'users', cred.user.uid), demoProfile, { merge: true });
        } catch (createErr: any) {
          if (createErr?.code === 'auth/email-already-in-use') {
            const fallbackPasswords = [
              demoConfig.role === 'citizen' ? 'City@123' : demoConfig.role === 'officer' ? 'Officer@123' : 'Admin@123',
              demoConfig.role === 'citizen' ? 'city@123' : demoConfig.role === 'officer' ? 'officer@123' : 'admin@123',
              demoConfig.role === 'citizen' ? 'Citizen@12345' : demoConfig.role === 'officer' ? 'Officer@12345' : 'Admin@12345',
              'smartcivic2026',
            ];
            for (const fbPass of fallbackPasswords) {
              try {
                cred = await signInWithEmailAndPassword(auth, cleanIdentifier, fbPass);
                try {
                  await updatePassword(cred.user, effectivePass);
                } catch (_) {}
                break;
              } catch (_) {}
            }
          }
        }
      }

      if (!cred) {
        let authMessage = 'Unable to sign in. Please check your email and password.';
        if (
          authErr?.code === 'auth/invalid-credential' ||
          authErr?.code === 'auth/user-not-found' ||
          authErr?.code === 'auth/wrong-password'
        ) {
          authMessage = 'Invalid email or password. Please verify your credentials.';
        } else if (authErr?.code === 'auth/invalid-email') {
          authMessage = 'Invalid email address format. Please enter a valid email address.';
        } else if (authErr?.code === 'auth/network-request-failed') {
          authMessage = 'Network request failed. Please check your internet connection.';
        } else if (authErr?.code === 'auth/too-many-requests') {
          authMessage = 'Account temporarily locked due to too many failed sign-in attempts. Please try again later.';
        } else if (authErr?.code) {
          authMessage = `[${authErr.code}] ${authErr.message || 'Authentication failed.'}`;
        }
        setAuthError(authMessage);
        setIsAuthLoading(false);
        throw new Error(authMessage);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // PHASE 2: FIRESTORE USER PROFILE RETRIEVAL
    // ─────────────────────────────────────────────────────────────
    const firebaseUid = cred.user.uid;
    let profileDoc: any;
    try {
      profileDoc = await getDoc(doc(db, 'users', firebaseUid));
    } catch (fsErr: any) {
      handleFirestoreError(fsErr, OperationType.GET, `users/${firebaseUid}`);
    }

    if (!profileDoc.exists()) {
      // Check if this is a known demo account that needs initial profile creation
      const demoConfig = DEMO_PRESET_USERS[cleanIdentifier];
      if (demoConfig) {
        const nowIso = new Date().toISOString();
        const demoProfile = {
          id: firebaseUid,
          uid: firebaseUid,
          name: demoConfig.name,
          email: cleanIdentifier,
          mobile: demoConfig.mobile || '',
          phone: demoConfig.mobile || '',
          ward: demoConfig.ward || 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
          role: demoConfig.role,
          status: 'active',
          department: demoConfig.department,
          employeeId: demoConfig.employeeId,
          designation: demoConfig.designation,
          approvalStatus: 'approved',
          createdAt: nowIso,
          lastLoginAt: nowIso,
          loginCount: 1,
          isOnline: true,
        };
        try {
          await setDoc(doc(db, 'users', firebaseUid), demoProfile, { merge: true });
          profileDoc = { exists: () => true, id: firebaseUid, data: () => demoProfile };
        } catch (bootstrapErr: any) {
          handleFirestoreError(bootstrapErr, OperationType.WRITE, `users/${firebaseUid}`);
        }
      } else {
        const nowIso = new Date().toISOString();
        const rawPrefix = cleanIdentifier.split('@')[0];
        const derivedName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
        const autoProfile = {
          id: firebaseUid,
          uid: firebaseUid,
          name: cred.user.displayName || derivedName,
          email: cleanIdentifier,
          phone: '',
          mobile: '',
          ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
          role: 'citizen',
          status: 'active',
          approvalStatus: 'approved',
          createdAt: nowIso,
          lastLoginAt: nowIso,
          loginCount: 1,
          isOnline: true,
        };
        try {
          await setDoc(doc(db, 'users', firebaseUid), autoProfile, { merge: true });
          profileDoc = { exists: () => true, id: firebaseUid, data: () => autoProfile };
        } catch (autoErr: any) {
          handleFirestoreError(autoErr, OperationType.WRITE, `users/${firebaseUid}`);
        }
      }
    }

    const profile = profileDoc.data();
    if (profile.status === 'inactive') {
      setAuthError('Your account is inactive. Please contact the administrator.');
      setIsAuthLoading(false);
      await signOut(auth);
      throw new Error('Your account is inactive. Please contact the administrator.');
    }

    let safeUser: User;
    if (!profile.role) {
      safeUser = {
        id: profileDoc.id,
        name: profile.name || cred.user.displayName || cleanIdentifier.split('@')[0],
        email: profile.email || cleanIdentifier,
        role: 'unconfigured' as any,
        phone: profile.mobile || profile.phone,
        ward: profile.ward,
        approvalStatus: profile.approvalStatus || 'approved',
        createdAt: profile.createdAt,
        lastLoginAt: new Date().toISOString(),
        loginCount: (profile.loginCount || 0) + 1,
        isOnline: true,
      };
      setCurrentUser(safeUser);
      setIsAuthenticated(true);
      setIsAuthLoading(false);
      return;
    }

    safeUser = {
      id: profileDoc.id,
      name: profile.name || cred.user.displayName || cleanIdentifier.split('@')[0],
      email: profile.email || cleanIdentifier,
      role: normalizeUserRole(profile.role || 'citizen'),
      phone: profile.mobile || profile.phone,
      ward: profile.ward,
      department: profile.department,
      employeeId: profile.employeeId,
      designation: profile.designation,
      workArea: profile.workArea,
      approvalStatus: profile.approvalStatus || 'approved',
      createdAt: profile.createdAt,
      lastLoginAt: new Date().toISOString(),
      loginCount: (profile.loginCount || 0) + 1,
      isOnline: true,
    };

    setCurrentUser(safeUser);
    setIsAuthenticated(true);
    setIsAuthLoading(false);
    showToast('Welcome Back', `Logged in as ${safeUser.name} (${getRoleDisplayName(safeUser.role)}).`, 'success');
  };

  // Sign In with Google
  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      let profileDoc: any;
      try {
        profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      } catch (fsErr: any) {
        console.error('[FIRESTORE ERROR] Google sign-in getDoc failed:', fsErr?.code, fsErr?.message);
        const fsMessage = 'Authentication succeeded, but Smart Civic could not access your user profile because of Firestore permissions.';
        setAuthError(fsMessage);
        setIsAuthLoading(false);
        throw new Error(fsMessage);
      }

      let safeUser: User;
      let profile: any;

      if (!profileDoc.exists()) {
        const nowIso = new Date().toISOString();
        profile = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Citizen Resident',
          email: firebaseUser.email || '',
          mobile: firebaseUser.phoneNumber || '',
          phone: firebaseUser.phoneNumber || '',
          ward: 'Ward 101 - Anna Nagar 2nd Avenue & Roundtana',
          role: 'citizen',
          status: 'active',
          approvalStatus: 'approved',
          authProvider: 'google',
          createdAt: nowIso,
          lastLoginAt: nowIso,
          loginCount: 1,
          isOnline: true,
          submittedComplaintsCount: 0,
        };
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
        } catch (setErr: any) {
          console.error('[FIRESTORE ERROR] Google sign-in setDoc failed:', setErr?.code, setErr?.message);
          const fsMsg = 'Authentication succeeded, but Smart Civic could not access your user profile because of Firestore permissions.';
          setAuthError(fsMsg);
          setIsAuthLoading(false);
          throw new Error(fsMsg);
        }
        safeUser = profile;
      } else {
        profile = profileDoc.data();
        if (profile.status === 'inactive') {
          setAuthError('Your account is inactive. Please contact the administrator.');
          setIsAuthLoading(false);
          await signOut(auth);
          throw new Error('Your account is inactive. Please contact the administrator.');
        }
        safeUser = {
          id: profileDoc.id,
          name: profile.name || firebaseUser.displayName || 'Citizen Resident',
          email: profile.email || firebaseUser.email || '',
          role: normalizeUserRole(profile.role || 'citizen'),
          phone: profile.mobile || profile.phone,
          status: profile.status || 'active',
          ward: profile.ward,
          department: profile.department,
          employeeId: profile.employeeId,
          designation: profile.designation,
          workArea: profile.workArea,
          approvalStatus: profile.approvalStatus || 'approved',
          createdAt: profile.createdAt,
          lastLoginAt: new Date().toISOString(),
          loginCount: (profile.loginCount || 0) + 1,
          isOnline: true,
        };
      }

      setCurrentUser(safeUser);
      setIsAuthenticated(true);
      setRegisteredUsers((prev) => {
        const next = prev.filter((u) => u.id !== safeUser.id);
        return [{ ...profile, ...safeUser, lastLoginAt: safeUser.lastLoginAt, loginCount: safeUser.loginCount, isOnline: true }, ...next];
      });

      await syncUserToFirestore({ ...profile, ...safeUser, lastLoginAt: safeUser.lastLoginAt, loginCount: safeUser.loginCount, isOnline: true });

      addAuditLog({
        user: safeUser.name,
        role: safeUser.role,
        action: 'USER_LOGIN',
        details: 'User signed in with Google authentication.',
      });

      showToast('Google Sign-In Successful', `Welcome ${safeUser.name} (${getRoleDisplayName(safeUser.role)}).`, 'success');
    } catch (err: any) {
      const message =
        err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request'
          ? 'Google sign-in was cancelled.'
          : err?.message || 'Google sign-in failed. Please try again.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { isOnline: false }).catch(() => undefined);
      }
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }

    setCurrentUser(DEFAULT_GUEST_USER);
    setIsAuthenticated(false);
    setAuthError(null);
    showToast('Signed Out', 'You have been signed out. Browsing as guest visitor.', 'info');
  };

  // Sign in using designated development demo accounts
  const signInDemo = async (role: 'citizen' | 'officer' | 'admin') => {
    const config = DEMO_ACCOUNTS[role];
    await signInWithEmail(config.email, config.password);
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
    photoAnalysis?: PhotoAuthenticityAnalysis;
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

    let maxSeq = 0;
    complaints.forEach((c) => {
      const match = c.id?.match(/^SC-2026-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });
    const nextSeq = Math.max(maxSeq + 1, complaints.length + 1);
    const complaintId = `SC-2026-${String(nextSeq).padStart(6, '0')}`;
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
        id: auth.currentUser?.uid || currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
      },
      citizenId: auth.currentUser?.uid || currentUser.id,
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
          updatedBy: 'Smart Civic AI Assistant',
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
      photoAnalysis: data.photoAnalysis,
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

  const createInfrastructureProject = async (
    data: InfrastructureProjectInput
  ): Promise<InfrastructureProject> => {
    const seqNum = infrastructureProjects.length + 1;
    const projectId = `PRJ-CHN-2026-${String(seqNum).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();
    const newProject: InfrastructureProject = {
      id: projectId,
      ...data,
      progressPercent: Math.min(100, Math.max(0, Math.round(data.progressPercent))),
      photos: data.photos || [],
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: currentUser.name,
    };

    try {
      await setDoc(doc(db, 'infrastructure_projects', projectId), newProject);
    } catch (e) {
      console.warn('Firestore write project error (using local state):', e);
    }

    setInfrastructureProjects((prev) => [newProject, ...prev.filter((p) => p.id !== projectId)]);
    setSelectedProject(newProject);

    addAuditLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'INFRASTRUCTURE_PROJECT_CREATED',
      details: `Project ${projectId} (${newProject.name}) registered in ${newProject.ward}.`,
    });

    showToast('Infrastructure Project Added', `${projectId} has been registered.`, 'success');
    return newProject;
  };

  const updateInfrastructureProject = async (
    projectId: string,
    data: InfrastructureProjectInput
  ): Promise<InfrastructureProject | null> => {
    const target = infrastructureProjects.find((p) => p.id === projectId);
    if (!target) return null;

    const nowIso = new Date().toISOString();
    const updated: InfrastructureProject = {
      ...target,
      ...data,
      id: projectId,
      progressPercent: Math.min(100, Math.max(0, Math.round(data.progressPercent))),
      photos: data.photos ?? target.photos,
      createdAt: target.createdAt,
      createdBy: target.createdBy,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'infrastructure_projects', projectId), updated, { merge: true });
    } catch (e) {}

    setInfrastructureProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    setSelectedProject(updated);

    addAuditLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'INFRASTRUCTURE_PROJECT_UPDATED',
      details: `Project ${projectId} updated. Status: ${updated.status}, progress ${updated.progressPercent}%.`,
    });

    showToast('Project Updated', `${projectId} details saved.`, 'success');
    return updated;
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
      updatedBy: `${currentUser.name} (${getRoleDisplayName(currentUser.role)})`,
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
      updatedBy: `${currentUser.name} (${getRoleDisplayName(currentUser.role)})`,
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

    showToast('Announcement Published', 'Citizens and staff notified across Smart City.', 'success');
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

  return (
    <CivicContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        setCurrentUser,
        complaints,
        notifications,
        selectedComplaint,
        setSelectedComplaint,
        infrastructureProjects,
        selectedProject,
        setSelectedProject,
        createInfrastructureProject,
        updateInfrastructureProject,
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
        signInDemo,
        signInWithGoogle,
        signUpWithEmail,
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
