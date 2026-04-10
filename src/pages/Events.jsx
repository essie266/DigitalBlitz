import React from "react";
import { useNavigate } from "react-router-dom";

// Single event image (you said it's one)
import eventImage from "../assets/images/events/event.png";

const START_BLUE = "#1fb6fc";

export default function Event() {
  const navigate = useNavigate();

  // Layout tuning values
  const HEADER_HEIGHT = 64; // px (fixed header)
  const PAGE_PADDING = 20; // outer page padding on all sides

  // area the image should occupy (full viewport minus header and outer paddings)
  const imageAreaHeight = `calc(100vh - ${HEADER_HEIGHT}px - ${PAGE_PADDING * 2}px)`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efe9e3", // page beige background
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
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

        <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Event</div>

        <div style={{ position: "absolute", right: 14, width: 24, height: 24 }} />
      </div>

      {/* spacer so content sits below the fixed header */}
      <div style={{ height: HEADER_HEIGHT + 8 }} />

      {/* Main area: centers the image area */}
      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* We reduce the width (maxWidth) so the image will not overflow horizontally.
            Using backgroundSize: 'contain' ensures the entire image fits inside the area
            while preserving height. This addresses your request to reduce only width while
            keeping the height behavior you liked. */}
        <div
          role="img"
          aria-label="Event banner"
          style={{
            width: "100%",
            maxWidth: 760, // reduced maximum width so image doesn't exceed page horizontally
            height: imageAreaHeight, // keep the tall height you wanted
            borderRadius: 12,
            backgroundImage: `url(${eventImage})`,
            backgroundSize: "contain",      // contain so full image is visible without overflow
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Keep an <img> for accessibility / preloading, visually hidden */}
          <img src={eventImage} alt="Event" style={{ width: 0, height: 0, opacity: 0, pointerEvents: "none" }} />
        </div>
      </main>
    </div>
  );
}