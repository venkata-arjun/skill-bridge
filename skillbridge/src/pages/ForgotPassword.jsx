import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to get user-friendly error messages
  const getErrorMessage = (error) => {
    const errorCode = error.code || error.message;

    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/too-many-requests":
        return "Too many requests. Try again later";
      case "auth/network-request-failed":
        return "Network error. Check connection";
      default:
        return "Failed to send reset email. Try again";
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
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

      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl glass-card border border-gray-200">
        <div className="p-8">
          <div className="enter">
            {/* Back button */}
            <button
              onClick={() => nav("/login")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="text-center mb-6">
              <img
                src={logo}
                alt="SkillBridge Logo"
                className="w-16 h-16 mx-auto mb-4 rounded-lg"
              />
              <h3 className="text-gray-900 text-2xl font-bold">
                Reset Password
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Enter your email to receive a reset link
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
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl px-4 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 leading-relaxed">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-80">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  id="email"
                  aria-label="Email address"
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <button
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
                    <span className="text-white font-medium">Sending...</span>
                  </>
                ) : (
                  <span className="text-white font-semibold">
                    Send Reset Email
                  </span>
                )}
              </button>
            </form>

            <div className="text-xs text-slate-500 text-center mt-6">
              Remember your password?{" "}
              <button
                onClick={() => nav("/login")}
                className="text-indigo-600 hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
