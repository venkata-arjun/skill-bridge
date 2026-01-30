import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useConfirmation } from "../contexts/ConfirmationContext";
import { Calendar, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import AttendeesDisplay from "../components/AttendeesDisplay";

export default function SessionDetails() {
  const { id } = useParams();
  const { currentUser, profile } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirmation } = useConfirmation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [approverName, setApproverName] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No session id provided.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const sRef = doc(db, "sessions", id);
        const snap = await getDoc(sRef);

        if (!snap.exists()) {
          if (!mounted) return;
          setError("Session not found.");
          setSession(null);
          setLoading(false);
          return;
        }

        const s = { id: snap.id, ...snap.data() };
        if (mounted) setSession(s);

        // Resolve speaker information
        if (s.authorId) {
          try {
            const speakerSnap = await getDoc(doc(db, "users", s.authorId));
            if (speakerSnap.exists()) {
              const speakerData = speakerSnap.data();
              if (mounted) {
                setSession((prev) => ({
                  ...prev,
                  speakerBio: speakerData.bio || "",
                  speakerSkills: speakerData.skills || [],
                }));
              }
            }
          } catch (err) {
            console.error("failed to resolve speaker info", err);
          }
        }

        // Resolve approver information
        if (s.approvedBy) {
          try {
            const approverSnap = await getDoc(doc(db, "users", s.approvedBy));
            if (approverSnap.exists()) {
              const approverData = approverSnap.data();
              if (mounted) {
                setApproverName(
                  approverData.displayName || approverData.email || "Faculty"
                );
              }
            }
          } catch (err) {
            console.error("failed to resolve approver info", err);
            if (mounted) setApproverName("Faculty");
          }
        }

        // Check registration state
        if (currentUser) {
          try {
            const regSnap = await getDoc(
              doc(db, "registrations", `${id}_${currentUser.uid}`)
            );
            if (mounted) setIsRegistered(regSnap.exists());
          } catch (err) {
            console.error("failed to check registration:", err);
          }
        }

        // Fetch registrations
        try {
          const regsRef = collection(db, "registrations");
          const regsSnap = await getDocs(regsRef);

          if (!mounted) return;

          const regs = [];
          regsSnap.docs.forEach((d) => {
            const data = d.data();
            if (!data || data.sessionId !== id || data.cancelled === true)
              return;
            if (
              !data.attendeeId ||
              typeof data.attendeeId !== "string" ||
              !data.attendeeId.trim()
            )
              return;
            regs.push({ id: d.id, ...data });
          });

          const uniqueAttendees = new Set(regs.map((r) => r.attendeeId.trim()));
          setAttendeeCount(uniqueAttendees.size);
        } catch (err) {
          console.error("failed to load registrations:", err);
          setError((prev) => prev || "Failed to load attendees");
        }
      } catch (err) {
        console.error("failed to load session details", err);
        if (mounted) setError(err.message || "Failed to load session");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, currentUser, profile]);

  function formatDate(ts) {
    if (!ts) return "Not scheduled";
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      });
    } catch {
      return String(ts);
    }
  }

  async function handleRegister() {
    if (!currentUser) {
      showAlert("Please log in to register.", "warning");
      return;
    }
    if (profile?.role !== "student") {
      showAlert(
        `Only students can register. Your current role: ${
          profile?.role || "not set"
        }`,
        "warning"
      );
      return;
    }
    if (session?.status !== "approved") {
      showAlert(
        `Session is not open for registration. Status: ${session?.status}`,
        "warning"
      );
      return;
    }

    // Check if session has reached maximum attendees
    if (session?.maxAttendees && attendeeCount >= session.maxAttendees) {
      showAlert(
        `This session has reached its maximum capacity of ${session.maxAttendees} attendees.`,
        "warning"
      );
      return;
    }

    setProcessing(true);
    try {
      await setDoc(doc(db, "registrations", `${id}_${currentUser.uid}`), {
        sessionId: id,
        attendeeId: currentUser.uid,
        attendeeName:
          profile?.displayName ||
          currentUser.displayName ||
          currentUser.email ||
          `User ${currentUser.uid.slice(0, 8)}`,
        attendeeEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
      setIsRegistered(true);

      // Update attendee count in session
      const regsRef = collection(db, "registrations");
      const regsSnap = await getDocs(regsRef);
      const regs = [];
      regsSnap.docs.forEach((d) => {
        const data = d.data();
        if (!data || data.sessionId !== id || data.cancelled === true) return;
        if (
          !data.attendeeId ||
          typeof data.attendeeId !== "string" ||
          !data.attendeeId.trim()
        )
          return;
        regs.push({ id: d.id, ...data });
      });
      const uniqueAttendees = new Set(regs.map((r) => r.attendeeId.trim()));
      await updateDoc(doc(db, "sessions", id), {
        attendeeCount: uniqueAttendees.size,
      });
      setAttendeeCount(uniqueAttendees.size);

      showAlert("Successfully registered!", "success");
    } catch (err) {
      console.error("register error:", err);
      showAlert("Failed to register: " + (err.message || "unknown"), "error");
    } finally {
      setProcessing(false);
    }
  }

  async function handleUnregister() {
    if (!currentUser) {
      showAlert("Please log in.", "warning");
      return;
    }

    showAlert(
      "Are you sure you want to unregister from this session?",
      "warning",
      async () => {
        setProcessing(true);
        try {
          await deleteDoc(doc(db, "registrations", `${id}_${currentUser.uid}`));
          setIsRegistered(false);

          // Update attendee count in session
          const regsRef = collection(db, "registrations");
          const regsSnap = await getDocs(regsRef);
          const regs = [];
          regsSnap.docs.forEach((d) => {
            const data = d.data();
            if (!data || data.sessionId !== id || data.cancelled === true)
              return;
            if (
              !data.attendeeId ||
              typeof data.attendeeId !== "string" ||
              !data.attendeeId.trim()
            )
              return;
            regs.push({ id: d.id, ...data });
          });
          const uniqueAttendees = new Set(regs.map((r) => r.attendeeId.trim()));
          await updateDoc(doc(db, "sessions", id), {
            attendeeCount: uniqueAttendees.size,
          });
          setAttendeeCount(uniqueAttendees.size);

          showAlert("Successfully unregistered from the session.", "success");
        } catch (err) {
          console.error("unregister error:", err);
          showAlert(
            "Failed to unregister: " + (err.message || "unknown"),
            "error"
          );
        } finally {
          setProcessing(false);
        }
      },
      true,
      "ok",
      "Cancel"
    );
  }

  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="h-6 sm:h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
          <div className="h-12 sm:h-16 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm mb-4">
          {error}
        </div>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          Back to Sessions
        </Link>
      </div>
    );

  if (!session)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-gray-500 p-4 sm:p-6 bg-white rounded-xl shadow-sm text-center">
          Session not found.
        </div>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center mt-4"
        >
          Back to Sessions
        </Link>
      </div>
    );

  const speakerName =
    session.authorName || session.authorId || "Unknown Speaker";
  const when = formatDate(session.date);
  const where =
    session.location || session.venue || session.place || "Online / TBD";
  const status = session.status || "pending";

  const statusProps =
    status === "approved"
      ? {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          ring: "ring-emerald-200",
        }
      : status === "rejected"
      ? { bg: "bg-rose-100", text: "text-rose-800", ring: "ring-rose-200" }
      : { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="md:flex md:items-start p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8">
          {/* Speaker Section */}
          <aside className="md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shadow-inner">
              <div className="w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  ></path>
                  <circle cx="12" cy="7" r="4" strokeWidth="1.5"></circle>
                </svg>
              </div>
            </div>

            <div className="mt-4 px-2 md:px-4">
              <div className="font-bold text-lg sm:text-xl text-gray-900">
                {speakerName}
              </div>
              <div className="mt-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                  Speaker
                </span>
              </div>

              <a
                href={
                  session.speakerLinkedIn ||
                  `https://www.linkedin.com/in/${(speakerName || "speaker")
                    .toLowerCase()
                    .replace(/\s+/g, "")}`
                }
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="hidden sm:inline">View LinkedIn</span>
                <span className="sm:hidden">LinkedIn</span>
              </a>
            </div>

            <div className="mt-4 px-2 md:px-4 text-sm text-gray-600 leading-relaxed">
              {session.speakerBio || "Speaker bio not provided."}
            </div>

            {session.speakerSkills && session.speakerSkills.length > 0 && (
              <div className="mt-4 px-2 md:px-4 w-full">
                <div className="text-xs text-gray-400 uppercase font-medium mb-2">
                  Skills
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {session.speakerSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 sm:px-2.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="md:flex-1 mt-4 md:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="pr-0 sm:pr-6 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                  {session.title}
                </h1>
                {session.subtitle && (
                  <div className="text-sm sm:text-base md:text-lg text-gray-500 mt-1">
                    {session.subtitle}
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="break-words">{when}</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="break-words">{where}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 font-medium capitalize ${statusProps.bg} ${statusProps.text} ${statusProps.ring} self-start`}
                  >
                    {status === "approved" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : status === "rejected" ? (
                      <XCircle className="w-4 h-4" />
                    ) : null}
                    <span>{status}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="break-words">
                      {(() => {
                        const sessionDate = session?.date?.toDate
                          ? session.date.toDate()
                          : new Date(session?.date);
                        const isUpcoming = sessionDate >= new Date();
                        const label = isUpcoming ? "participant" : "attendee";
                        const max = session?.maxAttendees;

                        if (max) {
                          return `${attendeeCount}/${max} ${label}${
                            attendeeCount === 1 ? "" : "s"
                          }`;
                        } else {
                          return `${attendeeCount} ${label}${
                            attendeeCount === 1 ? "" : "s"
                          }`;
                        }
                      })()}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200 self-start">
                    <span className="text-lg font-bold text-green-700">
                      {session?.price > 0 ? "₹" : ""}
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {session?.price > 0 ? session.price : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right self-start">
                <div className="text-xs text-gray-400 uppercase font-medium mb-1">
                  Approved by
                </div>
                {approverName && (
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-words">
                    {approverName}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Conducted by Team SkillBridge
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words">
              {session.description}
            </div>

            {session.status === "rejected" && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-700">
                <div className="font-semibold">Rejected</div>
                <div className="mt-1">
                  {session.rejectionReason || "No reason provided."}
                </div>
              </div>
            )}

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              {profile?.role === "faculty" ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    Role: faculty
                  </div>
                </div>
              ) : profile?.role === "student" ? (
                session.status === "completed" ? (
                  isRegistered ? (
                    <div className="px-4 sm:px-6 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
                      Attended
                    </div>
                  ) : (
                    <div className="px-4 sm:px-6 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium text-center">
                      Session Completed
                    </div>
                  )
                ) : isRegistered ? (
                  <button
                    onClick={handleUnregister}
                    disabled={processing}
                    className="px-4 sm:px-6 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {processing ? "Processing..." : "Unregister"}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={true}
                    className="px-4 sm:px-6 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {processing ? "Processing..." : "Registration Disabled"}
                  </button>
                )
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div className="text-sm font-medium text-amber-800 break-words">
                      {profile?.role
                        ? `Role: ${profile.role} (only students can register)`
                        : "Loading profile..."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attendees Display for Speakers and Faculty - Only for session owners */}
            {(profile?.role === "faculty" ||
              (profile?.role === "speaker" &&
                session.authorId === currentUser?.uid)) &&
              session.status === "approved" && (
                <div className="mt-6 sm:mt-8">
                  <AttendeesDisplay
                    sessionId={session.id}
                    sessionDate={session.date}
                  />
                </div>
              )}

            {/* Back to Sessions - positioned at the very end */}
            <div className="flex justify-center sm:justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
              <Link
                to="/sessions"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Sessions
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
