import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://digitalblitz-backend.onrender.com";
const START_BLUE = "#1fb6fc";
const HEADER_HEIGHT = 64;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/notifications`, {
          headers: {
            "x-auth-token": localStorage.getItem("authToken") || "",
          },
        });
        const data = await res.json();
        if (!mounted) return;

        if (data && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          // mark latest as read locally
          if (data.notifications.length > 0) {
            localStorage.setItem(
              "lastReadNotificationId",
              data.notifications[0].id
            );
          }
        } else {
          // fallback if API returns different shape
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // keep notifications empty on error
        setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efebe6", // page beige like screenshots
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* Fixed header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          background: "#111",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            margin: 0,
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
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

        <div style={{ fontWeight: 800, fontSize: 18 }}>Notifications</div>
      </div>

      {/* spacer so content sits below header */}
      <div style={{ height: HEADER_HEIGHT + 8 }} />

      {/* content area */}
      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "12px 16px 40px",
          boxSizing: "border-box",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#8f8f8f",
              paddingTop: 18,
              fontSize: 15,
            }}
          >
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#8f8f8f",
              paddingTop: 18,
              fontSize: 15,
            }}
          >
            No notifications at the moment.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notifications.map((n) => {
              const title = n.title || "Notification";
              const message = n.message || "";
              const createdAt = n.createdAt
                ? (() => {
                    const d = new Date(n.createdAt);
                    return isNaN(d.getTime()) ? "" : d.toLocaleString();
                  })()
                : "";

              return (
                <li
                  key={n.id || `${title}-${createdAt}`}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 20,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: 10,
                      color: "#111",
                      fontSize: 20,
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h3>

                  <div
                    style={{
                      color: "#8f8f8f",
                      fontSize: 15,
                      fontWeight: 600,
                      lineHeight: 1.55,
                      marginBottom: 14,
                    }}
                    // preserve line breaks if message contains them
                  >
                    {message}
                  </div>

                  <div style={{ color: "#bdbdbd", fontSize: 13 }}>{createdAt}</div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
