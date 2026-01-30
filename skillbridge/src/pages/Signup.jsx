import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import logo from "../assets/logo.png";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Map Firebase error codes to friendly messages
  const getErrorMessage = (err) => {
    const code = err?.code || err?.message || String(err);

    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please try logging in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/operation-not-allowed":
        return "Account creation is currently disabled. Please contact support.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many requests. Please try again later.";
      default:
        // fallback: show concise message and log full error to console
        console.warn("Unhandled signup error:", err);
        return "Failed to create account. Please try again or contact support.";
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const displayName = (form.displayName || "").trim();
    const email = (form.email || "").trim().toLowerCase();
    const password = form.password || "";
    const role = form.role || "student";

    // Basic validations
    if (!displayName || displayName.length < 3) {
      setError("Please enter your full name (at least 3 characters).");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Please enter your college email.");
      setLoading(false);
      return;
    }

    if (!email.endsWith("@vishnu.edu.in")) {
      setError(
        "Please use your Vishnu college email (example: your.rollnumber@vishnu.edu.in)."
      );
      setLoading(false);
      return;
    }

    const username = email.split("@")[0] || "";
    if (username.length < 10) {
      setError("Use college mail id only (roll number should be complete).");
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // Calls your AuthContext.signup which expects an object
      await signup({ email, password, displayName, role });

      // Option A (current behavior): go to login page after signup
      nav("/login");

      // Option B (recommended UX): since Firebase auto-signs-in after createUserWithEmailAndPassword,
      // you could instead redirect the user into the app immediately:
      // nav("/"); // <-- uncomment if you prefer to land inside the app right away
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
      <style>
        {`
        .glass-card { background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        @keyframes floatUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulseGlow { 0% { box-shadow: 0 6px 20px rgba(99,102,241,0.08) } 50% { box-shadow: 0 10px 30px rgba(99,102,241,0.12) } 100% { box-shadow: 0 6px 20px rgba(99,102,241,0.08) } }
        .enter { animation: floatUp 420ms cubic-bezier(.2,.9,.2,1) both }
        .glow { animation: pulseGlow 2.8s infinite }
        `}
      </style>

      <div className="w-full max-w-5xl rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-xl sm:shadow-2xl glass-card border border-gray-200">
        {/* Left decorative panel */}
        <div className="hidden md:flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 gap-4 sm:gap-6 bg-white">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt="SkillBridge Logo"
              className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-xl object-cover"
            />
            <h2 className="text-gray-800 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center">
              Skill Bridge
            </h2>
            <p className="text-gray-800 text-lg sm:text-xl font-medium text-center max-w-xs px-2">
              Empowering Students with SkillBridge
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-6 sm:p-8 md:p-12 bg-white">
          <div className="enter">
            <div className="mb-6">
              <h3 className="text-gray-900 text-2xl font-bold">
                Create your account
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Join SkillBridge with your Vishnu Institute email
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 rounded-lg px-4 py-3 bg-red-50 text-red-800 border border-red-200"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
              noValidate
            >
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-80">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  name="displayName"
                  required
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  type="text"
                  id="displayName"
                  aria-label="Full name"
                  placeholder="Full name"
                  aria-invalid={!!error && form.displayName.length < 3}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-[85%] opacity-80">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  id="email"
                  aria-label="Email address"
                  placeholder="your.rollnumber@vishnu.edu.in"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <div className="mt-1 text-xs text-gray-500 ml-12">
                  Only use college mail address
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-80">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  type="password"
                  id="password"
                  aria-label="Password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                  aria-hidden
                >
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <select
                  aria-label="Role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full pl-12 pr-10 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 hover:shadow-md"
                >
                  <option value="student" className="py-2">
                    Student
                  </option>
                  <option value="speaker" className="py-2">
                    Speaker
                  </option>
                  <option value="faculty" className="py-2">
                    Faculty
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:scale-[1.01] transform transition-all disabled:opacity-60 text-sm sm:text-base"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">
                      Creating account...
                    </span>
                  </>
                ) : (
                  <span className="text-white font-semibold text-sm sm:text-base">
                    Create Account
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center text-xs sm:text-sm text-slate-400 mt-2 sm:mt-3">
                <Link to="/login" className="hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="text-xs text-slate-500 text-center mt-2 sm:mt-3 px-2">
                By creating an account you agree to our{" "}
                <a className="underline">Terms</a> and{" "}
                <a className="underline">Privacy Policy</a>.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
