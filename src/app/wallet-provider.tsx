'use client';

import { useState, ReactNode, createContext } from 'react';
import { WalletInstance, WalletStatus } from './types';

type WalletContextType = {
  walletApi: WalletInstance | null;
  setWalletApi: (i: WalletInstance) => void;
  walletStatus: WalletStatus;
  setWalletStatus: (i: WalletStatus) => void;
};

export const WalletContext = createContext<WalletContextType>({
  walletApi: null,
  setWalletApi: () => {},
  walletStatus: 'disconnected',
  setWalletStatus: () => {},
});

export default function WalletProvider({ children }: { children: ReactNode }) {
  const [walletApi, setWalletApi] = useState<WalletInstance | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');

  return (
    <WalletContext.Provider value={{ walletApi, setWalletApi, walletStatus, setWalletStatus }}>
      {children}
    </WalletContext.Provider>
  );
}
