import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerServiceModal from "../components/CustomerServiceModal";
import { useProfile } from "../context/profileContext";

// VIP badge images (same assets you already use elsewhere)
import vip1 from "../assets/images/vip/vip11-removebg-preview.png";
import vip2 from "../assets/images/vip/vip22-removebg-preview.png";
import vip3 from "../assets/images/vip/vip333-removebg-preview.png";
import vip4 from "../assets/images/vip/vip44-removebg-preview.png";

/**
 * Premium (VIP Levels) page — updated to match the provided screenshot:
 * - Card sizes, paddings, and font sizes tuned to match the mock.
 * - "Current" shown as a subtle grey pill aligned on the same line as the VIP title, on the right.
 * - Non-current levels have an "Upgrade" button in the same position (opens CustomerServiceModal).
 * - Uses profileContext to determine current vip level.
 *
 * Drop this file into src/pages/Premium.jsx. No other files changed.
 */

export default function Premium() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const safeProfile = profile || {};
  const currentVipRaw = safeProfile.vipLevel;
  const currentVip = (typeof currentVipRaw === "number")
    ? Math.max(1, Math.min(4, Math.floor(currentVipRaw)))
    : (typeof currentVipRaw === "string" ? (Number((currentVipRaw.match(/\d+/) || [NaN])[0]) || null) : null);

  const [showContactModal, setShowContactModal] = useState(false);

  const vipLevels = [
    {
      level: 1,
      icon: vip1,
      title: "VIP1",
      priceLabel: "USDC 100",
      priceSub: "100 USDC",
      notes: [
        "Profit of 0.40% per product improvement",
        "Profit of 2.40% per combination product package",
        "Maximum 45 products per set of data improvement",
        "Maximum of 3 sets of product improvement tasks per day",
      ],
    },
    {
      level: 2,
      icon: vip2,
      title: "VIP2",
      priceLabel: "USDC 500",
      priceSub: "500 USDC",
      notes: [
        "Profit of 0.60% per product improvement",
        "Profit of 3.60% per combination product package",
        "Maximum 50 products per set of data improvement",
        "Maximum of 3 sets of product improvement tasks per day",
      ],
    },
    {
      level: 3,
      icon: vip3,
      title: "VIP3",
      priceLabel: "USDC 1500",
      priceSub: "1500 USDC",
      notes: [
        "Profit of 0.80% per product improvement",
        "Profit of 4.80% per combination product package",
        "Maximum 55 products per set of data improvement",
        "Maximum of 4 sets of product improvement tasks per day",
      ],
    },
    {
      level: 4,
      icon: vip4,
      title: "VIP4",
      priceLabel: "USDC 5000",
      priceSub: "5000 USDC",
      notes: [
        "Profit of 1% per product improvement",
        "Profit of 6% per combination product package",
        "Maximum 60 products per set of data improvement",
        "Maximum of 5 sets of product improvement tasks per day",
      ],
    },
  ];

  return (
    <div style={{ background: "#efe9e3", minHeight: "100vh", fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      {/* Top header */}
      <div style={{ background: "#111", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center" }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 6 }}
        >
          ←
        </button>
        <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 18 }}>
          Vip Levels
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: "18px 16px 32px", maxWidth: 980, margin: "0 auto" }}>
        {vipLevels.map((v) => {
          const isCurrent = currentVip === v.level;

          return (
            <div
              key={v.level}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                marginBottom: 18,
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                display: "flex",
                gap: 18,
                alignItems: "flex-start",
              }}
            >
              {/* Icon column */}
              <div style={{ flex: "0 0 72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={v.icon} alt={`vip-${v.level}`} style={{ width: 56, height: 56, objectFit: "contain", display: "block" }} />
              </div>

              {/* Content column */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>{v.title}</div>

                  {/* Right-aligned pill: Current (grey) or Upgrade (button) */}
                  <div style={{ marginLeft: "auto" }}>
                    {isCurrent ? (
                      <div style={{
                        display: "inline-block",
                        background: "#f0f0f0",
                        color: "#6f6f6f",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        Current
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowContactModal(true)}
                        style={{
                          background: "#111",
                          color: "#fff",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                        aria-label={`Upgrade to ${v.title}`}
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#111" }}>{v.priceLabel}</div>
                  <div style={{ marginTop: 6, color: "#777", fontWeight: 400 }}>{v.priceSub}</div>

                  <div style={{ marginTop: 4, color: "#666", lineHeight: 1.2 }}>
                    {v.notes.map((n, i) => (
                      <div key={i} style={{ marginBottom: 2, fontWeight: 700, fontSize: 13 }}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", color: "#999", marginTop: 6 }}>Contact customer service to upgrade.</div>

      <CustomerServiceModal open={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
}
