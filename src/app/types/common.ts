import { UnspentTransactionOutput } from './wallet';

export type Utxo = { utxoString: string; txOutputs: UnspentTransactionOutput };
export type WalletStatus = 'disconnected' | 'available' | 'in_queue' | 'in_batch' | 'signed';
