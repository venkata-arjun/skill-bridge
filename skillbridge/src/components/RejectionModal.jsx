// src/components/RejectionModal.jsx
import React from "react";

export default function RejectionModal({
  open,
  onClose,
  onSubmit,
  initial = "",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={() => onClose()}
      />
      <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md p-5 z-10">
        <h3 className="text-lg font-semibold mb-2">Reject session</h3>
        <p className="text-sm text-gray-600 mb-3">
          Write a short reason so the speaker understands why this was rejected.
        </p>
        <textarea
          defaultValue={initial}
          id="rejectionReasonInput"
          className="w-full border rounded p-2 h-28 mb-3"
          placeholder="Type rejection reason (required)"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onClose()}
            className="px-3 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const val =
                document.getElementById("rejectionReasonInput")?.value || "";
              onSubmit(val);
            }}
            className="px-3 py-2 rounded bg-red-600 text-white"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
