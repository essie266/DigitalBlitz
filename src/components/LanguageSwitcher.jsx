import React, { useContext, useEffect, useRef, useState } from "react";
import { LanguageContext } from "../context/LanguageContext";

/**
 * Inline LanguageSwitcher (non-fixed)
 * - Renders inline where it's mounted (no fixed positioning).
 * - Shows flag + 2-letter code when closed, expands to show full name when opened.
 * - Uses LanguageContext.changeLanguage if available. Falls back to initI18n fallback if not.
 * - Minimal, accessible, and scrolls with the page.
 */

const LANGS = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

function getLangMeta(code) {
  return LANGS.find((l) => l.code === code) || LANGS[0];
}

export default function LanguageSwitcher() {
  const ctx = useContext(LanguageContext) || {};
  const { lang: providerLang, changeLanguage, loading } = ctx;

  const initial =
    providerLang ||
    document.documentElement.getAttribute("lang") ||
    localStorage.getItem("lang") ||
    "en";

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initial);
  const ref = useRef(null);

  // keep in sync with provider
  useEffect(() => {
    if (providerLang && providerLang !== value) setValue(providerLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerLang]);

  // close on outside click / escape
  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const applyChange = async (newCode) => {
    if (!newCode || newCode === value) {
      setOpen(false);
      return;
    }
    setValue(newCode);
    setOpen(false);
    // persist immediately
    try {
      localStorage.setItem("lang", newCode);
      try { document.documentElement.setAttribute("lang", newCode); } catch(e) {}
    } catch (e) {}
    // Use provider if available (preferred)
    if (typeof changeLanguage === "function") {
      try {
        await changeLanguage(newCode);
      } catch (e) {
        console.error("changeLanguage error", e);
      }
      return;
    }

    // Fallback: try to call initI18n if available globally (defensive)
    try {
      if (typeof window !== "undefined" && window.initI18n && typeof window.initI18n === "function") {
        await window.initI18n({ lang: newCode });
      } else {
        // last resort: dispatch event for any listener to pick up
        window.dispatchEvent(new Event("app:languageChanged"));
      }
    } catch (e) {
      console.error("Fallback language apply failed", e);
    }
  };

  const current = getLangMeta(value);

  // Inline styles (keeps small footprint; parent decides exact placement)
  const wrapperStyle = {
    display: "inline-block",
    position: "relative",
    verticalAlign: "middle",
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    height: 36,
    borderRadius: 10,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: 13,
    color: "#111827",
    userSelect: "none",
    minWidth: 84,
  };

  const dropdownStyle = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: 160,
    background: "#fff",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
    overflow: "hidden",
    padding: 6,
    zIndex: 2000,
  };

  const itemStyle = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
    color: "#111827",
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
  };

  const activeItemStyle = {
    background: "rgba(99,102,241,0.06)",
    fontWeight: 600,
  };

  return (
    <div ref={ref} style={wrapperStyle}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={current.name}
        style={buttonStyle}
      >
        <span style={{ fontSize: 18 }}>{current.flag}</span>
        <span style={{ fontWeight: 700, fontSize: 12 }}>{current.code ? current.code.toUpperCase() : value.toUpperCase()}</span>
        <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, transform: open ? "rotate(180deg)" : "none" }} aria-hidden>
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div role="listbox" style={dropdownStyle}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => applyChange(l.code)}
              style={{
                ...itemStyle,
                ...(l.code === value ? activeItemStyle : {}),
              }}
            >
              <span style={{ width: 28, textAlign: "center", fontSize: 18 }}>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
