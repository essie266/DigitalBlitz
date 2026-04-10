import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskRecords } from "../context/TaskRecordsContext";
import { useBalance } from "../context/balanceContext";
import "./Records.css";

// Header removed per request (Records page shouldn't render header)

// settings (currency)
import { useSettings } from "../context/SettingsContext";

import homeIcon from "../assets/images/tabBar/Homes.png";
import startingIcon from "../assets/images/tabBar/Start.png";
import recordsIcon from "../assets/images/tabBar/Record.png";
import profileIcon from "../assets/images/tabBar/My3.png";

import BottomNav from "../components/BottomNav.jsx"; // added import

const tabs = ["All", "Pending", "Completed"];

const START_BLUE = "#1fb6fc";
const BLACK_BG = "#181c23";

// Fixed tabs (header) height in px - used to reserve space so content doesn't go under it
const TAB_BAR_HEIGHT = 72;

function SpinnerOverlay({ show }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 11000,
        background: "rgba(245,247,251,0.38)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          border: "6px solid #ddd",
          borderTop: `6px solid ${START_BLUE}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>
        {`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>
    </div>
  );
}

function GreyToast({ show, message }) {
  if (!show) return null;
  return (
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
      <span>{message}</span>
      <style>
        {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

const Records = () => {
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();
  const { records, submitTaskRecord, refreshRecords } = useTaskRecords();
  const { balance, commissionToday, refreshProfile } = useBalance();
  const [submitting, setSubmitting] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [greyToast, setGreyToast] = useState({ show: false, message: "" });

  // We won't block initial render with spinner; we will refresh immediately and show a quick animation.
  const [showSpinner, setShowSpinner] = useState(false);

  // Visual feedback states
  const [tabAnimating, setTabAnimating] = useState(false);
  const [pageEnterAnim, setPageEnterAnim] = useState(false);

  // settings (currency)
  const { currency } = useSettings();

  // Utility: schedule work non-blocking (use idle callback when available)
  const scheduleNonBlocking = (fn) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      try {
        window.requestIdleCallback(fn, { timeout: 500 });
      } catch {
        setTimeout(fn, 0);
      }
    } else {
      setTimeout(fn, 0);
    }
  };

  // On mount: refresh in background (non-blocking) and show a short enter animation + success toast
  useEffect(() => {
    if (refreshRecords) {
      scheduleNonBlocking(() => {
        try {
          refreshRecords();
        } catch (e) {
          // ignore
          // console.error("refreshRecords threw on mount:", e);
        }
      });
    }

    // Show "Refresh success" immediately (no loading)
    setGreyToast({ show: true, message: "Refresh success" });
    const hideToast = setTimeout(() => setGreyToast({ show: false, message: "" }), 800);

    // Trigger a quick enter animation so user sees a transition
    setPageEnterAnim(true);
    const t = setTimeout(() => setPageEnterAnim(false), 800);

    return () => {
      clearTimeout(t);
      clearTimeout(hideToast);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also set up a fast periodic refresh but keep it light; still refreshRecords called immediately on mount.
  useEffect(() => {
    const interval = setInterval(() => {
      scheduleNonBlocking(() => {
        refreshRecords && refreshRecords();
      });
    }, 5000); // keep periodic but not too aggressive
    return () => clearInterval(interval);
  }, [refreshRecords]);

  // Precompute numeric timestamps to avoid expensive Date parsing in sorts
  const augmentedRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.map((r) => {
      const raw = r.startedAt || r.createdAt || r.completedAt || r.addedAt || r.updatedAt || null;
      const ts = raw ? Date.parse(raw) || 0 : 0;
      return { __ts: ts, ...r };
    });
  }, [records]);

  // Build combo groups (memoized)
  const pendingComboGroups = useMemo(() => {
    const groups = {};
    for (const rec of augmentedRecords) {
      if (String(rec.status || "").toLowerCase() === "pending" && rec.comboGroupId) {
        if (!groups[rec.comboGroupId]) groups[rec.comboGroupId] = [];
        groups[rec.comboGroupId].push(rec);
      }
    }
    // sort by precomputed timestamp
    Object.values(groups).forEach((arr) => arr.sort((a, b) => (a.__ts || 0) - (b.__ts || 0)));
    return groups;
  }, [augmentedRecords]);

  // Derive lastPendingComboTaskCodes memoized
  const lastPendingComboTaskCodes = useMemo(() => {
    return Object.values(pendingComboGroups).map((comboRecords) => {
      if (!comboRecords || comboRecords.length === 0) return null;
      return comboRecords[comboRecords.length - 1].taskCode;
    }).filter(Boolean);
  }, [pendingComboGroups]);

  // Filter records by activeTab (memoized)
  const filteredRecords = useMemo(() => {
    if (!Array.isArray(augmentedRecords)) return [];
    const at = (activeTab || "").toLowerCase();
    return augmentedRecords.filter((record) => {
      if (at === "all" || !activeTab) return true;
      return (record.status && String(record.status).toLowerCase() === at);
    });
  }, [augmentedRecords, activeTab]);

  // Sorted records (memoized) - uses __ts for date comparison
  const sortedRecords = useMemo(() => {
    // Use a stable sort approach with precomputed ts
    const arr = [...filteredRecords];
    arr.sort((a, b) => {
      if (
        a.comboGroupId &&
        b.comboGroupId &&
        a.comboGroupId === b.comboGroupId &&
        String(a.status || "").toLowerCase() === "pending" &&
        String(b.status || "").toLowerCase() === "pending"
      ) {
        return (b.canSubmit ? 1 : 0) - (a.canSubmit ? 1 : 0);
      }
      return (b.__ts || 0) - (a.__ts || 0);
    });
    return arr;
  }, [filteredRecords]);

  function getLastPendingComboTaskCode(comboRecords) {
    if (!comboRecords || comboRecords.length === 0) return null;
    return comboRecords[comboRecords.length - 1].taskCode;
  }

  const getRecordKey = (record, i) => {
    if (record.isCombo && typeof record.comboIndex !== "undefined") {
      return `${record.taskCode || record._id || "noid"}-combo-${record.comboIndex}`;
    }
    return record.taskCode || record._id || `idx-${i}`;
  };

  const showGrey = (message, duration = 1600) => {
    setGreyToast({ show: true, message });
    setTimeout(() => setGreyToast({ show: false, message: "" }), duration);
  };

  const handleSubmit = async (task) => {
    if (task.isCombo && task.canSubmit && balance < 0) {
      showGrey("Insufficient Balance.");
      setTimeout(() => {
        navigate("/deposit");
      }, 1600);
      return;
    }
    setSubmitting((prev) => ({ ...prev, [task.taskCode]: true }));
    setSubmitted((prev) => ({ ...prev, [task.taskCode]: false }));
    try {
      const result = await submitTaskRecord(task.taskCode);
      setSubmitting((prev) => ({ ...prev, [task.taskCode]: false }));
      if (!result.success && result.mustDeposit) {
        showGrey("Insufficient Balance.");
        setTimeout(() => {
          navigate("/deposit");
        }, 1600);
        return;
      }
      if (!result.success) {
        alert(result.message || "Failed to submit task.");
      } else {
        setSubmitted((prev) => ({ ...prev, [task.taskCode]: true }));
        await refreshProfile();
        scheduleNonBlocking(() => { refreshRecords && refreshRecords(); });
        setTimeout(() => {
          setSubmitted((prev) => ({ ...prev, [task.taskCode]: false }));
        }, 1500);
      }
    } catch (err) {
      setSubmitting((prev) => ({ ...prev, [task.taskCode]: false }));
      alert("Submission failed");
    }
  };

  const getRecordImage = (product) => {
    if (
      product &&
      typeof product.image === "string" &&
      product.image.trim() !== "" &&
      product.image !== "null"
    ) {
      return product.image;
    }
    return "/assets/images/products/default.png";
  };

  // helper to format numeric amount (2 decimals)
  const fmtNum = (v) => {
    const n = Number(v || 0);
    if (!Number.isFinite(n)) return "";
    return n.toFixed(2);
  };

  // Handle tab clicks: update immediately, call refreshRecords asynchronously and show "Refresh success" only (no loading)
  const onTabClick = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);

    // show success toast immediately
    showGrey("Refresh success", 800);

    // preserve a brief visual fade
    setTabAnimating(true);
    setTimeout(() => setTabAnimating(false), 300);

    // defer refreshRecords (non-blocking)
    scheduleNonBlocking(() => {
      try {
        refreshRecords && refreshRecords();
      } catch (e) {
        console.error("refreshRecords error on tab click:", e);
      }
    });
  };

  const renderProductRecord = (record, i) => {
    // Date string
    const dateStr = record.completedAt
      ? new Date(record.completedAt).toLocaleString()
      : record.startedAt
      ? new Date(record.startedAt).toLocaleString()
      : record.createdAt
      ? new Date(record.createdAt).toLocaleString()
      : "";

    // Determine button color for pending vs others (pending should match tasks modal color)
    const isPendingButton = String(record.status || "").toLowerCase() === "pending";

    return (
      <div key={getRecordKey(record, i)} style={{ marginBottom: 10 }}>
        {/* Date + status row (status placed inline to the right, outside card) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 8px 8px" }}>
          <div style={{ color: "#bfb7af", fontSize: 13, fontWeight: 700 }}>{dateStr}</div>

          <div>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                background: record.status === "Completed" ? "#1f1f1f" : "#e0e0e0",
                color: record.status === "Completed" ? "#fff" : "#666",
                fontWeight: 700,
                fontSize: 12,
                display: "inline-block",
              }}
            >
              {record.status}
            </span>
          </div>
        </div>

        <div
          className={`record-card ${tabAnimating || pageEnterAnim ? "animate-fade" : ""}`}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 14px rgba(0,0,0,0.045)",
            marginBottom: 6,
            padding: "12px 12px",
            position: "relative",
          }}
        >
          <div className="record-content flex items-center gap-3" style={{ marginBottom: 8 }}>
            <img
              src={getRecordImage(record.product)}
              alt={record.product?.name || "Product"}
              className="record-img"
              style={{
                width: 84, // increased image size
                height: 84,
                borderRadius: 12,
                objectFit: "cover",
                background: "#f5f5f5",
                border: "1px solid #f2f2f2",
                flex: "0 0 84px",
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/images/products/default.png";
              }}
            />
            <div className="record-info flex-1 min-w-0">
              <div className="truncate" style={{ fontSize: 17, fontWeight: 700, color: "#6e6e6e", marginBottom: 6 }}>
                {record.product?.name}
              </div>

              <div style={{ color: "#9a9a9a", fontSize: 13, marginBottom: 6 }}>
                {currency || ""} {fmtNum(record.product?.price)}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ color: "#ffcf2e", fontSize: 14, lineHeight: 1 }}>
                  {/* five stars */}
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between" style={{ borderTop: "1px solid #f1f1f0", paddingTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#a5a5a5", fontSize: 12, marginBottom: 6 }}>Total Amount</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#222" }}>
                {currency || ""} {fmtNum(record.product?.price)}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: "#a5a5a5", fontSize: 12, marginBottom: 6 }}>Commission</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#222" }}>
                {currency || ""} {fmtNum(record.product?.commission)}
              </div>
            </div>
          </div>

          {/* Submit button area (if applicable) */}
          {(
            ((record.status === "Pending" && (!record.isCombo || record.canSubmit)) ||
              (submitted[record.taskCode] && record.status === "Completed"))
          ) && (
            (!record.comboGroupId ||
              lastPendingComboTaskCodes.includes(record.taskCode) ||
              record.canSubmit) && (
              <div style={{ marginTop: 10 }}>
                <button
                  className="submit-btn"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    padding: "10px 0",
                    fontWeight: 700,
                    fontSize: 15,
                    background: isPendingButton ? BLACK_BG : START_BLUE,
                    color: "#fff",
                    opacity: submitting[record.taskCode] ? 0.8 : 1,
                    boxShadow: `0 4px 14px ${isPendingButton ? `${BLACK_BG}22` : `${START_BLUE}22`}`,
                  }}
                  onClick={() => handleSubmit(record)}
                  disabled={submitting[record.taskCode] || submitted[record.taskCode]}
                >
                  {submitting[record.taskCode] ? "Submitting..." : submitted[record.taskCode] ? "Submitted" : "Submit"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // bottom nav helper: derive active using pathname
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = (tabKey) => {
    if (tabKey === "home") return currentPath === "/" || currentPath === "/dashboard";
    if (tabKey === "starting") return currentPath.startsWith("/tasks") || currentPath.startsWith("/starting");
    if (tabKey === "records") return currentPath.startsWith("/records");
    if (tabKey === "profile") return currentPath.startsWith("/profile");
    return false;
  };

  // Inline styles and small CSS for animation effects so you don't need to change the separate CSS file
  const inlineAnimStyles = (
    <style>{`
      .animate-fade {
        animation: fadeEffect 1000ms ease;
      }
      @keyframes fadeEffect {
        0% { opacity: 0.55; transform: translateY(6px); }
        50% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }
      /* small helper to ensure content scrolls under fixed header smoothly */
      .records-container { -webkit-overflow-scrolling: touch; }
    `}</style>
  );

  return (
    <div className="records-container" style={{ background: "#efe9e3", minHeight: "100vh", paddingBottom: 78 }}>
      {inlineAnimStyles}
      <SpinnerOverlay show={showSpinner} />
      <GreyToast show={greyToast.show} message={greyToast.message} />

      {/* Fixed tabs header - will not scroll with page */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div className="tabs" style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", width: "100%", maxWidth: 980 }}>
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""} text-base font-semibold`}
              style={{
                cursor: "pointer",
                padding: "10px 6px",
                textAlign: "center",
                borderRadius: 18,
                fontWeight: activeTab === tab ? 800 : 700,
                fontSize: 16,
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
              onClick={() => onTabClick(tab)}
              data-i18n={tab}
            >
              <div style={{ paddingBottom: activeTab === tab ? 6 : 12, borderBottom: activeTab === tab ? `4px solid ${BLACK_BG}` : "4px solid transparent" }}>
                {tab}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* spacer so content sits below fixed tabs */}
      <div style={{ height: TAB_BAR_HEIGHT }} />

      {/* Space between tabs and first card is reduced */}
      <div style={{ height: 6 }} />

      <div className={`record-list px-2 ${tabAnimating || pageEnterAnim ? "animate-fade" : ""}`} style={{ gap: 10 }}>
        {showSpinner ? (
          <div style={{ height: "80px" }} />
        ) : sortedRecords.length === 0 ? (
          <p className="no-records" style={{ padding: 12, color: "#999" }} data-i18n="No records in this category.">
            No records in this category.
          </p>
        ) : (
          sortedRecords.map((record, i) => renderProductRecord(record, i))
        )}
      </div>

      {/* Use shared BottomNav component instead of the local inline nav */}
      <BottomNav />
    </div>
  );
};

export default Records;
