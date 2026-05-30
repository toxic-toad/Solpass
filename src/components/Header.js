'use client';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <header style={{ 
      display: 'flex', 
      flexDirection: 'row',
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 1rem', 
      background: 'rgba(15, 23, 42, 0.9)', 
      borderBottom: '1px solid #3b0764',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#a78bfa', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>SolPass</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>Explore</Link>
          <Link href="/create-event" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>Create</Link>
          <Link href="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>My Badges</Link>
        </nav>
      </div>
      <div style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}>
        <WalletMultiButton />
      </div>
    </header>
  );
}
