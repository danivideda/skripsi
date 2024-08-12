import { BufferLike } from 'cbor/types/lib/decoder';
import { UnspentTransactionOutput, WalletInstance } from './wallet';

export type Utxo = { utxoString: string; txOutputs: UnspentTransactionOutput };
export type WalletStatus = 'disconnected' | 'available' | 'in_queue' | 'in_batch' | 'signed';
export type AggregatedTransactionDetail = {
  in_batch: boolean;
  signed: boolean;
  data: {
    aggregatedTxId: string;
    aggregatedTxData: {
      stakeAddressList: Array<string>;
      transactionFullCborHex: string;
      witnessSignatureList: Array<BufferLike[]>;
      signedList: Array<string>;
      feeTotal: number;
      feePerParticipant: number;
      totalInputUtxoCount: number;
      txByteSize: number;
    };
  };
};

export type WalletContextType = {
  walletApi: WalletInstance | null;
  setWalletApi: (i: WalletInstance | null) => void;
  walletStatus: WalletStatus;
  setWalletStatus: (i: WalletStatus) => void;
  walletAddress: string | null;
  setWalletAddress: (i: string | null) => void;
};

export type AggregatedTransactionContextType = {
  aggregatedTransactionDetail: AggregatedTransactionDetail | null,
  setAggregatedTransactionDetail: (i: AggregatedTransactionDetail) => void;
}