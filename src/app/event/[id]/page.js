'use client';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import QRCode from 'qrcode';

export default function EventDetails() {
  const { id } = useParams();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const { data: evData } = await supabase.from('events').select('*').eq('id', id).single();
      if (evData) setEvent(evData);

      if (publicKey && evData) {
        const { data: tkData } = await supabase.from('tickets').select('*').eq('event_id', id).eq('attendee_address', publicKey.toString()).single();
        if (tkData) {
          setTicket(tkData);
          generateTicketQR(tkData.id);
        }
      }
    }
    loadData();
  }, [id, publicKey]);

  const generateTicketQR = async (ticketId) => {
    const code = await QRCode.toDataURL(ticketId);
    setQrCode(code);
  };

  const handleBuyTicket = async () => {
    if (!publicKey) return alert('Please connect your Solana wallet first!');
    setLoading(true);
    setStatus('Preparing transaction payload...');

    try {
      let txSig = 'free-pass';

      // If the ticket costs SOL, execute the Web3 transfer to the host
      if (event.ticket_price > 0) {
        setStatus(`Requesting authorization for ${event.ticket_price} SOL...`);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(event.creator_address),
            lamports: event.ticket_price * LAMPORTS_PER_SOL,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = blockhash;

        txSig = await sendTransaction(transaction, connection);
        setStatus('Confirming block on the Solana network...');
        await connection.confirmTransaction(txSig, 'processed');
      }

      setStatus('Registering your ticket in the database...');
      const ticketId = 'tk-' + Math.random().toString(36).substring(2, 11);

      const { data, error } = await supabase.from('tickets').insert([{
        id: ticketId,
        event_id: id,
        attendee_address: publicKey.toString(),
        tx_signature: txSig,
        is_validated: false
      }]).select().single();

      if (error) throw error;

      setTicket(data);
      await generateTicketQR(data.id);
      setStatus('Success! Your entry ticket is generated below.');
    } catch (err) {
      alert(err.message || 'Payment or registration failed.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '4rem' }}>Loading event info...</p>;

  return (
    <main style={{ maxWidth: '440px', margin: '1rem auto', padding: '1.5rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #3b0764', textAlign: 'center' }}>
      <img src={event.image_url} alt="Badge Artwork" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }} />
      <h2 style={{ color: '#c084fc', margin: '0 0 0.5rem 0' }}>{event.title}</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{event.description}</p>
      
      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Admission Price</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>
          {event.ticket_price === 0 ? 'FREE' : `${event.ticket_price} SOL`}
        </p>
      </div>

      {!ticket ? (
        <button onClick={handleBuyTicket} disabled={loading} style={{ width: '100%', background: '#9333ea', color: '#fff', padding: '0.85rem', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Processing...' : event.ticket_price === 0 ? 'Get Free Ticket' : 'Purchase Entry Ticket'}
        </button>
      ) : (
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #4ade80' }}>
          <p style={{ color: '#4ade80', fontWeight: 'bold', margin: '0 0 1rem 0' }}>You Own This Ticket!</p>
          {qrCode ? (
            <div style={{ background: '#fff', padding: '0.5rem', display: 'inline-block', borderRadius: '0.375rem' }}>
              <img src={qrCode} alt="Ticket QR" style={{ width: '180px', height: '180px' }} />
            </div>
          ) : null}
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem', margin: 0 }}>
            {ticket.is_validated ? '✅ Checked in at door & Badge Unlocked!' : '⏳ Show this QR code to the host at the door to get validated.'}
          </p>
        </div>
      )}

      {status && <p style={{ color: '#a78bfa', fontSize: '0.85rem', marginTop: '1rem' }}>{status}</p>}
    </main>
  );
  }
  
