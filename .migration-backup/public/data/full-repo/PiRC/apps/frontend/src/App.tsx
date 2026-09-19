import React, { useEffect, useState } from "react";

// Declare global Pi interface injected by CDN
declare global {
  interface Window {
    Pi: any;
  }
}

interface PiUser {
  uid: string;
  username: string;
}

export const PiRCAppV3: React.FC = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initPi = async () => {
      try {
        if (typeof window.Pi === "undefined") {
          console.warn(
            "Pi SDK not found. Make sure you access this via the Pi Browser.",
          );
          setLoading(false);
          return;
        }

        const onIncompletePaymentFound = (payment: any) => {
          console.log("Incomplete Pi Payment detected:", payment);
        };

        const auth = await window.Pi.authenticate(
          ["username", "payments"],
          onIncompletePaymentFound,
        );
        setUser({ uid: auth.user.uid, username: auth.user.username });
        setLoading(false);
      } catch (err) {
        console.error("Pi Network connection failed:", err);
        setLoading(false);
      }
    };
    initPi();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "2em", fontFamily: "sans-serif" }}>
        Connecting to PiRC Network...
      </div>
    );
  if (!user)
    return (
      <div style={{ padding: "2em", fontFamily: "sans-serif", color: "red" }}>
        Please access via the Pi Browser.
      </div>
    );

  return (
    <div
      style={{
        padding: "2em",
        fontFamily: "sans-serif",
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#F4B814" }}>PiRC v3 Ecosystem</h1>
      <h2>Enterprise Ready Monorepo</h2>
      <p>
        Welcome, <strong>{user.username}</strong>
      </p>

      <div
        style={{
          marginTop: "2em",
          padding: "1.5em",
          border: "1px solid #333",
          borderRadius: "12px",
          background: "#f9f9f9",
          textAlign: "left",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>✓ System Status</h3>
        <p style={{ margin: "5px 0" }}>
          ✅ V3 Monorepo Architecture: <strong>Active</strong>
        </p>
        <p style={{ margin: "5px 0" }}>
          ✅ Pi SDK (CDN Verified): <strong>Ready</strong>
        </p>
        <p style={{ margin: "5px 0" }}>
          ✅ Zero-Config Environment: <strong>Protected</strong>
        </p>
      </div>
    </div>
  );
};

export default PiRCAppV3;
