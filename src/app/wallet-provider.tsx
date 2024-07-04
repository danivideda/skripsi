'use client';

import { useState, ReactNode, createContext } from 'react';
import { WalletInstance, WalletStatus } from './types';

type WalletContextType = {
  walletApi: WalletInstance | null;
  setWalletApi: (i: WalletInstance) => void;
  walletStatus: WalletStatus;
  setWalletStatus: (i: WalletStatus) => void;
  walletAddress: string | null;
  setWalletAddress: (i: string) => void;
};

export const WalletContext = createContext<WalletContextType>({
  walletApi: null,
  setWalletApi: () => {},
  walletStatus: 'disconnected',
  setWalletStatus: () => {},
  walletAddress: null,
  setWalletAddress: () => {},
});

export default function WalletProvider({ children }: { children: ReactNode }) {
  const [walletApi, setWalletApi] = useState<WalletInstance | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider
      value={{
        walletApi,
        setWalletApi,
        walletStatus,
        setWalletStatus,
        walletAddress,
        setWalletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
