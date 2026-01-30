import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import SessionCard from "../../shared/SessionCard";
import RatingsDisplay from "../../components/RatingsDisplay";
import AttendeesDisplay from "../../components/AttendeesDisplay";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Clock,
  Tag,
  FileText,
  Send,
  Users,
  User,
  MessageSquare,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export default function SpeakerDashboard() {
  const { currentUser, profile } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    tags: "",
    price: "",
    maxAttendees: "",
  });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [showSessionReviewsModal, setShowSessionReviewsModal] = useState(false);
  const [studentRequests, setStudentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [newTopic, setNewTopic] = useState({
    topic: "",
    category: "",
    description: "",
  });
  const [creatingProposedTopic, setCreatingProposedTopic] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "sessions"),
      where("authorId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSessions(arr);
      },
      (err) => {
        console.error("speaker sessions snapshot error:", err);
        setError(err.message || "Failed to load your sessions");
      }
    );
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setLoadingRequests(true);
    const q = query(
      collection(db, "studentRequests"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStudentRequests(arr);
        setLoadingRequests(false);
      },
      (err) => {
        console.error("student requests snapshot error:", err);
        setError(err.message || "Failed to load student requests");
        setLoadingRequests(false);
      }
    );
    return () => unsub();
  }, [currentUser]);

  const handleShowSessionReviews = async (session) => {
    setSelectedSession(session);

    const q = query(
      collection(db, "feedback"),
      where("sessionId", "==", session.id)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const feedbackData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSessionFeedback(feedbackData);
        setShowSessionReviewsModal(true);
      },
      (err) => {
        console.error("session feedback snapshot error:", err);
        setSessionFeedback([]);
        setShowSessionReviewsModal(true);
      }
    );

    // Clean up listener after a short delay
    setTimeout(() => unsub(), 1000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      if (!form.title.trim() || !form.description.trim()) {
        setError("Please provide title and description.");
        setCreating(false);
        return;
      }

      // combine date + time into a timestamp (if provided)
      let sessionDate = null;
      if (form.date) {
        const dtString = form.time
          ? `${form.date}T${form.time}:00`
          : `${form.date}T00:00:00`;
        sessionDate = Timestamp.fromDate(new Date(dtString));
      }

      // create session doc (no imageUrl, status pending)
      await addDoc(collection(db, "sessions"), {
        title: form.title.trim(),
        description: form.description.trim(),
        authorId: currentUser.uid,
        authorName: profile?.displayName || currentUser.email,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        createdAt: serverTimestamp(),
        date: sessionDate,
        status: "pending",
        price: parseFloat(form.price) || 0,
        attendeeCount: 0,
        maxAttendees: parseInt(form.maxAttendees) || null,
      });

      // reset form
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        tags: "",
        price: "",
        maxAttendees: "",
      });
      setError("");
    } catch (err) {
      console.error("Create session error:", err);
      setError(err.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  }

  // split sessions into categories
  const pendingSessions = sessions.filter((s) => s.status === "pending");
  const approvedSessions = sessions.filter((s) => s.status === "approved");
  const rejectedSessions = sessions.filter((s) => s.status === "rejected");
  const completedSessions = sessions.filter((s) => {
    if (s.status === "approved" && s.date) {
      const sessionDate = s.date.toDate ? s.date.toDate() : new Date(s.date);
      return sessionDate < new Date();
    }
    return false;
  });

  async function handleCreateProposedTopic(e) {
    e.preventDefault();
    if (!currentUser) return;
    if (!newTopic.topic.trim()) {
      setError("Please provide a topic.");
      return;
    }

    setCreatingProposedTopic(true);
    try {
      await addDoc(collection(db, "sessions"), {
        title: newTopic.topic.trim(),
        description: newTopic.description.trim() || "",
        authorId: currentUser.uid,
        authorName: profile?.displayName || currentUser.email,
        tags: newTopic.category ? [newTopic.category] : [],
        createdAt: serverTimestamp(),
        date: null,
        status: "proposed",
        attendeeCount: 0,
        maxAttendees: null,
        upvotes: 0,
      });

      // Reset form
      setNewTopic({
        topic: "",
        category: "",
        description: "",
      });
      setError("");
    } catch (err) {
      console.error("create proposed topic error:", err);
      setError(err.message || "Failed to create proposed topic");
    } finally {
      setCreatingProposedTopic(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-8">
      <div className="space-y-10">
        {/* Session Statistics */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Your Session Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {approvedSessions.length}
              </div>
              <div className="text-sm text-gray-600">Approved Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completedSessions.length}
              </div>
              <div className="text-sm text-gray-600">Completed Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingSessions.length}
              </div>
              <div className="text-sm text-gray-600">Pending Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {rejectedSessions.length}
              </div>
              <div className="text-sm text-gray-600">Rejected Sessions</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-xl shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create a new session
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Share your knowledge with the community
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter an engaging session title"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  required
                />
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what attendees will learn and why they should join..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                rows={4}
                required
              />
            </div>

            {/* Date and Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Price and Max Attendees Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set the price for this session (0 for free)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={form.maxAttendees}
                    onChange={(e) =>
                      setForm({ ...form, maxAttendees: e.target.value })
                    }
                    placeholder="e.g., 30"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of attendees allowed (leave empty for
                  unlimited)
                </p>
              </div>
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g., JavaScript, React, Web Development"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
              <button
                disabled={creating}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Create Session
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                New sessions require faculty approval before publishing
              </div>
            </div>
          </form>
        </div>

        {/* Pending */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Pending Sessions</h3>
          {pendingSessions.length === 0 ? (
            <div className="text-gray-500">No pending sessions.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  showRegisterButton={false}
                  showRating={false}
                  showRatingsDisplay={false}
                  showReviewsButton={true}
                  canRegister={false}
                  onShowReviews={handleShowSessionReviews}
                />
              ))}
            </div>
          )}
        </section>

        {/* Approved */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Approved Sessions</h3>
          {approvedSessions.length === 0 ? (
            <div className="text-gray-500">No approved sessions yet.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {approvedSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  showRegisterButton={false}
                  showRating={false}
                  showRatingsDisplay={false}
                  showAttendeesDisplay={false}
                  showReviewsButton={true}
                  canRegister={false}
                  onShowReviews={handleShowSessionReviews}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Completed Sessions</h3>
          {completedSessions.length === 0 ? (
            <div className="text-gray-500">No completed sessions yet.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={{ ...s, status: "completed" }}
                  showRegisterButton={false}
                  showRating={false}
                  showRatingsDisplay={false}
                  showAttendeesDisplay={false}
                  showReviewsButton={true}
                  canRegister={false}
                  onShowReviews={handleShowSessionReviews}
                />
              ))}
            </div>
          )}
        </section>

        {/* Rejected */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Rejected Sessions</h3>
          {rejectedSessions.length === 0 ? (
            <div className="text-gray-500">No rejected sessions.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rejectedSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  showRegisterButton={false}
                  showRating={false}
                  showRatingsDisplay={false}
                  showReviewsButton={false}
                  canRegister={false}
                  onShowReviews={handleShowSessionReviews}
                />
              ))}
            </div>
          )}
        </section>

        {/* Student Requested Topics */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Student Requested Topics</h3>
              </div>
              <div className="text-indigo-200 font-medium">
                Total Requests :{" "}
                <span className="font-bold text-white">
                  {studentRequests.length}
                </span>
              </div>
            </div>
          </div>

          {loadingRequests ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">
                Loading student requests...
              </p>
            </div>
          ) : studentRequests.length === 0 ? (
            <div className="p-6 text-center">
              <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                No student requests yet.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Be the first to inspire learning!
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white">
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {studentRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="bg-white border border-gray-100 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 group shadow-sm"
                    >
                      {/* Header with topic and status */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                              {request.topic}
                            </h5>
                            {request.description && (
                              <p className="text-gray-600 text-xs leading-relaxed">
                                {request.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Preferred date */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {request.preferredDate && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200/50 shadow-sm">
                            <Calendar className="w-2.5 h-2.5" />
                            {request.preferredDate}
                          </span>
                        )}
                        {request.mergedCount && request.mergedCount > 1 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200/50 shadow-sm">
                            <Users className="w-2.5 h-2.5" />
                            {request.mergedCount} similar
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* View More Button */}
                {studentRequests.length > 3 && (
                  <div className="mt-6 text-center">
                    <Link
                      to="/student-requests"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                      View More
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Session Reviews Modal */}
      {showSessionReviewsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden">
            <div className="bg-blue-500 text-white p-3 md:p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-bold pr-3">
                  Reviews for "{selectedSession.title}"
                </h3>
                <button
                  onClick={() => setShowSessionReviewsModal(false)}
                  className="text-white hover:text-gray-200 text-lg md:text-xl flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-3 md:p-4 overflow-y-auto max-h-[70vh] md:max-h-[70vh]">
              {sessionFeedback.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No reviews yet for this session.
                </div>
              ) : (
                <>
                  {/* Session Average */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="text-center">
                      <h4 className="text-base font-semibold mb-2 text-gray-800">
                        Overall Rating
                      </h4>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                          {(
                            sessionFeedback.reduce(
                              (sum, f) => sum + f.rating,
                              0
                            ) / sessionFeedback.length
                          ).toFixed(1)}
                        </div>
                        <div className="text-yellow-500 text-lg md:text-xl">
                          ★
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          /5
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Based on {sessionFeedback.length} review
                        {sessionFeedback.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <h4 className="text-base font-semibold mb-3">
                    Individual Reviews
                  </h4>
                  <div className="space-y-2">
                    {sessionFeedback.map((f) => (
                      <div
                        key={f.id}
                        className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {f.attendeeName}
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="flex text-yellow-400 text-xs">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={
                                        i < f.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                  {f.rating}/5
                                </span>
                              </div>
                            </div>
                            {f.comment && (
                              <div className="text-gray-700 text-sm leading-relaxed">
                                {f.comment}
                              </div>
                            )}
                            {f.createdAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                {f.createdAt.toDate
                                  ? f.createdAt.toDate().toLocaleDateString()
                                  : "Recent"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-3 md:p-4 border-t">
              <button
                onClick={() => setShowSessionReviewsModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full md:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
