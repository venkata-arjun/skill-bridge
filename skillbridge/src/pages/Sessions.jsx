import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import SessionCard from "../shared/SessionCard";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useConfirmation } from "../contexts/ConfirmationContext";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  ListChecks,
  ThumbsUp,
  BookOpen,
  Tag,
  ChevronRight,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function Sessions() {
  const { currentUser, profile } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirmation } = useConfirmation();
  const [approvedSessions, setApprovedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [proposedSessions, setProposedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(new Set());
  const [userRegs, setUserRegs] = useState(new Set());
  const [ratings, setRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [upvotedSessions, setUpvotedSessions] = useState(new Set());

  // Double tap detection for mobile
  const [lastTap, setLastTap] = useState(0);

  const handleCardInteraction = (session) => {
    const currentTime = new Date().getTime();
    const tapGap = currentTime - lastTap;

    if (tapGap < 300 && tapGap > 0) {
      // Double interaction detected
      toggleUpvote(session);
      setLastTap(0); // Reset to prevent triple-clicks
    } else {
      // Single interaction - could navigate to session details or do nothing
      setLastTap(currentTime);
      // Clear the tap after a delay to prevent stale state
      setTimeout(() => setLastTap(0), 400);
    }
  };

  // Fetch sessions
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "sessions"),
      where("status", "in", ["approved", "completed", "proposed"]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => {
          const data = d.data();
          // Mark sessions as completed if they have passed their date
          if (data.status === "approved" && data.date) {
            const sessionDate = data.date.toDate
              ? data.date.toDate()
              : new Date(data.date);
            if (sessionDate < new Date()) {
              data.status = "completed";
            }
          }
          return { id: d.id, ...data };
        });

        // Separate sessions into proposed, approved and completed
        const proposed = arr
          .filter((s) => s.status === "proposed")
          .sort((a, b) => {
            // Sort by upvotes desc, then by createdAt desc
            const aUpvotes = a.upvotes || 0;
            const bUpvotes = b.upvotes || 0;
            if (aUpvotes !== bUpvotes) {
              return bUpvotes - aUpvotes;
            }
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return bTime - aTime;
          });
        const approved = arr
          .filter((s) => s.status === "approved")
          .sort((a, b) => {
            // Sort by upvotes desc, then by createdAt desc
            const aUpvotes = a.upvotes || 0;
            const bUpvotes = b.upvotes || 0;
            if (aUpvotes !== bUpvotes) {
              return bUpvotes - aUpvotes;
            }
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return bTime - aTime;
          });
        const completed = arr
          .filter((s) => s.status === "completed")
          .sort((a, b) => {
            // Sort by upvotes desc, then by createdAt desc
            const aUpvotes = a.upvotes || 0;
            const bUpvotes = b.upvotes || 0;
            if (aUpvotes !== bUpvotes) {
              return bUpvotes - aUpvotes;
            }
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return bTime - aTime;
          });

        setApprovedSessions(approved);
        setCompletedSessions(completed);
        setProposedSessions(proposed);
        setLoading(false);
      },
      (err) => {
        console.error("sessions snapshot error:", err);
        setError(err.message || "Failed to load sessions");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Watch user registrations
  useEffect(() => {
    if (!currentUser) {
      setUserRegs(new Set());
      return;
    }
    const q = query(
      collection(db, "registrations"),
      where("attendeeId", "==", currentUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const setIds = new Set(snap.docs.map((d) => d.data().sessionId));
        setUserRegs(setIds);
      },
      (err) => {
        console.error("user registrations listener error:", err);
        setUserRegs(new Set());
      }
    );
    return () => unsub();
  }, [currentUser]);
  useEffect(() => {
    if (!currentUser) {
      setUpvotedSessions(new Set());
      return;
    }
    const q = query(
      collection(db, "sessionUpvotes"),
      where("userId", "==", currentUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const setIds = new Set(snap.docs.map((d) => d.data().sessionId));
        setUpvotedSessions(setIds);
      },
      (err) => {
        console.error("user upvotes listener error:", err);
        setUpvotedSessions(new Set());
      }
    );
    return () => unsub();
  }, [currentUser]);

  // Fetch ratings
  useEffect(() => {
    const allSessions = [
      ...approvedSessions,
      ...completedSessions,
      ...proposedSessions,
    ];
    if (!allSessions || allSessions.length === 0) {
      setRatings({});
      return;
    }

    const q = query(collection(db, "feedback"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const ratingsData = {};
        snap.docs.forEach((doc) => {
          const data = doc.data();
          const sessionId = data.sessionId;
          if (!ratingsData[sessionId]) {
            ratingsData[sessionId] = { totalRating: 0, count: 0 };
          }
          ratingsData[sessionId].totalRating += data.rating;
          ratingsData[sessionId].count += 1;
        });

        const averages = {};
        Object.keys(ratingsData).forEach((sessionId) => {
          const { totalRating, count } = ratingsData[sessionId];
          averages[sessionId] = {
            averageRating: totalRating / count,
            ratingCount: count,
          };
        });

        setRatings(averages);
      },
      (err) => {
        console.error("ratings snapshot error:", err);
      }
    );

    return () => unsub();
  }, [approvedSessions, completedSessions, proposedSessions]);

  // Filtered sessions
  const filteredApprovedSessions = useMemo(() => {
    return approvedSessions.filter((session) => {
      const now = new Date();
      const sessionDate = session.date?.toDate
        ? session.date.toDate()
        : new Date(session.date);
      const isUpcoming = sessionDate > now;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          session.title?.toLowerCase().includes(term) ||
          session.description?.toLowerCase().includes(term) ||
          (session.tags &&
            session.tags.some((tag) => tag.toLowerCase().includes(term)));
        if (!matches) return false;
      }

      if (selectedFaculty && session.authorName !== selectedFaculty)
        return false;

      if (selectedDate) {
        const filterDate = new Date(selectedDate);
        const sessionDay = new Date(sessionDate);
        sessionDay.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        if (sessionDay.getTime() !== filterDate.getTime()) return false;
      }

      if (selectedStatus === "upcoming" && !isUpcoming) return false;
      if (selectedStatus === "completed") return false; // Don't show approved sessions in completed filter

      return true;
    });
  }, [
    approvedSessions,
    searchTerm,
    selectedFaculty,
    selectedDate,
    selectedStatus,
  ]);

  const filteredCompletedSessions = useMemo(() => {
    return completedSessions.filter((session) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          session.title?.toLowerCase().includes(term) ||
          session.description?.toLowerCase().includes(term) ||
          (session.tags &&
            session.tags.some((tag) => tag.toLowerCase().includes(term)));
        if (!matches) return false;
      }

      if (selectedFaculty && session.authorName !== selectedFaculty)
        return false;

      if (selectedDate) {
        const filterDate = new Date(selectedDate);
        const sessionDate = session.date?.toDate
          ? session.date.toDate()
          : new Date(session.date);
        const sessionDay = new Date(sessionDate);
        sessionDay.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        if (sessionDay.getTime() !== filterDate.getTime()) return false;
      }

      if (selectedStatus === "upcoming") return false; // Don't show completed sessions in upcoming filter
      if (selectedStatus === "completed") return true; // Show all completed sessions when completed is selected

      return selectedStatus === "" || selectedStatus === "completed";
    });
  }, [
    completedSessions,
    searchTerm,
    selectedFaculty,
    selectedDate,
    selectedStatus,
  ]);

  // Unique faculties
  const faculties = useMemo(() => {
    const allSessions = [
      ...approvedSessions,
      ...completedSessions,
      ...proposedSessions,
    ];
    const set = new Set(allSessions.map((s) => s.authorName).filter(Boolean));
    return Array.from(set).sort();
  }, [approvedSessions, completedSessions, proposedSessions]);

  // Register for a session
  async function register(session) {
    if (!currentUser) {
      showAlert("Please log in to register for sessions.", "warning");
      return;
    }
    if (profile?.role !== "student") {
      showAlert(
        "Only students can register. Sign up as a student or contact admin.",
        "warning"
      );
      return;
    }

    // Check if session is approved (available for registration)
    if (session.status !== "approved") {
      showAlert("This session is not available for registration.", "warning");
      return;
    }

    // Check if session has reached maximum attendees
    const currentCount = session.attendeeCount || 0;
    if (session.maxAttendees && currentCount >= session.maxAttendees) {
      showAlert(
        `This session has reached its maximum capacity of ${session.maxAttendees} attendees.`,
        "warning"
      );
      return;
    }

    // For students, handle free vs paid sessions differently
    const price = session.price || 0;

    if (price === 0) {
      // Free session - direct registration without confirmation
      setProcessing((prev) => new Set(prev).add(session.id));

      try {
        // Check session availability
        const snap = await getDoc(doc(db, "sessions", session.id));
        if (!snap.exists() || snap.data().status !== "approved") {
          showAlert(
            "This session is no longer available for registration.",
            "warning"
          );
          return;
        }

        // Create registration
        const regId = `${session.id}_${currentUser.uid}`;
        await setDoc(doc(db, "registrations", regId), {
          sessionId: session.id,
          attendeeId: currentUser.uid,
          attendeeName:
            profile?.displayName ||
            currentUser.displayName ||
            currentUser.email ||
            `User ${currentUser.uid.slice(0, 8)}`,
          attendeeEmail: currentUser.email,
          createdAt: serverTimestamp(),
          paymentAmount: price,
          paymentStatus: "completed",
          paymentDate: serverTimestamp(),
        });

        // Update attendee count
        const regsRef = collection(db, "registrations");
        const regsSnap = await getDocs(
          query(regsRef, where("sessionId", "==", session.id))
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
        await updateDoc(doc(db, "sessions", session.id), {
          attendeeCount: uniqueAttendees.size,
        });

        setUserRegs((prev) => new Set(prev).add(session.id));
        showAlert("Successfully registered for the session!", "success");
      } catch (err) {
        console.error("registration error:", err);
        showAlert("Failed to register: " + (err.message || "unknown"), "error");
      } finally {
        setProcessing((prev) => {
          const copy = new Set(prev);
          copy.delete(session.id);
          return copy;
        });
      }
    } else {
      // Paid session - show payment confirmation
      showAlert(
        `Register for <strong>${session.title}</strong><br><br>Payment: <strong style="font-size: 1.2em; color: #2563eb;">₹${price}</strong><br><br>Proceed with registration?`,
        "info",
        async () => {
          setProcessing((prev) => new Set(prev).add(session.id));

          try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Check session availability again after payment simulation
            const snap = await getDoc(doc(db, "sessions", session.id));
            if (!snap.exists() || snap.data().status !== "approved") {
              showAlert(
                "This session is no longer available for registration.",
                "warning"
              );
              return;
            }

            // Create registration
            const regId = `${session.id}_${currentUser.uid}`;
            await setDoc(doc(db, "registrations", regId), {
              sessionId: session.id,
              attendeeId: currentUser.uid,
              attendeeName:
                profile?.displayName ||
                currentUser.displayName ||
                currentUser.email ||
                `User ${currentUser.uid.slice(0, 8)}`,
              attendeeEmail: currentUser.email,
              createdAt: serverTimestamp(),
              paymentAmount: price,
              paymentStatus: "completed",
              paymentDate: serverTimestamp(),
            });

            // Update attendee count
            const regsRef = collection(db, "registrations");
            const regsSnap = await getDocs(
              query(regsRef, where("sessionId", "==", session.id))
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
            const uniqueAttendees = new Set(
              regs.map((r) => r.attendeeId.trim())
            );
            await updateDoc(doc(db, "sessions", session.id), {
              attendeeCount: uniqueAttendees.size,
            });

            setUserRegs((prev) => new Set(prev).add(session.id));
            showAlert(
              `Registration successful! Payment of ₹${price} processed.`,
              "success"
            );
          } catch (err) {
            console.error("registration error:", err);
            showAlert(
              "Failed to register: " + (err.message || "unknown"),
              "error"
            );
          } finally {
            setProcessing((prev) => {
              const copy = new Set(prev);
              copy.delete(session.id);
              return copy;
            });
          }
        }
      );
    }
  }

  // Toggle upvote for a session (upvotes are permanent)
  async function toggleUpvote(session) {
    if (!currentUser) {
      showAlert("Please log in to upvote sessions.", "warning");
      return;
    }

    const upvoteId = `${session.id}_${currentUser.uid}`;
    const isUpvoted = upvotedSessions.has(session.id);

    try {
      if (isUpvoted) {
        // User has already upvoted - upvotes are permanent, can't remove
        showAlert(
          "You have already upvoted this session. Upvotes cannot be removed.",
          "info"
        );
        return;
      } else {
        // Add upvote (permanent)
        await setDoc(doc(db, "sessionUpvotes", upvoteId), {
          sessionId: session.id,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "sessions", session.id), {
          upvotes: increment(1),
        });
        setUpvotedSessions((prev) => new Set(prev).add(session.id));
        showAlert("Session upvoted successfully!", "success");
      }
    } catch (err) {
      console.error("upvote error:", err);
      if (err.code === "permission-denied") {
        showAlert("You have already upvoted this session.", "info");
      } else {
        showAlert("Failed to upvote session.", "error");
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Available Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse upcoming sessions and view completed sessions
          </p>
        </div>

        {currentUser && profile?.role === "student" ? (
          <Link
            to="/dashboard/student"
            className="text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto text-center"
          >
            My Registrations
          </Link>
        ) : currentUser ? null : (
          <Link
            to="/login"
            className="text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto text-center"
          >
            Login to Register
          </Link>
        )}
      </div>

      {/* Filter UI */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, description, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
            />
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedFaculty("");
                setSelectedDate("");
                setSelectedStatus("");
                setShowMobileFilters(false);
              }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <div className="hidden md:flex gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm focus:outline-none"
                />
              </div>

              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-w-48 truncate"
              >
                <option value="">All Faculties</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty.length > 20
                      ? faculty.substring(0, 20) + "..."
                      : faculty}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                aria-expanded={showMobileFilters}
                aria-controls="mobile-filters"
              >
                <ListChecks className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile filter dropdown */}
        {showMobileFilters && (
          <div
            id="mobile-filters"
            className="mt-4 md:hidden grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full"
            >
              <option value="">All Faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty.length > 25
                    ? faculty.substring(0, 25) + "..."
                    : faculty}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex-1"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex-1"
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-lg mb-4 sm:mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 sm:p-6 bg-white rounded-xl shadow-sm animate-pulse"
            >
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 sm:mb-3"></div>
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-full mb-2 sm:mb-3"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {/* Proposed Sessions */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Student Suggested Topics
              </h2>
            </div>

            {proposedSessions.length === 0 ? (
              <div className="text-gray-500 p-6 bg-white rounded-lg border shadow-sm text-center">
                No student suggested topics yet.
              </div>
            ) : (
              <>
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Top Suggested Topics
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          Most upvoted student suggestions
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {proposedSessions.length} total
                    </div>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {proposedSessions.slice(0, 3).map((s, index) => {
                    const isUpvoted = upvotedSessions.has(s.id);
                    const upvoteCount = s.upvotes || 0;
                    return (
                      <div
                        key={s.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg flex flex-col h-full"
                        onClick={() => handleCardInteraction(s)}
                        onDoubleClick={() => toggleUpvote(s)}
                      >
                        {/* Rank and Title */}
                        <div className="flex items-start gap-3 mb-3 flex-1">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-base mb-1 hover:text-blue-700 transition-colors">
                              {s.title}
                            </h4>
                            {s.description && (
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {s.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                          <div className="text-xs text-gray-500 font-medium">
                            Suggested
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              toggleUpvote(s);
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <ThumbsUp
                              className={`w-4 h-4 ${
                                isUpvoted ? "text-blue-600" : "text-gray-400"
                              }`}
                              fill={isUpvoted ? "currentColor" : "none"}
                            />
                            <span
                              className={`font-semibold ${
                                isUpvoted ? "text-blue-700" : "text-gray-600"
                              }`}
                            >
                              {upvoteCount}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View More Button */}
                {proposedSessions.length > 3 && (
                  <div className="mt-6 text-center">
                    <Link
                      to="/suggested-topics"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                      View More
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Upcoming/Approved Sessions */}
          {(selectedStatus === "" || selectedStatus === "upcoming") && (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Upcoming Sessions
                </h2>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full self-start">
                  {filteredApprovedSessions.length} sessions
                </div>
              </div>

              {filteredApprovedSessions.length === 0 ? (
                <div className="text-gray-500 p-4 sm:p-6 bg-white rounded-xl shadow-sm text-center">
                  No upcoming sessions match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                  {filteredApprovedSessions.map((s) => {
                    const isRegistered = currentUser
                      ? userRegs.has(s.id)
                      : false;
                    const count = s.attendeeCount || 0;
                    const sessionRatings = ratings[s.id];
                    const canRegister =
                      currentUser && profile?.role === "student";
                    const isProcessing = processing.has(s.id);
                    return (
                      <SessionCard
                        key={s.id}
                        session={{
                          ...s,
                          attendeeCount: count,
                          averageRating: sessionRatings?.averageRating,
                          ratingCount: sessionRatings?.ratingCount,
                        }}
                        showRating={true}
                        isRegistered={isRegistered}
                        isProcessing={isProcessing}
                        onRegister={register}
                        canRegister={canRegister}
                        showUnregisterButton={false}
                        showUpvote={false}
                        isUpvoted={upvotedSessions.has(s.id)}
                        onToggleUpvote={toggleUpvote}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Completed Sessions */}
          {(selectedStatus === "" || selectedStatus === "completed") && (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Completed Sessions
                </h2>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full self-start">
                  {filteredCompletedSessions.length} sessions
                </div>
              </div>

              {filteredCompletedSessions.length === 0 ? (
                <div className="text-gray-500 p-4 sm:p-6 bg-white rounded-xl shadow-sm text-center">
                  No completed sessions match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                  {filteredCompletedSessions.map((s) => {
                    const isRegistered = currentUser
                      ? userRegs.has(s.id)
                      : false;
                    const count = s.attendeeCount || 0;
                    const sessionRatings = ratings[s.id];
                    const canRegister = false; // Can't register for completed sessions
                    const isProcessing = processing.has(s.id);
                    return (
                      <SessionCard
                        key={s.id}
                        session={{
                          ...s,
                          attendeeCount: count,
                          averageRating: sessionRatings?.averageRating,
                          ratingCount: sessionRatings?.ratingCount,
                        }}
                        showRating={true}
                        isRegistered={isRegistered}
                        isProcessing={isProcessing}
                        onRegister={register}
                        canRegister={canRegister}
                        showUnregisterButton={false}
                        showUpvote={false}
                        isUpvoted={upvotedSessions.has(s.id)}
                        onToggleUpvote={toggleUpvote}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* No sessions message when both sections are empty */}
          {filteredApprovedSessions.length === 0 &&
            filteredCompletedSessions.length === 0 && (
              <div className="text-gray-500 p-4 sm:p-6 bg-white rounded-xl shadow-sm text-center">
                No sessions match your filters.
              </div>
            )}
        </div>
      )}
    </div>
  );
}
