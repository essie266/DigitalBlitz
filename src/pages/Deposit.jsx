import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBalance } from "../context/balanceContext";
import { useTransactions } from "../context/transactionContext";
// new: settings context
import { useSettings } from "../context/SettingsContext";
// Import CustomerServiceModal so Contact button opens it
import CustomerServiceModal from "../components/CustomerServiceModal";

// Set your contact URLs here
const TELEGRAM_URL = "https://t.me/your_customer_service";
const WHATSAPP_URL = "https://wa.me/1234567890"; // replace with your WhatsApp number

const START_BLUE = "#1fb6fc";

export default function Deposit() {
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { balance, refreshProfile } = useBalance();
  const { deposits, loading } = useTransactions();

  // settings context
  const { currency, formatAmount } = useSettings();

  // When Deposit is clicked, show modal (now opens CustomerServiceModal)
  const handleDeposit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleContact = (platform) => {
    setShowModal(false);
    if (platform === "telegram") {
      window.open(TELEGRAM_URL, "_blank");
    } else if (platform === "whatsapp") {
      window.open(WHATSAPP_URL, "_blank");
    }
  };

  const maxCardWidth = 600;

  // Compose all deposit-like entries (normal deposit + admin_add_balance, etc)
  const allDeposits = deposits.filter(
    (deposit) =>
      deposit.type === "deposit" ||
      deposit.type === "admin_add_balance" ||
      deposit.type === "admin_add_funds" ||
      deposit.type === "add_balance_admin" ||
      !deposit.type // fallback: if type is missing, assume user deposit
  );

  return (
    <div className="min-h-screen bg-white pb-16" style={{ fontFamily: "system-ui, Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: "#464b4e",
          color: "white",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 22,
          padding: "14px 0",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Back"
        >
          <svg width={28} height={28} viewBox="0 0 22 22">
            <polyline
              points="14,5 8,11 14,17"
              fill="none"
              stroke={START_BLUE}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span data-i18n="Deposit">Deposit</span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid #eaeaea",
          background: "#fff",
          marginBottom: 0,
          fontSize: 0,
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "20px 0 10px 0",
            fontWeight: 600,
            fontSize: 20,
            color: tab === "deposit" ? "#222" : "#888",
            background: "none",
            border: "none",
            borderBottom: tab === "deposit" ? "3px solid #2196d6" : "3px solid transparent",
            outline: "none",
            cursor: "pointer",
          }}
          onClick={() => setTab("deposit")}
        >
          <span data-i18n="Deposit">Deposit</span>
        </button>
        <button
          style={{
            flex: 1,
            padding: "20px 0 10px 0",
            fontWeight: 600,
            fontSize: 20,
            color: tab === "history" ? "#222" : "#888",
            background: "none",
            border: "none",
            borderBottom: tab === "history" ? "3px solid #2196d6" : "3px solid transparent",
            outline: "none",
            cursor: "pointer",
          }}
          onClick={() => setTab("history")}
        >
          <span data-i18n="History">History</span>
        </button>
      </div>

      {/* Deposit Tab */}
      {tab === "deposit" ? (
        <>
          {/* Card */}
          <div
            style={{
              background: "#2196d6",
              borderRadius: 20,
              margin: "28px auto 18px auto",
              maxWidth: maxCardWidth,
              boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)",
              padding: 0,
              overflow: "hidden",
              minHeight: 120,
              width: "95%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ padding: 22, width: "100%" }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 18, marginBottom: 2 }} data-i18n="Account Amount">
                Account Amount
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 38, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
                  {Number(balance || 0).toFixed(2)}
                </span>
                {/* show the raw currency exactly as stored in settings */}
                <span style={{ fontSize: 18, fontWeight: 600, color: "#fff", paddingBottom: 5 }}>{currency || ""}</span>
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <form
            onSubmit={handleDeposit}
            autoComplete="off"
            style={{
              margin: "0 auto",
              marginBottom: 0,
              maxWidth: maxCardWidth,
              width: "95%",
              borderRadius: 13,
              background: "#fff",
              boxShadow: "0 4px 12px 0 rgba(0,0,0,.08)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div>
              <label
                style={{ display: "block", color: "#222", fontWeight: 700, marginBottom: 8, fontSize: 16 }}
                data-i18n="Deposit Amount"
              >
                Deposit Amount
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 7,
                  background: "#eaf2fb",
                  border: "none",
                  fontSize: 18,
                  color: "#222",
                  marginBottom: 0,
                }}
                placeholder="Deposit Amount"
                data-i18n-placeholder="Deposit Amount"
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#2196d6",
                color: "#fff",
                fontWeight: 500,
                fontSize: 20,
                borderRadius: 7,
                border: "none",
                padding: "13px 0",
                marginTop: 8,
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              <span data-i18n="Contact Customer Service">Contact Customer Service</span>
            </button>
            {message && (
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 15, color: "#18a93c" }}>{message}</div>
            )}
          </form>

          {/* Use the shared CustomerServiceModal component instead of inline platform modal */}
          <CustomerServiceModal open={showModal} onClose={() => setShowModal(false)} />
        </>
      ) : (
        // History Tab
        <div style={{ marginTop: 30, width: "100%", maxWidth: maxCardWidth, marginLeft: "auto", marginRight: "auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", fontSize: 16, color: "#888", marginTop: 30 }} data-i18n="Loading...">
              Loading...
            </p>
          ) : allDeposits.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: 16, color: "#888", marginTop: 30 }} data-i18n="No deposit records found.">
              No deposit records found.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {allDeposits
                .slice()
                .reverse()
                .map((deposit, index) => {
                  const amt = Number(deposit.amount || 0).toFixed(2);
                  // show amount with currency exactly as stored in settings
                  const displayAmount = currency ? `${amt} ${currency}` : amt;
                  return (
                    <div
                      key={index}
                      style={{
                        background: "#fff",
                        boxShadow: "0 4px 12px 0 rgba(0,0,0,.07)",
                        borderRadius: 8,
                        padding: "18px 22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>+{displayAmount}</div>
                        <div style={{ fontSize: 14, color: "#888", marginTop: 2 }}>
                          {deposit.createdAt ? new Date(deposit.createdAt).toLocaleString() : deposit.date || ""}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "#2196d6",
                          textTransform: "capitalize",
                        }}
                      >
                        <span>{deposit.status || "Completed"}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          {allDeposits.length > 0 && (
            <p style={{ textAlign: "center", color: "#888", fontSize: 15, marginTop: 22 }} data-i18n="No more data...">
              No more data...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
