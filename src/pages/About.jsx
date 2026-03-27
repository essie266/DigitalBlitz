import React from "react";

export default function About() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800" data-i18n="About_Title">
        ℹ️ About Us
      </h2>

      <div className="bg-white rounded shadow p-5 space-y-4 text-gray-700 leading-relaxed">
        <p data-i18n="About_P1">
          Welcome to <strong>StacksWork</strong> — your trusted platform to earn rewards by completing simple daily tasks. We connect users with top products and services in need of promotion.
        </p>

        <p data-i18n="About_P2">
          📦 Each day, tasks are generated based on your balance and VIP level. Complete them with one click and earn rewards instantly!
        </p>

        <p data-i18n="About_P3">
          💼 With our transparent VIP system, secure wallet binding, and fast withdrawals, StacksWork is built to be simple, fair, and rewarding.
        </p>

        <p data-i18n="About_P4">
          🚀 Start earning smarter — refer friends, boost your level, and grow your balance every day!
        </p>

        <p className="text-sm text-gray-500" data-i18n="About_Footer">
          Have questions? Visit our FAQ section or contact support anytime.
        </p>
      </div>
    </div>
  );
}
