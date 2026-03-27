import React from "react";

const START_BLUE = "#1fb6fc";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header with blue back arrow */}
      <div className="bg-[#2d2d2d] text-white text-center py-3 font-semibold text-lg relative flex items-center justify-center">
        <button
          aria-label="Back"
          onClick={() => window.history.back()}
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
            display: "flex",
            alignItems: "center"
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
        <span data-i18n="FAQs">FAQs</span>
      </div>

      {/* Body Content */}
      <div className="px-5 pt-6 text-[15px] text-[#333] leading-relaxed">
        <p
          data-i18n="At the core of our philosophy is a strong commitment to you, our esteemed users. We understand that navigating a dynamic platform like ours can create questions and situations that standard FAQs can't address. That's why our customer service team is always on standby, eager to provide you with the personalised help and insights for which we're renowned for excellence."
        >
          At the core of our philosophy is a strong commitment to you, our esteemed users.
          We understand that navigating a dynamic platform like ours can create questions
          and situations that standard FAQs can't address. That's why our customer service
          team is always on standby, eager to provide you with the personalised help and
          insights for which we're renowned for excellence.
        </p>
        <br />
        <p
          data-i18n="We don't just answer your questions, we provide you with solutions to ensure that your experience with us is seamless, enjoyable, and above all, fulfilling. If you are experiencing a curiosity or challenge, please contact one of our customer service specialists, who are available from 10am to 10pm and are dedicated to enhancing your experience."
        >
          We don't just answer your questions, we provide you with solutions to ensure that
          your experience with us is seamless, enjoyable, and above all, fulfilling. If you
          are experiencing a curiosity or challenge, please contact one of our customer service
          specialists, who are available from 10am to 10pm and are dedicated to enhancing your experience.
        </p>
        <br />
        <p
          data-i18n="Your satisfaction is not only our top priority, it's our passion. Allow us to guide you, support you, and celebrate every step of this remarkable journey with you."
        >
          Your satisfaction is not only our top priority, it's our passion. Allow us to guide you,
          support you, and celebrate every step of this remarkable journey with you.
        </p>
      </div>
    </div>
  );
}
