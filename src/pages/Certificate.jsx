import React from "react";
import { useNavigate } from "react-router-dom";
// Single certificate image import (you said you have one)
import certificateImage from "../assets/images/certificates/certificate.png";

const START_BLUE = "#1fb6fc";

export default function Certificate() {
  const navigate = useNavigate();

  // Layout tuning values (adjust if you want slightly different spacing)
  const HEADER_HEIGHT = 64; // fixed header height in px
  const PAGE_PADDING = 24; // outer page padding (left/right/top/bottom)
  const CARD_PADDING = 28; // inner white-card padding (applies on all sides)

  // Card height that fills almost the full viewport while leaving the PAGE_PADDING above/below
  // This makes the white card a fixed height so the image inside can be sized to fill it.
  const cardHeight = `calc(100vh - ${HEADER_HEIGHT}px - ${PAGE_PADDING * 2}px)`;

  // Image height inside the card should fill the card minus the vertical card padding
  const imageHeight = `calc(${cardHeight} - ${CARD_PADDING * 2}px)`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efe9e3", // beige page background like screenshots
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        padding: PAGE_PADDING,
        boxSizing: "border-box",
      }}
    >
      {/* Fixed top header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          zIndex: 40,
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.02)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <polyline
              points="15 6 9 12 15 18"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>
          Certificate
        </div>

        <div style={{ position: "absolute", right: 14, width: 24, height: 24 }} />
      </div>

      {/* Spacer to place content below fixed header */}
      <div style={{ height: HEADER_HEIGHT + 8 }} />

      {/* Main area; centers the card and ensures equal left/right padding from the root */}
      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          boxSizing: "border-box",
          // ensure main area fills remaining viewport so card can be vertically centered
          minHeight: `calc(100vh - ${HEADER_HEIGHT + PAGE_PADDING * 2}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {/* White card with fixed height so the image can fill it consistently on all screen sizes */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 10,
            padding: CARD_PADDING,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            width: "100%",
            maxWidth: 760 + CARD_PADDING * 2,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: cardHeight,
            overflow: "hidden",
          }}
        >
          {/* Image sized to fill the card vertically while keeping horizontal spacing equal */}
          <img
            src={certificateImage}
            alt="Certificate"
            style={{
              display: "block",
              // Make image fill the card height (minus card padding)
              height: imageHeight,
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </main>
    </div>
  );
}