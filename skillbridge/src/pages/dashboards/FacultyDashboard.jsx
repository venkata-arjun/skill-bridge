// src/pages/dashboards/FacultyDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import RatingsDisplay from "../../components/RatingsDisplay";
import FacultyApprovalModal from "../../components/FacultyApprovalModal";
import FinalApprovalModal from "../../components/FinalApprovalModal";

/**
 * FacultyDashboard with approvals history and rejected history
 */
export default function FacultyDashboard() {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirmation } = useConfirmation();

  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [finalizedProposals, setFinalizedProposals] = useState([]);
  const [finalApprovedProposals, setFinalApprovedProposals] = useState([]);
  const [finalDisapprovedProposals, setFinalDisapprovedProposals] = useState(
    []
  );
  const [rejected, setRejected] = useState([]);
  const [speakerProposals, setSpeakerProposals] = useState([]);
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [loadingCompletedInterviews, setLoadingCompletedInterviews] =
    useState(true);
  const [loadingFinalizedProposals, setLoadingFinalizedProposals] =
    useState(true);
  const [loadingRejected, setLoadingRejected] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingApprovedProposals, setLoadingApprovedProposals] =
    useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [selected, setSelected] = useState(new Set()); // for bulk ops on pending
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sessions");

  // Rejection form state
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionTargetId, setRejectionTargetId] = useState(null);

  // Approval confirmation state
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [approvalTargetId, setApprovalTargetId] = useState(null);

  // Modals for speaker proposals
  const [facultyApprovalModal, setFacultyApprovalModal] = useState({
    isOpen: false,
    student: null,
    action: null,
  });
  const [finalApprovalModal, setFinalApprovalModal] = useState({
    isOpen: false,
    student: null,
    action: null,
  });

  useEffect(() => {
    if (!currentUser) return;

    // pending sessions
    const qPending = query(
      collection(db, "sessions"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")
    );
    const unsubPending = onSnapshot(
      qPending,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPending(arr);
        setLoadingPending(false);
      },
      (err) => {
        console.error("pending sessions snapshot error:", err);
        setError(err.message || "Failed to load pending sessions");
        setLoadingPending(false);
      }
    );

    // approved history (most recent first)
    const qApproved = query(
      collection(db, "sessions"),
      where("status", "==", "approved"),
      orderBy("approvedAt", "desc")
    );
    const unsubApproved = onSnapshot(
      qApproved,
      (snap) => {
        const arr = snap.docs.map((d) => {
          const data = d.data();
          // Mark sessions as completed if they have passed their date
          if (data.date) {
            const sessionDate = data.date.toDate
              ? data.date.toDate()
              : new Date(data.date);
            if (sessionDate < new Date()) {
              data.status = "completed";
            }
          }
          return { id: d.id, ...data };
        });
        // Separate completed from approved
        const approvedArr = arr.filter((s) => s.status === "approved");
        const completedArr = arr.filter((s) => s.status === "completed");
        setApproved(approvedArr);
        setCompleted(completedArr);
        setLoadingApproved(false);
        setLoadingCompleted(false);
      },
      (err) => {
        console.error("approved sessions snapshot error:", err);
        setError(err.message || "Failed to load approved sessions");
        setLoadingApproved(false);
        setLoadingCompleted(false);
      }
    );

    // rejected history (most recent first) — new
    const qRejected = query(
      collection(db, "sessions"),
      where("status", "==", "rejected"),
      orderBy("approvedAt", "desc")
    );
    const unsubRejected = onSnapshot(
      qRejected,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRejected(arr);
        setLoadingRejected(false);
      },
      (err) => {
        console.error("rejected sessions snapshot error:", err);
        setError(err.message || "Failed to load rejected sessions");
        setLoadingRejected(false);
      }
    );

    // speaker proposals (pending approval)
    const qProposals = query(
      collection(db, "speakerProposals"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")
    );
    const unsubProposals = onSnapshot(
      qProposals,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSpeakerProposals(arr);
        setLoadingProposals(false);
      },
      (err) => {
        console.error("speaker proposals snapshot error:", err);
        setError(err.message || "Failed to load speaker proposals");
        setLoadingProposals(false);
      }
    );

    // approved speaker proposals (for final approval)
    const qApprovedProposals = query(
      collection(db, "speakerProposals"),
      where("status", "==", "approved"),
      orderBy("createdAt", "asc")
    );
    const unsubApprovedProposals = onSnapshot(
      qApprovedProposals,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setApprovedProposals(arr);
        setLoadingApprovedProposals(false);
      },
      (err) => {
        console.error("approved speaker proposals snapshot error:", err);
        setError(err.message || "Failed to load approved speaker proposals");
        setLoadingApprovedProposals(false);
      }
    );

    // completed interviews (scheduled proposals that have passed their interview time)
    const qCompletedInterviews = query(
      collection(db, "speakerProposals"),
      where("status", "==", "scheduled"),
      orderBy("createdAt", "asc")
    );
    const unsubCompletedInterviews = onSnapshot(
      qCompletedInterviews,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Filter for interviews that have passed but are not yet finalized
        const now = new Date();
        const completedInterviewsArr = arr.filter((proposal) => {
          if (!proposal.interviewDate || !proposal.interviewTime) return false;

          // Use interviewTimestamp if available, otherwise parse the string
          let interviewDateTime;
          if (
            proposal.interviewTimestamp &&
            proposal.interviewTimestamp.toDate
          ) {
            interviewDateTime = proposal.interviewTimestamp.toDate();
          } else {
            try {
              interviewDateTime = new Date(
                `${proposal.interviewDate} ${proposal.interviewTime}`
              );
            } catch (error) {
              console.warn("Error parsing interview date/time:", error);
              return false;
            }
          }
          return interviewDateTime < now; // Only show past interviews that aren't finalized
        });
        setCompletedInterviews(completedInterviewsArr);
        setLoadingCompletedInterviews(false);
      },
      (err) => {
        console.error("completed interviews snapshot error:", err);
        setError(err.message || "Failed to load completed interviews");
        setLoadingCompletedInterviews(false);
      }
    );

    // finalized proposals (already given final approval or rejection)
    // Use separate simple queries to avoid compound index requirement

    // Query for final approved proposals
    const qFinalApproved = query(
      collection(db, "speakerProposals"),
      where("status", "==", "final_approved")
    );
    const unsubFinalApproved = onSnapshot(
      qFinalApproved,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFinalApprovedProposals(arr);
      },
      (err) => {
        console.error("final approved proposals snapshot error:", err);
      }
    );

    // Query for final disapproved proposals
    const qFinalDisapproved = query(
      collection(db, "speakerProposals"),
      where("status", "==", "final_disapproved")
    );
    const unsubFinalDisapproved = onSnapshot(
      qFinalDisapproved,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFinalDisapprovedProposals(arr);
      },
      (err) => {
        console.error("final disapproved proposals snapshot error:", err);
      }
    );

    return () => {
      unsubPending();
      unsubApproved();
      unsubRejected();
      unsubProposals();
      unsubApprovedProposals();
      unsubCompletedInterviews();
      unsubFinalApproved();
      unsubFinalDisapproved();
    };
  }, [currentUser]);

  // Combine finalized proposals when either changes
  useEffect(() => {
    const combinedArr = [
      ...finalApprovedProposals,
      ...finalDisapprovedProposals,
    ].sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return bTime - aTime;
    });
    setFinalizedProposals(combinedArr);
    setLoadingFinalizedProposals(false);
  }, [finalApprovedProposals, finalDisapprovedProposals]);

  // toggle selection for bulk ops
  function toggleSelect(id) {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  // Robust setSessionStatus with logging + alert on failure
  async function setSessionStatus(sessionId, newStatus, reason = null) {
    setError("");
    setProcessingIds((prev) => new Set(prev).add(sessionId));
    try {
      const ref = doc(db, "sessions", sessionId);
      const updatePayload = {
        status: newStatus,
        approvedBy:
          newStatus === "approved"
            ? currentUser.uid
            : newStatus === "rejected"
            ? currentUser.uid
            : null,
        approvedAt:
          newStatus === "approved"
            ? serverTimestamp()
            : newStatus === "rejected"
            ? serverTimestamp()
            : null,
      };

      // Set or clear rejectionReason explicitly
      if (newStatus === "rejected") {
        updatePayload.rejectionReason = reason || "";
      } else {
        // remove rejectionReason (set to null) on approve
        updatePayload.rejectionReason = null;
      }

      await updateDoc(ref, updatePayload);
    } catch (err) {
      console.error("update session status error:", err);
      setError(err.message || "Failed to update session");
      showAlert(
        "Unable to update session: " + (err.message || "unknown error")
      );
    } finally {
      setProcessingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(sessionId);
        return copy;
      });
    }
  }

  async function bulkApprove() {
    if (selected.size === 0) return;
    showConfirmation(
      `Are you sure you want to approve ${selected.size} selected session${
        selected.size !== 1 ? "s" : ""
      }?`,
      async () => {
        setError("");
        const ids = Array.from(selected);
        const batch = writeBatch(db);
        try {
          ids.forEach((id) => {
            const ref = doc(db, "sessions", id);
            batch.update(ref, {
              status: "approved",
              approvedBy: currentUser.uid,
              approvedAt: serverTimestamp(),
              rejectionReason: null,
            });
          });
          await batch.commit();
          showAlert(
            `${selected.size} sessions approved successfully!`,
            "success"
          );
          setSelected(new Set());
        } catch (err) {
          console.error("bulk approve error:", err);
          setError(err.message || "Bulk approve failed");
          showAlert("Bulk approve failed: " + (err.message || "unknown"));
        }
      },
      () => {}, // Cancel callback (do nothing)
      "Approve All",
      "Cancel"
    );
  }

  async function bulkReject() {
    if (selected.size === 0) return;
    setError("");
    const ids = Array.from(selected);
    const batch = writeBatch(db);
    try {
      ids.forEach((id) => {
        const ref = doc(db, "sessions", id);
        batch.update(ref, {
          status: "rejected",
          rejectionReason: "Bulk rejected by faculty",
          approvedBy: currentUser.uid,
          approvedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      showAlert(`${selected.size} sessions rejected.`, "warning");
      setSelected(new Set());
    } catch (err) {
      console.error("bulk reject error:", err);
      setError(err.message || "Bulk reject failed");
      showAlert("Bulk reject failed: " + (err.message || "unknown"));
    }
  }

  // Rejection form handlers
  const handleRejectClick = (sessionId) => {
    setRejectionTargetId(sessionId);
    setRejectionReason("");
    setShowRejectionForm(true);
  };

  const handleRejectionSubmit = async () => {
    if (!rejectionTargetId) return;
    const reason = rejectionReason.trim() || "Rejected by faculty";
    setShowRejectionForm(false);
    showAlert("Session rejected.", "warning");
    await setSessionStatus(rejectionTargetId, "rejected", reason);
    setRejectionTargetId(null);
    setRejectionReason("");
  };

  const handleRejectionCancel = () => {
    setShowRejectionForm(false);
    setRejectionTargetId(null);
    setRejectionReason("");
  };

  // Approval confirmation handlers
  const handleApproveClick = (sessionId) => {
    setApprovalTargetId(sessionId);
    setShowApprovalConfirm(true);
  };

  const handleApprovalConfirm = async () => {
    if (!approvalTargetId) return;
    setShowApprovalConfirm(false);
    showAlert("Session approved successfully!", "success");
    await setSessionStatus(approvalTargetId, "approved");
    setApprovalTargetId(null);
  };

  const handleApprovalCancel = () => {
    setShowApprovalConfirm(false);
    setApprovalTargetId(null);
  };

  // helper to resolve approvedBy uid -> displayName (small cached map)
  const [userCache, setUserCache] = useState({});
  async function resolveUser(uid) {
    if (!uid) return null;
    if (userCache[uid]) return userCache[uid];
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserCache((prev) => ({
          ...prev,
          [uid]: data.displayName || data.email || uid,
        }));
        return data.displayName || data.email || uid;
      } else {
        setUserCache((prev) => ({ ...prev, [uid]: uid }));
        return uid;
      }
    } catch (err) {
      console.error("resolveUser error:", err);
      return uid;
    }
  }

  // SimpleRatingDisplay component for approved sessions
  function SimpleRatingDisplay({ sessionId }) {
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const q = query(
        collection(db, "feedback"),
        where("sessionId", "==", sessionId)
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const feedbackData = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setReviewCount(feedbackData.length);

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
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          Loading rating...
        </div>
      );
    }

    if (reviewCount === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-5 h-5 text-gray-300">★</div>
          <span>No ratings yet</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={
                i < Math.round(averageRating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500">
          ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
        </span>
      </div>
    );
  }

  // RejectedRow component
  function RejectedRow({ s }) {
    const [approverName, setApproverName] = useState(s.approvedBy || "—");

    useEffect(() => {
      let mounted = true;
      if (s.approvedBy) {
        resolveUser(s.approvedBy).then((name) => {
          if (mounted) setApproverName(name || s.approvedBy);
        });
      }
      return () => {
        mounted = false;
      };
    }, [s.approvedBy]);

    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {s.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Rejected
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
              {s.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">{s.authorName}</span>
              </div>

              {s.date && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
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
                  <span className="truncate">
                    {s.date.toDate
                      ? s.date.toDate().toLocaleDateString()
                      : s.date}
                  </span>
                </div>
              )}

              {s.tags && s.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="truncate">{s.tags.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-red-800 mb-1">
                    Rejection Reason
                  </h5>
                  <p className="text-xs sm:text-sm text-red-700">
                    {s.rejectionReason
                      ? s.rejectionReason
                      : "No reason provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 sm:pt-4">
              <div className="text-right text-xs text-gray-500">
                <div>
                  Rejected by{" "}
                  <span className="font-medium text-gray-700">
                    {approverName}
                  </span>
                </div>
                <div>
                  {s.approvedAt
                    ? s.approvedAt.toDate
                      ? s.approvedAt.toDate().toLocaleDateString()
                      : s.approvedAt
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CompletedInterviewRow component
  function CompletedInterviewRow({ proposal }) {
    const [studentName, setStudentName] = useState(proposal.name || "—");

    useEffect(() => {
      let mounted = true;
      if (proposal.studentId) {
        resolveUser(proposal.studentId).then((name) => {
          if (mounted) setStudentName(name || proposal.name || "—");
        });
      }
      return () => {
        mounted = false;
      };
    }, [proposal.studentId, proposal.name]);

    const handleFinalApproval = (action) => {
      // Add to processing IDs to disable buttons
      setProcessingIds((prev) => new Set(prev).add(proposal.id));

      setFinalApprovalModal({
        isOpen: true,
        student: {
          studentId: proposal.studentId,
          name: studentName,
          email: proposal.email,
        },
        action: action,
        id: proposal.id,
      });
    };

    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                Speaker Proposal: {proposal.name}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  Interview Completed
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
              {proposal.resume ? (
                <a
                  href={proposal.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  📄 Resume
                </a>
              ) : (
                "No resume provided"
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">{studentName}</span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
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
                <span className="truncate">
                  {proposal.interviewDate} at {proposal.interviewTime}
                </span>
              </div>

              {proposal.interviewVenue && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">{proposal.interviewVenue}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 sm:pt-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => handleFinalApproval("approve")}
                  disabled={
                    processingIds.has(proposal.id) ||
                    proposal.status === "final_approved" ||
                    proposal.status === "final_disapproved"
                  }
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingIds.has(proposal.id) ? (
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {proposal.status === "final_approved"
                    ? "Already Approved"
                    : proposal.status === "final_disapproved"
                    ? "Already Rejected"
                    : "Final Approve"}
                </button>
                <button
                  onClick={() => handleFinalApproval("disapprove")}
                  disabled={
                    processingIds.has(proposal.id) ||
                    proposal.status === "final_approved" ||
                    proposal.status === "final_disapproved"
                  }
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingIds.has(proposal.id) ? (
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
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
                  )}
                  {proposal.status === "final_approved"
                    ? "Already Approved"
                    : proposal.status === "final_disapproved"
                    ? "Already Rejected"
                    : "Final Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FinalizedProposalRow component - shows completed approvals without action buttons
  function FinalizedProposalRow({ proposal }) {
    const [studentName, setStudentName] = useState(proposal.name || "—");

    useEffect(() => {
      let mounted = true;
      if (proposal.studentId) {
        resolveUser(proposal.studentId).then((name) => {
          if (mounted) setStudentName(name || proposal.name || "—");
        });
      }
      return () => {
        mounted = false;
      };
    }, [proposal.studentId, proposal.name]);

    const getStatusDisplay = () => {
      if (proposal.status === "final_approved") {
        return {
          label: "Final Approved",
          bg: "bg-green-100",
          text: "text-green-800",
          icon: (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        };
      } else if (proposal.status === "final_disapproved") {
        return {
          label: "Final Rejected",
          bg: "bg-red-100",
          text: "text-red-800",
          icon: (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
        };
      }
      return {
        label: "Unknown",
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: null,
      };
    };

    const statusDisplay = getStatusDisplay();

    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                Speaker Proposal: {proposal.name}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusDisplay.bg} ${statusDisplay.text}`}
                >
                  {statusDisplay.icon}
                  {statusDisplay.label}
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
              {proposal.resume ? (
                <a
                  href={proposal.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  📄 Resume
                </a>
              ) : (
                "No resume provided"
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">{studentName}</span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
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
                <span className="truncate">
                  {proposal.interviewDate} at {proposal.interviewTime}
                </span>
              </div>

              {proposal.interviewVenue && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">{proposal.interviewVenue}</span>
                </div>
              )}
            </div>

            {/* Show disapproval message if rejected */}
            {proposal.status === "final_disapproved" &&
              proposal.disapprovalMessage && (
                <div className="border-t border-gray-100 pt-3 sm:pt-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-red-800 mb-1">
                      Disapproval Reason:
                    </h5>
                    <p className="text-sm text-red-700">
                      {proposal.disapprovalMessage}
                    </p>
                  </div>
                </div>
              )}

            {/* No action buttons for finalized proposals */}
          </div>
        </div>
      </div>
    );
  }

  // ApprovedRow component
  function ApprovedRow({ s }) {
    const [approverName, setApproverName] = useState(s.approvedBy || "—");

    useEffect(() => {
      let mounted = true;
      if (s.approvedBy) {
        resolveUser(s.approvedBy).then((name) => {
          if (mounted) setApproverName(name || s.approvedBy);
        });
      }
      return () => {
        mounted = false;
      };
    }, [s.approvedBy]);

    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {s.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Approved
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
              {s.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">{s.authorName}</span>
              </div>

              {s.date && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
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
                  <span className="truncate">
                    {s.date.toDate
                      ? s.date.toDate().toLocaleDateString()
                      : s.date}
                  </span>
                </div>
              )}

              {s.tags && s.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="truncate">{s.tags.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <SimpleRatingDisplay sessionId={s.id} />
                </div>
                <div className="text-left sm:text-right text-xs text-gray-500">
                  <div>
                    Approved by{" "}
                    <span className="font-medium text-gray-700">
                      {approverName}
                    </span>
                  </div>
                  <div>
                    {s.approvedAt
                      ? s.approvedAt.toDate
                        ? s.approvedAt.toDate().toLocaleDateString()
                        : s.approvedAt
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 sm:space-y-10">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Faculty Dashboard
                </h1>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl">
                  Review and manage session proposals from speakers across the
                  platform with elegance and precision.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-yellow-800">
                    {pending.length} Pending
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-800">
                    {approved.length} Approved
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-purple-800">
                    {finalizedProposals.length} Finalized
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-red-800">
                    {rejected.length} Rejected
                  </span>
                </div>
              </div>
            </div>

            {selected.size > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-blue-900">
                      <strong className="text-lg">{selected.size}</strong>{" "}
                      session{selected.size !== 1 ? "s" : ""} selected for bulk
                      actions
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={bulkApprove}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Approve All
                    </button>
                    <button
                      onClick={bulkReject}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Reject All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeTab === "sessions" && (
            <>
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-red-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Error Occurred
                      </h3>
                      <p className="text-red-700 text-sm leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className={`px-4 py-2 rounded ${
                      activeTab === "sessions"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Sessions
                  </button>
                  <button
                    onClick={() => setActiveTab("proposals")}
                    className={`px-4 py-2 rounded ${
                      activeTab === "proposals"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Speaker Proposals
                  </button>
                </nav>
              </div>

              {/* Pending section */}
              {activeTab === "sessions" && (
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          Pending Sessions
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base mt-1">
                          Review and approve session proposals
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-sm font-bold rounded-full border border-yellow-200 shadow-sm">
                      {pending.length} pending
                    </div>
                  </div>

                  {loadingPending ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Loading Sessions
                          </h3>
                          <span className="text-gray-600 text-sm">
                            Fetching pending sessions...
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : pending.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            All Caught Up!
                          </h3>
                          <p className="text-gray-600 text-base leading-relaxed">
                            No sessions are currently waiting for review.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6">
                      {pending.map((session) => {
                        const processing = processingIds.has(session.id);
                        return (
                          <div
                            key={session.id}
                            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                      {session.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <svg
                                        className="w-4 h-4 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                      <span className="truncate">
                                        {session.authorName}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                    <div className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-medium rounded-full">
                                      Pending Review
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={selected.has(session.id)}
                                      onChange={() => toggleSelect(session.id)}
                                      className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>

                                <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                                  {session.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                                  {session.tags && session.tags.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                      </svg>
                                      <span className="truncate">
                                        {session.tags.join(", ")}
                                      </span>
                                    </div>
                                  )}

                                  {session.date && (
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
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
                                      <span className="truncate">
                                        {session.date.toDate
                                          ? session.date
                                              .toDate()
                                              .toLocaleDateString()
                                          : session.date}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1">
                                    <svg
                                      className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="truncate">
                                      Created{" "}
                                      {session.createdAt
                                        ? session.createdAt.toDate
                                          ? session.createdAt
                                              .toDate()
                                              .toLocaleDateString()
                                          : session.createdAt
                                        : "recently"}
                                    </span>
                                  </div>
                                </div>

                                <RatingsDisplay sessionId={session.id} />
                              </div>

                              <div className="flex-shrink-0 flex flex-row sm:flex-col gap-2 sm:gap-3 lg:flex-col">
                                <button
                                  disabled={processing}
                                  onClick={() => handleApproveClick(session.id)}
                                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
                                >
                                  {processing ? (
                                    <>
                                      <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span className="hidden sm:inline">
                                        Processing...
                                      </span>
                                      <span className="sm:hidden">...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      <span>Approve</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  disabled={processing}
                                  onClick={() => handleRejectClick(session.id)}
                                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
                                >
                                  <svg
                                    className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0"
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
                                  <span>Reject</span>
                                </button>
                              </div>

                              {/* Rejection Modal */}
                              {showRejectionForm && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                  <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200">
                                    {/* Header */}
                                    <div className="bg-red-500 text-white p-4 rounded-t-lg">
                                      <h3 className="text-lg font-semibold">
                                        Reject Session
                                      </h3>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason
                                          </label>
                                          <textarea
                                            value={rejectionReason}
                                            onChange={(e) =>
                                              setRejectionReason(e.target.value)
                                            }
                                            placeholder="Enter reason for rejection..."
                                            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                            rows={3}
                                            autoFocus
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 pb-6 flex justify-end gap-3">
                                      <button
                                        onClick={handleRejectionCancel}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleRejectionSubmit}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                                      >
                                        Reject Session
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Approval Confirmation Modal */}
                              {showApprovalConfirm && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                  <div className="bg-white rounded-lg max-w-sm w-full shadow-xl border border-gray-200">
                                    {/* Header */}
                                    <div className="bg-green-500 text-white p-4 rounded-t-lg">
                                      <h3 className="text-lg font-semibold">
                                        Approve Session
                                      </h3>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                      <p className="text-gray-700 text-center">
                                        Are you sure you want to approve this
                                        session? This action cannot be undone.
                                      </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 pb-6 flex justify-end gap-3">
                                      <button
                                        onClick={handleApprovalCancel}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleApprovalConfirm}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                                      >
                                        Approve
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {activeTab === "proposals" && (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Speaker Proposals
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Review student proposals for speaker roles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                    {speakerProposals.length} pending
                  </div>
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {approvedProposals.length} approved
                  </div>
                </div>
              </div>

              {loadingProposals ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : speakerProposals.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Pending Proposals
                  </h3>
                  <p className="text-gray-600">
                    All speaker proposals have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {speakerProposals.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      <p>Email: {p.email}</p>
                      <p>Year: {p.year}</p>
                      <p>
                        Resume:{" "}
                        <a
                          href={p.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Resume
                        </a>
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() =>
                            showConfirmation(
                              `Are you sure you want to approve ${p.name}'s speaker proposal?`,
                              () => {
                                // When confirmed, show the interview details modal
                                setFacultyApprovalModal({
                                  isOpen: true,
                                  student: p,
                                  action: "approve",
                                  id: p.id,
                                });
                              },
                              () => {}, // Cancel callback (do nothing)
                              "Yes, Proceed",
                              "Cancel"
                            )
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setFacultyApprovalModal({
                              isOpen: true,
                              student: p,
                              action: "reject",
                              id: p.id,
                            })
                          }
                          className="px-4 py-2 bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Approved Proposals for Final Approval */}
              {loadingApprovedProposals ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : approvedProposals.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Approved Proposals
                  </h3>
                  <p className="text-gray-600">
                    No proposals have been approved yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {approvedProposals.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      <p>Email: {p.email}</p>
                      <p>Year: {p.year}</p>
                      <p>
                        Interview: {p.interviewDate} at {p.interviewTime},{" "}
                        {p.interviewVenue}
                      </p>
                      <p>
                        Resume:{" "}
                        <a
                          href={p.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Resume
                        </a>
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() =>
                            setFinalApprovalModal({
                              isOpen: true,
                              student: p,
                              action: "approve",
                              id: p.id,
                            })
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                          Final Approve
                        </button>
                        <button
                          onClick={() =>
                            setFinalApprovalModal({
                              isOpen: true,
                              student: p,
                              action: "disapprove",
                              id: p.id,
                            })
                          }
                          className="px-4 py-2 bg-red-500 text-white rounded"
                        >
                          Disapprove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <FacultyApprovalModal
            isOpen={facultyApprovalModal.isOpen}
            onClose={() =>
              setFacultyApprovalModal({
                isOpen: false,
                student: null,
                action: null,
                id: null,
              })
            }
            student={facultyApprovalModal.student}
            action={facultyApprovalModal.action}
            id={facultyApprovalModal.id}
          />
          <FinalApprovalModal
            isOpen={finalApprovalModal.isOpen}
            onClose={() => {
              // Remove from processing IDs when modal closes
              if (finalApprovalModal.id) {
                setProcessingIds((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(finalApprovalModal.id);
                  return newSet;
                });
              }
              setFinalApprovalModal({
                isOpen: false,
                student: null,
                action: null,
                id: null,
              });
            }}
            student={finalApprovalModal.student}
            action={finalApprovalModal.action}
            id={finalApprovalModal.id}
          />

          {/* Approved history section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Approved Sessions
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 text-xs sm:text-sm font-medium rounded-full w-fit">
                {approved.length} approved
              </div>
            </div>

            {loadingApproved ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">
                    Loading approved sessions...
                  </span>
                </div>
              </div>
            ) : approved.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center">
                  <svg
                    className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No approved sessions
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Approved sessions will appear here once you start approving
                    proposals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {approved.map((s) => (
                  <ApprovedRow key={s.id} s={s} />
                ))}
              </div>
            )}
          </section>

          {/* Completed Interviews section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Completed Interviews
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium rounded-full w-fit">
                {completedInterviews.length} pending final approval
              </div>
            </div>

            {loadingCompletedInterviews ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">
                    Loading completed interviews...
                  </span>
                </div>
              </div>
            ) : completedInterviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center">
                  <svg
                    className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No completed interviews
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Completed interviews will appear here once scheduled
                    interviews have passed their date and time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {completedInterviews.map((proposal) => (
                  <CompletedInterviewRow
                    key={proposal.id}
                    proposal={proposal}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Finalized Proposals section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Finalized Proposals
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 text-xs sm:text-sm font-medium rounded-full w-fit">
                {finalizedProposals.length} finalized
              </div>
            </div>

            {loadingFinalizedProposals ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">
                    Loading finalized proposals...
                  </span>
                </div>
              </div>
            ) : finalizedProposals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center">
                  <svg
                    className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No finalized proposals
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Finalized proposals will appear here once you give final
                    approval or rejection to completed interviews.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {finalizedProposals.map((proposal) => (
                  <FinalizedProposalRow key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </section>

          {/* Completed history section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Completed Sessions
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full w-fit">
                {completed.length} completed
              </div>
            </div>

            {loadingCompleted ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">
                    Loading completed sessions...
                  </span>
                </div>
              </div>
            ) : completed.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center">
                  <svg
                    className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No completed sessions
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Completed sessions will appear here once approved sessions
                    have passed their scheduled date.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {completed.map((s) => (
                  <ApprovedRow key={s.id} s={s} />
                ))}
              </div>
            )}
          </section>

          {/* Rejected history section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Rejected Sessions
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 text-xs sm:text-sm font-medium rounded-full w-fit">
                {rejected.length} rejected
              </div>
            </div>

            {loadingRejected ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">
                    Loading rejected sessions...
                  </span>
                </div>
              </div>
            ) : rejected.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center">
                  <svg
                    className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4"
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
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No rejected sessions
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Rejected sessions will appear here once you start rejecting
                    proposals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {rejected.map((s) => (
                  <RejectedRow key={s.id} s={s} />
                ))}
              </div>
            )}
          </section>

          {/* Statistics Overview Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Performance Overview
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full w-fit">
                Analytics
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="w-6 sm:w-8 h-6 sm:h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {approved.length} Approved Sessions
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {completed.length} Completed Sessions
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="w-6 sm:w-8 h-6 sm:h-8 text-red-600"
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
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {rejected.length} Rejected Sessions
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    Pending Sessions
                  </h3>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {pending.length}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Sessions awaiting your review and approval.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    Total Sessions Reviewed
                  </h3>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {approved.length + rejected.length}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Total number of sessions you have reviewed.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
