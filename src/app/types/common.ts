import { UnspentTransactionOutput, WalletInstance } from './wallet';

export type Utxo = { utxoString: string; txOutputs: UnspentTransactionOutput };
export type WalletHelper = {
  walletInstance: WalletInstance;
  state: 'available' | 'in_queue' | 'in_batch' | 'signed';
  status: 'connected' | 'disconnected';
};
