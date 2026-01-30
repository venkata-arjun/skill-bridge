// src/components/FeedbackModal.jsx
import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAlert } from "../contexts/AlertContext";

export default function FeedbackModal({
  session,
  isOpen,
  onClose,
  currentUser,
}) {
  const { showAlert } = useAlert();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showAlert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const feedbackId = `${session.id}_${currentUser.uid}`;
      await setDoc(doc(db, "feedback", feedbackId), {
        sessionId: session.id,
        attendeeId: currentUser.uid,
        attendeeName: currentUser.displayName,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      showAlert("Thank you!");
      onClose();
    } catch (err) {
      console.error("feedback submission error:", err);
      showAlert("Failed: " + (err.message || "unknown"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 pb-2 sm:pb-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate pr-3 sm:pr-4">
            Rate this session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Session Title */}
        <div className="px-3 sm:px-4 pb-1">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            {session.title}
          </p>
        </div>

        {/* Rating */}
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex justify-center mb-1">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Your rating
            </span>
          </div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-2xl sm:text-3xl p-0.5 sm:p-1 rounded-full transition-all duration-200 transform hover:scale-110 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 drop-shadow-sm"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-center mt-1">
              <span className="text-xs sm:text-sm text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            </div>
          )}
        </div>

        {/* Comment */}
        <div className="px-3 sm:px-4 pb-2 sm:pb-3">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Comments (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this session..."
            className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg mb-1 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200"
            rows={2}
            maxLength={150}
          />
          <div className="text-xs text-gray-500 text-right">
            {comment.length}/150
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 pt-2 sm:pt-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
