'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      // If no wallet is connected, clear the state and stop loading
      if (!publicKey) {
        setTickets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Fetch tickets specifically for the currently connected wallet
      const { data, error } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('buyer_address', publicKey.toBase58());

      if (error) {
        console.error('Error fetching tickets:', error);
      } else {
        setTickets(data || []);
      }
      setLoading(false);
    }

    fetchTickets();
  }, [publicKey]); // <--- THIS is what forces the page to update when you switch wallets

  if (loading) return <div>Loading your badges...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Badges</h1>
      {tickets.length === 0 ? (
        <p>No badges found for this wallet address.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border p-4 rounded-lg">
              <h2 className="font-bold">{ticket.events?.event_name || 'Event'}</h2>
              <p>Status: {ticket.validated ? 'Used' : 'Active'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
