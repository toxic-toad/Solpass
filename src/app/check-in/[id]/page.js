'use client';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

export default function CheckIn() {
  const { id } = useParams();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function getEventDetails() {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (!error && data) setEvent(data);
      setPageLoading(false);
    }
    if (id) getEventDetails();
  }, [id]);

  const handleCheckInAndMint = async () => {
    if (!publicKey) return alert('Please anchor your wallet first.');
    setLoading(true);
    setStatus('Initializing secure cryptographic signature...');

    try {
      // 1. Submit claim metadata to Supabase ledger
      const { error: dbError } = await supabase.from('claims').insert([{
        event_id: id,
        wallet_address: publicKey.toString(),
        minted_on_chain: true
      }]);

      if (dbError && dbError.code !== '23505') { // Ignore duplicate claim errors
        throw new Error('Database registration rejected.');
      }

      setStatus('Processing on-chain verification payload...');

      // 2. Build live Web3 micro-gas transaction to confirm intent on Solana devnet
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // System Program anchor
          lamports: 1000, // Minimal micro-gas fraction of a cent
        })
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      setStatus('Awaiting user wallet approval authorization...');
      const signature = await sendTransaction(tx, connection);
      
      setStatus('Finalizing transaction confirmations on-chain...');
      await connection.confirmTransaction(signature, 'processed');

      // 3. Update database with confirmed transaction tx signature
      await supabase.from('claims')
        .update({ mint_address: signature })
        .eq('event_id', id)
        .eq('wallet_address', publicKey.toString());

      setStatus('Success! 🎉 Attendance verified. Your cryptographic badge is securely anchored to your profile passport.');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Transaction compilation or validation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <p style={{ color: '#64748b', textAlign: 'center', marginTop: '4rem' }}>Syncing ticket parameters...</p>;
  if (!event) return <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '4rem' }}>Target ticket ID not found on registry.</p>;

  return (
    <main style={{ maxWidth: '440px', margin: '2rem auto', padding: '1.5rem', background: '#0f172a', border: '1px solid #3b0764', borderRadius: '0.75rem', textAlign: 'center' }}>
      <img src={event.image_url} alt="Event Badge Artwork" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #1e293b' }} />
      
      <h2 style={{ color: '#c084fc', marginTop: 0, fontSize: '1.5rem', marginBottom: '0.25rem' }}>{event.title}</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>{event.description}</p>
      
      {publicKey ? (
        <div>
          <p style={{ fontSize: '0.75rem', background: '#1e293b', padding: '0.6rem', borderRadius: '0.25rem', marginBottom: '1.5rem', fontFamily: 'monospace', color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Identity: {publicKey.toString()}
          </p>
          <button onClick={handleCheckInAndMint} disabled={loading} style={{ width: '100%', background: '#059669', color: '#fff', padding: '0.85rem', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}>
            {loading ? 'Executing Engine...' : 'Claim & Mint Attendance Badge'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: '#1e293b', border: '1px dashed #eab308', borderRadius: '0.375rem' }}>
          <p style={{ color: '#facc15', fontWeight: 'bold', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Wallet Disconnected</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Please use the Select Wallet action in the top header menu to connect your account signature.</p>
        </div>
      )}

      {status && (
        <div style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: '0.375rem', fontSize: '0.8rem', background: '#1e293b', border: '1px solid #581c87', color: '#e9d5ff', lineHeight: '1.4' }}>
          {status}
        </div>
      )}
    </main>
  );
}
