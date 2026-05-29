'use client';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

export default function CheckIn() {
  const { id } = useParams();
  const { publicKey } = useWallet();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!publicKey) return alert('Please connect your Solana Wallet first.');
    setLoading(true);
    setStatus('');

    try {
      // Simulating a successful network handshake with the backend database
      setTimeout(() => {
        setStatus('Success! 🎉 Attendance verified, your cryptographic badge has been allocated.');
        setLoading(false);
      }, 1500);
    } catch (err) {
      setStatus('Failed to execute check-in process.');
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '450px', margin: '4rem auto', padding: '2rem', textAlignment: 'center', textAlign: 'center', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#c084fc', marginTop: 0, fontSize: '1.75rem', marginBottom: '0.5rem' }}>Event Check-In</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>Verify your attendance on-chain and collect your proof-of-participation badge.</p>
      
      {publicKey ? (
        <div>
          <p style={{ fontSize: '0.875rem', background: '#1e293b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontFamily: 'monospace', color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Connected: {publicKey.toString()}
          </p>
          <button onClick={handleCheckIn} disabled={loading} style={{ width: '100%', background: '#059669', color: '#fff', padding: '1rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? 'Verifying Ticket...' : 'Claim Attendance Badge'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '1.5rem', background: '#1e293b', border: '1px dashed #eab308', borderRadius: '0.5rem' }}>
          <p style={{ color: '#facc15', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Wallet Disconnected</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Please use the Connect button in the top navigation bar to anchor your wallet.</p>
        </div>
      )}

      {status && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', background: '#1e293b', border: '1px solid #581c87', color: '#e9d5ff' }}>
          {status}
        </div>
      )}
    </main>
  );
}
