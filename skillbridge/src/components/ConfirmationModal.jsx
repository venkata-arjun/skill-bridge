// src/components/ConfirmationModal.jsx
import React from "react";

export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  isOpen,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmDisabled = false,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg w-full shadow-xl border border-gray-200 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-orange-500 text-white p-3 sm:p-4 md:p-6 rounded-t-lg">
          <h3 className="text-base sm:text-lg font-semibold">Confirm Action</h3>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {message && (
            <p className="text-gray-700 text-center leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              {message}
            </p>
          )}
          {children && <div className="mt-3 sm:mt-4">{children}</div>}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`px-3 sm:px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 font-medium w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base ${
              confirmDisabled
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
