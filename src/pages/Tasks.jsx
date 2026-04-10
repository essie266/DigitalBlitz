import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskRecords } from "../context/TaskRecordsContext";
import { useBalance } from "../context/balanceContext";
import { useToast } from "../context/ToastContext";
import "./Tasks.css";

import { useSettings } from "../context/SettingsContext";

import avatar from "../assets/images/profile/avatar.png";
import vip1 from "../assets/images/vip/vip1.png";
import vip2 from "../assets/images/vip/vip2.png";
import vip3 from "../assets/images/vip/vip3.png";
import vip4 from "../assets/images/vip/vip4.png";
import homeIcon from "../assets/images/tabBar/Homes.png";
import startingIcon from "../assets/images/tabBar/Start.png";
import recordsIcon from "../assets/images/tabBar/Record.png";
import profileIcon from "../assets/images/tabBar/My3.png";

// Import local diamond-shaped images
import main from "../assets/images/Starting/main.png";
import sub1 from "../assets/images/Starting/1.png";
import sub2 from "../assets/images/Starting/2.png";
import sub3 from "../assets/images/Starting/3.png";
import sub4 from "../assets/images/Starting/4.png";
import sub5 from "../assets/images/Starting/5.png";
import sub6 from "../assets/images/Starting/6.png";
import sub7 from "../assets/images/Starting/7.png";
import sub8 from "../assets/images/Starting/8.png";

import BottomNav from "../components/BottomNav.jsx"; // added shared BottomNav import

// CONFIG
const START_BLUE = "#1fb6fc";
const BLACK_BG = "#181c23";

// Local images array for rotating carousel
const LOCAL_IMAGES = [sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8];
const MAIN_IMAGE = main;

// UI Components
function Spinner({ size = 36, color = "#bbb", style = {} }) {
  return (
    <div
      style={{
        border: `3px solid #ececec`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        width: size,
        height: size,
        animation: "spin 0.9s linear infinite",
        ...style,
      }}
    />
  );
}

// JumpingBars animation component (grey jumping bars used when clicking "Start")
function JumpingBars({ size = 44, barColor = "#999" }) {
  const barWidth = Math.max(6, Math.floor(size / 8));
  const barHeight = Math.max(10, Math.floor(size / 3));
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <style>{`
        @keyframes jumpBars {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }
      `}</style>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: barWidth,
            height: barHeight,
            background: barColor,
            borderRadius: barWidth / 2,
            animation: `jumpBars 0.7s ${i * 0.08}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

function FadeOverlay({ show, children }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 11000,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "all",
        transition: "opacity 0.5s"
      }}
    >
      {children}
      <style>
        {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
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
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Main Component
const Tasks = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showOptimizingOverlay, setShowOptimizingOverlay] = useState(false);
  const [submitState, setSubmitState] = useState("");
  const [fadeSpinner, setFadeSpinner] = useState(false);
  const [greyToast, setGreyToast] = useState({ show: false, message: "" });
  const [rotation, setRotation] = useState(0);

  const navigate = useNavigate();
  const {
    addTaskRecord,
    submitTaskRecord,
    hasPendingTask,
    hasPendingComboTask,
    records,
    fetchTaskRecords,
    setRecords,
  } = useTaskRecords();

  const {
    balance,
    setBalance,
    commissionToday,
    setCommissionToday,
    username,
    vipLevel,
    refreshProfile,
    userProfile
  } = useBalance();
  const { showToast } = useToast();
  const { currency } = useSettings();

  // Display state
  const [displayUser, setDisplayUser] = useState({
    username: username || "",
    balance: balance != null ? balance : 0,
    commissionToday: commissionToday != null ? commissionToday : 0,
  });

  const fetchProfileDirect = async () => {
    try {
      const token =
        localStorage.getItem("x-auth-token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("X-Auth-Token") ||
        null;

      if (!token) return null;

      const resp = await fetch("https://stacksapp-backend.onrender.com/api/user-profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-auth-token": token
        },
        credentials: "include",
      });

      if (!resp.ok) return null;
      const body = await resp.json();
      const profile = body && (body.data || body.user || body);
      if (!profile) return null;

      const newDisplay = {
        username: profile.username || profile.name || username || "",
        balance: profile.balance ?? profile.walletBalance ?? balance ?? 0,
        commissionToday: profile.commissionToday ?? profile.commission ?? commissionToday ?? 0,
      };
      setDisplayUser(newDisplay);

      if (typeof setBalance === "function" && newDisplay.balance !== undefined) {
        setBalance(prev => (Number(newDisplay.balance) || Number(prev) || 0));
      }
      if (typeof setCommissionToday === "function" && newDisplay.commissionToday !== undefined) {
        setCommissionToday(prev => (Number(newDisplay.commissionToday) || Number(prev) || 0));
      }

      return profile;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    setDisplayUser({
      username: username || (userProfile && userProfile.username) || "",
      balance: balance != null ? balance : (userProfile && userProfile.balance) || 0,
      commissionToday:
        commissionToday != null
          ? commissionToday
          : (userProfile && (userProfile.commissionToday ?? userProfile.commission)) || 0,
    });
  }, [username, balance, commissionToday, userProfile]);

  useEffect(() => {
    (async () => {
      try {
        const refreshed = await refreshProfile();
        if (refreshed && typeof refreshed === "object") {
          setDisplayUser({
            username: refreshed.username || refreshed.name || username || "",
            balance: refreshed.balance ?? refreshed.walletBalance ?? balance ?? 0,
            commissionToday: refreshed.commissionToday ?? refreshed.commission ?? commissionToday ?? 0,
          });
        } else {
          await fetchProfileDirect();
        }
      } catch (e) {
        await fetchProfileDirect();
      }
    })();

    if (typeof fetchTaskRecords === "function") fetchTaskRecords().catch(() => {});

    const onAuthLogin = () => {
      (async () => {
        try {
          const refreshed = await refreshProfile();
          if (refreshed && typeof refreshed === "object") {
            setDisplayUser({
              username: refreshed.username || refreshed.name || username || "",
              balance: refreshed.balance ?? refreshed.walletBalance ?? balance ?? 0,
              commissionToday: refreshed.commissionToday ?? refreshed.commission ?? commissionToday ?? 0,
            });
          } else {
            await fetchProfileDirect();
          }
          if (typeof fetchTaskRecords === "function") await fetchTaskRecords();
        } catch (e) {
          await fetchProfileDirect();
          if (typeof fetchTaskRecords === "function") fetchTaskRecords().catch(() => {});
        }
      })();
    };
    window.addEventListener("auth:login", onAuthLogin);

    const onProfileRefresh = () => {
      (async () => {
        try {
          const refreshed = await refreshProfile();
          if (refreshed && typeof refreshed === "object") {
            setDisplayUser({
              username: refreshed.username || refreshed.name || username || "",
              balance: refreshed.balance ?? refreshed.walletBalance ?? balance ?? 0,
              commissionToday: refreshed.commissionToday ?? refreshed.commission ?? commissionToday ?? 0,
            });
          } else {
            await fetchProfileDirect();
          }
        } catch (e) {
          await fetchProfileDirect();
        }
      })();
    };
    window.addEventListener("profile:refresh", onProfileRefresh);

    return () => {
      window.removeEventListener("auth:login", onAuthLogin);
      window.removeEventListener("profile:refresh", onProfileRefresh);
    };
  }, []);

  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  function getCurrentTaskCountThisSet() {
    if (!records || !userProfile) return 0;
    const currentSet = userProfile.currentSet ?? 1;
    let comboTaskCodes = new Set();
    let count = 0;
    records.forEach(r => {
      if (r.status === "Completed" && (r.set === currentSet || r.set === undefined)) {
        if (r.isCombo) {
          if (r.taskCode && !comboTaskCodes.has(r.taskCode)) {
            count += 1;
            comboTaskCodes.add(r.taskCode);
          }
        } else {
          count += 1;
        }
      }
    });
    let pendingComboCodes = new Set();
    let hasPendingCombo = false;
    records.forEach(r => {
      if (r.status === "Pending" && (r.set === currentSet || r.set === undefined)) {
        if (r.isCombo) {
          if (r.taskCode && !pendingComboCodes.has(r.taskCode)) {
            hasPendingCombo = true;
            pendingComboCodes.add(r.taskCode);
          }
        } else {
          count += 1;
        }
      }
    });
    if (hasPendingCombo) count += 1;
    return count;
  }

  const vipConfig = { 1: { taskLimit: 40 }, 2: { taskLimit: 45 }, 3: { taskLimit: 50 }, 4: { taskLimit: 55 } };
  const maxTasks =
    (userProfile && userProfile.maxTasks) ||
    vipConfig[Number(vipLevel)]?.taskLimit ||
    40;
  const todaysTasks = getCurrentTaskCountThisSet();

  const showGreyToast = (message, duration = 1600) => {
    setGreyToast({ show: true, message });
    setTimeout(() => setGreyToast({ show: false, message: "" }), duration);
  };

  const handleStartTask = async () => {
    if (hasPendingTask() || hasPendingComboTask()) {
      showGreyToast("Please submit the previous rating before you proceed.");
      return;
    }

    if (todaysTasks >= maxTasks) {
      showGreyToast("Task set complete. Please contact customer service for reset.");
      return;
    }

    setOptimizing(true);
    setShowOptimizingOverlay(true);

    const imageForTask = MAIN_IMAGE;

    try {
      const result = await addTaskRecord({ image: imageForTask });
      setOptimizing(false);
      setShowOptimizingOverlay(false);

      if (result && result.isCombo) {
        showGreyToast("Please submit the previous rating before you proceed.", 1800);
        setTimeout(() => {
          navigate("/deposit");
        }, 1800);
        return;
      }

      if (result && result.task) {
        const backendTask = result.task;
        if (!backendTask.product?.image) {
          backendTask.product = backendTask.product || {};
          backendTask.product.image = imageForTask;
        }
        setCurrentTask(backendTask);
        setShowModal(true);
        setSubmitState("");
        if (typeof backendTask.product?.price === "number") {
          setBalance(prev => Number(prev) - Number(backendTask.product.price));
        }

        (async () => {
          try { await refreshProfile(); } catch (e) {}
          try { if (typeof fetchTaskRecords === "function") await fetchTaskRecords(); } catch (e) {}
          try { window.dispatchEvent(new Event("profile:refresh")); } catch (e) {}
          try { window.dispatchEvent(new Event("balance:changed")); } catch (e) {}
        })();

      } else {
        showGreyToast("Failed to start task. Please try again later.");
      }
    } catch (err) {
      setOptimizing(false);
      setShowOptimizingOverlay(false);
      showGreyToast("API error: " + (err.message || err));
    }
  };

  const handleSubmitTask = async () => {
    if (!currentTask) return;
    setSubmitState("submitting");

    try {
      const result = await submitTaskRecord(currentTask.taskCode);

      if (result && result.success) {
        setSubmitState("submitted");
        if (result.task) {
          const refund = Number(result.task.product?.price) || 0;
          const commission = Number(result.task.product?.commission) || 0;
          setCommissionToday(prev => commission + (Number(prev) || 0));
          setBalance(prev => Number(prev) + refund + commission);
          setRecords(prevRecords => {
            return prevRecords.map(r =>
              r.taskCode === result.task.taskCode
                ? { ...r, ...result.task }
                : r
            );
          });
        }

        (async () => {
          try { await refreshProfile(); } catch (e) {}
          try { if (typeof fetchTaskRecords === "function") await fetchTaskRecords(); } catch (e) {}
          try { window.dispatchEvent(new Event("profile:refresh")); } catch (e) {}
          try { window.dispatchEvent(new Event("balance:changed")); } catch (e) {}
        })();

        setTimeout(() => {
          setShowModal(false);
          setCurrentTask(null);
          setSubmitState("");
          setFadeSpinner(true);
          setTimeout(() => {
            setFadeSpinner(false);
          }, 250);
        }, 250);
      } else {
        setSubmitState("");
        showGreyToast(result && result.message ? result.message : "Failed to submit task");
      }
    } catch (err) {
      setSubmitState("");
      showGreyToast("API error: " + (err.message || err));
    }
  };

  function renderTaskModal() {
    if (!currentTask) return null;
    const product = currentTask.product || {};
    const displayPrice = (() => {
      const candidate =
        product.price !== undefined && product.price !== null && product.price !== ""
          ? product.price
          : (currentTask?.product?.price ?? currentTask?.totalAmount ?? "");
      if (candidate === "" || candidate === null || candidate === undefined) return "";
      const num = Number(candidate);
      return !isNaN(num) ? num.toFixed(2) : String(candidate);
    })();

    const displayCommission = (() => {
      const c = product.commission ?? "";
      if (c === "" || c === null || c === undefined) return "";
      const num = Number(c);
      return !isNaN(num) ? num.toFixed(2) : String(c);
    })();

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2" style={{fontFamily:"Arial,sans-serif"}}>
        <div
          className="w-full max-w-lg rounded-[20px] shadow-2xl"
          style={{
            minWidth: 320,
            maxWidth: 460,
            borderRadius: 20,
            border: "none",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            paddingBottom: 20,
            background: "#ffffff" // white modal to match platform cards
          }}
        >
          <div className="flex justify-between items-center mb-0 px-6 pt-6 pb-1">
            <div
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#111111",
                letterSpacing: "0.01em"
              }}
              data-i18n="Task Submission"
            >
              Task Submission
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 text-2xl px-2 py-1 rounded hover:bg-gray-100"
              style={{ lineHeight: 1, background: "none", border: "none", color: "#666" }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex flex-row items-center px-6" style={{marginTop:6, marginBottom:10}}>
            <img
              src={product.image || MAIN_IMAGE}
              alt="Product"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MAIN_IMAGE; }}
              style={{
                width: 68,
                height: 68,
                borderRadius: 14,
                objectFit: "cover",
                marginRight: 14,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
              }}
            />
            <div style={{flex:1, minWidth:0}}>
              <div style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#111111",
                marginBottom: 2,
                letterSpacing: 0.01,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "1.15"
              }}>
                {product.name}
              </div>
              <div style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#111111", // amounts black as requested
                marginBottom: 1,
                lineHeight: "1.12",
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                <span style={{ color: "#666", fontWeight: 700, marginRight: 6 }}>{currency || ""}</span>
                <span
                  style={{ color: "#111", fontWeight: 800 }}
                  title={displayPrice ? `${currency || ""} ${displayPrice}` : ""}
                >
                  {displayPrice}
                </span>
              </div>
              <div style={{
                margin: "6px 0 0 0",
                display: "flex",
                alignItems: "center"
              }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 32 32" fill="#FFD700" style={{ marginRight: i < 4 ? 3 : 0 }}>
                    <polygon points="16,2 20,12 31,12.5 22,19 25,29 16,23.5 7,29 10,19 1,12.5 12,12" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #f1f1f1",
            margin: "6px 0 0 0"
          }} />

          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "14px 8px 8px 8px"
          }}>
            <div style={{
              flex: 1,
              textAlign: "center"
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#888888",
                marginBottom: 3
              }} data-i18n="Total Amount">Total Amount</div>
              <div style={{
                color: "#111", // amounts black
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: ".01em",
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 8
              }}>
                <span style={{ color: "#666", fontWeight: 700 }}>{currency || ""}</span>
                <span style={{ color: "#111" }}>{displayPrice}</span>
              </div>
            </div>
            <div style={{
              flex: 1,
              textAlign: "center"
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#888888",
                marginBottom: 3
              }} data-i18n="Commission">Commission</div>
              <div style={{
                color: "#111", // commission black
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: ".01em",
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 8
              }}>
                <span style={{ color: "#666", fontWeight: 700 }}>{currency || ""}</span>
                <span style={{ color: "#111" }}>{displayCommission}</span>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #f1f1f1",
            margin: "0 0 0 0"
          }} />

          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "13px 28px 0 28px",
            fontSize: 14.5,
            fontWeight: 500,
            color: "#666",
            letterSpacing: "0.01em"
          }}>
            <div data-i18n="Created At">Created At</div>
            <div style={{ fontWeight: 700, color: "#111" }}>
              {formatDate(product.createdAt || currentTask.createdAt)}
            </div>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 28px 0 28px",
            fontSize: 14.5,
            fontWeight: 500,
            color: "#666",
            letterSpacing: "0.01em"
          }}>
            <div data-i18n="Task Code">Task Code</div>
            <div style={{
              fontWeight: 700,
              color: "#111", // taskcode black
              fontFamily: "monospace",
              fontSize: 15.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "63vw",
              textTransform: "uppercase"
            }}>
              {currentTask.taskCode}
            </div>
          </div>

          <div style={{ padding: "0 28px 0 28px", marginTop: 18 }}>
            <button
              onClick={submitState === "" ? handleSubmitTask : undefined}
              disabled={submitState !== ""}
              className="mt-2 w-full py-2 text-white rounded-full font-semibold text-lg"
              style={{
                background: "#111", // submit button black
                color: "#fff",
                opacity: 1,
                transition: "opacity 0.2s",
                boxShadow: `0 6px 18px ${START_BLUE}22`,
                borderRadius: "18px",
                fontSize: "1.08rem",
                marginTop: 2,
                border: "none",
                cursor: submitState !== "" ? "not-allowed" : "pointer",
                padding: "12px 18px"
              }}
            >
              {submitState === "submitting" ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Spinner size={24} style={{ marginRight: 9 }} color={"#fff"} />
                  <span data-i18n="Submitting...">Submitting...</span>
                </span>
              ) : submitState === "submitted" ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Spinner size={24} style={{ marginRight: 9 }} color={"#fff"} />
                  <span data-i18n="Submitted!">Submitted!</span>
                </span>
              ) : (
                <span data-i18n="Submit">Submit</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render carousel - NO card container, sits directly on page bg
  const renderCarousel = () => {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px",
          paddingTop: "20px",
        }}
      >
        <style>
          {`
            .carousel-img-orbit {
              mix-blend-mode: darken;
              -webkit-mask-image: radial-gradient(circle, black 0%, black 70%, transparent 100%);
              mask-image: radial-gradient(circle, black 0%, black 70%, transparent 100%);
              filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15)) contrast(1.1);
            }
            
            .carousel-center-img {
              mix-blend-mode: darken;
              -webkit-mask-image: radial-gradient(circle, black 0%, black 70%, transparent 100%);
              mask-image: radial-gradient(circle, black 0%, black 70%, transparent 100%);
              filter: drop-shadow(0 12px 24px rgba(0,0,0,0.2)) contrast(1.1);
            }
          `}
        </style>

        {/* Carousel container - NO background card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            padding: "30px 0",
          }}
        >
          {/* Carousel content area */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "470px",
              margin: "0 auto",
            }}
          >
            {/* Center fixed diamond image with label */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "55%",
                transform: "translate(-50%, -50%)",
                width: "200px",
                height: "200px",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <img
                src={MAIN_IMAGE}
                alt="main"
                className="carousel-center-img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <div style={{
                marginTop: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#999",
                textAlign: "center"
              }}>
                
              </div>
            </div>

            {/* 8 orbiting diamond images */}
            {LOCAL_IMAGES.map((img, idx) => {
              const angle = (rotation + (idx * 45)) * (Math.PI / 180);
              const radius = 155;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <img
                  key={`sub-${idx}`}
                  src={img}
                  alt={`sub-${idx}`}
                  className="carousel-img-orbit"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "55%",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    display: "block",
                    zIndex: 5,
                    borderRadius: "18px",
                  }}
                />
              );
            })}
          </div>

          {/* Start button */}
          <div style={{ marginTop: 0, display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleStartTask}
              disabled={optimizing}
              style={{
                background: BLACK_BG,
                color: "#fff",
                padding: "14px 40px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 16,
                border: "none",
                boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
                width: "78%",
                maxWidth: 580,
                cursor: optimizing ? "wait" : "pointer"
              }}
            >
              Start ({todaysTasks}/{maxTasks})
            </button>
          </div>

          {/* Today's profits */}
          <div style={{ marginTop: 16, textAlign: "center", padding: "0 20px", color: "#222" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Today's Profits: {fmtNum(displayUser.commissionToday)}</div>
            <div style={{ fontSize: 12, color: "#777", lineHeight: 1.4 }}>
              The displayed amount reflects the profits earned today as an indication.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getVipBadgeInfo = () => {
    const raw = vipLevel ?? userProfile?.vipLevel;
    if (raw === undefined || raw === null) return { level: null, badge: null };
    let lvlNum = null;
    if (typeof raw === "number") lvlNum = raw;
    else if (typeof raw === "string") {
      const m = raw.match(/\d+/);
      lvlNum = m ? Number(m[0]) : NaN;
    } else {
      lvlNum = Number(raw);
    }
    if (!Number.isFinite(lvlNum)) return { level: null, badge: null };
    const level = Math.max(1, Math.min(4, Math.floor(lvlNum)));
    const map = { 1: vip1, 2: vip2, 3: vip3, 4: vip4 };
    const badge = map[level] || null;
    return { level, badge };
  };

  const vipInfo = getVipBadgeInfo();

  const fmtNum = (v) => {
    const n = Number(v || 0);
    if (!Number.isFinite(n)) return "";
    return n.toFixed(2);
  };

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = (tabKey) => {
    if (tabKey === "home") return currentPath === "/" || currentPath === "/dashboard";
    if (tabKey === "starting") return currentPath.startsWith("/tasks") || currentPath.startsWith("/starting");
    if (tabKey === "records") return currentPath.startsWith("/records");
    if (tabKey === "profile") return currentPath.startsWith("/profile");
    return false;
  };

  const tabKeys = ["home", "starting", "records", "profile"];
  const activeIndexRaw = tabKeys.findIndex((k) => isActive(k));
  const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : 0;

  // Use explicit currency label under amounts as uppercase per request
  const currencyLabel = (currency || "USDC").toString().toUpperCase();

  return (
    <div className="min-h-screen pb-20 bg-[#efe9e3] relative" style={{fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"}}>
      {/* Dark curved header background */}
      <div
        style={{
          width: "99.6vw",
          left: 1,
          top: 0,
          position: "absolute",
          zIndex: 0,
          background: BLACK_BG,
          height: 350,
          borderBottomLeftRadius: 60,
          borderBottomRightRadius: 60,
        }}
      />

      {/* Header section */}
      <div style={{ zIndex: 1, position: "relative", paddingTop: 28, paddingBottom: 12, paddingLeft: 20, paddingRight: 20 }}>
        {/* Avatar and Name with VIP */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
          {/* Avatar */}
          <div>
            <img 
              src={avatar} 
              alt="Avatar" 
              style={{ 
                width: 70, 
                height: 70, 
                borderRadius: "50%",
                border: "0px solid #00d9d9",
                flexShrink: 0
              }} 
            />
          </div>
          
          {/* Name and description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ 
                fontSize: 18, 
                fontWeight: 800, 
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.8px"
              }}>
                Hi, {displayUser.username} <span style={{fontSize: 24}}>👏</span>
              </h1>
            </div>
            <p style={{ 
              fontSize: 13, 
              color: "#e8e8e8",
              margin: 0,
              lineHeight: 1.8,
              marginTop: 3
            }}>
              Join 65,000 others and learn the secrets to SEO success with ourweekly blog posts.
            </p>
          </div>

          {/* VIP Badge */}
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            {vipInfo.badge ? (
              <img src={vipInfo.badge} alt={`VIP-${vipInfo.level}`} style={{ height: 45, display: "block" }} />
            ) : vipInfo.level ? (
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>VIP{vipInfo.level}</div>
            ) : (
              <img src={vip2} alt="VIP" style={{ height: 40, display: "block" }} />
            )}
          </div>
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <div style={{ zIndex: 2, position: "relative", padding: "0 20px", marginBottom: -60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 1100, margin: "0 auto" }}>
          {/* Wallet Balance Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: "18px 18px 16px 18px",
            position: "relative",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "visible",
            minHeight: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            {/* Icon Badge Top Right - REMOVED */}

            {/* Title */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111", letterSpacing: "0.2px" }} data-i18n="Wallet Balance">
                Wallet Balance
              </div>
            </div>

            {/* Amount row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#00d966", lineHeight: 1 }}>
                {fmtNum(displayUser.balance)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {currencyLabel}
              </div>
            </div>

            {/* Supporting text */}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 13, color: "#222", fontWeight: 500 }} data-i18n="Commission will be added here">
                Commission will be added here
              </div>
            </div>
          </div>

          {/* Daily Commission Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: "18px 18px 16px 18px",
            position: "relative",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "visible",
            minHeight: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            {/* Icon Badge Top Right - REMOVED */}

            {/* Title */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111", letterSpacing: "0.2px" }} data-i18n="Daily Commission">
                Daily Commission
              </div>
            </div>

            {/* Amount row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111", lineHeight: 1 }}>
                {fmtNum(displayUser.commissionToday)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {currencyLabel}
              </div>
            </div>

            {/* Supporting text */}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 13, color: "#222", fontWeight: 500 }} data-i18n="Daily Earned">
                Daily Earned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Section - NO card container */}
      <div style={{ zIndex: 3, position: "relative" }}>
        {renderCarousel()}
      </div>

      {/* Notice Box */}
      <div style={{ zIndex: 3, position: "relative", margin: "16px 16px 0 16px", padding: 20, borderRadius: 14, background: "#3d3d3d", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
          <span data-i18n="Notice">Notice</span>
        </div>
        <p style={{ fontSize: 12, color: "#e0e0e0", margin: 0, lineHeight: 1.5 }} data-i18n="Online Support Hours">
          Online Support Hours 9:00 - 21:00<br/>Please contact online support for your assistance!
        </p>
      </div>

      {showModal && renderTaskModal()}

      <FadeOverlay show={fadeSpinner}>
        <Spinner size={44} color={START_BLUE} />
      </FadeOverlay>
      <GreyToast show={greyToast.show} message={greyToast.message} />

      {showOptimizingOverlay && (
        <FadeOverlay show={showOptimizingOverlay}>
          <JumpingBars size={44} barColor="#999" />
        </FadeOverlay>
      )}

      {/* Use the shared BottomNav component instead of the local inline nav */}
      <BottomNav />
    </div>
  );
};

function formatDate(dateValue) {
  if (!dateValue) return "";
  try {
    const date = typeof dateValue === "string" || typeof dateValue === "number" ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return "";
  }
}

export default Tasks;
