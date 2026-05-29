'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEvents() {
      const { data, error } = await supabase.from('events').select('*');
      if (!error && data) setEvents(data);
      setLoading(false);
    }
    getEvents();
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#c084fc', margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Discover Events</h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>Scan QR codes and claim your attendance badges.</p>
        </div>
        <Link href="/create-event" style={{ background: '#9333ea', padding: '0.6rem 1.2rem', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.875rem' }}>+ Create Event</Link>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading events from ledger...</p>
      ) : events.length === 0 ? (
        <div style={{ background: '#0f172a', padding: '3rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px dashed #334155' }}>
          <p style={{ color: '#94a3b8' }}>No events found. Be the first to launch one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {events.map(ev => (
            <div key={ev.id} style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>{ev.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.4', marginBottom: '1.5rem' }}>{ev.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
                <span style={{ color: '#c084fc', fontSize: '0.75rem', fontFamily: 'monospace' }}>{new Date(ev.date).toLocaleDateString()}</span>
                <Link href={`/check-in/${ev.id}`} style={{ color: '#34d399', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 'bold' }}>Claim Pass &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
        }
