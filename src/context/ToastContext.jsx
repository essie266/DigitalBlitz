import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = useCallback((message, duration = 1600) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "22%",
            transform: "translateX(-50%)",
            background: "#eee",
            color: "#666",
            borderRadius: 10,
            padding: "10px 28px",
            fontWeight: 500,
            fontSize: 15.5,
            boxShadow: "0 2px 12px #0001",
            zIndex: 99999,
            minWidth: 210,
            maxWidth: "80vw",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              border: "3px solid #e0e0e0",
              borderTop: "3px solid #bbb",
              borderRadius: "50%",
              marginRight: 13,
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span>{toast.message}</span>
          <style>
            {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      )}
    </ToastContext.Provider>
  );
}
