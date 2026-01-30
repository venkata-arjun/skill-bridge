// src/components/RatingsDisplay.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAlert } from "../contexts/AlertContext";

export default function RatingsDisplay({ sessionId }) {
  const { showAlert } = useAlert();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "feedback"),
      where("sessionId", "==", sessionId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const feedbackData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeedback(feedbackData);

        if (feedbackData.length > 0) {
          const avg =
            feedbackData.reduce((sum, f) => sum + f.rating, 0) /
            feedbackData.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }

        setLoading(false);
      },
      (err) => {
        console.error("feedback snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [sessionId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading ratings...</div>;
  }

  if (feedback.length === 0) {
    return <div className="text-sm text-gray-500">No ratings yet</div>;
  }

  return (
    <>
      {/* Clickable Rating Summary */}
      <div
        className="mt-2 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-medium">Average Rating:</div>
          <div className="flex items-center gap-1">
            <div className="text-yellow-500">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(5 - Math.round(averageRating))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} ({feedback.length} review
              {feedback.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {/* Preview of first 2 reviews */}
        <div className="space-y-1">
          {feedback.slice(0, 2).map((f) => (
            <div
              key={f.id}
              className="text-xs bg-white p-2 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the main modal
                setSelectedReview(f);
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{f.attendeeName}</span>
                <div className="text-yellow-500">
                  {"★".repeat(f.rating)}
                  {"☆".repeat(5 - f.rating)}
                </div>
              </div>
              {f.comment && (
                <div className="text-gray-600 italic truncate">
                  "{f.comment}"
                </div>
              )}
            </div>
          ))}
          {feedback.length > 2 && (
            <div className="text-xs text-gray-500 text-center">
              Click to view all {feedback.length} reviews
            </div>
          )}
        </div>
      </div>

      {/* Modal for detailed ratings */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    Session Ratings & Feedback
                  </h3>
                  <p className="text-blue-100 mt-1">Detailed review analysis</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors text-2xl hover:bg-white hover:bg-opacity-10 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Overall Rating Summary */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Overall Session Rating
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="text-5xl">
                      {"⭐".repeat(Math.round(averageRating))}
                      {"☆".repeat(5 - Math.round(averageRating))}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {averageRating.toFixed(1)}/5
                  </div>
                  <div className="text-lg text-gray-600">
                    Based on {feedback.length} review
                    {feedback.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* All Reviews */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Individual Reviews
                </h4>
                {feedback.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
                    onClick={() => setSelectedReview(f)}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {f.attendeeName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {f.attendeeName}
                        </div>
                        {f.createdAt && (
                          <div className="text-xs text-gray-500">
                            {f.createdAt.toDate
                              ? f.createdAt.toDate().toLocaleDateString()
                              : "Recent"}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-500 text-xl">
                          {"★".repeat(f.rating)}
                          {"☆".repeat(5 - f.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          ({f.rating}/5)
                        </span>
                        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {f.comment && (
                      <div className="text-gray-700 italic bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400 ml-14">
                        "{f.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-200 font-medium shadow-sm"
                >
                  Close Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Review Special Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="relative">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold text-lg">
                        {selectedReview.attendeeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedReview.attendeeName}
                      </h3>
                      <p className="text-blue-100 text-sm">Session Feedback</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-white hover:text-gray-200 transition-colors text-2xl hover:bg-white hover:bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Rating Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Rating Given
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="text-4xl">
                        {"⭐".repeat(selectedReview.rating)}
                        {"☆".repeat(5 - selectedReview.rating)}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedReview.rating}/5 Stars
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedReview.rating >= 4
                        ? "Excellent!"
                        : selectedReview.rating >= 3
                        ? "Good!"
                        : selectedReview.rating >= 2
                        ? "Fair"
                        : "Needs Improvement"}
                    </div>
                  </div>
                </div>

                {/* Comment Section */}
                {selectedReview.comment && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Feedback Message
                        </div>
                        <div className="text-gray-800 leading-relaxed italic bg-white p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
                          "{selectedReview.comment}"
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {selectedReview.createdAt && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {selectedReview.createdAt.toDate
                          ? selectedReview.createdAt
                              .toDate()
                              .toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                          : "Recent"}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedReview(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Could implement reply functionality
                        showAlert("Reply functionality coming soon!");
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
