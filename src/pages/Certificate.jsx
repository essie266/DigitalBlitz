import React from "react";
import { useNavigate } from "react-router-dom";
import cert1 from "../assets/images/certificates/certificate1.png";
import cert2 from "../assets/images/certificates/certificate2.png";

const START_BLUE = "#1fb6fc";

export default function Certificate() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white min-h-screen w-full">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#2d2d2d] text-white flex items-center justify-between p-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-xl font-bold"
          aria-label="Back"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
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
        <div className="text-base font-semibold" data-i18n="Certificate">Certificate</div>
        <div className="w-6" />
      </div>

      {/* Certificate images */}
      <div className="pt-16 pb-10 px-4 flex flex-col items-center gap-6">
        <img
          src={cert1}
          alt="Certificate 1"
          data-i18n-alt="Certificate 1"
          className="w-full max-w-[500px] rounded shadow-md"
        />
        <img
          src={cert2}
          alt="Certificate 2"
          data-i18n-alt="Certificate 2"
          className="w-full max-w-[500px] rounded shadow-md"
        />
      </div>
    </div>
  );
}
