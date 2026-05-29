import WalletContextProvider from '@/components/WalletContextProvider';
import Header from '@/components/Header';
import '@solana/wallet-adapter-react-ui/styles.css';

export const metadata = { title: 'SolPass' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#020617', color: '#f8fafc', fontFamily: 'sans-serif', minHeight: '100vh', margin: 0 }}>
        <WalletContextProvider>
          <Header />
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>{children}</div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
