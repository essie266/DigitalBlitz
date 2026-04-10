import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const START_BLUE = "#1fb6fc";
const API_URL = "https://digitalblitz-backend.onrender.com";

/**
 * FadeMessage overlay (keeps same behavior as your original)
 */
function FadeMessage({ message, onDone, duration = 1000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, duration);
    return () => clearTimeout(timer);
  }, [onDone, duration]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(60,60,60,0.94)",
          color: "#fff",
          borderRadius: 16,
          padding: "1.1rem 2.2rem",
          fontWeight: 600,
          fontSize: "1.05rem",
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
          opacity: 0.98,
          textAlign: "center",
          minWidth: 140,
          maxWidth: "80vw",
        }}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeMsg, setFadeMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Clean up any stale states on mount if needed
  useEffect(() => {
    setErrorMsg("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (data?.success) {
        setFadeMsg("Password updated successfully!");
        // Clear sensitive data and redirect to login after fade
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } else {
        setErrorMsg(data?.message || "Password update failed.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Network error. Please try again.");
    }
  };

  // After success message, redirect to login
  useEffect(() => {
    if (!fadeMsg) return;
    const t = setTimeout(() => {
      setFadeMsg("");
      navigate("/login");
    }, 1000);
    return () => clearTimeout(t);
  }, [fadeMsg, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efebe6", // page beige (matches screenshot)
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {fadeMsg && <FadeMessage message={fadeMsg} />}

      {/* Fixed black header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 60,
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.02)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 8,
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="15 6 9 12 15 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ fontWeight: 800, fontSize: 18 }}>Update Password</div>
      </div>

      {/* Spacer so content sits below header */}
      <div style={{ height: 80 }} />

      {/* Form container */}
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "12px 20px 80px",
          boxSizing: "border-box",
        }}
      >
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {/* Old Password */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="oldPassword"
              style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: 700, fontSize: 18 }}
            >
              Old Password
            </label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old Password"
              required
              style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 8,
                padding: "14px 16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
                fontSize: 15,
                color: "#222",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* New Password */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="newPassword"
              style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: 700, fontSize: 18 }}
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 8,
                padding: "14px 16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
                fontSize: 15,
                color: "#222",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Confirm New Password */}
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="confirmPassword"
              style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: 700, fontSize: 18 }}
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 8,
                padding: "14px 16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
                fontSize: 15,
                color: "#222",
                boxSizing: "border-box",
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ color: "#d9534f", marginBottom: 12, fontSize: 14 }}>{errorMsg}</div>
          )}

          {/* Update button (black bar like screenshot) */}
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "#111",
                color: "#fff",
                padding: "14px 18px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              }}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
