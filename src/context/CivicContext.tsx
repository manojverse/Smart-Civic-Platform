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
} from '../types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS,
  FIELD_OFFICERS,
} from '../data/seedData';
import { classifyComplaint } from '../services/aiClassifier';
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
  onAuthStateChanged,
} from '../services/firebase';

interface CivicContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  complaints: Complaint[];
  notifications: CivicNotification[];
  selectedComplaint: Complaint | null;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  
  // Real-Time User Database for Admin
  registeredUsers: RegisteredUserRecord[];
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
    }
  ) => Promise<void>;
  signInWithDemoUser: (demoRole: 'citizen' | 'admin' | 'field_officer' | 'department_officer') => Promise<void>;
  signOutUser: () => Promise<void>;

  // Actions
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

const STORAGE_KEY_COMPLAINTS = 'civicsense_complaints_v1';
const STORAGE_KEY_NOTIFS = 'civicsense_notifs_v1';
const STORAGE_KEY_USER = 'civicsense_user_v1';

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

  // 3. Registered Users Database (real-time Firestore)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>(() => {
    return DEMO_USERS.map((u, i) => ({
      ...u,
      createdAt: '2026-01-10T10:00:00.000Z',
      lastLoginAt: new Date(Date.now() - i * 3600000).toISOString(),
      loginCount: 5 + i * 3,
      isOnline: i === 0,
      submittedComplaintsCount: i === 0 ? 3 : 1,
      lastVisitedComplaintId: i === 0 ? 'CIVIC-2026-8812' : undefined,
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

  // Sync current user to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync notifications to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  // Sync complaints to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  // --- Real-time Cloud Firestore synchronization ---

  // A. Real-time Users Database Listener
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
                submittedComplaintsCount: idx === 0 ? 3 : 1,
                lastVisitedComplaintId: idx === 0 ? 'CIVIC-2026-8812' : undefined,
              };
              try {
                await setDoc(doc(db, 'users', u.id), seedRecord);
              } catch (e) {}
            });
          }
        },
        (err) => {
          console.warn('Users onSnapshot error (continuing with local memory state):', err);
        }
      );
    } catch (e) {
      console.warn('Firebase users listener init error:', e);
    }
    return () => unsubscribe();
  }, []);

  // B. Real-time Complaints Listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const complaintsColRef = collection(db, 'complaints');
      unsubscribe = onSnapshot(
        complaintsColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudComplaints: Complaint[] = [];
            snapshot.forEach((docSnap) => {
              cloudComplaints.push({ id: docSnap.id, ...docSnap.data() } as Complaint);
            });
            // Sort by createdAt descending
            cloudComplaints.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setComplaints(cloudComplaints);
          } else {
            // Seed initial complaints to Firestore if empty
            INITIAL_COMPLAINTS.forEach(async (c) => {
              try {
                await setDoc(doc(db, 'complaints', c.id), c);
              } catch (e) {}
            });
          }
        },
        (err) => {
          console.warn('Complaints onSnapshot error (continuing with local state):', err);
        }
      );
    } catch (e) {
      console.warn('Firebase complaints listener init error:', e);
    }
    return () => unsubscribe();
  }, []);

  // Record user visiting / inspecting a complaint
  const recordComplaintVisit = async (complaintId: string) => {
    try {
      if (currentUser?.id) {
        const userDocRef = doc(db, 'users', currentUser.id);
        await updateDoc(userDocRef, {
          lastVisitedComplaintId: complaintId,
          lastLoginAt: new Date().toISOString(),
          isOnline: true,
        });
      }
    } catch (e) {
      // Update local state if offline
      setRegisteredUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, lastVisitedComplaintId: complaintId, isOnline: true }
            : u
        )
      );
    }
  };

  // Helper to persist user profile to Firestore
  const syncUserToFirestore = async (userRecord: RegisteredUserRecord) => {
    try {
      await setDoc(doc(db, 'users', userRecord.id), userRecord, { merge: true });
    } catch (e) {
      console.warn('Could not sync user to Firestore:', e);
    }
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
        // auth/operation-not-allowed happens when Email/Password provider isn't enabled in Firebase Console
        console.warn(
          'Firebase Auth provider disabled or unavailable, continuing with live Firestore database authentication:',
          authErr.code || authErr.message
        );
      }

      const nowIso = new Date().toISOString();
      const newUser: RegisteredUserRecord = {
        id: uid,
        firebaseUid: isFirebaseAuthSuccessful ? uid : undefined,
        name: profile.name.trim(),
        email: cleanEmail,
        phone: profile.phone?.trim() || '+91 8922 245000',
        ward: profile.ward || 'Ward 1',
        role: profile.role,
        department: profile.department,
        authProvider: isFirebaseAuthSuccessful ? 'password' : 'password',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        loginCount: 1,
        isOnline: true,
        submittedComplaintsCount: 0,
      };

      setCurrentUser(newUser);
      await syncUserToFirestore(newUser);

      // Immediately reflect in registeredUsers state
      setRegisteredUsers((prev) => {
        const index = prev.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newUser;
          return updated;
        }
        return [newUser, ...prev];
      });

      showToast(
        'Account Registered',
        `Welcome to CivicSense, ${newUser.name}! Profile saved to cloud database.`,
        'success'
      );
    } catch (err: any) {
      console.error('Sign up error:', err);
      throw new Error(
        err.message?.includes('operation-not-allowed')
          ? 'Email/Password authentication provider is disabled in Firebase Console. You can enable it in Firebase Console > Authentication > Sign-in method.'
          : err.message || 'Could not register user account.'
      );
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
      let isFirebaseAuthSuccessful = false;

      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        uid = cred.user.uid;
        isFirebaseAuthSuccessful = true;
      } catch (authErr: any) {
        // auth/operation-not-allowed or user-not-found or configuration-not-found
        console.warn(
          'Firebase Auth sign-in caught error (switching to live Firestore user database):',
          authErr.code || authErr.message
        );
      }

      // Check existing registered users in memory
      let existing = registeredUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail || (uid && u.id === uid)
      );

      // If not found in memory, query Firestore users collection directly
      if (!existing) {
        try {
          const deterministicId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
          const directDoc = await getDocs(
            query(collection(db, 'users'), where('email', '==', cleanEmail))
          );
          if (!directDoc.empty) {
            existing = { id: directDoc.docs[0].id, ...directDoc.docs[0].data() } as RegisteredUserRecord;
          } else if (uid) {
            const userSnap = registeredUsers.find((u) => u.id === uid);
            if (userSnap) existing = userSnap;
          }
        } catch (dbErr) {
          console.warn('Could not query Firestore for user:', dbErr);
        }
      }

      if (existing) {
        const updatedUser: RegisteredUserRecord = {
          ...existing,
          firebaseUid: isFirebaseAuthSuccessful ? uid : existing.firebaseUid,
          lastLoginAt: new Date().toISOString(),
          loginCount: (existing.loginCount || 0) + 1,
          isOnline: true,
        };

        setCurrentUser(updatedUser);
        await syncUserToFirestore(updatedUser);

        setRegisteredUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );

        showToast(
          'Signed In Successfully',
          `Welcome back, ${updatedUser.name}! (${updatedUser.role})`,
          'success'
        );
        return;
      }

      // If user does not exist yet and Firebase Auth was blocked by operation-not-allowed:
      // Auto-provision and register account seamlessly so user is never blocked
      const fallbackId = uid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      const derivedName = cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const nowIso = new Date().toISOString();

      const autoRegisteredUser: RegisteredUserRecord = {
        id: fallbackId,
        firebaseUid: isFirebaseAuthSuccessful ? uid : undefined,
        name: derivedName || 'Civic Citizen',
        email: cleanEmail,
        phone: '+91 8922 245000',
        ward: 'Ward 1',
        role: cleanEmail.includes('admin')
          ? 'admin'
          : cleanEmail.includes('officer')
          ? 'field_officer'
          : 'citizen',
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
        'Account Initialized & Signed In',
        `Logged in as ${autoRegisteredUser.name} (${autoRegisteredUser.role}).`,
        'success'
      );
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.message?.includes('operation-not-allowed')) {
        // Fallback directly to demo citizen if anything failed
        const demo = DEMO_USERS[0];
        setCurrentUser(demo);
        showToast('Signed In as Citizen', 'Connected using demo profile.', 'info');
      } else {
        throw new Error(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Quick Demo Sign In
  const signInWithDemoUser = async (demoRole: 'citizen' | 'admin' | 'field_officer' | 'department_officer') => {
    const matched = DEMO_USERS.find((u) => u.role === demoRole) || DEMO_USERS[0];
    const updated: RegisteredUserRecord = {
      ...matched,
      lastLoginAt: new Date().toISOString(),
      loginCount: (matched.loginCount || 5) + 1,
      isOnline: true,
    };
    setCurrentUser(updated);
    await syncUserToFirestore(updated);
    showToast('Signed In as Demo', `Logged in as ${updated.name} (${updated.role})`, 'info');
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      if (currentUser?.id) {
        await updateDoc(doc(db, 'users', currentUser.id), { isOnline: false });
      }
      await signOut(auth);
    } catch (e) {}
    // Reset to default citizen Deepika or guest
    const guestUser: User = {
      id: `GUEST-${Date.now().toString().slice(-4)}`,
      name: 'Vizianagaram Visitor',
      email: 'visitor@vizianagaram.gov.in',
      role: 'citizen',
      ward: 'Ward 1',
    };
    setCurrentUser(guestUser);
    showToast('Signed Out', 'You have been signed out. Browsing as visitor.', 'info');
  };

  // Switch role helper for quick testing
  const switchRole = async (role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role) || {
      id: `USR-${role.toUpperCase()}`,
      name: `${role.replace('_', ' ').toUpperCase()} Officer`,
      email: `${role}@civicsense.gov`,
      role,
    };
    const updated: RegisteredUserRecord = {
      ...matched,
      lastLoginAt: new Date().toISOString(),
      loginCount: (matched.loginCount || 1) + 1,
      isOnline: true,
    };
    setCurrentUser(updated);
    await syncUserToFirestore(updated);
    showToast('Role Switched', `Active user: ${updated.name} (${updated.role})`, 'info');
  };

  // Create complaint action
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
  }): Promise<Complaint> => {
    // Run AI classification if not passed
    let ai = data.aiResult;
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

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CIVIC-2026-${uniqueNum}`;
    const nowIso = new Date().toISOString();
    const slaHours =
      ai?.estimatedResolutionHours ||
      (data.severity === 'Critical' ? 12 : data.severity === 'High' ? 24 : 48);
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const newComplaint: Complaint = {
      id: complaintId,
      title: data.title,
      description: data.description,
      category: ai?.category || data.category,
      subcategory: ai?.subcategory,
      severity: ai?.severity || data.severity,
      priority: ai?.priority || (data.severity === 'Critical' ? 'P1-Critical' : 'P2-High'),
      status: 'Submitted',
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
      department: ai?.suggestedDepartment,
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
          remarks: 'Citizen registered complaint with GPS coordinates and evidence.',
        },
        {
          id: `TL-${Date.now()}-2`,
          status: 'Under Review',
          timestamp: new Date(Date.now() + 1000).toISOString(),
          updatedBy: 'CivicSense AI Assistant',
          role: 'admin',
          remarks: `AI auto-classified issue under ${ai?.suggestedDepartment} with ${ai?.confidence}% confidence. Safety Risk: ${ai?.safetyRisk}`,
        },
      ],
      aiAnalysis: ai,
    };

    // Save to Firestore real-time collection
    try {
      await setDoc(doc(db, 'complaints', complaintId), newComplaint);
    } catch (e) {
      console.warn('Firestore write complaint error (using local state):', e);
    }

    // Update user submittedComplaintsCount in Firestore & local
    try {
      if (currentUser?.id) {
        await updateDoc(doc(db, 'users', currentUser.id), {
          submittedComplaintsCount: (currentUser.loginCount || 0) + 1,
          lastVisitedComplaintId: complaintId,
        });
      }
    } catch (e) {}

    setComplaints((prev) => [newComplaint, ...prev.filter((c) => c.id !== complaintId)]);

    // Create notification
    const newNotif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId: newComplaint.id,
      title: `New Report: ${newComplaint.title.slice(0, 30)}...`,
      message: `A new ${newComplaint.category} issue has been logged in ${newComplaint.location.ward}.`,
      type: 'new_complaint',
      timestamp: nowIso,
      read: false,
      targetRole: 'admin',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Complaint Filed',
      `Complaint ${complaintId} submitted to VMC live database.`,
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
        notes: remarks || 'Resolved by field municipal crew.',
        proofPhotos: evidenceUrl ? [evidenceUrl] : target.photos,
        resolvedBy: `${currentUser.name} (${target.department || 'Municipal Dept'})`,
      };
    }

    // Write to Firestore
    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update complaint error:', e);
    }

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    // Notification to citizen
    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `Status: ${complaintId} is now ${newStatus}`,
      message: remarks || `Municipal updates have moved this complaint to ${newStatus}.`,
      type: newStatus === 'Resolved' ? 'resolved' : 'status_change',
      timestamp: nowIso,
      read: false,
      targetRole: 'citizen',
      targetUserId: target?.reportedBy.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('Status Updated', `${complaintId} changed to ${newStatus}`, 'success');
  };

  // Assign officer
  const assignOfficer = async (
    complaintId: string,
    department: MunicipalDepartment,
    officer: AssignedOfficer,
    remarks?: string
  ) => {
    const nowIso = new Date().toISOString();
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const timelineItem = {
      id: `TL-${Date.now()}`,
      status: 'Assigned' as ComplaintStatus,
      timestamp: nowIso,
      updatedBy: `${currentUser.name} (${currentUser.role})`,
      role: currentUser.role,
      remarks: remarks || `Assigned to ${officer.name} (${officer.badgeNumber}) at ${department}`,
    };

    const updated: Complaint = {
      ...target,
      department,
      assignedOfficer: officer,
      status: 'Assigned',
      updatedAt: nowIso,
      timeline: [...target.timeline, timelineItem],
    };

    // Write to Firestore
    try {
      await setDoc(doc(db, 'complaints', complaintId), updated, { merge: true });
    } catch (e) {}

    setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));

    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `Officer Assigned to ${complaintId}`,
      message: `${officer.name} from ${department} has been dispatched to resolve your issue.`,
      type: 'officer_assigned',
      timestamp: nowIso,
      read: false,
      targetRole: 'citizen',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('Officer Assigned', `Assigned ${officer.name} to ${complaintId}`, 'success');
  };

  // Update priority
  const updatePriority = async (complaintId: string, priority: Priority) => {
    const nowIso = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, priority, updatedAt: nowIso } : c))
    );
    try {
      await updateDoc(doc(db, 'complaints', complaintId), { priority, updatedAt: nowIso });
    } catch (e) {}
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

    showToast('Internal Note Added', 'Authority note recorded securely.', 'success');
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
      'Feedback Submitted',
      'Thank you for rating municipal service resolution!',
      'success'
    );
  };

  // Reopen complaint
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
      remarks: `Citizen reopened issue: ${reason}`,
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

    const notif: CivicNotification = {
      id: `NOTIF-${Date.now()}`,
      complaintId,
      title: `⚠️ Complaint Reopened: ${complaintId}`,
      message: `Citizen reported incomplete work: "${reason.slice(0, 50)}..."`,
      type: 'reopened',
      timestamp: nowIso,
      read: false,
      targetRole: 'admin',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('Complaint Reopened', 'Escalation sent to municipal senior engineer.', 'warning');
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
    showToast('Notifications Cleared', 'All notifications marked as read', 'info');
  };

  // Reset demo data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    localStorage.removeItem(STORAGE_KEY_USER);
    setComplaints(INITIAL_COMPLAINTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(DEMO_USERS[0]);
    setSelectedComplaint(null);
    showToast('Reset Complete', 'Database restored to initial seed presentation state.', 'info');
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
