// src/contexts/ConfirmationContext.jsx
import React, { createContext, useContext, useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal";

const ConfirmationContext = createContext();

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationProvider"
    );
  }
  return context;
}

export function ConfirmationProvider({ children }) {
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const showConfirmation = (
    message,
    onConfirm,
    onCancel = null,
    confirmText = "Confirm",
    cancelText = "Cancel"
  ) => {
    setConfirmation({
      isOpen: true,
      message,
      onConfirm,
      onCancel: onCancel || (() => {}),
      confirmText,
      cancelText,
    });
  };

  const hideConfirmation = () => {
    setConfirmation({
      isOpen: false,
      message: "",
      onConfirm: null,
      onCancel: null,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
  };

  const handleConfirm = () => {
    if (confirmation.onConfirm) {
      confirmation.onConfirm();
    }
    hideConfirmation();
  };

  const handleCancel = () => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  };

  return (
    <ConfirmationContext.Provider value={{ showConfirmation }}>
      {children}
      <ConfirmationModal
        message={confirmation.message}
        isOpen={confirmation.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
      />
    </ConfirmationContext.Provider>
  );
}
