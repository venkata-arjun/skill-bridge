import React from "react";
import { format } from "date-fns";
import { Star, Calendar, User, Tag as TagIcon, ThumbsUp } from "lucide-react";
import RatingsDisplay from "../components/RatingsDisplay";
import AttendeesDisplay from "../components/AttendeesDisplay";

export default function SessionCard({
  session,
  showRating = false,
  showRatingsDisplay = false,
  showAttendeesDisplay = false,
  showReviewsButton = false,
  isRegistered = false,
  isProcessing = false,
  onRegister,
  onShowReviews,
  canRegister = true,
  showUnregisterButton = false,
  onUnregister,
  showFeedbackButton = false,
  onGiveFeedback,
  hasFeedback = false,
  unregisterProcessing = false,
  showAttendeeCount = true,
  showUpvote = false,
  isUpvoted = false,
  onToggleUpvote,
}) {
  const dateDisplay = session.date
    ? session.date.toDate
      ? format(session.date.toDate(), "PPP p")
      : session.date
    : "No date";

  // Status styling
  const statusProps =
    session.status === "approved"
      ? {
          bg: "bg-green-100",
          text: "text-green-800",
          ring: "ring-green-200",
        }
      : session.status === "rejected"
      ? { bg: "bg-red-100", text: "text-red-800", ring: "ring-red-200" }
      : session.status === "completed"
      ? { bg: "bg-blue-100", text: "text-blue-800", ring: "ring-blue-200" }
      : {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          ring: "ring-yellow-200",
        };

  // Render star ratings
  function renderStars(avg) {
    const n = Math.round(avg || 0);
    return (
      <div className="inline-flex items-center gap-1" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 transition-colors duration-200 ${
              i < n ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <article className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 w-full max-w-4xl overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 leading-tight tracking-tight md:truncate">
            {session.title}
          </h3>
          <div className="mt-2 text-sm text-gray-500 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="md:truncate">
                {session.authorName || "Unknown"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="md:truncate">{dateDisplay}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 sm:text-right">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusProps.bg} ${statusProps.text} ring-1 ${statusProps.ring} transition-colors duration-200`}
            aria-label={`Status: ${session.status}`}
          >
            {session.status}
          </div>

          {showRating && session.averageRating && (
            <div className="mt-3 text-right text-sm text-gray-600">
              <div className="flex items-center justify-end gap-2">
                {renderStars(session.averageRating)}
                <span className="text-xs font-medium">
                  {session.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({session.ratingCount || 0})
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <p className="mt-4 text-sm text-gray-600 md:line-clamp-3 leading-relaxed break-words overflow-hidden max-w-full">
        {session.description}
      </p>

      {session.tags && session.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 overflow-hidden">
          {session.tags.slice(0, 5).map((t, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-gray-100 hover:bg-gray-100 transition-colors duration-200 md:max-w-32 md:truncate"
            >
              <TagIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {t}
            </span>
          ))}
          {session.tags.length > 5 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-gray-100">
              +{session.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      <footer className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {showAttendeeCount && (
            <div className="text-sm text-gray-500 font-medium min-w-0">
              {(() => {
                const count = session.attendeeCount || 0;
                const max = session.maxAttendees;
                const sessionDate = session.date?.toDate
                  ? session.date.toDate()
                  : new Date(session.date);
                const isUpcoming = sessionDate >= new Date();
                const label = isUpcoming ? "participants" : "attendee";

                if (max) {
                  return `${count}/${max} ${label}${count === 1 ? "" : "s"}`;
                } else {
                  return `${count} ${label}${count === 1 ? "" : "s"}`;
                }
              })()}
            </div>
          )}

          {showUpvote && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <button
                onClick={() => onToggleUpvote && onToggleUpvote(session)}
                className="flex items-center gap-1 p-1 rounded transition-colors hover:bg-gray-100"
              >
                <ThumbsUp
                  className={`w-4 h-4 ${
                    isUpvoted ? "fill-blue-500 text-blue-500" : "text-gray-400"
                  }`}
                />
                <span className={isUpvoted ? "text-blue-600" : ""}>
                  {session.upvotes || 0}
                </span>
              </button>
            </div>
          )}

          <div className="bg-green-50 px-2 py-1 rounded-md border border-green-200 flex-shrink-0">
            <span className="text-sm font-bold text-green-700 whitespace-nowrap">
              {session?.price > 0 ? `₹${session.price}` : "Free"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/sessions/${session.id}`}
            className="text-sm px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex-shrink-0"
          >
            Details
          </a>
          {showReviewsButton && (
            <button
              onClick={() => onShowReviews && onShowReviews(session)}
              className="text-sm px-3 py-2 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex-shrink-0"
            >
              Reviews
            </button>
          )}
          {canRegister && session.status === "approved" && (
            <button
              onClick={() => !isRegistered && onRegister && onRegister(session)}
              disabled={
                isProcessing ||
                isRegistered ||
                (session.maxAttendees &&
                  (session.attendeeCount || 0) >= session.maxAttendees)
              }
              className={`text-sm px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex-shrink-0 ${
                isRegistered
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed shadow-lg"
                  : session.maxAttendees &&
                    (session.attendeeCount || 0) >= session.maxAttendees
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isProcessing
                ? "Processing..."
                : isRegistered
                ? "Registered"
                : session.maxAttendees &&
                  (session.attendeeCount || 0) >= session.maxAttendees
                ? "Full"
                : "Register" +
                  (session.price > 0 ? ` (₹${session.price})` : " (Free)")}
            </button>
          )}
          {showUnregisterButton && session.status !== "completed" && (
            <button
              onClick={() => onUnregister && onUnregister(session.id)}
              disabled={unregisterProcessing}
              className={`text-sm px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex-shrink-0 ${
                unregisterProcessing
                  ? "bg-gray-300 text-gray-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {unregisterProcessing ? "Processing..." : "Unregister"}
            </button>
          )}
          {showFeedbackButton && (
            <button
              onClick={() => onGiveFeedback && onGiveFeedback(session)}
              disabled={hasFeedback}
              className={`text-sm px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex-shrink-0 ${
                hasFeedback
                  ? "bg-gray-300 text-gray-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {hasFeedback ? "Feedback Given" : "Give Feedback"}
            </button>
          )}
        </div>
      </footer>

      {session.status === "rejected" && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-700 overflow-hidden">
          <div className="font-semibold mb-1">Rejected</div>
          <div className="break-words md:line-clamp-2">
            {session.rejectionReason || "No reason provided."}
          </div>
        </div>
      )}

      {showRatingsDisplay && <RatingsDisplay sessionId={session.id} />}
      {showAttendeesDisplay && (
        <AttendeesDisplay sessionId={session.id} sessionDate={session.date} />
      )}
    </article>
  );
}
