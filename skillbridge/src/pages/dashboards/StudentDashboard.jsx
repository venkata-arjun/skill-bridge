// src/pages/dashboards/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import SessionCard from "../../shared/SessionCard";
import FeedbackModal from "../../components/FeedbackModal";

export default function StudentDashboard() {
  const { currentUser, profile } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirmation } = useConfirmation();
  const [loading, setLoading] = useState(true);
  const [registeredSessions, setRegisteredSessions] = useState([]);
  const [attendedSessions, setAttendedSessions] = useState([]);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(new Set());
  const [activeTab, setActiveTab] = useState("dashboard");

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(new Set()); // sessionIds where feedback already given

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const q = query(
      collection(db, "registrations"),
      where("attendeeId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const regDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // fetch session docs for registrations
        const sessionPromises = regDocs.map((r) =>
          getDoc(doc(db, "sessions", r.sessionId))
        );
        try {
          const snaps = await Promise.all(sessionPromises);
          const sarr = snaps
            .map((s) => {
              if (s.exists()) {
                const data = s.data();
                // Mark sessions as completed if they have passed their date
                if (data.status === "approved" && data.date) {
                  const sessionDate = data.date.toDate
                    ? data.date.toDate()
                    : new Date(data.date);
                  if (sessionDate < new Date()) {
                    data.status = "completed";
                  }
                }
                return { id: s.id, ...data };
              }
              return null;
            })
            .filter(Boolean);

          // Separate sessions into registered and attended
          const registered = sarr.filter((s) => {
            const sessionDate = s.date?.toDate
              ? s.date.toDate()
              : new Date(s.date);
            return sessionDate >= new Date();
          });

          const attended = sarr.filter((s) => {
            const sessionDate = s.date?.toDate
              ? s.date.toDate()
              : new Date(s.date);
            return sessionDate < new Date();
          });

          setRegisteredSessions(registered);
          setAttendedSessions(attended);
          setLoading(false);
        } catch (err) {
          console.error("failed to fetch sessions:", err);
          setError("Failed to load sessions");
          setLoading(false);
        }
      },
      (err) => {
        console.error("registrations snapshot error:", err);
        setError("Failed to load registrations");
        setLoading(false);
      }
    );

    return unsub;
  }, [currentUser]);

  // Track feedback given
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "feedback"),
      where("attendeeId", "==", currentUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const feedbackSet = new Set(snap.docs.map((d) => d.data().sessionId));
        setFeedbackGiven(feedbackSet);
      },
      (err) => {
        console.error("feedback snapshot error:", err);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const unregister = async (sessionId) => {
    showAlert(
      "Are you sure you want to unregister from this session?",
      "warning",
      async () => {
        setProcessing((prev) => new Set([...prev, sessionId]));
        try {
          await deleteDoc(
            doc(db, "registrations", `${sessionId}_${currentUser.uid}`)
          );

          // Update attendee count
          const regsRef = collection(db, "registrations");
          const regsSnap = await getDocs(
            query(regsRef, where("sessionId", "==", sessionId))
          );
          const regs = [];
          regsSnap.docs.forEach((d) => {
            const data = d.data();
            if (!data || data.cancelled === true) return;
            if (
              !data.attendeeId ||
              typeof data.attendeeId !== "string" ||
              !data.attendeeId.trim()
            )
              return;
            regs.push({ id: d.id, ...data });
          });
          const uniqueAttendees = new Set(regs.map((r) => r.attendeeId.trim()));
          await updateDoc(doc(db, "sessions", sessionId), {
            attendeeCount: uniqueAttendees.size,
          });

          // Remove from registered sessions
          setRegisteredSessions((prev) =>
            prev.filter((s) => s.id !== sessionId)
          );
          showAlert("Successfully unregistered from the session.", "success");
        } catch (err) {
          console.error("unregister error:", err);
          showAlert("Failed to unregister", "error");
        } finally {
          setProcessing((prev) => {
            const newSet = new Set(prev);
            newSet.delete(sessionId);
            return newSet;
          });
        }
      },
      true,
      "Unregister",
      "Cancel"
    );
  };

  const openFeedbackModal = (session) => {
    setSelectedSession(session);
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedSession(null);
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <a
          href="/profile"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 w-fit"
        >
          Manage Profile
        </a>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded ${
              activeTab === "dashboard"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <a
            href="/request/topic"
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-orange-100"
          >
            Request Topic
          </a>
        </nav>
      </div>

      {activeTab === "dashboard" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">My Registrations</h2>

          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded mb-3">
              {error}
            </div>
          )}

          {loading ? (
            <div>Loading...</div>
          ) : registeredSessions.length === 0 &&
            attendedSessions.length === 0 ? (
            <div className="text-gray-500">
              You have not registered for any sessions yet.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Registered Sessions (Upcoming) */}
              {registeredSessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Registered Sessions
                    </h3>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {registeredSessions.length} upcoming
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registeredSessions.map((s) => {
                      const hasFeedback = feedbackGiven.has(s.id);
                      return (
                        <div key={s.id}>
                          <SessionCard
                            session={s}
                            canRegister={false}
                            showUnregisterButton={true}
                            onUnregister={unregister}
                            showFeedbackButton={false}
                            onGiveFeedback={openFeedbackModal}
                            hasFeedback={hasFeedback}
                            unregisterProcessing={processing.has(s.id)}
                            showAttendeeCount={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attended Sessions (Completed) */}
              {attendedSessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Attended Sessions
                    </h3>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {attendedSessions.length} completed
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attendedSessions.map((s) => {
                      const hasFeedback = feedbackGiven.has(s.id);
                      return (
                        <div key={s.id}>
                          <SessionCard
                            session={s}
                            canRegister={false}
                            showUnregisterButton={false}
                            onUnregister={unregister}
                            showFeedbackButton={true}
                            onGiveFeedback={openFeedbackModal}
                            hasFeedback={hasFeedback}
                            unregisterProcessing={processing.has(s.id)}
                            showAttendeeCount={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Topic requests moved to /request/topic. Use the Request menu in the navbar. */}

      <FeedbackModal
        session={selectedSession}
        isOpen={feedbackModalOpen}
        onClose={closeFeedbackModal}
        currentUser={currentUser}
      />
    </div>
  );
}
