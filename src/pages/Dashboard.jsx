import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Header
import logo from "../assets/images/header/Logo4.png";
import LanguageSwitcher from "../components/LanguageSwitcher";

// Video banner
import bannerVideo from "../assets/videos/home_bg_videos.mp4";

// Menu icons
import wfpIcon from "../assets/images/home/wfp.png";
import serviceIcon from "../assets/images/home/service.png";
import certificateIcon from "../assets/images/home/Certificate.png";
import eventIcon from "../assets/images/home/Event.png";
import withdrawIcon from "../assets/images/home/Withdraw.png";
import depositIcon from "../assets/images/home/Deposit.png";
import termsIcon from "../assets/images/home/T&C.png";

// VIP images
import vip1 from "../assets/images/vip/VIPs1.png";
import vip2 from "../assets/images/vip/VIPs2.png";
import vip3 from "../assets/images/vip/VIPs3.png";
import vip4 from "../assets/images/vip/VIPs4.png";

import CustomerServiceModal from "../components/CustomerServiceModal";
import BottomNav from "../components/BottomNav.jsx"; // <-- added import for shared BottomNav

// Tab bar icons (ensure these imports exist so runtime processing won't crash)
import homeIcon from "../assets/images/tabBar/Homes.png";
import taskIcon from "../assets/images/tabBar/Start.png";
import recordsIcon from "../assets/images/tabBar/Record.png";
import profileIcon from "../assets/images/tabBar/My3.png";

// Partner logos (ensure this import exists)
import partnerRow from "../assets/images/home/partner_row.png";

const API_URL = "https://stacksapp-backend.onrender.com";
const START_BLUE = "#1fb6fc";

/* Withdraw password modal updated to match the bottom-sheet style used on Profile/Withdraw pages.
   It keeps the same props and behavior (onSubmit is the handler that performs verification).
*/
function WithdrawPasswordModal({
  open,
  onClose,
  onSubmit,
  withdrawPassword,
  setWithdrawPassword,
  errorMsg,
  submitting,
}) {
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
        pointerEvents: "auto",
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
          boxShadow: "0 -6px 30px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>Withdrawal Password</div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 26,
              color: "#999",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginTop: 8, marginBottom: 18 }}>
            <input
              type="password"
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
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

          {errorMsg && (
            <div style={{ color: "#d9534f", marginBottom: 12, fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <div style={{ padding: "6px 0 12px 0" }}>
            <button
              type="submit"
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
                opacity: submitting ? 0.8 : 1,
              }}
            >
              {submitting ? "Verifying..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  // -------------------------
  // Hooks (declare all here)
  // -------------------------
  const [user, setUser] = useState(null);
  const [vipLevel, setVipLevel] = useState(1);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const vipImages = [vip1, vip2, vip3, vip4];
  const [vipIndex, setVipIndex] = useState(0);
  const vipIntervalRef = useRef(null);

  const menuRef = useRef(null);

  // processed icon data-urls (active/inactive) for bottom tabs
  const [processedIcons, setProcessedIcons] = useState({
    home: null,
    starting: null,
    records: null,
    profile: null,
  });

  // processed menu icons with transparent backgrounds (mask)
  const [processedMenuIcons, setProcessedMenuIcons] = useState({
    wfp: null,
    service: null,
    certificate: null,
    event: null,
    withdraw: null,
    deposit: null,
    terms: null,
  });

  // -------------------------
  // Effects / other hooks
  // -------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetch(`${API_URL}/api/user-profile`, {
      headers: { "x-auth-token": parsedUser.token },
    })
      .then((res) => res.json())
      .then((data) => {
        setVipLevel(data.user?.vipLevel || 1);
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    vipIntervalRef.current = setInterval(() => {
      setVipIndex((prev) => (prev + 1) % vipImages.length);
    }, 3500);

    return () => clearInterval(vipIntervalRef.current);
  }, []);

  // Runtime icon processor effect (keeps hooks declared above)
  useEffect(() => {
    let mounted = true;

    async function processIcon(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const w = img.width || 64;
            const h = img.height || 64;
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            let imageData = ctx.getImageData(0, 0, w, h);
            let data = imageData.data;

            // Sample corner pixels to estimate background color
            function samplePixel(x, y) {
              const idx = (y * w + x) * 4;
              return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
            }

            const px1 = samplePixel(1, 1);
            const px2 = samplePixel(Math.max(1, w - 2), 1);
            const px3 = samplePixel(1, Math.max(1, h - 2));
            const px4 = samplePixel(Math.max(1, w - 2), Math.max(1, h - 2));

            const avgBg = [
              Math.round((px1[0] + px2[0] + px3[0] + px4[0]) / 4),
              Math.round((px1[1] + px2[1] + px3[1] + px4[1]) / 4),
              Math.round((px1[2] + px2[2] + px3[2] + px4[2]) / 4),
              Math.round((px1[3] + px2[3] + px3[3] + px4[3]) / 4),
            ];

            const threshold = 30; // color closeness threshold

            // Make background-like pixels transparent
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              const dr = Math.abs(r - avgBg[0]);
              const dg = Math.abs(g - avgBg[1]);
              const db = Math.abs(b - avgBg[2]);

              // if close to background color and not already transparent => make transparent
              if (a > 0 && dr < threshold && dg < threshold && db < threshold) {
                data[i + 3] = 0;
              }
            }

            ctx.putImageData(imageData, 0, 0);

            // capture mask image (original colors, background stripped)
            const maskData = canvas.toDataURL();

            // Helper to tint non-transparent pixels to a given RGB color
            function tintedDataURL(targetRGB) {
              const c2 = document.createElement("canvas");
              c2.width = w;
              c2.height = h;
              const cctx = c2.getContext("2d");

              // draw the mask (image with transparent background)
              cctx.clearRect(0, 0, w, h);
              cctx.drawImage(canvas, 0, 0, w, h);

              const d = cctx.getImageData(0, 0, w, h);
              const dd = d.data;

              for (let i = 0; i < dd.length; i += 4) {
                const alpha = dd[i + 3];
                if (alpha > 0) {
                  dd[i] = targetRGB[0];
                  dd[i + 1] = targetRGB[1];
                  dd[i + 2] = targetRGB[2];
                  // leave alpha as-is
                }
              }

              cctx.putImageData(d, 0, 0);
              return c2.toDataURL();
            }

            const activeData = tintedDataURL([255, 255, 255]); // white
            const inactiveData = tintedDataURL([122, 122, 122]); // gray

            resolve({ mask: maskData, active: activeData, inactive: inactiveData });
          } catch (err) {
            // If any failure (CORS, security), fallback to null
            resolve(null);
          }
        };

        img.onerror = () => {
          resolve(null);
        };

        // set src last
        img.src = src;
      });
    }

    async function runProcessing() {
      // process the four tab icons in parallel
      const tabEntries = await Promise.all([
        processIcon(homeIcon),
        processIcon(taskIcon),
        processIcon(recordsIcon),
        processIcon(profileIcon),
      ]);

      if (!mounted) return;

      setProcessedIcons({
        home: tabEntries[0],
        starting: tabEntries[1],
        records: tabEntries[2],
        profile: tabEntries[3],
      });

      // process the menu icons in parallel (we'll extract the mask which has the background stripped)
      const menuEntries = await Promise.all([
        processIcon(wfpIcon),
        processIcon(serviceIcon),
        processIcon(certificateIcon),
        processIcon(eventIcon),
        processIcon(withdrawIcon),
        processIcon(depositIcon),
        processIcon(termsIcon),
      ]);

      if (!mounted) return;

      setProcessedMenuIcons({
        wfp: menuEntries[0] ? menuEntries[0].mask : null,
        service: menuEntries[1] ? menuEntries[1].mask : null,
        certificate: menuEntries[2] ? menuEntries[2].mask : null,
        event: menuEntries[3] ? menuEntries[3].mask : null,
        withdraw: menuEntries[4] ? menuEntries[4].mask : null,
        deposit: menuEntries[5] ? menuEntries[5].mask : null,
        terms: menuEntries[6] ? menuEntries[6].mask : null,
      });
    }

    runProcessing();

    return () => {
      mounted = false;
    };
  }, []);

  // -------------------------
  // Non-hook helpers (safe to define after hooks)
  // -------------------------
  const handleWithdrawClick = () => {
    setWithdrawPassword("");
    setWithdrawError("");
    setShowWithdrawModal(true);
  };

  const submitWithdrawPassword = async (e) => {
    e.preventDefault();

    try {
      setWithdrawLoading(true);

      const res = await fetch(`${API_URL}/api/verify-withdraw-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": user.token,
        },
        body: JSON.stringify({ password: withdrawPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setShowWithdrawModal(false);
        navigate("/withdraw");
      } else {
        setWithdrawError(data.message);
      }
    } catch {
      setWithdrawError("Verification failed.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Add menu items (include key for processedMenuIcons mapping)
  const menuItems = [
    { key: "wfp", label: "WFP", icon: wfpIcon, path: "/wfp" },
    { key: "service", label: "Service", icon: serviceIcon, path: "/service" },
    { key: "certificate", label: "Certificate", icon: certificateIcon, path: "/certificate" },
    { key: "event", label: "Event", icon: eventIcon, path: "/events" },
    { key: "withdraw", label: "Withdrawal", icon: withdrawIcon, path: "/withdraw" },
    { key: "deposit", label: "Deposit", icon: depositIcon, path: "/deposit" },
    { key: "terms", label: "T & C", icon: termsIcon, path: "/terms" },
  ];

  // At this point all hooks have been declared, so early return is safe:
  if (!user) return null;

  const scrollMenu = (distance = 120) => {
    if (!menuRef.current) return;
    menuRef.current.scrollBy({ left: distance, behavior: "smooth" });
  };

  // derive active tab from current path (no extra imports or new state)
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = (tabKey) => {
    if (tabKey === "home") return currentPath === "/" || currentPath === "/dashboard";
    if (tabKey === "starting") return currentPath.startsWith("/tasks") || currentPath.startsWith("/starting");
    if (tabKey === "records") return currentPath.startsWith("/records");
    if (tabKey === "profile") return currentPath.startsWith("/profile");
    return false;
  };

  // tab keys order (used for indicator placement)
  const tabKeys = ["home", "starting", "records", "profile"];
  const activeIndexRaw = tabKeys.findIndex((k) => isActive(k));
  const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : 0;

  // Helper to pick the correct src (processed if available, else fallback to original)
  const iconSrcFor = (key, originalSrc, active) => {
    const p = processedIcons[key];
    if (p && p.active && p.inactive) {
      return active ? p.active : p.inactive;
    }
    // fallback: use original image and rely on CSS filter to invert to white when active
    return originalSrc;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "74px",
        background: "#efebe6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        className="text-white"
        style={{
          padding: "10px 16px",
          background: "linear-gradient(90deg,#2b2a2c,#1b1a1b)",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                background: "transparent",
                padding: "4px 6px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ height: 52, objectFit: "contain", display: "block" }}
              />
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "1px",
                color: "#ffffff",
              }}
            >
              DIGITAL BLITZ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                background: "#ffffff",
                padding: "6px 10px",
                borderRadius: 12,
                color: "#111",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO - increased height as requested (280px in provided file) */}
      <video
        src={bannerVideo}
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: 280,
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* ICON MENU */}
      <div
        style={{
          background: "#efe9e3",
          padding: "8px 0 6px",
          position: "relative",
        }}
      >
        {/* invisible left scroll button */}
        <button
          onClick={() => scrollMenu(-140)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "transparent",
            border: "none",
            zIndex: 10,
            cursor: "pointer",
          }}
          aria-hidden="true"
        />

        {/* icon scroll container */}
        <div
          ref={menuRef}
          style={{
            display: "flex",
            gap: 12,
            padding: "6px 44px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
          className="menu-scroll"
        >
          <style>{`.menu-scroll::-webkit-scrollbar { display: none; }`}</style>

          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.key === "wfp") {
                  // navigate current tab to external WFP site (same-tab navigation)
                  // user requested "open as a page" (same tab)
                  window.location.href = "https://www.wfp.org/";
                  return;
                }

                if (item.key === "service") {
                  setShowServiceModal(true);
                  return;
                }

                if (item.key === "withdraw") {
                  handleWithdrawClick();
                  return;
                }

                navigate(item.path);
              }}
              className="flex flex-col items-center"
              style={{ background: "transparent", border: "none", minWidth: 64 }}
            >
              <img
                src={processedMenuIcons[item.key] || item.icon}
                alt={item.label}
                style={{
                  width: 64,
                  height: 44,
                  marginBottom: 6,
                  opacity: 0.98,
                  background: "transparent",
                  borderRadius: 10,
                  objectFit: "contain",
                  display: "block",
                  // If we don't have a processed (transparent) icon, use mixBlendMode to visually remove white bg.
                  mixBlendMode: processedMenuIcons[item.key] ? "normal" : "multiply",
                }}
              />
              <span
                className="text-[11px]"
                style={{ color: "#333", fontWeight: 500 }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* invisible right scroll button */}
        <button
          onClick={() => scrollMenu(140)}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "transparent",
            border: "none",
            zIndex: 10,
            cursor: "pointer",
          }}
          aria-hidden="true"
        />
      </div>

      {/* VIP */}
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginTop: 18,
        }}
      >
        <div
          style={{
            background: "#1d1b1f",
            borderRadius: "20px 20px 0 0",
            paddingTop: 12,
            paddingBottom: 10,
            boxSizing: "border-box",
          }}
        >
          <div style={{ padding: "0 16px 12px", boxSizing: "border-box" }}>
            <div className="flex justify-between items-center">
              <h3 className="text-white text-[15px] font-semibold">Vip Levels</h3>
              <button
                onClick={() => navigate("/premium")}
                className="text-[#999] text-[13px]"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#999", fontSize: 13 }}
                aria-label="View more VIP levels"
              >
                View More &gt;
              </button>
            </div>
          </div>

          {/* Inner card area (inset) */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
              padding: "0 16px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 980,
                boxSizing: "border-box",
                padding: 0,
                margin: 0,
              }}
            >
              {/* BIGGER inner rounded card so VIP image is larger */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: 14,
                  height: 260,
                  background: "#2a2829",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* carousel track */}
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    width: `${vipImages.length * 100}%`,
                    transform: `translateX(-${vipIndex * 100}%)`,
                    transition: "transform 420ms cubic-bezier(.22,.9,.32,1)",
                  }}
                >
                  {vipImages.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        flex: `0 0 100%`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                        padding: 0,
                        margin: 0,
                      }}
                      aria-hidden={vipIndex !== i}
                    >
                      {/* VIP image: fully visible artwork centered; fits inside the larger inner card */}
                      <img
                        src={img}
                        alt={`vip-${i}`}
                        style={{
                          maxWidth: "94%",
                          maxHeight: "94%",
                          objectFit: "contain",
                          display: "block",
                          backgroundColor: "#2a2829",
                          borderRadius: 12,
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* indicators inside card bottom center */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "auto",
                  }}
                >
                  {vipImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setVipIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      style={{
                        width: vipIndex === i ? 18 : 8,
                        height: 8,
                        borderRadius: 20,
                        background:
                          vipIndex === i ? "#fff" : "rgba(255,255,255,0.35)",
                        border: "none",
                        cursor: "pointer",
                        transition: "width 160ms ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <section
        style={{
          background: "#efebe6",
          padding: "0px 8px 18px",
        }}
      >
        {/* Working With The Best image — responsive */}
        <div style={{ textAlign: "center", marginBottom: 18}}>
          <img
            src={partnerRow}
            alt="Partners"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: 760,
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            color: "#8f8f8f",
            fontSize: 14,
          }}
        >
          2025—2026.
        </div>
      </section>

      {/* MODALS */}
      <WithdrawPasswordModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSubmit={submitWithdrawPassword}
        withdrawPassword={withdrawPassword}
        setWithdrawPassword={setWithdrawPassword}
        errorMsg={withdrawError}
        submitting={withdrawLoading}
      />

      <CustomerServiceModal
        open={showServiceModal}
        onClose={() => setShowServiceModal(false)}
      />

      {/* Use the shared BottomNav component instead of the local inline nav */}
      <BottomNav />
    </div>
  );
}
