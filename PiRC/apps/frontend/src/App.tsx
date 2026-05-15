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
    Pi.init({ version: "2.0", sandbox: true });

    Pi.authenticate(["username", "payments"], (payment: any) => {
      console.log("Incomplete payment found:", payment);
    })
      .then((auth: any) => {
        setUser({ uid: auth.user.uid, username: auth.user.username });
        setLoading(false);
      })
      .catch((error: any) => {
        console.error("Pi Network Auth Error:", error);
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
        Unauthorized: Open via Pi Browser.
      </div>
    );

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#F4B814" }}>PiRC v3 Ecosystem</h1>
      <h2>Justice Engine Online</h2>
      <p>
        Welcome back, <strong>{user.username}</strong>
      </p>
    </div>
  );
};

export default PiRCAppV3;
