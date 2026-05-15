import React, { useEffect, useState } from 'react';

interface PiUser {
  uid: string;
  username: string;
}

export const PiRCAppV3: React.FC = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Injecting the Pi SDK securely at runtime
    const loadPiSdk = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        // @ts-ignore
        if (window.Pi) {
          // @ts-ignore
          window.Pi.init({ version: "2.0", sandbox: true });
          // @ts-ignore
          window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
            .then((auth: any) => {
              setUser({ uid: auth.user.uid, username: auth.user.username });
              setLoading(false);
            })
            .catch((error: any) => {
              console.error("Pi Auth Failed:", error);
              setLoading(false);
            });
        }
      };
      document.body.appendChild(script);
    };

    const onIncompletePaymentFound = (payment: any) => {
      console.log("Incomplete payment found:", payment);
    };

    loadPiSdk();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Connecting to PiRC v3 Protocol via Pi Network...</div>;
  if (!user) return <div style={{ padding: '20px', color: 'red' }}>Unauthorized: Please open within the Pi Browser.</div>;

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#F4B814' }}>PiRC v3 Ecosystem</h1>
      <h2>Justice & Asset Recovery Engine</h2>
      <p>Welcome, <strong>{user.username}</strong></p>
      
      <div style={{ marginTop: '2em', padding: '1.5em', border: '1px solid #ddd', borderRadius: '12px', background: '#f9f9f9', textAlign: 'left' }}>
         <h3 style={{ margin: '0 0 10px 0' }}>✓ System Integrity</h3>
         <p>✅ V3 Monorepo Architecture: <strong>Active</strong></p>
         <p>✅ Pi Network Connection: <strong>Verified</strong></p>
      </div>
    </div>
  );
};

export default PiRCAppV3;
