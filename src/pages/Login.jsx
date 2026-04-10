import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/images/header/Logos.png";
import csIcon from "../assets/images/header/cs1.png";
import CustomerServiceModal from "../components/CustomerServiceModal";
import "./Login.css";
import { useProfile } from "../context/profileContext"; // keep as-is

// Reusable fading message overlay (grey, centered)
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
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
          opacity: 0.98,
          textAlign: "center",
          minWidth: 140,
          maxWidth: "80vw",
        }}
      >
        {message}
      </div>
    </div>
  );
}

// Simple spinner overlay
function SpinnerOverlay({ duration = 500, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, duration);
    return () => clearTimeout(timer);
  }, [onDone, duration]);

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
        background: "rgba(245,247,251,0.75)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "4px solid #ddd",
          borderTop: "4px solid #216378",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const API_URL = "https://stacksapp-backend.onrender.com";

export default function Login({ refreshRecords }) {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [fadeMsg, setFadeMsg] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const navigate = useNavigate();
  const { fetchProfile } = useProfile();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        const token =
          data.token ||
          (data.user && (data.user.token || data.user?.token)) ||
          null;

        if (token) {
          try { localStorage.setItem("authToken", token); } catch (e) {}
          try { localStorage.setItem("token", token); } catch (e) {}
        }

        if (data.user) {
          try { localStorage.setItem("currentUser", JSON.stringify(data.user)); } catch (e) {}
          try { localStorage.setItem("user", data.user.username || ""); } catch (e) {}
        }

        try {
          if (typeof fetchProfile === "function") {
            await fetchProfile();
          }
        } catch (err) {
          console.warn("fetchProfile failed:", err);
        }

        try { window.dispatchEvent(new Event("auth:login")); } catch (e) {}
        try { window.dispatchEvent(new Event("profile:refresh")); } catch (e) {}

        if (typeof refreshRecords === "function") {
          try { await refreshRecords(); } catch (err) {}
        }

        setFadeMsg("Login Success");
      } else {
        setFadeMsg(data.message || "Login failed!");
      }
    } catch (err) {
      console.error(err);
      setFadeMsg("Server error. Please try again later.");
    }
  };

  useEffect(() => {
    if (fadeMsg === "Login Success") {
      const t = setTimeout(() => {
        setFadeMsg("");
        setShowSpinner(true);
      }, 1000);
      return () => clearTimeout(t);
    }
    if (fadeMsg && fadeMsg !== "Login Success") {
      const t = setTimeout(() => setFadeMsg(""), 1200);
      return () => clearTimeout(t);
    }
  }, [fadeMsg]);

  useEffect(() => {
    if (showSpinner) {
      const t = setTimeout(() => {
        setShowSpinner(false);
        navigate("/dashboard");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [showSpinner, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efebe6", // beige background
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        position: "relative",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        paddingTop: 16,
        boxSizing: "border-box",
      }}
    >
      {fadeMsg && <FadeMessage message={fadeMsg} />}
      {showSpinner && <SpinnerOverlay />}

      {/* Customer service icon (top-right) - transparent background so it blends with page */}
      <button
        type="button"
        onClick={() => setShowCustomerModal(true)}
        aria-label="Customer Service"
        style={{
          position: "fixed",
          top: 6,
          right: 16,
          zIndex: 10060,
          width: 48,
          height: 48,
          borderRadius: 999,
          background: "transparent", // use page background, no purple
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
      >
        <img src={csIcon} alt="Customer Service" style={{ width: 42, height: 42, display: "block" }} />
      </button>

      {/* Main centered column */}
      <div style={{ width: "100%", maxWidth: 760, padding: "0 38px", textAlign: "center", boxSizing: "border-box" }}>
        <img
          src={logo}
          alt="Digital Blitz"
          style={{ width: 140, height: "auto", display: "block", margin: "100px auto 12px" }}
          loading="lazy"
        />

        <h2 style={{ marginTop: 70, marginBottom: 58, fontSize: 20, fontWeight: 700, color: "#111" }}>
          Login Now
        </h2>

        <form onSubmit={handleLogin} style={{ width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {/* Username row: label left, placeholder right on the same line */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: -20 }}>
              <label style={{ color: "#333", fontWeight: 600, fontSize: 14 }}>Username/Phone</label>

              {/* Right-aligned placeholder inside a small box that disappears when typing */}
              <div
                aria-hidden="true"
                style={{
                  color: "#7d7d7d",
                  fontSize: 14,
                  borderRadius: 4,
                  padding: "4px 8px",
                  boxSizing: "border-box",
                  // position visually aligned to right of the label line
                }}
              >
                {input.length === 0 ? "Username/Phone" : ""}
              </div>
            </div>
            <div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder=""
                required
                autoComplete="username"
                style={{
                  width: "100%",
                  border: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
                  padding: "10px 6px",
                  borderRadius: 4,
                  background: "transparent",
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                  marginTop: -30,
                  textAlign: "right", // <-- ensure typed text appears on the right
                }}
              />
            </div>
          </div>

          {/* Password row */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: -30 }}>
              <label style={{ color: "#333", fontWeight: 700, fontSize: 14 }}>Password</label>

              {/* Right-aligned placeholder inside a small box that disappears when typing */}
              <div
                aria-hidden="true"
                style={{
                  color: "#7d7d7d",
                  fontSize: 14,
                  borderRadius: 4,
                  padding: "4px 8px",
                  boxSizing: "border-box",
                }}
              >
                {password.length === 0 ? "Password" : ""}
              </div>
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  border: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
                  padding: "10px 6px",
                  borderRadius: 4,
                  background: "transparent",
                  fontSize: 16,
                  boxSizing: "border-box",
                  outline: "none",
                  marginTop: 8,
                  textAlign: "right", // <-- ensure typed password appears on the right
                }}
              />
            </div>
          </div>

          {/* Big rounded black Login button */}
          <div style={{ marginBottom: 30 }}>
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#111",
                color: "#fff",
                borderRadius: 999,
                padding: "14px 28px",
                fontSize: 18,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                display: "block",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              Login
            </button>
          </div>

          {/* Register link */}
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <Link to="/register" style={{ color: "#111", fontSize: 17, textDecoration: "underline", fontWeight: 700 }}>
              Register
            </Link>
          </div>
        </form>

        {/* footer */}
        <div style={{ marginTop: 260, color: "#8f8f8f", textAlign: "center", fontSize: 15 }}>
          2025—2026.
        </div>
      </div>

      <CustomerServiceModal open={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
    </div>
  );
}