export type StakeAddress = string;

export type Transaction = {
  destinationAddressBech32: string;
  utxos: string[];
  lovelace: number;
};

export type Batch = {
  stakeAddressList: StakeAddress[];
  transactionFullCborHex: string;
  witnessSignatureList: string[];
  signedList: StakeAddress[];
};

export type WalletStatus = 'available' | 'in_queue' | 'in_batch' | 'signed';
