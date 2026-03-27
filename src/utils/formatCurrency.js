/**
 * formatCurrency(amount, currencyCodeOrSymbol, opts)
 *
 * - amount: number (or numeric string)
 * - currencyCodeOrSymbol: preferred ISO currency code like "GBP", "USD", "EUR"
 *   or a symbol like "£" or "USDT". The function tries to format correctly with Intl
 *   when a three-letter ISO code is provided. For non-ISO tokens (USDT, BTC, etc.)
 *   it will fall back to a simple "amount CODE" form.
 * - opts: optional { decimals, locale, showSymbolOnly }:
 *     - decimals: number of fraction digits (overrides auto-detected)
 *     - locale: e.g. "en-GB" (defaults to browser locale)
 *     - showSymbolOnly: when true and an explicit symbol is provided (e.g. "£"),
 *         will format as "£123.45" without the "GBP" code.
 *
 * Returns a string ready for display.
 */

export default function formatCurrency(amount, currency = "", opts = {}) {
  const { decimals: overrideDecimals, locale, showSymbolOnly } = opts || {};

  let num = Number(amount);
  if (!isFinite(num)) num = 0;

  const userLocale = locale || (typeof navigator !== "undefined" ? navigator.language : "en-GB");

  // If provided currency looks like an ISO code (3 letters), try Intl
  const isIso = typeof currency === "string" && /^[A-Za-z]{3}$/.test(currency);
  if (isIso) {
    try {
      const options = {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: typeof overrideDecimals === "number" ? overrideDecimals : undefined,
        maximumFractionDigits: typeof overrideDecimals === "number" ? overrideDecimals : undefined,
      };
      return new Intl.NumberFormat(userLocale, options).format(num);
    } catch (e) {
      // Intl may throw for unknown currency — fall back
    }
  }

  // If currency looks like a single symbol or token (e.g. "£" or "USDT")
  // and user wants symbol-only rendering for symbol strings:
  if (!isIso && typeof currency === "string") {
    const trimmed = currency.trim();
    const looksLikeSymbol = /^[^\sA-Za-z0-9]{1,4}$/.test(trimmed); // e.g. "£", "$", "€"
    const looksLikeToken = /^[A-Za-z]{2,6}$/.test(trimmed); // e.g. "USDT", "BTC"

    const frac = (typeof overrideDecimals === "number") ? overrideDecimals : 2;

    // Use Intl for number formatting (no currency), then append/prepend token/symbol
    const numberFormatted = new Intl.NumberFormat(userLocale, {
      minimumFractionDigits: frac,
      maximumFractionDigits: frac,
    }).format(num);

    if (looksLikeSymbol) {
      // Prefer symbol before amount (typical), but caller can override showSymbolOnly if they want
      return `${trimmed}${numberFormatted}`;
    }

    if (looksLikeToken) {
      // For tokens, use "123.45 USDT"
      return `${numberFormatted} ${trimmed}`;
    }

    // fallback: append currency after number
    return `${numberFormatted} ${trimmed}`;
  }

  // final fallback: plain number with 2 decimals
  const fallbackDecimals = typeof overrideDecimals === "number" ? overrideDecimals : 2;
  const fallbackNumber = new Intl.NumberFormat(userLocale, {
    minimumFractionDigits: fallbackDecimals,
    maximumFractionDigits: fallbackDecimals,
  }).format(num);
  if (currency) {
    return `${fallbackNumber} ${String(currency)}`;
  }
  return fallbackNumber;
}
