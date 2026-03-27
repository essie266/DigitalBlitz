import React, { createContext, useEffect, useState } from "react";
import initI18n from "../i18n/initI18n";

export const LanguageContext = createContext({
  lang: "en",
  changeLanguage: async (l) => {},
  loading: false,
});

export function LanguageProvider({ children }) {
  const initial = (typeof document !== "undefined" && (document.documentElement.getAttribute("lang") || localStorage.getItem("lang"))) || "en";
  const [lang, setLang] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Helper to use a global i18next instance if present (optional)
  const getGlobalI18next = () => {
    try {
      if (typeof window !== "undefined" && window.i18next && typeof window.i18next.changeLanguage === "function") {
        return window.i18next;
      }
    } catch (e) {}
    return null;
  };

  // Initialize translations for startup language BEFORE rendering children.
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Ensure document.lang reflects persisted language early
        try { if (typeof document !== "undefined") document.documentElement.setAttribute("lang", lang); } catch(e){}
        await initI18n({ lang });
        const i18nextGlobal = getGlobalI18next();
        if (i18nextGlobal) {
          try { await i18nextGlobal.changeLanguage(lang); } catch (e) {}
        }
      } catch (e) {
        console.error("initI18n failed on startup:", e);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  /**
   * changeLanguage(newLang)
   * - persist newLang
   * - load & apply translations via initI18n
   * - sync optional global i18next
   * - update React state (remount subtree)
   * - perform a one-time programmatic reload so every part of the app shows the new language
   */
  const changeLanguage = async (newLang) => {
    if (!newLang || newLang === lang) return;
    setLoading(true);
    try {
      // Persist selection immediately
      localStorage.setItem("lang", newLang);
      try { document.documentElement.setAttribute("lang", newLang); } catch (e) {}

      // Load & apply translations (applies to DOM and sets window.__TRANSLATIONS__)
      await initI18n({ lang: newLang });

      // Sync optional global i18next instance if present
      const i18nextGlobal = getGlobalI18next();
      if (i18nextGlobal) {
        try { await i18nextGlobal.changeLanguage(newLang); } catch (e) {}
      }

      // Update React language state - this will remount subtree by key if provider is used
      setLang(newLang);

      // --- ONE-TIME AUTO-RELOAD ---
      // Programmatic page reload ensures any parts of the app that don't respond to
      // the provider remount or direct DOM application will display the selected language.
      // Because we saved the selected language to localStorage/document.lang above,
      // the reload will start the app with the correct language.
      try {
        // Use setTimeout to allow React state to settle before reload (small delay)
        setTimeout(() => {
          // Use location.reload() so browser reloads current URL
          // This will run only once after language change.
          window.location.reload();
        }, 50);
      } catch (e) {
        console.error("Failed to trigger reload after language change:", e);
      }
    } catch (e) {
      console.error("changeLanguage failed:", e);
    } finally {
      // Note: the reload will happen immediately after; loading state may not matter then.
      setLoading(false);
    }
  };

  // Remount the single child when lang changes by cloning it with key=lang.
  let renderedChildren = children;
  try {
    const only = React.Children.only(children);
    renderedChildren = React.cloneElement(only, { key: lang });
  } catch (e) {
    // multiple children: fall back to not cloning
    renderedChildren = children;
  }

  // Don't render the app until initial i18n bootstrap finishes to avoid flicker.
  if (!initialized) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, loading }}>
      {renderedChildren}
    </LanguageContext.Provider>
  );
}
