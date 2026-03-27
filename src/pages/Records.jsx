import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskRecords } from "../context/TaskRecordsContext";
import { useBalance } from "../context/balanceContext";
import "./Records.css";

import Header from "../components/Header";

// settings (currency)
import { useSettings } from "../context/SettingsContext";

import homeIcon from "../assets/images/tabBar/homeh.png";
import startingIcon from "../assets/images/tabBar/icon30.png";
import recordsIcon from "../assets/images/tabBar/records.png";

const tabs = ["All", "Pending", "Completed"];

const START_BLUE = "#1fb6fc";
const BLACK_BG = "#181c23";

function SpinnerOverlay({ show }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        zIndex: 11000,
        background: "rgba(245,247,251,0.38)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          border: "6px solid #ddd",
          borderTop: `6px solid ${START_BLUE}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
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

  const [showSpinner, setShowSpinner] = useState(true);

  // settings (currency)
  const { currency } = useSettings();

  // On mount: ensure records are refreshed immediately.
  // Use the returned Promise (refreshRecords may be async) to hide spinner when done.
  useEffect(() => {
    setShowSpinner(true);
    if (refreshRecords) {
      // call and hide spinner once it completes (or after a short timeout fallback)
      let didFinish = false;
      const finish = () => {
        if (!didFinish) {
          didFinish = true;
          setShowSpinner(false);
        }
      };
      const p = refreshRecords();
      if (p && typeof p.finally === "function") {
        p.finally(finish);
      } else {
        // If refreshRecords doesn't return a promise, fallback to 800ms delay
        setTimeout(finish, 800);
      }
    } else {
      // No refreshRecords available -> fallback to previous behavior
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  useEffect(() => {
    if (showSpinner) return;
    const interval = setInterval(() => {
      refreshRecords && refreshRecords();
    }, 1000);
    return () => clearInterval(interval);
  }, [showSpinner, refreshRecords]);

  function getPendingComboGroups(records) {
    const groups = {};
    for (const rec of records) {
      if (rec.status === "Pending" && rec.comboGroupId) {
        if (!groups[rec.comboGroupId]) groups[rec.comboGroupId] = [];
        groups[rec.comboGroupId].push(rec);
      }
    }
    Object.values(groups).forEach(arr =>
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
    return groups;
  }

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
    setTimeout(async () => {
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
        refreshRecords && refreshRecords();
        setTimeout(() => {
          setSubmitted((prev) => ({ ...prev, [task.taskCode]: false }));
        }, 1500);
      }
    }, 3000);
  };

  const filteredRecords = records.filter(
    (record) =>
      activeTab === "All" ||
      (record.status && record.status.toLowerCase() === activeTab.toLowerCase())
  );

  const pendingComboGroups = getPendingComboGroups(filteredRecords);
  const lastPendingComboTaskCodes = Object.values(pendingComboGroups).map(getLastPendingComboTaskCode);

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (
      a.comboGroupId &&
      b.comboGroupId &&
      a.comboGroupId === b.comboGroupId &&
      a.status === "Pending" &&
      b.status === "Pending"
    ) {
      return (b.canSubmit ? 1 : 0) - (a.canSubmit ? 1 : 0);
    }
    return new Date(b.startedAt || b.createdAt) - new Date(a.startedAt || a.createdAt);
  });

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

  const renderProductRecord = (record, i) => {
    const isComboRed = record.isCombo && !record.canSubmit && record.status === "Pending";
    const isComboGrey = record.isCombo && record.canSubmit && record.status === "Pending";
    const badgeColor =
      isComboRed
        ? "bg-red-600 text-white"
        : isComboGrey
        ? "bg-gray-400 text-white"
        : `badge ${record.status?.toLowerCase()}`;

    // Status badge on top right
    return (
      <div
        key={getRecordKey(record, i)}
        className="record-card"
        style={{
          background: "#fff",
          borderRadius: 15,
          border: "2.4px solid #e7e7e7",
          boxShadow: "0 1.5px 8px #0001",
          marginBottom: 18,
          padding: "16px 16px 14px 16px",
          position: "relative"
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}>
          <div style={{
            color: "#888",
            fontSize: 13,
            fontWeight: 500,
            textAlign: "left"
          }}>
            {record.completedAt
              ? new Date(record.completedAt).toLocaleString()
              : record.startedAt
              ? new Date(record.startedAt).toLocaleString()
              : record.createdAt
              ? new Date(record.createdAt).toLocaleString()
              : ""}
          </div>
          <span className={typeof badgeColor === "string" ? badgeColor : ""} style={{
            fontSize: 13,
            fontWeight: 700,
            padding: "7px 18px",
            borderRadius: 12,
            minWidth: 82,
            textAlign: "center",
            color: record.status === "Completed" ? "#fff" : undefined,
            background: record.status === "Completed" ? START_BLUE : undefined,
            border: record.status === "Completed" ? `2px solid ${START_BLUE}` : undefined
          }} data-i18n={record.status || ""}>
            {record.status}
          </span>
        </div>
        <div className="record-content flex items-center gap-3" style={{marginBottom: 6}}>
          <img
            src={getRecordImage(record.product)}
            alt={record.product?.name || "Product"}
            className="record-img"
            style={{
              width: 70,
              height: 70,
              borderRadius: 10,
              objectFit: "cover",
              background: "#f5f5f5",
              border: "1px solid #f2f2f2"
            }}
          />
          <div className="record-info flex-1 min-w-0">
            <div className="truncate font-semibold text-[17px] text-[#222] mb-1">
              {record.product?.name}
            </div>
            <div className="text-[#222] text-[15px] font-medium">
              <span style={{ color: BLACK_BG, fontWeight: 700 }}>{currency || ""}</span>{" "}
              <span style={{ color: START_BLUE }}>{fmtNum(record.product?.price)}</span>
            </div>
            <div className="text-yellow-500 mt-1" style={{fontSize: 15, marginTop: 2}}>⭐⭐⭐⭐⭐</div>
          </div>
        </div>
        <div className="flex justify-between border-t border-b py-2 mb-1" style={{ borderColor: "#ececec" }}>
          <div className="text-center flex-1">
            <div className="font-semibold text-gray-500 text-xs mb-1" data-i18n="Total Amount">Total Amount</div>
            <div className="font-bold" style={{fontSize:16, color: START_BLUE}}>
              <span style={{ color: BLACK_BG, fontWeight: 700 }}>{currency || ""}</span>{" "}{fmtNum(record.product?.price)}
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="font-semibold text-gray-500 text-xs mb-1" data-i18n="Commission">Commission</div>
            <div className="font-bold" style={{fontSize:16, color: START_BLUE}}>
              <span style={{ color: BLACK_BG, fontWeight: 700 }}>{currency || ""}</span>{" "}{fmtNum(record.product?.commission)}
            </div>
          </div>
        </div>
        {(
            ((record.status === "Pending" && (!record.isCombo || record.canSubmit)) ||
            (submitted[record.taskCode] && record.status === "Completed"))
          ) && (
            (!record.comboGroupId ||
              lastPendingComboTaskCodes.includes(record.taskCode) ||
              record.canSubmit) && (
              <button
                className={`submit-btn`}
                style={{
                  marginTop: 7,
                  width: "100%",
                  borderRadius: 13,
                  padding: "10px 0",
                  fontWeight: 600,
                  fontSize: 16,
                  background: submitted[record.taskCode]
                    ? START_BLUE
                    : START_BLUE,
                  color: "#fff",
                  opacity: submitting[record.taskCode] ? 0.7 : 1,
                  boxShadow: `0 1px 8px ${START_BLUE}22`,
                  transition: "opacity 0.2s"
                }}
                onClick={() => handleSubmit(record)}
                disabled={
                  submitting[record.taskCode] ||
                  submitted[record.taskCode]
                }
              >
                <span data-i18n={submitting[record.taskCode] ? "Submitting..." : submitted[record.taskCode] ? "Submitted" : "Submit"}>
                  {submitting[record.taskCode]
                    ? "Submitting..."
                    : submitted[record.taskCode]
                    ? "Submitted"
                    : "Submit"}
                </span>
              </button>
            )
          )}
      </div>
    );
  };

  return (
    <div className="records-container" style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 78 }}>
      <Header />

      <SpinnerOverlay show={showSpinner} />
      <GreyToast show={greyToast.show} message={greyToast.message} />

      <div
        className="tabs flex justify-between px-2 mt-2 mb-0"
        style={{
          background: "#f7f7fa",
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 18,
          boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        {tabs.map((tab, idx) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""} text-base font-semibold flex-1 mx-0 px-0`}
            style={{
              cursor: "pointer",
              marginLeft: idx === 0 ? 0 : 2,
              marginRight: idx === tabs.length - 1 ? 0 : 2,
              padding: "9px 0",
              textAlign: "center",
              borderRadius: 18,
              background: activeTab === tab ? "#e9f8ff" : "#e6e7ea",
              color: activeTab === tab ? START_BLUE : "#555",
              boxShadow: activeTab === tab ? `0 2px 4px ${START_BLUE}44` : "none",
              border: activeTab === tab ? `2.5px solid ${START_BLUE}` : "none",
              fontWeight: activeTab === tab ? 700 : 600,
              fontSize: 17,
              transition: "all 0.15s"
            }}
            onClick={() => setActiveTab(tab)}
            data-i18n={tab}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Space between tabs and cards */}
      <div style={{ height: 14 }} />

      <div className="record-list px-2">
        {showSpinner ? (
          <div style={{height: "120px"}} />
        ) : sortedRecords.length === 0 ? (
          <p className="no-records text-center text-gray-400 mt-8" data-i18n="No records in this category.">No records in this category.</p>
        ) : (
          sortedRecords.map((record, i) => renderProductRecord(record, i))
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-end py-2 z-40" style={{height: 64}}>
        <div
          className="flex flex-col items-center text-xs text-gray-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img src={homeIcon} alt="Home" className="w-6 h-6 mb-1" />
          <div data-i18n="Home">Home</div>
        </div>
        <div
          className="flex flex-col items-center text-xs font-semibold cursor-pointer"
          onClick={() => navigate("/tasks")}
          style={{ color: "#8fadc7", transform: "translateY(-10px)" }}
        >
          <img
            src={startingIcon}
            alt="Starting"
            style={{
              width: 56,
              height: 56,
              marginBottom: 2,
            }}
          />
          <div data-i18n="Starting" style={{ fontSize: "1.13rem", fontWeight: 700, marginTop: -6 }}>Starting</div>
        </div>
        <div className="flex flex-col items-center text-xs font-semibold" style={{ color: START_BLUE }}>
          <img src={recordsIcon} alt="Records" className="w-6 h-6 mb-1" />
          <div data-i18n="Records">Records</div>
        </div>
      </div>
    </div>
  );
};

export default Records;
