import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_API = "https://stacksapp-backend.onrender.com/api";

export default function BindWallet() {
  const [fullName, setFullName] = useState("");
  const [exchange, setExchange] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState(""); // BTC / TRC20 / ERC20 etc.
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // bottom sheet network selector
  const [showNetworkSheet, setShowNetworkSheet] = useState(false);
  const [sheetClosing, setSheetClosing] = useState(false); // used to play closing animation

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFullName(parsed.fullName || "");
      setExchange(parsed.exchange || "");
      setWalletAddress(parsed.walletAddress || parsed.wallet || "");
      setNetwork(parsed.network || parsed.cryptoNetwork || "BTC");
    } else {
      alert("Please login first.");
      navigate("/login");
    }
  }, [navigate]);

  const handleUpdate = async () => {
    if (!walletAddress.trim()) {
      alert("Please enter a wallet address.");
      return;
    }
    setLoading(true);

    try {
      const token = user?.token;
      const res = await fetch(`${BACKEND_API}/bind-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          fullName,
          exchange,
          walletAddress,
          network,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        const updatedUser = {
          ...user,
          fullName,
          exchange,
          walletAddress,
          network,
        };
        try {
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        } catch (e) {
          // ignore localStorage errors
        }
        setUser(updatedUser);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/profile");
        }, 1400);
      } else {
        alert(data.message || "Failed to update wallet address.");
      }
    } catch (err) {
      setLoading(false);
      alert("Failed to update wallet address.");
    }
  };

  if (!user) return null;

  const networkOptions = ["BTC", "TRC20", "ERC20"];

  // close sheet with slide-down animation
  const closeSheet = () => {
    setSheetClosing(true);
    // match the transition duration below (220ms)
    setTimeout(() => {
      setSheetClosing(false);
      setShowNetworkSheet(false);
    }, 220);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4efe9",
        position: "relative",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#111",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#000",
          color: "#fff",
          padding: "14px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {/* white back arrow */}
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
            <polyline
              points="15 6 9 12 15 18"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div style={{ fontSize: 20, fontWeight: 800 }}>Payment Methods</div>
      </div>

      {/* Content */}
      <div style={{ padding: 22, maxWidth: 820, margin: "0 auto", boxSizing: "border-box" }}>
        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#111" }}>
            Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              background: "#fff",
              fontSize: 15,
              fontWeight: 600,
              boxSizing: "border-box",
              color: "#222",
              outline: "none",
              textAlign: "left",
            }}
          />
        </div>

        {/* Crypto Network */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#111" }}>
            Crypto Network
          </label>
          <div
            role="button"
            onClick={() => setShowNetworkSheet(true)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setShowNetworkSheet(true);
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              background: "#fff",
              fontSize: 15,
              fontWeight: 600,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              color: network ? "#111" : "#7d7d7d",
            }}
          >
            <span style={{ color: network ? "#111" : "#7d7d7d" }}>{network || "BTC"}</span>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
              <polyline points="6 9 12 15 18 9" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Crypto Wallet */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#111" }}>
            Crypto Wallet
          </label>
          <input
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            placeholder="Wallet name"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              background: "#fff",
              fontSize: 15,
              fontWeight: 600,
              boxSizing: "border-box",
              color: "#222",
              outline: "none",
              textAlign: "left",
            }}
          />
        </div>

        {/* Wallet Address */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 800, fontSize: 18, marginBottom: 10, color: "#111" }}>
            BTC/ERC-20/TRC-20 Wallet Address
          </label>
          <input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Wallet address"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              background: "#fff",
              fontSize: 15,
              fontWeight: 600,
              boxSizing: "border-box",
              color: "#222",
              outline: "none",
              textAlign: "left",
            }}
          />
        </div>

        {/* Update button */}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "default" : "pointer",
              boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
              letterSpacing: 0.2,
            }}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16a34a",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontWeight: 700,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            zIndex: 80,
          }}
          role="status"
        >
          ✅ Wallet updated successfully!
        </div>
      )}

      {/* Bottom sheet overlay + sheet */}
      {(showNetworkSheet || sheetClosing) && (
        <>
          {/* Overlay */}
          <div
            onClick={closeSheet}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)", // dark overlay
              zIndex: 70,
            }}
          />

          {/* Sheet: mount while opening or closing so we can animate */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: 12,
              right: 12,
              bottom: 12,
              zIndex: 80,
              // We use transform for the slide animation:
              transform: sheetClosing ? "translateY(110%)" : showNetworkSheet ? "translateY(0%)" : "translateY(110%)",
              transition: "transform 220ms cubic-bezier(.2,.9,.2,1)",
              background: "#fff",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              paddingTop: 8,
              paddingBottom: 18,
              boxShadow: "0 -12px 36px rgba(0,0,0,0.22)",
              maxWidth: 820,
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "8px 8px" }}>
              {/* We make the sheet smaller and remove separators as requested */}
              {networkOptions.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => {
                    setNetwork(opt);
                    // animate close
                    setSheetClosing(true);
                    setTimeout(() => {
                      setSheetClosing(false);
                      setShowNetworkSheet(false);
                    }, 220);
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    textAlign: "center",
                    padding: "14px 12px",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    // no separator lines between options
                    // keep comfortable spacing but smaller than previous
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}