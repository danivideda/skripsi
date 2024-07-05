import { UnspentTransactionOutput, WalletInstance } from './wallet';

export type Utxo = { utxoString: string; txOutputs: UnspentTransactionOutput };
export type WalletStatus = 'disconnected' | 'available' | 'in_queue' | 'in_batch' | 'signed';

export type WalletContextType = {
  walletApi: WalletInstance | null;
  setWalletApi: (i: WalletInstance) => void;
  walletStatus: WalletStatus;
  setWalletStatus: (i: WalletStatus) => void;
  walletAddress: string | null;
  setWalletAddress: (i: string) => void;
};
