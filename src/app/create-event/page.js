'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import QRCode from 'qrcode';

export default function CreateEvent() {
  const { publicKey } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) return alert('Please connect your Solana wallet first');
    setLoading(true);

    try {
      // In a dynamic app, this sends data to the Supabase database
      const mockEventId = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const qrCodeUrl = `${baseUrl}/check-in/${mockEventId}`;
      
      // Generate the QR code data URI
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
      setQrDataUrl(qrCodeImage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '450px', margin: '2rem auto', padding: '2rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #1e293b', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#c084fc', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Create New Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>Event Title</label>
          <input type="text" required style={{ wWidth: '100%', boxSizing: 'border-box', width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>Description</label>
          <textarea style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff', minHeight: '80px', resize: 'vertical' }} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>Date & Time</label>
          <input type="datetime-local" required style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }} onChange={e => setDate(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#9333ea', padding: '0.75rem', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
          {loading ? 'Creating...' : 'Generate Pass & QR Code'}
        </button>
      </form>

      {qrDataUrl && (
        <div style={{ marginTop: '2rem', textAlign: 'center', background: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #9333ea' }}>
          <p style={{ color: '#4ade80', fontWeight: 'bold', margin: '0 0 1rem 0' }}>Pass Generated Successfully!</p>
          <img src={qrDataUrl} alt="Event QR Code" style={{ background: '#fff', padding: '0.5rem', borderRadius: '0.375rem', maxWidth: '200px', margin: '0 auto' }} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '1rem 0 0 0' }}>Attendees scan this code to instantly verify their attendance and claim their badge proof.</p>
        </div>
      )}
    </main>
  );
}
