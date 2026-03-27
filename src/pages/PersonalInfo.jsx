import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Consistent blue used everywhere else
const START_BLUE = "#1fb6fc";

export default function PersonalInfo() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-20">
      {/* Header */}
      <div className="bg-[#2d2d2d] text-white text-center py-3 font-semibold text-lg relative flex items-center justify-center">
        {/* Back Arrow */}
        <button
          aria-label="Back"
          data-i18n-aria="Back"
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            lineHeight: 1,
            zIndex: 1,
          }}
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
        <span data-i18n="Modify information">Modify information</span>
      </div>

      <div className="bg-white m-4 rounded-lg text-sm shadow">
        <Item label="Modify Personal Information" isBlue />
        <Item label="Username" value={user.username} isBlue />
        <Item label="Phone" value={user.phone} isBlue />
      </div>

      {/* Password update section */}
      <div
        className="bg-white m-4 rounded-lg text-sm shadow"
        style={{
          borderTop: `4px solid ${START_BLUE}`,
        }}
      >
        <button
          onClick={() => navigate("/update-password")}
          className="w-full text-left px-4 py-3 border-b flex justify-between items-center"
        >
          <span style={{ color: START_BLUE }} data-i18n="Update Password">
            Update Password
          </span>
          <span className="text-xl text-gray-400">›</span>
        </button>

        <button
          onClick={() => navigate("/update-withdraw-password")}
          className="w-full text-left px-4 py-3 flex justify-between items-center"
        >
          <span style={{ color: START_BLUE }} data-i18n="Update Withdrawal Password">
            Update Withdrawal Password
          </span>
          <span className="text-xl text-gray-400">›</span>
        </button>
      </div>
    </div>
  );
}

function Item({ label, value, isBlue }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b">
      <div
        style={{ color: isBlue ? "#1fb6fc" : "#666", fontWeight: isBlue ? 600 : 400 }}
        data-i18n={label}
      >
        {label}
      </div>
      <div className="font-medium" style={{ color: isBlue ? "#1fb6fc" : "#111" }}>
        {value || "›"}
      </div>
    </div>
  );
}
