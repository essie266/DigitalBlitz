import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Icons (paths match your repo layout used earlier)
import homeIcon from "../assets/images/tabBar/Homes.png";
import startingIcon from "../assets/images/tabBar/Start.png";
import recordsIcon from "../assets/images/tabBar/Record.png";
import profileIcon from "../assets/images/tabBar/My3.png";

/**
 * BottomNav
 * - Processes icons to strip background and produce tinted active/inactive images so
 *   selecting an icon doesn't cover the whole icon with a white rounded bg.
 * - Falls back to CSS filter coloring when processing isn't possible.
 * - NOTE: indicator pill (white line above active tab) removed per request.
 * - The Starting tab now uses the same icon size and layout as other tabs.
 */

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useRef(true);

  const currentPath = location?.pathname || window.location.pathname || "/";

  const isActive = (tabKey) => {
    if (tabKey === "home") return currentPath === "/" || currentPath === "/dashboard";
    if (tabKey === "starting") return currentPath.startsWith("/tasks") || currentPath.startsWith("/starting") || currentPath === "/starting";
    if (tabKey === "records") return currentPath.startsWith("/records");
    if (tabKey === "profile") return currentPath.startsWith("/profile");
    return false;
  };

  const items = [
    { key: "home", label: "Home", icon: homeIcon, route: "/dashboard" },
    { key: "starting", label: "Starting", icon: startingIcon, route: "/tasks" },
    { key: "records", label: "Records", icon: recordsIcon, route: "/records" },
    { key: "profile", label: "Profile", icon: profileIcon, route: "/profile" },
  ];

  // processedIcons: { home: { mask, active, inactive } , ... }
  const [processedIcons, setProcessedIcons] = useState({
    home: null,
    starting: null,
    records: null,
    profile: null,
  });

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    // Canvas-based processor: strips background-like pixels and returns tinted dataURLs
    async function processIcon(srcUrl) {
      if (!srcUrl) return null;
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const w = img.width || 64;
            const h = img.height || 64;
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            // Read pixels and compute corner-average background color
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;

            function samplePixel(x, y) {
              const idx = (y * w + x) * 4;
              return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
            }

            const px1 = samplePixel(1, 1);
            const px2 = samplePixel(Math.max(1, w - 2), 1);
            const px3 = samplePixel(1, Math.max(1, h - 2));
            const px4 = samplePixel(Math.max(1, w - 2), Math.max(1, h - 2));
            const avgBg = [
              Math.round((px1[0] + px2[0] + px3[0] + px4[0]) / 4),
              Math.round((px1[1] + px2[1] + px3[1] + px4[1]) / 4),
              Math.round((px1[2] + px2[2] + px3[2] + px4[2]) / 4),
              Math.round((px1[3] + px2[3] + px3[3] + px4[3]) / 4),
            ];

            // Threshold for "background-like" pixels
            const threshold = 28;

            // Make background-like pixels transparent
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
              const dr = Math.abs(r - avgBg[0]);
              const dg = Math.abs(g - avgBg[1]);
              const db = Math.abs(b - avgBg[2]);
              if (a > 0 && dr < threshold && dg < threshold && db < threshold) {
                data[i + 3] = 0;
              }
            }
            ctx.putImageData(imageData, 0, 0);

            // maskData is the image with background pixels made transparent
            const maskData = canvas.toDataURL();

            // Helper to produce tinted versions: paint non-transparent pixels to targetRGB
            function tintedDataURL(targetRGB) {
              const c2 = document.createElement("canvas");
              c2.width = w;
              c2.height = h;
              const cctx = c2.getContext("2d");
              cctx.clearRect(0, 0, w, h);
              cctx.drawImage(canvas, 0, 0, w, h);
              const d = cctx.getImageData(0, 0, w, h);
              const dd = d.data;
              for (let i = 0; i < dd.length; i += 4) {
                const alpha = dd[i + 3];
                if (alpha > 0) {
                  dd[i] = targetRGB[0];
                  dd[i + 1] = targetRGB[1];
                  dd[i + 2] = targetRGB[2];
                  // keep alpha
                }
              }
              cctx.putImageData(d, 0, 0);
              return c2.toDataURL();
            }

            const activeData = tintedDataURL([255, 255, 255]); // white
            const inactiveData = tintedDataURL([122, 122, 122]); // gray

            resolve({ mask: maskData, active: activeData, inactive: inactiveData });
          } catch (err) {
            // processing failure (CORS or other) -> resolve null to indicate fallback
            resolve(null);
          }
        };

        img.onerror = () => resolve(null);
        img.src = srcUrl;
      });
    }

    async function runAll() {
      const entries = await Promise.all([
        processIcon(homeIcon),
        processIcon(startingIcon),
        processIcon(recordsIcon),
        processIcon(profileIcon),
      ]);

      if (cancelled || !mountedRef.current) return;

      setProcessedIcons({
        home: entries[0],
        starting: entries[1],
        records: entries[2],
        profile: entries[3],
      });
    }

    runAll();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI styles
  const activeColor = "#ffffff";
  const inactiveColor = "#9b9b9b";
  const navBg = "linear-gradient(180deg,#111113,#151516)";

  const containerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    background: navBg,
    borderTop: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 -4px 14px rgba(0,0,0,0.35)",
  };

  const contentStyle = {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 8px",
    position: "relative",
  };

  const buttonBase = {
    background: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    padding: 0,
  };

  // compute active index for potential future use
  const tabKeys = items.map((it) => it.key);
  const activeIndexRaw = tabKeys.findIndex((k) => isActive(k));
  const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : 0;

  return (
    <nav style={containerStyle} aria-label="Bottom navigation">
      <div style={contentStyle}>
        {items.map((it) => {
          const active = isActive(it.key);

          // Make all icons same size/arrangement now (22px) including Starting
          const iconSize = 22;

          // If we processed the icon, use the processed active/inactive data URLs
          const p = processedIcons[it.key];
          const src = p && (active ? p.active : p.inactive);
          const useProcessed = Boolean(src);

          const iconStyle = {
            width: iconSize,
            height: iconSize,
            display: "block",
            objectFit: "contain",
            background: "transparent",
            borderRadius: 0,
            transition: "filter 150ms, transform 150ms, opacity 150ms",
            // if processed, no CSS filter required; otherwise use filter fallback
            filter: useProcessed ? "none" : (active ? "brightness(0) invert(1)" : "grayscale(100%) brightness(0.75)"),
            opacity: active ? 1 : 0.9,
            // Do not translate or scale the starting icon; keep all icons aligned uniformly
            transform: "translateY(0)",
            mixBlendMode: useProcessed ? "normal" : "multiply",
          };

          const labelStyle = {
            fontSize: 12,
            color: active ? activeColor : inactiveColor,
            fontWeight: active ? 800 : 500,
            marginTop: 2,
            lineHeight: "14px",
          };

          return (
            <button
              key={it.key}
              onClick={() => navigate(it.route)}
              aria-current={active ? "page" : undefined}
              aria-label={it.label}
              style={{ ...buttonBase, color: active ? activeColor : inactiveColor }}
            >
              <img src={useProcessed ? src : it.icon} alt={it.label} style={iconStyle} />
              <span style={labelStyle}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
