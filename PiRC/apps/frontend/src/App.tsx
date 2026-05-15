import React, { useEffect, useState } from "react";

// Using Pi Network SDK globally from index.html script inclusion
declare const Pi: any;

interface PiUser {
  uid: string;
  username: string;
}

export const PiRCAppV3: React.FC = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof Pi !== "undefined") {
        Pi.init({ version: "2.0", sandbox: true });

        const onIncompletePaymentFound = (payment: any) => {
          console.log("Incomplete payment requiring resolution:", payment);
        };

        Pi.authenticate(["username", "payments"], onIncompletePaymentFound)
          .then((auth: any) => {
            setUser({ uid: auth.user.uid, username: auth.user.username });
            setLoading(false);
          })
          .catch((error: any) => {
            console.error("Pi Auth Error:", error);
            setLoading(false);
          });
      } else {
        console.warn("Pi SDK not loaded via script tag - skipping auth.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  if (loading)
    return (
      <div style={{ padding: "20px" }}>Connecting to PiRC v3 Protocol...</div>
    );
  if (!user)
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Unauthorized: Please open in Pi Browser.
      </div>
    );

  return (
    <div
      style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#F4B814" }}>PiRC v3 Ecosystem</h1>
      <h2>Enterprise Data Architecture</h2>
      <p>
        Welcome back, <strong>{user.username}</strong>
      </p>
    </div>
  );
};

export default PiRCAppV3;
