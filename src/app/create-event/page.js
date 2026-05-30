'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../../lib/supabase';
import QRCode from 'qrcode';

export default function CreateEvent() {
  const { publicKey } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imageBlob, setImageBlob] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBlob(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) return alert('Connect your Solana wallet first');
    setLoading(true);

    try {
      const { data, error } = await supabase.from('events').insert([{
        title,
        description,
        date,
        image_url: imageBlob || 'https://placeholder.co/150',
        creator_address: publicKey.toString()
      }]).select();

      if (error) throw error;

      const eventId = data[0].id;
      const qrCodeUrl = `${window.location.origin}/check-in/${eventId}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
      setQrDataUrl(qrCodeImage);
    } catch (err) {
      alert(err.message || 'Database registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '480px', margin: '1rem auto', padding: '1.5rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #3b0764' }}>
      <h2 style={{ color: '#c084fc', margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Create New Event Badge</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#94a3b8' }}>Event Title</label>
          <input type="text" required style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#94a3b8' }}>Description</label>
          <textarea style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff', minHeight: '60px' }} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#94a3b8' }}>Date & Time</label>
          <input type="datetime-local" required style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#94a3b8' }}>Upload Badge Image Artwork</label>
          <input type="file" accept="image/*" required style={{ width: '100%', color: '#94a3b8' }} onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#9333ea', padding: '0.75rem', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold' }}>
          {loading ? 'Publishing Design...' : 'Generate Pass & Live QR'}
        </button>
      </form>

      {qrDataUrl && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center', background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #4ade80' }}>
          <p style={{ color: '#4ade80', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Live Pass Published!</p>
          <img src={qrDataUrl} alt="QR Code" style={{ background: '#fff', padding: '0.5rem', borderRadius: '0.375rem', maxWidth: '180px' }} />
        </div>
      )}
    </main>
  );
}
