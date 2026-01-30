/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import emailjs from "@emailjs/browser";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // firebase auth user
  const [profile, setProfile] = useState(null); // user doc (role, displayName)
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * create user + user doc
   * Accepts an object: { email, password, displayName, role, bio, skills }
   */
  async function signup({
    email,
    password,
    displayName,
    role = "student",
    bio = "",
    skills = [],
  }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // set displayName in firebase auth profile (if provided)
      if (displayName) {
        try {
          await updateProfile(cred.user, { displayName });
        } catch (updErr) {
          // log and continue — displayName failure shouldn't break account creation
          console.warn("AuthContext.signup: updateProfile failed:", updErr);
        }
      }

      // create Firestore user doc
      const userRef = doc(db, "users", cred.user.uid);
      const userDoc = {
        uid: cred.user.uid,
        email,
        displayName: displayName || cred.user.displayName || "",
        role,
        bio,
        skills,
        createdAt: serverTimestamp(),
        isApproved: role === "faculty" ? false : true,
      };
      await setDoc(userRef, userDoc);

      // Send email notification for faculty registration
      if (role === "faculty") {
        try {
          const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
          const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
          const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

          const templateParams = {
            from_name: displayName || "New Faculty User",
            from_email: email,
            to_email: "skillbridge.portal@gmail.com",
            message: `A new faculty account has been created and requires approval.\n\nFaculty Details:\nName: ${
              displayName || "Not provided"
            }\nEmail: ${email}\nRole: ${role}\n\nPlease review and approve this faculty account in the Firebase database.`,
            reply_to: email,
            subject: "New Faculty Account Requires Approval",
          };

          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          console.log(
            "Faculty registration notification email sent successfully!"
          );
        } catch (emailError) {
          console.warn(
            "Failed to send faculty registration notification email:",
            emailError
          );
          // Don't throw error - account creation should still succeed even if email fails
        }
      }

      return cred.user;
    } catch (err) {
      // rethrow so UI can map/handle errors
      console.error("AuthContext.signup error:", err);
      throw err;
    }
  }

  async function login({ email, password }) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Get user data to check approval status
      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // block faculty login if not approved
        if (userData.role === "faculty" && !userData.isApproved) {
          throw new Error("Faculty account not approved yet.");
        }
      }

      return cred.user;
    } catch (err) {
      console.error("AuthContext.login error:", err);
      throw err;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error("AuthContext.resetPassword error:", err);
      throw err;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("AuthContext.signOut error:", err);
      throw err;
    } finally {
      setProfile(null);
      setCurrentUser(null);
    }
  }

  /**
   * Load Firestore profile for a given uid.
   * Uses auth.currentUser to populate fallback fields when possible.
   *
   * IMPORTANT: This function catches permission and other Firestore errors
   * and returns null instead of throwing, so that the app's auth
   * initialization won't be blocked by Firestore security rules.
   */
  async function loadProfile(uid) {
    if (!uid) {
      console.log("loadProfile: No UID provided");
      setProfile(null);
      return null;
    }

    setProfileLoading(true);
    const userRef = doc(db, "users", uid);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();

        // Add faculty tag if approved faculty
        const profileData = {
          ...data,
          facultyTag:
            data.role === "faculty" && data.isApproved ? "faculty" : null,
        };

        setProfile(profileData);
        return profileData;
      }

      // no profile doc found — create a basic profile using auth.currentUser if available
      const authUser = auth.currentUser;
      const basicProfile = {
        uid,
        email: authUser?.email || "",
        displayName: authUser?.displayName || "",
        role: "student",
        createdAt: serverTimestamp(),
      };

      await setDoc(userRef, basicProfile);
      setProfile(basicProfile);
      return basicProfile;
    } catch (error) {
      // Do NOT rethrow. Log and return null so UI can continue.
      console.error("loadProfile: Error loading/creating profile:", error);
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }

  // Subscribe to Firebase auth changes once (empty dep array).
  // When user changes, set currentUser and attempt to load profile.
  useEffect(() => {
    let mounted = true;
    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log(
        "AuthContext: Auth state changed:",
        user ? { uid: user.uid, email: user.email } : null
      );

      if (!mounted) return;

      setCurrentUser(user);
      setProfile(null);

      if (user) {
        // attempt to load profile but DO NOT let it throw and block initialization
        try {
          await loadProfile(user.uid);
        } catch (err) {
          // Defensive: loadProfile returns null on errors, but keep the log for unexpected failures.
          console.warn(
            "AuthContext: loadProfile failed after auth change:",
            err
          );
        }
      }

      // always finish initial loading (so children can render)
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsub();
    };
    // intentionally empty deps: we want single subscription to auth state
  }, []);

  const value = {
    currentUser,
    profile,
    signup,
    login,
    resetPassword,
    signOut,
    loading,
    profileLoading,
    reloadProfile: async () => {
      if (auth.currentUser) return loadProfile(auth.currentUser.uid);
      return null;
    },
  };

  // only render children when initial auth check is done
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
