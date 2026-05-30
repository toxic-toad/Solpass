'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function HostScanner() {
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    if (!ticketId) return;
    setLoading(true);
    setStatus('Scanning security signature...');

    try {
      // Look up ticket directly from database
      const { data: ticket, error: fetchError } = await supabase.from('tickets').select('*').eq('id', ticketId).single();

      if (fetchError || !ticket) {
        throw new Error('Invalid ticket QR code. Access Denied.');
      }

      if (ticket.is_validated) {
        setStatus('⚠️ Ticket warning: This person is already checked in!');
        setLoading(false);
        return;
      }

      // Mark ticket valid in ledger so attendance badge drops into attendee profile
      const { error: updateError } = await supabase.from('tickets').update({ is_validated: true }).eq('id', ticketId);
      if (updateError) throw updateError;

      setStatus('✅ Ticket Verified Successfully! Entry granted and badge sent.');
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '440px', margin: '2rem auto', padding: '1.5rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #3b0764', textAlign: 'center' }}>
      <h2 style={{ color: '#c084fc', marginTop: 0 }}>Gate Ticket Validator</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Organizer Mode: Scan or enter ticket signatures below to confirm arrivals instantly.</p>

      <form onSubmit={handleVerifyTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Paste or Type Ticket ID Signature..." 
          value={ticketId}
          required
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff', textAlign: 'center', fontFamily: 'monospace' }}
          onChange={e => setTicketId(e.target.value)} 
        />
        <button type="submit" disabled={loading} style={{ background: '#10b981', color: '#fff', padding: '0.85rem', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Validating...' : 'Verify Ticket Admission'}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1e293b', borderRadius: '0.5rem', border: '1px solid #334155', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
          {status}
        </div>
      )}
    </main>
  );
            }
