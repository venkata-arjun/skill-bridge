import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import logo from "../assets/logo.png";

export default function Login() {
  const { login, profile } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Function to get user-friendly error messages
  const getErrorMessage = (err) => {
    const errorCode = err?.code || err?.message || String(err);

    switch (errorCode) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password. Please check your credentials.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/user-disabled":
        return "Account disabled. Please contact support.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/operation-not-allowed":
        return "Sign-in method not enabled. Please contact support.";
      default:
        return "Sign in failed. Please try again or contact support if the problem persists.";
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      // Instant redirect to home
      nav("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <style>
        {`
        .glass-card { background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        @keyframes floatUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulseGlow { 0% { box-shadow: 0 6px 20px rgba(99,102,241,0.08) } 50% { box-shadow: 0 10px 30px rgba(99,102,241,0.12) } 100% { box-shadow: 0 6px 20px rgba(99,102,241,0.08) } }
        @keyframes shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }
        .enter { animation: floatUp 420ms cubic-bezier(.2,.9,.2,1) both }
        .glow { animation: pulseGlow 2.8s infinite }
        .error-shake { animation: shake 0.5s ease-in-out }
        `}
      </style>

      <div className="w-full max-w-4xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl glass-card border border-gray-200">
        {/* Left decorative panel */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 gap-6 bg-white">
          <div className="flex flex-col items-center gap-4">
            <img
              src={logo}
              alt="SkillBridge Logo"
              className="w-56 h-56 rounded-xl object-cover"
            />
            <h2 className="text-gray-800 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center">
              Skill Bridge
            </h2>
            <p className="text-gray-800 text-xl font-medium text-center max-w-xs">
              Empowering Students with SkillBridge
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-12 bg-white">
          <div className="enter">
            <div className="mb-6">
              <h3 className="text-gray-900 text-2xl font-bold">
                Sign in to your account
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Use your email and password to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl px-4 py-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 shadow-sm error-shake">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 leading-relaxed">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-80 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  id="email"
                  aria-label="Email address"
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-80 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  type={showPassword ? "text" : "password"}
                  id="password"
                  aria-label="Password"
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-90"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:scale-[1.01] transform transition-all disabled:opacity-60"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
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
                    <span className="text-white font-medium">
                      Signing in...
                    </span>
                  </>
                ) : (
                  <span className="text-white font-semibold">Sign In</span>
                )}
              </button>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <button
                  type="button"
                  onClick={() => nav("/forgot-password")}
                  className="hover:underline"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => nav("/signup")}
                  className="hover:underline"
                >
                  Create account
                </button>
              </div>

              <div className="text-xs text-slate-500 text-center mt-3">
                By signing in you agree to our{" "}
                <a className="underline">Terms</a> and{" "}
                <a className="underline">Privacy Policy</a>.
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} SkillBridge
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
