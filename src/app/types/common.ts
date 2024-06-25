import { Dispatch, SetStateAction } from 'react';
import { UnspentTransactionOutput, WalletInstance } from './wallet';

export type Utxo = { utxoString: string; txOutputs: UnspentTransactionOutput };
export type WalletHelper = {
  walletInstance: WalletInstance | null;
  status: 'disconnected' | 'available' | 'in_queue' | 'in_batch' | 'signed';
};
export type WalletContextType = {
  wallet: WalletHelper;
  setWallet: Dispatch<SetStateAction<WalletHelper>> | null;
};

export type WalletStatus = 'disconnected' | 'available' | 'in_queue' | 'in_batch' | 'signed';
