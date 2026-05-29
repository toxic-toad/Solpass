'use client';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/"><h1 style={{ color: '#c084fc', margin: 0, fontSize: '1.25rem', cursor: 'pointer' }}>SolPass</h1></Link>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
          <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Explore</Link>
          <Link href="/create-event" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Create</Link>
        </nav>
      </div>
      <WalletMultiButton />
    </header>
  );
}
