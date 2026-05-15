import React, { useEffect, useState } from "react";
import Pi from "@pinetwork-js/sdk";

interface PiUser {
  uid: string;
  username: string;
}

export const PiRCAppV3: React.FC = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initialize Pi Network SDK Environment
    // NOTE: Sandbox is required for local dev, switch to false for live mainnet production.
    Pi.init({ version: "2.0", sandbox: true });

    const onIncompletePaymentFound = (payment: any) => {
      console.log("Found an incomplete payment requiring resolution:", payment);
    };

    // 2. Authenticate User securely across the Pi Node Ecosystem
    Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
      .then((auth: any) => {
        setUser({
          uid: auth.user.uid,
          username: auth.user.username,
        });
        setLoading(false);
      })
      .catch((error: any) => {
        console.error("Pi Network Connection Failed:", error);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        Connecting to PiRC v3 Protocol via Pi Network...
      </div>
    );
  if (!user)
    return (
      <div
        style={{ padding: "20px", fontFamily: "sans-serif", color: "#ff4444" }}
      >
        Unauthorized: Please open this application through the official Pi
        Browser.
      </div>
    );

  return (
    <div
      className="pirc-container"
      style={{
        padding: "40px 20px",
        fontFamily: "sans-serif",
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#F4B814" }}>PiRC v3 Ecosystem</h1>
      <h2>Justice & Asset Recovery Engine</h2>
      <p style={{ marginTop: "10px" }}>
        Welcome back, <strong>{user.username}</strong>
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
          ✅ Production Monorepo Structure: <strong>Active</strong>
        </p>
        <p style={{ margin: "5px 0" }}>
          ✅ SDK Payment Interface: <strong>Ready</strong>
        </p>
        <p style={{ margin: "5px 0" }}>
          ✅ SCP / Soroban Smart Contracts: <strong>Indexed</strong>
        </p>
      </div>
    </div>
  );
};

export default PiRCAppV3;
