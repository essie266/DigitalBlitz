import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      data-i18n="Logout"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        background: hover ? "#0f0f0f" : "#111111", // black pill (slightly darker on hover)
        color: "#ffffff",
        textAlign: "center",
        padding: "14px 0",
        borderRadius: 999,
        fontSize: 16,
        fontWeight: 700,
        border: "none",
        boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
        cursor: "pointer",
        transition: "background 150ms ease, transform 120ms ease",
      }}
    >
      Logout
    </button>
  );
}