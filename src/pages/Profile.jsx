import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "../context/profileContext";
import CustomerServiceModal from "../components/CustomerServiceModal";

// VIP badge images
import vip1 from "../assets/images/vip/vip1.png";
import vip2 from "../assets/images/vip/vip2.png";
import vip3 from "../assets/images/vip/vip3.png";
import vip4 from "../assets/images/vip/vip4.png";

import avatarIcon from "../assets/images/profile/avatar.png";
import depositIcon from "../assets/images/profile/deposit.png";
import withdrawIcon from "../assets/images/profile/withdraw.png";
import personalIcon from "../assets/images/profile/personal.png";
import walletIcon from "../assets/images/profile/wallet.png";
import contactIcon from "../assets/images/profile/contact.png";
import notifIcon from "../assets/images/profile/notif.png";

import NotificationBell from "../components/NotificationBell";

// Bottom nav icons (used for the bottom bar)
import homeIcon from "../assets/images/tabBar/Homes.png";
import startingIcon from "../assets/images/tabBar/Start.png";
import recordsIcon from "../assets/images/tabBar/Record.png";
import profileIcon from "../assets/images/tabBar/My3.png";

// ---- API domain kept the same as before ----
const API_URL = "https://digitalblitz-backend.onrender.com";

// --- Colors ---
const START_BLUE = "#1fb6fc";
const END_BLUE = "#0072ff";

/* Changes in this file:
   - Transaction item is disabled (no navigation) and visually muted.
   - Small top spacer restored above profile card.
   - "100%" indicator positioned to the right of the credit score bar (above the bar line).
   - Modal buttons/overlays tuned to platform colors.
   - Added tiny "jumping grey bars" refresh toast that shows for 0.5s when profile refresh is triggered instead of a full white spinner.
   - Visual refresh shows for 500ms so refresh "takes only a half-second" visually and avoids white flash on navigation/refresh.
   No other logic or handlers were removed/modified.
*/

// Grey fading spinner (replaced by small grey jumping bars animation)
function GreyFadeSpinner() {
  // small, uneven jumping bars (matches the screenshot: compact, different heights)
  const barHeights = [8, 14, 10, 16, 12, 9];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        background: "rgba(245,247,251,0.9)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10000,
        transition: "opacity 1s",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "flex-end",
          padding: 8,
          borderRadius: 8,
        }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes jumpSmall {
            0% { transform: translateY(0); opacity: 0.8; }
            40% { transform: translateY(-8px); opacity: 1; }
            100% { transform: translateY(0); opacity: 0.8; }
          }
        `}</style>

        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: h,
              background: "#111",
              borderRadius: 6,
              animation: `jumpSmall 750ms ${i * 0.09}s infinite ease-in-out`,
              transformOrigin: "center bottom",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Grey fading message overlay (unchanged)
function GreyFadeMessage({ message, duration = 600, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 20000,
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(245,247,251,0.93)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none"
      }}
    >
      <div style={{
        background: "#e6e6e6",
        color: "#222",
        borderRadius: "18px",
        padding: "1.2rem 2.5rem",
        fontWeight: 700,
        opacity: 0.96,
        fontSize: "1.18rem",
        boxShadow: "0 2px 16px 0 #0002",
        textAlign: "center",
        minWidth: "180px",
        letterSpacing: "0.01em",
        animation: "fade-in-out-profile-logout 1s linear"
      }}>
        {message}
      </div>
      <style>
        {`
        @keyframes fade-in-out-profile-logout {
          0% { opacity: 0; transform: scale(0.98);}
          10% { opacity: 1; transform: scale(1);}
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        `}
      </style>
    </div>
  );
}

// Tiny jumping grey bars toast component
function TinyBarsToast({ show, duration = 500 }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    let t;
    if (show) {
      setVisible(true);
      t = setTimeout(() => setVisible(false), duration);
    } else {
      setVisible(false);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [show, duration]);

  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      top: 12,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20001,
      pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(245,247,251,0.95)",
        padding: "6px 10px",
        borderRadius: 999,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        display: "flex",
        gap: 6,
        alignItems: "flex-end",
        height: 26,
      }}>
        <div style={{ width: 4, height: 10, background: "#bdbdbd", borderRadius: 2, animation: "jump 900ms ease-in-out infinite" }} />
        <div style={{ width: 4, height: 10, background: "#bdbdbd", borderRadius: 2, animation: "jump 900ms ease-in-out 150ms infinite" }} />
        <div style={{ width: 4, height: 10, background: "#bdbdbd", borderRadius: 2, animation: "jump 900ms ease-in-out 300ms infinite" }} />
      </div>
      <style>{`
        @keyframes jump {
          0% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// Logout modal (colors tuned to platform - updated to neutral white/black per screenshot)
function LogoutModal({ open, onClose, onLogout }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.45)",
        minHeight: "100vh",
        minWidth: "100vw",
        pointerEvents: "auto"
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs mx-auto rounded-xl shadow-xl"
        style={{
          background: "#fff",
          pointerEvents: "auto",
          padding: "1.25rem 1.25rem",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          maxWidth: 360,
          minWidth: 280,
          textAlign: "center",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#222" }}>Logout</span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 14, color: "#666" }}>Are you sure you want to logout?</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 6 }}>
          <button
            className="flex-1"
            style={{
              background: "transparent",
              color: "#111",
              border: "none",
              padding: "10px 6px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={onClose}
            data-i18n="Cancel"
          >
            Cancel
          </button>

          <button
            className="flex-1"
            style={{
              background: "transparent",
              color: "#111",
              border: "none",
              padding: "10px 6px",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
            onClick={onLogout}
            data-i18n="Confirm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Withdraw password modal (updated to match Withdraw page bottom-sheet style)
function WithdrawPasswordModalProfile({ open, onClose, onSubmit, withdrawPassword, setWithdrawPassword, errorMsg, submitting }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 12000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: "auto"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 900,
          background: "#fff",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: 22,
          boxShadow: "0 -6px 30px rgba(0,0,0,0.18)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>Transaction Password</div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 26,
              color: "#999",
              cursor: "pointer"
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 8, marginBottom: 18 }}>
          <input
            type="password"
            value={withdrawPassword}
            onChange={e => setWithdrawPassword(e.target.value)}
            placeholder="•••••"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              background: "#eef6ff",
              border: "1px solid #eaeff7",
              fontSize: 16,
              color: "#222",
            }}
            autoFocus
            disabled={submitting}
          />
        </div>

        {errorMsg && <div style={{ color: "#d9534f", marginBottom: 12, fontSize: 13 }}>{errorMsg}</div>}

        <div style={{ padding: "6px 0 12px 0" }}>
          <button
            onClick={onSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              background: "#111",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 999,
              border: "none",
              padding: "14px 0",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              opacity: submitting ? 0.8 : 1
            }}
          >
            {submitting ? "Verifying..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// VIP helper (unchanged)
function getVipBadgeInfo(vipLevelRaw) {
  if (vipLevelRaw === undefined || vipLevelRaw === null) return { level: null, badge: null };
  let lvlNum = null;
  if (typeof vipLevelRaw === "number") lvlNum = vipLevelRaw;
  else if (typeof vipLevelRaw === "string") {
    const m = vipLevelRaw.match(/\d+/);
    lvlNum = m ? Number(m[0]) : NaN;
  } else {
    lvlNum = Number(vipLevelRaw);
  }
  if (!Number.isFinite(lvlNum)) return { level: null, badge: null };
  const level = Math.max(1, Math.min(4, Math.floor(lvlNum)));
  const map = { 1: vip1, 2: vip2, 3: vip3, 4: vip4 };
  const badge = map[level] || null;
  return { level, badge };
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, fetchProfile, setProfile } = useProfile();

  const [showModal, setShowModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [destination, setDestination] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // showLoading kept for compatibility but not used to block rendering (avoid white flash)
  const [showLoading, setShowLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fadeMsg, setFadeMsg] = useState("");

  // refresh toast visibility (tiny jumping bars)
  const [refreshToast, setRefreshToast] = useState(false);
  const refreshTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const visualRefresh = (duration = 500) => {
      // show tiny bars toast for a short duration (0.5s by default)
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      setRefreshToast(true);
      refreshTimerRef.current = setTimeout(() => {
        setRefreshToast(false);
        refreshTimerRef.current = null;
      }, duration);
    };

    const run = async () => {
      // Start visual refresh (0.5s)
      visualRefresh(500);
      try {
        // trigger actual fetch (non-blocking UI)
        await fetchProfile();
      } catch (e) {
        // ignore
      }
    };
    run();

    // Event listeners: call visualRefresh and fetchProfile (non-blocking UI)
    const onAuthLogin = async () => {
      visualRefresh(500);
      try { await fetchProfile(); } catch (e) {}
    };
    const onProfileRefresh = async () => {
      visualRefresh(500);
      try { await fetchProfile(); } catch (e) {}
    };
    const onBalanceChanged = async () => {
      visualRefresh(500);
      try { await fetchProfile(); } catch (e) {}
    };
    const onAuthLogout = () => {
      try { localStorage.removeItem("authToken"); localStorage.removeItem("token"); localStorage.removeItem("currentUser"); localStorage.removeItem("userProfile"); } catch (e) {}
      try { setProfile(null); } catch (e) {}
      navigate("/login");
    };

    window.addEventListener("auth:login", onAuthLogin);
    window.addEventListener("profile:refresh", onProfileRefresh);
    window.addEventListener("balance:changed", onBalanceChanged);
    window.addEventListener("auth:logout", onAuthLogout);

    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      window.removeEventListener("auth:login", onAuthLogin);
      window.removeEventListener("profile:refresh", onProfileRefresh);
      window.removeEventListener("balance:changed", onBalanceChanged);
      window.removeEventListener("auth:logout", onAuthLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleProtectedRoute = (targetPath) => {
    setDestination(targetPath);
    setWithdrawPassword("");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSubmitPassword = async () => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/verify-withdraw-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({ password: withdrawPassword }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (data.success) {
        setShowModal(false);
        try { await fetchProfile(); } catch (e) {}
        navigate(destination);
      } else {
        setErrorMsg(data.message || "Incorrect withdrawal password.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setFadeMsg("Logout Success");
    setTimeout(() => {
      setFadeMsg("");
      try {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userProfile");
      } catch (e) {}
      try { setProfile(null); } catch (e) {}
      navigate("/login");
    }, 600);
  };

  // Always render the page to avoid white flash. Use a safe fallback profile object when profile is not yet available.
  const safeProfile = profile || {
    username: "",
    balance: 0,
    commissionToday: 0,
    vipLevel: null,
    inviteCode: ""
  };

  const vipInfo = getVipBadgeInfo(safeProfile.vipLevel);
  const fmt = (v) => { const n = Number(v || 0); return Number.isFinite(n) ? n.toFixed(2) : "0.00"; };

  const currentPath = location?.pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const isActive = (tabKey) => {
    if (tabKey === "home") return currentPath === "/" || currentPath === "/dashboard";
    if (tabKey === "starting") return currentPath.startsWith("/tasks") || currentPath.startsWith("/starting");
    if (tabKey === "records") return currentPath.startsWith("/records");
    if (tabKey === "profile") return currentPath.startsWith("/profile");
    return false;
  };

  return (
    <div style={{ background: "#efe9e3", minHeight: "100vh", paddingBottom: 84, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <style>{`
        .profile-section-title { font-size: 18px; font-weight: 700; color: #111; margin: 12px 16px 8px; }
        .list-card { background: #fff; border-radius: 12px; margin: 0 16px 0 16px; overflow: hidden; box-shadow: 0 1px 0 rgba(0,0,0,0.04); }
        .list-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; cursor: pointer; }
        .list-item-left { display:flex; align-items:center; gap:12px; }
        .list-item-title { font-size: 15px; font-weight: 600; color: #111; }
        .divider { height: 1px; background: #f2f2f2; margin: 0; }
        .logout-pill { margin: 20px 24px 28px; padding: 14px 20px; border-radius: 999px; text-align:center; background: #111; color: #fff; font-weight: 800; font-size: 16px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); cursor: pointer; border: none; }
        .icon-black { filter: grayscale(100%) brightness(0); opacity: 0.95; width:20px; height:20px; }
        .transaction-disabled { opacity: 0.55; cursor: default; pointer-events: none; color: #9a9a9a; }
      `}</style>

      {/* tiny jumping bars toast */}
      <TinyBarsToast show={refreshToast} duration={500} />

      {/* small top spacer restored as requested */}
      <div style={{ height: 20 }} />

      {/* Profile card with reduced height/paddings */}
      <div style={{
        margin: "6px 16px",
        borderRadius: 14,
        overflow: "hidden",
        padding: 12,
        background: "linear-gradient(135deg,#252426 0%,#111113 100%)",
        color: "#fff",
        position: "relative",
        boxShadow: "0 6px 24px rgba(0,0,0,0.12)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              overflow: "hidden", border: "3px solid rgba(255,255,255,0.08)",
              background: "#00d0c6",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <img src={avatarIcon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{safeProfile.username}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                <span style={{ opacity: 0.9 }}>Invitation Code:</span> <span style={{ fontWeight: 800 }}>{safeProfile.inviteCode || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            {vipInfo.badge ? (
              <img src={vipInfo.badge} alt={`VIP-${vipInfo.level}`} style={{ width: 56, height: 56 }} />
            ) : vipInfo.level ? (
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                VIP{vipInfo.level}
              </div>
            ) : (
              <img src={vip2} alt="VIP" style={{ width: 56, height: 56 }} />
            )}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{vipInfo.level ? `VIP${vipInfo.level}` : "VIP"}</div>
          </div>
        </div>

        {/* credit score and 100% indicator above the bar (right-aligned) */}
        <div style={{ marginTop: 12, position: "relative" }}>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 8 }}>Credit Score:</div>

          {/* 100% pill positioned above the bar on the right */}
          <div style={{ position: "absolute", right: 0, top: 18, transform: "translateY(-50%)", background: "rgba(0,0,0,0.25)", padding: "4px 8px", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 12 }}>
            100%
          </div>

          <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 999 }}>
            <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 999 }} />
          </div>

        </div>

        {/* wallet & commission compact */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", padding: 10, borderRadius: 10 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 6 }}>Wallet Amount</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{fmt(safeProfile.balance)} <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>USDC</span></div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", padding: 10, borderRadius: 10 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 6 }}>Commission</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#00d0c6" }}>{fmt(safeProfile.commissionToday)} <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>USDC</span></div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ marginTop: 28 }}>
        <div className="profile-section-title">My Financial</div>
        <div className="list-card" role="list">
          <div className="list-item" onClick={() => navigate("/deposit")}>
            <div className="list-item-left">
              <img src={depositIcon} alt="Deposit" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Deposit</div>
            </div>
            <div style={{ color: "#bdbdbd" }}>›</div>
          </div>
          <div className="divider" />
          <div className="list-item" onClick={() => handleProtectedRoute("/withdraw")}>
            <div className="list-item-left">
              <img src={withdrawIcon} alt="Withdraw" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Withdraw</div>
            </div>
            <div style={{ color: "#bdbdbd" }}>›</div>
          </div>
          <div className="divider" />
          {/* Transaction disabled: no navigation, muted style */}
          <div className="list-item transaction-disabled" aria-disabled="true" style={{ cursor: "default", pointerEvents: "none", opacity: 0.55 }}>
            <div className="list-item-left">
              <img src={walletIcon} alt="Transactions" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#9a9a9a" }}>Transaction</div>
            </div>
            <div style={{ color: "#e0e0e0" }}>›</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="profile-section-title">My Detail</div>
        <div className="list-card">
          <div className="list-item" onClick={() => handleProtectedRoute("/personal-info")}>
            <div className="list-item-left">
              <img src={personalIcon} alt="Personal" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Personal Information</div>
            </div>
            <div style={{ color: "#bdbdbd" }}>›</div>
          </div>
          <div className="divider" />
          <div className="list-item" onClick={() => handleProtectedRoute("/bind-wallet")}>
            <div className="list-item-left">
              <img src={walletIcon} alt="Payment" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Payment Methods</div>
            </div>
            <div style={{ color: "#bdbdbd" }}>›</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <div className="profile-section-title">Other</div>
        <div className="list-card">
          <div className="list-item" onClick={() => setShowContactModal(true)}>
            <div className="list-item-left">
              <img src={contactIcon} alt="Contact" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Contact Us</div>
            </div>
            <div style={{ color: "#bdbdbd" }}>›</div>
          </div>
          <div className="divider" />
          <div className="list-item" onClick={() => navigate("/notifications")}>
            <div className="list-item-left">
              <img src={notifIcon} alt="Notifications" className="icon-black" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Notifications</div>
            </div>
            <div style={{ color: "#bdbdbd" }}>›</div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="logout-pill"
          style={{ display: "block", width: "calc(100% - 48px)", marginLeft: 24, marginRight: 24 }}
        >
          Logout
        </button>
      </div>

      <div style={{ textAlign: "center", color: "#999", marginTop: 50 }}>2025—2026.</div>

      {/* Bottom Nav (shared component kept out) */}
      <nav
        className="fixed"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "linear-gradient(180deg,#111113,#151516)",
          borderTop: "1px solid rgba(255,255,255,0.03)",
          boxShadow: "0 -4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: 64, maxWidth: 1100, margin: "0 auto", padding: "0 8px" }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", color: isActive("home") ? "#ffffff" : "#9b9b9b" }}>
            <img src={homeIcon} alt="Home" style={{ width: 22, height: 22, filter: isActive("home") ? "brightness(0) invert(1)" : "grayscale(100%) brightness(0.75)", opacity: isActive("home") ? 1 : 0.9 }} />
            <span style={{ fontSize: 12, color: isActive("home") ? "#ffffff" : "#9b9b9b" }}>Home</span>
          </button>

          <button onClick={() => navigate("/tasks")} style={{ background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", color: isActive("starting") ? "#ffffff" : "#9b9b9b" }}>
            <img src={startingIcon} alt="Starting" style={{ width: 22, height: 22, filter: isActive("starting") ? "brightness(0) invert(1)" : "grayscale(100%) brightness(0.75)", opacity: isActive("starting") ? 1 : 0.9 }} />
            <span style={{ fontSize: 12, color: isActive("starting") ? "#ffffff" : "#9b9b9b" }}>Starting</span>
          </button>

          <button onClick={() => navigate("/records")} style={{ background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", color: isActive("records") ? "#ffffff" : "#9b9b9b" }}>
            <img src={recordsIcon} alt="Records" style={{ width: 22, height: 22, filter: isActive("records") ? "brightness(0) invert(1)" : "grayscale(100%) brightness(0.75)", opacity: isActive("records") ? 1 : 0.9 }} />
            <span style={{ fontSize: 12, color: isActive("records") ? "#ffffff" : "#9b9b9b" }}>Records</span>
          </button>

          <button onClick={() => navigate("/profile")} style={{ background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", color: isActive("profile") ? "#ffffff" : "#9b9b9b" }}>
            <img src={profileIcon} alt="Profile" style={{ width: 22, height: 22, filter: isActive("profile") ? "brightness(0) invert(1)" : "grayscale(100%) brightness(0.75)", opacity: isActive("profile") ? 1 : 0.9 }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = profileIcon; }} />
            <span style={{ fontSize: 12, color: isActive("profile") ? "#ffffff" : "#9b9b9b" }}>Profile</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <LogoutModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onLogout={handleLogout} />
      <WithdrawPasswordModalProfile
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitPassword}
        withdrawPassword={withdrawPassword}
        setWithdrawPassword={setWithdrawPassword}
        errorMsg={errorMsg}
        submitting={submitting}
      />
      {fadeMsg && <GreyFadeMessage message={fadeMsg} duration={600} onDone={() => setFadeMsg("")} />}
      <CustomerServiceModal open={showContactModal} onClose={() => setShowContactModal(false)} />

      {/* Keep NotificationBell present but not rendered */}
      <div style={{ display: "none" }}>
        <NotificationBell />
      </div>
    </div>
  );
}
