import React, { useEffect, useState } from 'react';

interface PiUser {
  uid: string;
  username: string;
}

export const PiRCAppV3: React.FC = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Graceful check for Pi Network Global Object
    const Pi = (window as any).Pi;
    
    if (!Pi) {
        console.warn("Pi Network Native SDK is not loaded.");
        setLoading(false);
        return;
    }

    try {
        Pi.init({ version: "2.0", sandbox: true });
        
        Pi.authenticate(['username', 'payments'], (payment: any) => {
           console.log("Incomplete payment mapped:", payment);
        })
        .then((auth: any) => {
           setUser({ uid: auth.user.uid, username: auth.user.username });
           setLoading(false);
        })
        .catch((error: any) => {
           console.error("Pi Authentication Rejected:", error);
           setLoading(false);
        });
    } catch (e) {
        setLoading(false);
    }
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Connecting to PiRC v3 Protocol via Pi Network...</div>;
  if (!user) return <div style={{ padding: '20px', color: '#ff4444' }}>Notice: System operates exclusively inside the authenticated Pi Browser Network.</div>;

  return (
    <div className="pirc-container" style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#F4B814' }}>PiRC v3 Ecosystem</h1>
      <h2>Justice & Asset Recovery Engine</h2>
      <p style={{ marginTop: '10px' }}>Secure Identity Verified: <strong>{user.username}</strong></p>
    </div>
  );
};

export default PiRCAppV3;
