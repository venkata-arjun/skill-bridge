// src/contexts/AlertContext.jsx
import React, { createContext, useContext, useState } from "react";
import AlertModal from "../components/AlertModal";

const AlertContext = createContext();

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    type: "info",
    showCancel: false,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const showAlert = (
    message,
    type = "info",
    onConfirm = null,
    showCancel = false,
    confirmText = "OK",
    cancelText = "Cancel"
  ) => {
    setAlert({
      isOpen: true,
      message,
      type,
      onConfirm,
      showCancel,
      confirmText,
      cancelText,
    });
  };

  const hideAlert = () => {
    setAlert({
      isOpen: false,
      message: "",
      onConfirm: null,
      type: "info",
      showCancel: false,
      confirmText: "OK",
      cancelText: "Cancel",
    });
  };

  const handleConfirm = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    hideAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={hideAlert}
        onConfirm={handleConfirm}
        type={alert.type}
        showCancel={alert.showCancel}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />
    </AlertContext.Provider>
  );
}
