import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Consistent blue (kept for compatibility but not used in header)
const START_BLUE = "#1fb6fc";

export default function PersonalInfo() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efebe6", // beige background to match screenshot
        paddingBottom: 20,
        boxSizing: "border-box",
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* Header (black with centered white title and white back arrow) */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.02)",
        }}
      >
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 8,
            margin: 0,
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

        <div style={{ fontWeight: 800, fontSize: 18 }}>Modify information</div>
      </div>

      {/* Spacer to avoid content hidden behind fixed header */}
      <div style={{ height: 72 }} />

      {/* Card container */}
      <div style={{ padding: "12px 16px 24px", boxSizing: "border-box" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Row: Modify Personal Information - DISABLED (not navigatable / not clickable) */}
          <ClickableRow disabled>
            <div style={{ color: "#111", fontSize: 16, fontWeight: 600 }}>Modify Personal Information</div>
            <Chevron />
          </ClickableRow>

          <Divider />

          {/* Username row (not clickable) */}
          <Row>
            <div style={{ color: "#111", fontSize: 14 }}>Username</div>
            <div style={{ color: "#8b8b8b", fontSize: 15, fontWeight: 700 }}>{user.username || "—"}</div>
          </Row>
        </div>

        {/* Spacing between sections */}
        <div style={{ height: 14 }} />

        {/* Password / Transaction Password card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <ClickableRow onClick={() => navigate("/update-password")}>
            <div style={{ color: "#111", fontSize: 14, fontWeight: 800 }}>Update Password</div>
            <Chevron />
          </ClickableRow>

          <Divider />

          <ClickableRow onClick={() => navigate("/update-withdraw-password")}>
            <div style={{ color: "#111", fontSize: 14, fontWeight: 800 }}>Update Transaction Password</div>
            <Chevron />
          </ClickableRow>
        </div>
      </div>
    </div>
  );
}

/* Helper row components to keep markup consistent and match screenshot styling */

function Row({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

/*
  ClickableRow now supports a `disabled` prop.
  - When disabled: it is non-interactive (no onClick), has aria-disabled, keyboard excluded (tabIndex -1),
    and shows the same visual style but with default cursor to indicate non-clickable.
*/
function ClickableRow({ children, onClick, disabled = false }) {
  const sharedStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "16px 18px",
    boxSizing: "border-box",
    border: "none",
    background: "transparent",
    textAlign: "left",
  };

  if (disabled) {
    return (
      <div
        role="button"
        aria-disabled="true"
        tabIndex={-1}
        style={{
          ...sharedStyle,
          cursor: "default",
          opacity: 1,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        ...sharedStyle,
        cursor: "pointer",
      }}
      aria-label="row-action"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f0f0f0", marginLeft: 0 }} />;
}

function Chevron() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ color: "#bdbdbd" }} xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L15 12L9 18" stroke="#bdbdbd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}