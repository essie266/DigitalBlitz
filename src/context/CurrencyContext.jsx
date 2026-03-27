import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * CurrencyContext
 *
 * Responsibilities:
 * - Fetch public site settings to learn the active currency and symbol.
 * - Expose { currency, symbol, decimals, loading, reload } via context.
 * - Persist a global reference on window (window.CURRENT_CURRENCY*, for other non-React code).
 * - Dispatch a `app:currencyChanged` CustomEvent when currency is loaded or changed so other parts
 *   of the app (including initI18n or non-React DOM replacers) can react.
 *
 * Notes:
 * - Tries /admin/settings-public first (common mounting), falls back to /settings-public.
 * - Does not modify numeric data in the DB — this is a display-layer change only.
 */

const CurrencyContext = createContext({
  currency: "GBP",
  symbol: "£",
  decimals: 2,
  loading: true,
  reload: async () => {},
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem("site:currency") || "";
    } catch (e) {
      return "";
    }
  });
  const [symbol, setSymbol] = useState(() => {
    try {
      return localStorage.getItem("site:currencySymbol") || "";
    } catch (e) {
      return "";
    }
  });
  const [decimals, setDecimals] = useState(() => {
    try {
      const v = localStorage.getItem("site:currencyDecimals");
      return v !== null ? Number(v) : 2;
    } catch (e) {
      return 2;
    }
  });
  const [loading, setLoading] = useState(true);

  const setGlobalsAndEmit = useCallback((c, s, d) => {
    try {
      window.CURRENT_CURRENCY = c || "";
      window.CURRENT_CURRENCY_SYMBOL = s || "";
      window.CURRENT_CURRENCY_DECIMALS = typeof d === "number" ? d : 2;
    } catch (e) {
      // ignore
    }

    try {
      window.dispatchEvent(new CustomEvent("app:currencyChanged", {
        detail: { currency: c, symbol: s, decimals: d }
      }));
    } catch (e) {
      // fallback to plain Event for older envs
      try { window.dispatchEvent(new Event("app:currencyChanged")); } catch (ee) {}
    }
  }, []);

  const fetchSettingsPublic = useCallback(async () => {
    setLoading(true);
    const candidates = ["/admin/settings-public", "/settings-public"];
    let lastErr = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          lastErr = new Error(`Fetch ${url} failed: ${res.status}`);
          continue;
        }
        const json = await res.json();
        // Expect shape: { service: {...}, currency: "...", currencySymbol: "...", currencyDecimals: n }
        const c = (json && json.currency) ? String(json.currency).trim() : "";
        const s = (json && json.currencySymbol) ? String(json.currencySymbol).trim() : "";
        const d = (json && typeof json.currencyDecimals === "number") ? Number(json.currencyDecimals) : (json && json.currencyDecimals ? Number(json.currencyDecimals) : 2);

        // Update state & localStorage
        setCurrency(c);
        setSymbol(s);
        setDecimals(Number.isFinite(d) ? d : 2);

        try { localStorage.setItem("site:currency", c || ""); } catch (e) {}
        try { localStorage.setItem("site:currencySymbol", s || ""); } catch (e) {}
        try { localStorage.setItem("site:currencyDecimals", String(Number.isFinite(d) ? d : 2)); } catch (e) {}

        // set global values and emit event
        setGlobalsAndEmit(c, s, Number.isFinite(d) ? d : 2);

        setLoading(false);
        return { currency: c, symbol: s, decimals: Number.isFinite(d) ? d : 2 };
      } catch (err) {
        lastErr = err;
        // try next candidate
      }
    }
    // If we reach here, all candidates failed — fallback to defaults
    console.warn("CurrencyProvider: failed to fetch settings-public:", lastErr);
    const fallbackCurrency = currency || "GBP";
    const fallbackSymbol = symbol || "£";
    const fallbackDecimals = typeof decimals === "number" ? decimals : 2;
    setGlobalsAndEmit(fallbackCurrency, fallbackSymbol, fallbackDecimals);
    setLoading(false);
    return { currency: fallbackCurrency, symbol: fallbackSymbol, decimals: fallbackDecimals };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setGlobalsAndEmit]);

  // initial load
  useEffect(() => {
    (async () => {
      await fetchSettingsPublic();
    })();
  }, [fetchSettingsPublic]);

  // reload helper exposed to consumers
  const reload = useCallback(async () => {
    return await fetchSettingsPublic();
  }, [fetchSettingsPublic]);

  return (
    <CurrencyContext.Provider value={{ currency, symbol, decimals, loading, reload }}>
      {children}
    </CurrencyContext.Provider>
  );
}
