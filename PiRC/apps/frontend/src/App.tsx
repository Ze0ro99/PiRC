import React, { useEffect, useState } from 'react';

// Declaration to satisfy TypeScript for global Pi object from CDN
declare global {
  interface Window {
    Pi: any;
  }
}

export const PiRCAppV3: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const Pi = window.Pi;
    if (!Pi) {
      console.warn("Pi SDK not detected. Are you bypassing index.html?");
      setLoading(false);
      return;
    }

    const onIncompletePaymentFound = (payment: any) => {
      console.log("Incomplete payment found:", payment);
    };

    Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
      .then((auth: any) => {
        setUser({ uid: auth.user.uid, username: auth.user.username });
        setLoading(false);
      })
      .catch((error: any) => {
        console.error("Pi Network Connection Failed:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Connecting to PiRC v3 Protocol via Pi Network...</div>;
  if (!user) return <div style={{ padding: '20px', color: 'red' }}>Unauthorized: Please open this application through the official Pi Browser, or ensure Pi SDK loaded.</div>;

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#F4B814' }}>PiRC v3 Ecosystem</h1>
      <p>Welcome back, <strong>{user.username}</strong></p>
    </div>
  );
};

export default PiRCAppV3;
