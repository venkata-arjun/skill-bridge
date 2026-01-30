import React, { useEffect, useState } from "react";
import { useAlert } from "../contexts/AlertContext";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import ConfirmationModal from "./ConfirmationModal";

export default function FacultyApprovalModal({
  isOpen,
  onClose,
  student = {},
  action,
  id,
}) {
  // action: 'approve' or 'reject'
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewVenue, setInterviewVenue] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    // Dummy mode: EmailJS removed. Keep effect in case future init is needed.
  }, []);

  const handleConfirm = async () => {
    // basic guard
    if (!student || !student.email) {
      showAlert("Student information is missing.", "warning");
      return;
    }

    // No external email service in dummy mode; proceed with local notifications.

    setLoading(true);

    try {
      if (action === "approve") {
        // Validate required fields
        if (!interviewDate || !interviewTime || !interviewVenue) {
          showAlert(
            "Please fill in all interview details (date, time, venue).",
            "warning"
          );
          return;
        }

        // Simulate sending approval notification (no external email)
        showAlert(
          `Approval notification simulated for ${student.name} (email: ${student.email})`,
          "success"
        );

        // Update proposal status in Firestore as scheduled and store interview details
        const interviewTimestamp = new Date(
          `${interviewDate} ${interviewTime}`
        );
        await updateDoc(doc(db, "speakerProposals", id), {
          status: "scheduled",
          interviewDate,
          interviewTime,
          interviewVenue,
          interviewTimestamp,
        });
      } else if (action === "reject") {
        // Validate rejection message
        if (!rejectionMessage.trim()) {
          showAlert("Please enter a rejection message.", "warning");
          return;
        }

        // Simulate sending rejection notification
        showAlert(
          `Rejection notification simulated for ${student.name} (email: ${student.email})`,
          "info"
        );

        // Update proposal status in Firestore
        await updateDoc(doc(db, "speakerProposals", id), {
          status: "rejected",
          rejectionMessage,
        });
        // UX: user already informed via showAlert
      } else {
        console.warn("Unknown action:", action);
      }

      // close modal after success
      onClose();
    } catch (error) {
      console.error("Error in FacultyApprovalModal:", error);
      showAlert(
        `Operation failed: ${error?.message || String(error)}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const message =
    action === "approve"
      ? `Schedule interview for ${student?.name ?? "the student"}`
      : "Enter rejection message.";

  const confirmText = loading
    ? action === "approve"
      ? "Scheduling..."
      : "Sending..."
    : action === "approve"
    ? "Schedule"
    : "Send Rejection";

  return (
    <ConfirmationModal
      isOpen={isOpen}
      message={message}
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmText={confirmText}
      // disable confirm while loading
      confirmDisabled={loading}
    >
      {action === "approve" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Interview Date</label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Interview Time</label>
            <input
              type="time"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Interview Venue</label>
            <input
              type="text"
              value={interviewVenue}
              onChange={(e) => setInterviewVenue(e.target.value)}
              placeholder="Venue"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium">Rejection Message</label>
          <textarea
            value={rejectionMessage}
            onChange={(e) => setRejectionMessage(e.target.value)}
            placeholder="Enter rejection reason"
            required
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </ConfirmationModal>
  );
}
