'use client';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <header style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '0.75rem',
      padding: '1rem', 
      background: '#0f172a', 
      borderBottom: '1px solid #3b0764',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#a78bfa', margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>SolPass</h1>
        </Link>
        <div style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>
          <WalletMultiButton />
        </div>
      </div>
      
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        background: '#1e293b', 
        padding: '0.5rem', 
        borderRadius: '0.375rem',
        fontSize: '0.85rem' 
      }}>
        <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>Explore</Link>
        <Link href="/create-event" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>Create</Link>
        <Link href="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>My Badges</Link>
        <Link href="/scanner" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', color: '#34d399' }}>Gate Scanner</Link>
      </nav>
    </header>
  );
}
