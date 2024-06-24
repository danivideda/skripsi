'use client';

import { useState, ReactNode, createContext } from 'react';
import { WalletHelper } from './types';

const WalletContext = createContext({});

export default function WalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wallet, setWallet] = useState({
    walletInstance: null,
    status: 'disconnected',
  } satisfies WalletHelper);

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
