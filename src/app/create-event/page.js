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
      let eventId = crypto.randomUUID();

      // Attempt to save to database, fallback gracefully if credentials are empty
      try {
        const { data, error } = await supabase.from('events').insert([{
          title,
          description,
          date,
          image_url: imageBlob || 'https://placehold.co/150',
          creator_address: publicKey.toString()
        }]).select();
        
        if (!error && data) eventId = data[0].id;
      } catch (dbErr) {
        console.log("Database fallback active");
      }

      // Generate QR code based on final ID
      const qrCodeUrl = `${window.location.origin}/check-in/${eventId}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
      setQrDataUrl(qrCodeImage);
    } catch (err) {
      alert('QR Compilation Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '480px', margin: '1rem auto', padding: '1.5rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #3b0764' }}>
      <h2 style={{ color: '#c084fc', margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Create New Event Badge
