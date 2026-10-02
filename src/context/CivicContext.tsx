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
    // 1. Create Firebase Authentication account
    const cred = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      pass
    );

    const firebaseUid = cred.user.uid;
    const nowIso = new Date().toISOString();

    // Public signup is always Citizen
    const safeRole: UserRole = 'citizen';

    // 2. Create Firestore user profile
    const newUser: RegisteredUserRecord = {
      // Firebase UID is used as the document/user ID
      id: firebaseUid,

      // IMPORTANT:
      // Firestore security rules validate this field
      uid: firebaseUid,

      // Keep firebaseUid for application compatibility
      firebaseUid,

      name: profile.name.trim(),
      email: cleanEmail,

      phone: profile.phone?.trim() || '+91 8922 245000',

      ward:
        profile.ward ||
        'Ward 1 - Fort Road & Royal Palace Quarter',

      // Users signing up publicly are Citizens
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

    // 3. Save profile to Firestore
    try {
      await setDoc(
        doc(db, 'users', firebaseUid),
        newUser,
        { merge: true }
      );
    } catch (firestoreErr) {
      console.error(
        'Firestore profile creation failed after Firebase auth created the user.',
        firestoreErr
      );

      // Firebase Auth account was created,
      // but Firestore profile failed.
      await signOut(auth).catch(() => undefined);

      throw new Error(
        'Unable to create your account profile. Please try again or contact the administrator.'
      );
    }

    // 4. Update local application state
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    setRegisteredUsers((prev) => {
      const next = prev.filter(
        (u) => u.id !== firebaseUid
      );

      return [newUser, ...next];
    });

    // 5. Add audit log
    addAuditLog({
      user: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTERED',
      details: 'New citizen account registered successfully.',
    });

    // 6. Show success message
    showToast(
      'Account Registered',
      `Welcome to Smart Civic, ${newUser.name}!`,
      'success'
    );

  } catch (err: any) {
    const message =
      err?.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err?.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters long.'
          : err?.code === 'auth/invalid-email'
            ? 'Please enter a valid email address.'
            : err?.message ||
              'Could not register user account.';

    console.error('Sign up error:', err);

    setAuthError(message);

    throw new Error(message);

  } finally {
    setIsAuthLoading(false);
  }
};