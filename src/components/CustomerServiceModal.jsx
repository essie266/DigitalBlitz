import React, { useEffect, useState } from "react";

// Path to your avatar image in the public folder
const csImage = "/assets/images/Cs.jpg";

const API_BASE = "https://stacksapp-backend.onrender.com";
const START_BLUE = "#1fb6fc";
const DARK_BG = "#0f1112";
const CARD_BG = "#ffffff";
const MUTED = "#6f6f6f";

/**
 * CustomerServiceModal
 * - Polished styling to match platform colors (dark accents + START_BLUE).
 * - Clean layout, clear affordances and disabled states.
 * - Fetches service links from backend when opened (cached per open).
 *
 * Props:
 *  - open: boolean
 *  - onClose: function
 */
export default function CustomerServiceModal({ open, onClose }) {
  const [links, setLinks] = useState({
    telegram1: "",
    telegram2: "",
    customerService: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    // fixed endpoint (removed accidental double https://)
    fetch(`${API_BASE}/service-links.json?ts=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setLinks({
          telegram1: data.telegram1 || "",
          telegram2: data.telegram2 || "",
          customerService: data.whatsapp || data.customerService || "",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLinks({ telegram1: "", telegram2: "", customerService: "" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  // Arrow chevron (platform blue)
  const Arrow = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M9 6l6 6-6 6"
        stroke={START_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  const avatar = (
    <img
      src={csImage}
      alt="Customer service"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        marginRight: 14,
        objectFit: "cover",
        background: "#f6f7f8",
        border: "1px solid #f0f1f3",
        flexShrink: 0,
      }}
    />
  );

  // Helper for row button click
  const openLink = (url) => {
    if (!url) return;
    try {
      // always open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      // fallback
      window.location.href = url;
    }
    onClose && onClose();
  };

  const handleChat = () => {
    const username = localStorage.getItem("user") || localStorage.getItem("currentUser") || "";
    if (!username) {
      // keep message visible to user
      alert("Please login first to start a chat with customer service.");
      return;
    }
    const chatUrl = `https://stacks-chat.onrender.com/?user=${encodeURIComponent(username)}`;
    openLink(chatUrl);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customer Service"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(12, 14, 16, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          background: CARD_BG,
          border: "1px solid rgba(15,15,15,0.06)",
        }}
      >
        {/* Header */}
        <div style={{ background: DARK_BG, padding: "12px 16px", display: "flex", alignItems: "center" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Contact Support</div>
          <button
            onClick={onClose}
            aria-label="Close customer service"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "#ffffff88",
              fontSize: 20,
              cursor: "pointer",
              padding: 6,
            }}
          >
            ×
          </button>
        </div>

        {/* Content rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Telegram 1 */}
          <button
            disabled={!links.telegram1 || loading}
            onClick={() => openLink(links.telegram1)}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              background: "transparent",
              border: "none",
              padding: "14px 18px",
              cursor: links.telegram1 && !loading ? "pointer" : "not-allowed",
              opacity: links.telegram1 && !loading ? 1 : 0.55,
              borderBottom: "1px solid #f0f1f3",
              textAlign: "left",
            }}
          >
            {avatar}
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>Telegram</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  {links.telegram1 ? links.telegram1.replace(/^(https?:\/\/)?/, "").split("/")[0] : ""}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Arrow />
              </div>
            </div>
          </button>

          {/* Telegram 2 */}
          <button
            disabled={!links.telegram2 || loading}
            onClick={() => openLink(links.telegram2)}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              background: "transparent",
              border: "none",
              padding: "14px 18px",
              cursor: links.telegram2 && !loading ? "pointer" : "not-allowed",
              opacity: links.telegram2 && !loading ? 1 : 0.55,
              borderBottom: "1px solid #f0f1f3",
              textAlign: "left",
            }}
          >
            {avatar}
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>Telegram</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  {links.telegram2 ? links.telegram2.replace(/^(https?:\/\/)?/, "").split("/")[0] : ""}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Arrow />
              </div>
            </div>
          </button>

          {/* In-app Chat / Customer Service */}
          <button
            onClick={handleChat}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              background: "transparent",
              border: "none",
              padding: "14px 18px",
              cursor: "pointer",
              opacity: 1,
              textAlign: "left",
            }}
          >
            {avatar}
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>Customer Service</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  Chat with our support team now!
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Arrow />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: "1px solid #f0f1f3", display: "flex", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(15,15,15,0.06)",
              padding: "10px 18px",
              borderRadius: 10,
              color: DARK_BG,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}