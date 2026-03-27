/**
 * Frontend translation service
 * Calls our backend LibreTranslate proxy
 *
 * Added:
 * - translateBatch({ texts, source, target }) which tries:
 *   1) POST /api/translate-batch with all unique texts (recommended backend)
 *   2) Fallback to many translateText() calls (parallel)
 *
 * Returns:
 * - translateText(...) -> translated string (same as before)
 * - translateBatch(...) -> object mapping originalText -> translatedText
 */

const API_BASE =
  import.meta.env.VITE_API_URL || "https://YOUR_BACKEND_DOMAIN.com";

export async function translateText({
  text,
  source = "en",
  target,
}) {
  if (!text || !target || source === target) {
    return text;
  }

  try {
    const response = await fetch(`${API_BASE}/api/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source,
        target,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("❌ Translation failed:", data.error || data);
      return text;
    }

    return data.translatedText || text;
  } catch (err) {
    console.error("❌ Translation request error:", err);
    return text;
  }
}

/**
 * translateBatch
 * - texts: array of strings (may contain duplicates)
 * - source, target: language codes
 *
 * Returns: { "<original>": "<translated>", ... }
 *
 * Behavior:
 * 1) If no texts or target===source -> returns a mapping identity (original->original)
 * 2) Try POST `${API_BASE}/api/translate-batch` with { source, target, items: uniqueTexts }
 *    expected response: { translations: { original: translated, ... } }
 * 3) If batch endpoint not available / fails, fall back to parallel translateText calls.
 */
export async function translateBatch({
  texts = [],
  source = "en",
  target,
}) {
  const resultMap = {};

  if (!Array.isArray(texts) || texts.length === 0 || !target || source === target) {
    // identity map
    texts.forEach((t) => {
      if (t) resultMap[t] = t;
    });
    return resultMap;
  }

  // Deduplicate to avoid extra work
  const unique = Array.from(new Set(texts.filter(Boolean)));

  // Try batch endpoint first
  try {
    const res = await fetch(`${API_BASE}/api/translate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target, items: unique }),
    });

    if (res.ok) {
      const json = await res.json();
      // Common expected shapes:
      // { translations: { original: translated, ... } }
      // or { results: [{ text: original, translated }, ...] }
      if (json && json.translations && typeof json.translations === "object") {
        // ensure every requested key is present; fallback to original if missing
        unique.forEach((orig) => {
          resultMap[orig] = json.translations[orig] || orig;
        });
        return resultMap;
      }

      if (json && Array.isArray(json.results)) {
        json.results.forEach((r) => {
          if (r.text && r.translated) resultMap[r.text] = r.translated;
          else if (r.original && r.translated) resultMap[r.original] = r.translated;
        });
        // fill missing with original
        unique.forEach((orig) => {
          if (!resultMap[orig]) resultMap[orig] = orig;
        });
        return resultMap;
      }

      // If we get here, the batch response was unexpected — fall through to fallback
      console.warn("translateBatch: unexpected batch response shape", json);
    } else {
      const txt = await res.text().catch(() => "");
      console.warn("translateBatch: batch endpoint returned error", res.status, txt);
    }
  } catch (err) {
    console.warn("translateBatch: batch endpoint error", err);
  }

  // Fallback: parallel translateText calls (preserves correctness if batch not available)
  try {
    const translatedArray = await Promise.all(
      unique.map((orig) =>
        translateText({
          text: orig,
          source,
          target,
        }).catch(() => orig)
      )
    );

    unique.forEach((orig, idx) => {
      resultMap[orig] = translatedArray[idx] || orig;
    });

    return resultMap;
  } catch (err) {
    // As a last-ditch effort, return identity mapping
    console.error("translateBatch fallback error:", err);
    unique.forEach((orig) => {
      resultMap[orig] = orig;
    });
    return resultMap;
  }
}
