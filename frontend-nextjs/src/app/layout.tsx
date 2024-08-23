import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import WalletProvider from './providers/wallet-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skripsi: Agregasi Transaksi Cardano',
  description: 'User interface untuk implementasi Agregasi Transaksi pada Cardano',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-100`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
