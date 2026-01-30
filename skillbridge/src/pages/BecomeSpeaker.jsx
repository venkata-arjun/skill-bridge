import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  FileText,
  Mic,
  Loader2,
} from "lucide-react";

export default function BecomeSpeaker() {
  const { currentUser, profile } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [year, setYear] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showAlert("Please login to apply.", "warning");
      return;
    }

    // Validate required fields
    if (!year) {
      showAlert("Please select your current year.", "warning");
      return;
    }

    if (!resume.trim()) {
      showAlert("Please provide a resume link.", "warning");
      return;
    }

    // Validate resume URL format
    try {
      new URL(resume);
    } catch {
      showAlert("Please provide a valid resume URL.", "warning");
      return;
    }

    setLoading(true);
    try {
      const id = `${currentUser.uid}_${Date.now()}`;
      await setDoc(doc(db, "speakerProposals", id), {
        studentId: currentUser.uid,
        name: profile?.displayName || currentUser.email,
        email: profile?.email || currentUser.email,
        linkedin: profile?.linkedin || "",
        phone: profile?.phone || "",
        year,
        resume,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      showAlert("Application submitted. Faculty will review.", "success");
    } catch (err) {
      console.error(err);
      showAlert("Failed to submit application.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto sm:max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Become a Speaker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your knowledge and inspire others. Apply to become a speaker
            at SkillBridge.
          </p>
        </div>

        {/* Main Form Card - Full Screen on Mobile */}
        <div className="fixed inset-0 sm:relative sm:inset-auto bg-white sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-xl border-none sm:border sm:border-gray-100 overflow-auto sm:overflow-hidden z-40 sm:z-auto top-16 sm:top-0">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Speaker Application
                </h2>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">
                  Fill out the form below to submit your application
                </p>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={() => navigate(-1)}
                className="sm:hidden text-black rounded-full p-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1"
          >
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile?.displayName || ""}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || currentUser?.email || ""}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <GraduationCap className="w-4 h-4" />
                    Current Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4" />
                    Resume Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 pb-20 sm:pb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Apply to be a Speaker
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section - Hidden on Mobile */}
        <div className="hidden sm:block mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            What happens next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Application Review</p>
                <p>Faculty reviews your application within 2-3 working days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Interview</p>
                <p>If approved, you'll be scheduled for a brief interview</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Get Started</p>
                <p>
                  Once approved, you can start proposing and hosting sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
