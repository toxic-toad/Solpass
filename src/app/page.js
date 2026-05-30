'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEvents() {
      try {
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        if (!error && data) setEvents(data);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    }
    getEvents();
  }, []);

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#c084fc', margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>Discover Events</h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Secure access tickets in $SOL and collect limited edition validation badges.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center' }}>Syncing ledger assets...</p>
      ) : events.length === 0 ? (
        <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px dashed #334155' }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>No active passes listed on-chain yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {events.map(ev => (
            <div key={ev.id} style={{ background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={ev.image_url} alt="Badge" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{ev.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>{ev.description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #1e293b' }}>
                  <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {ev.ticket_price === 0 ? 'FREE' : `${ev.ticket_price} SOL`}
                  </span>
                  <Link href={`/event/${ev.id}`} style={{ background: '#9333ea', color: '#fff', padding: '0.4rem 0.8rem', textDecoration: 'none', fontSize: '0.8rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                    View Tickets
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
