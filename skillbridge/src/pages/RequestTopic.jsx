import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Send, Loader2 } from "lucide-react";

export default function RequestTopic() {
  const { currentUser, profile } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showAlert("Please login to submit a request.", "warning");
      return;
    }
    if (!topic.trim()) {
      showAlert("Please provide a topic.", "warning");
      return;
    }
    setLoading(true);
    try {
      const id = `${currentUser.uid}_${Date.now()}`;
      await setDoc(doc(db, "studentRequests", id), {
        studentId: currentUser.uid,
        studentName: profile?.displayName || "",
        studentEmail: profile?.email || currentUser.email,
        topic: topic.trim(),
        description: description.trim(),
        status: "pending",
        mergedCount: 1,
        createdAt: serverTimestamp(),
      });
      showAlert("Request submitted — speakers will review it.", "success");
      setTopic("");
      setDescription("");
    } catch (err) {
      console.error(err);
      showAlert("Failed to submit request.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Request a Topic
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have an idea for a session? Submit your topic suggestion and let our
            speakers bring it to life.
          </p>
        </div>

        {/* Main Form Card - Full Screen on Mobile */}
        <div className="fixed inset-0 sm:relative sm:inset-auto bg-white sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-xl border-none sm:border sm:border-gray-100 overflow-auto sm:overflow-hidden z-40 sm:z-auto top-16 sm:top-0">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Topic Request Form
                </h2>
                <p className="text-green-100 mt-1 text-sm sm:text-base">
                  Share your session idea with the community
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
            {/* Topic Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Topic Details
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4" />
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  placeholder="Enter the topic title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the topic..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 pb-20 sm:pb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Topic Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section - Hidden on Mobile */}
        <div className="hidden sm:block mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Submit Your Idea</p>
                <p>Share your topic suggestion with detailed information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Speaker Review</p>
                <p>
                  Our speakers review and may create sessions based on your idea
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
