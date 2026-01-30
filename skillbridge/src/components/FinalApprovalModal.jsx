import React, { useEffect, useState } from "react";
import { useAlert } from "../contexts/AlertContext";
import { useConfirmation } from "../contexts/ConfirmationContext";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import ConfirmationModal from "./ConfirmationModal";

export default function FinalApprovalModal({
  isOpen,
  onClose,
  student = {},
  action,
  id,
}) {
  // action: 'approve' or 'disapprove'
  const [disapprovalMessage, setDisapprovalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();
  const { showConfirmation } = useConfirmation();
  const { currentUser, reloadProfile } = useAuth();

  useEffect(() => {
    // Dummy mode: EmailJS removed. Keep for future needs.
  }, []);
  // No EmailJS validation needed in dummy mode

  const handleConfirm = async () => {
    if (!student || !student.email) {
      alert("Student information (name/email) is missing.");
      return;
    }

    // Check if proposal is already finalized
    try {
      const proposalDoc = await getDocs(
        query(collection(db, "speakerProposals"), where("__name__", "==", id))
      );
      if (!proposalDoc.empty) {
        const proposalData = proposalDoc.docs[0].data();
        if (
          proposalData.status === "final_approved" ||
          proposalData.status === "final_disapproved"
        ) {
          showAlert("This proposal has already been finalized.", "warning");
          onClose();
          return;
        }
      }
    } catch (error) {
      console.error("Error checking proposal status:", error);
    }

    setLoading(true);

    try {
      if (action === "approve") {
        // Ask for confirmation before promoting to speaker (adds audit fields)
        showConfirmation(
          `Final approval will tag ${student.name} as a speaker. Proceed?`,
          async () => {
            // confirmed
            showAlert(
              `Final approval notification simulated for ${student.name} (email: ${student.email})`,
              "success"
            );

            await updateDoc(doc(db, "speakerProposals", id), {
              status: "final_approved",
            });

            // Promote the user to speaker role in their profile with audit info
            try {
              const promotedBy = currentUser?.uid || null;
              const promotedAt = new Date();
              const targetUid = student?.studentId;
              if (targetUid) {
                await updateDoc(doc(db, "users", targetUid), {
                  role: "speaker",
                  promotedBy,
                  promotedAt,
                });
                if (currentUser?.uid === targetUid) {
                  await reloadProfile();
                }
              } else if (student?.email) {
                const q = query(
                  collection(db, "users"),
                  where("email", "==", student.email)
                );
                const snaps = await getDocs(q);
                if (!snaps.empty) {
                  const userDoc = snaps.docs[0];
                  await updateDoc(doc(db, "users", userDoc.id), {
                    role: "speaker",
                    promotedBy,
                    promotedAt,
                  });
                  if (currentUser?.uid === userDoc.id) {
                    await reloadProfile();
                  }
                } else {
                  showAlert(
                    "Final approval done, but user profile not found to tag as speaker.",
                    "warning"
                  );
                }
              } else {
                showAlert(
                  "Final approval done, but no user identifier available to tag speaker.",
                  "warning"
                );
              }
            } catch (err) {
              console.error("Failed to tag user as speaker:", err);
              showAlert(
                "Final approval succeeded but failed to tag user as speaker.",
                "error"
              );
            }
          },
          () => {
            /* cancelled */
          },
          "Yes, promote",
          "Cancel"
        );
      } else if (action === "disapprove") {
        if (!disapprovalMessage.trim()) {
          showAlert("Please enter a disapproval message.", "warning");
          setLoading(false);
          return;
        }

        // Simulate sending final disapproval notification
        showAlert(
          `Final disapproval notification simulated for ${student.name} (email: ${student.email})`,
          "info"
        );

        await updateDoc(doc(db, "speakerProposals", id), {
          status: "final_disapproved",
          disapprovalMessage,
        });
      } else {
        console.warn("Unknown action in FinalApprovalModal:", action);
      }

      onClose();
    } catch (error) {
      console.error("Error in FinalApprovalModal:", error);
      showAlert(
        `Failed to complete operation: ${error?.message || String(error)}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const message =
    action === "approve"
      ? "Confirm final approval as Speaker."
      : "Enter disapproval message.";

  const confirmText = loading ? "Sending..." : "Confirm";

  return (
    <ConfirmationModal
      isOpen={isOpen}
      message={message}
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmText={confirmText}
      confirmDisabled={loading}
    >
      {action === "disapprove" && (
        <div>
          <label className="block text-sm font-medium">
            Disapproval Message
          </label>
          <textarea
            value={disapprovalMessage}
            onChange={(e) => setDisapprovalMessage(e.target.value)}
            placeholder="Enter disapproval reason"
            required
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </ConfirmationModal>
  );
}
