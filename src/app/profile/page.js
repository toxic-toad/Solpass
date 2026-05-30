'use client';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { publicKey } = useWallet();
  const [claimedBadges, setClaimedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyBadges() {
      if (!publicKey) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Query claims joined with the event details
        const { data, error } = await supabase
          .from('claims')
          .select(`
            id,
            claimed_at,
            events (
              title,
              description,
              image_url,
              date
            )
          `)
          .eq('wallet_address', publicKey.toString());

        if (!error && data) setClaimedBadges(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBadges();
  }, [publicKey]);

  return (
    <main style={{ minHeight: '70vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#c084fc', margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>My Badge Passport</h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Cryptographic attendance proof linked to your active wallet signature.</p>
      </div>

      {!publicKey ? (
        <div style={{ padding: '2rem', background: '#0f172a', border: '1px dashed #eab308', borderRadius: '0.5rem', textAlign: 'center' }}>
          <p style={{ color: '#facc15', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Wallet Connection Required</p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Please link your Solana wallet via the navigation bar to pull your digital credentials.</p>
        </div>
      ) : loading ? (
        <p style={{ color: '#64748b', textAlign: 'center' }}>Decrypting badge dashboard...</p>
      ) : claimedBadges.length === 0 ? (
        <div style={{ background: '#0f172a', padding: '3rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px dashed #334155' }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>Your profile passport is empty. Scan an event check-in pass to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {claimedBadges.map(item => {
            const ev = item.events;
            if (!ev) return null;
            return (
              <div key={item.id} style={{ background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #2e1065', overflow: 'hidden', textAlign: 'center', paddingBottom: '1rem' }}>
                <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderBottom: '1px solid #1e293b' }} />
                <div style={{ padding: '1rem 0.75rem 0.25rem' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{ev.title}</h3>
                  <p style={{ color: '#a78bfa', fontSize: '0.75rem', fontFamily: 'monospace', margin: '0 0 0.5rem 0' }}>Verified Attendance</p>
                  <span style={{ color: '#64748b', fontSize: '0.65rem' }}>Collected: {new Date(item.claimed_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
