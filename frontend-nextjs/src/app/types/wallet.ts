declare global {
  interface Window {
    cardano: Cardano;
  }
}

export type Cardano = {
  [key: string]: {
    name: string;
    icon: string;
    apiVersion: string;
    enable: () => Promise<WalletInstance>;
  };
};

export type WalletInstance = {
  experimental: ExperimentalFeatures;
  getBalance(): Promise<string>;
  getChangeAddress(): Promise<string>;
  getNetworkId(): Promise<number>;
  getRewardAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getUsedAddresses(): Promise<string[]>;
  getUtxos(): Promise<string[] | undefined>;
  signData(address: string, payload: string): Promise<any>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(tx: string): Promise<string>;
};

export type ExperimentalFeatures = {
  getCollateral(): Promise<string[] | undefined>;
};

// type transactionId = Uint8Array
// type index = number
// type address = Uint8Array
// type amount = number
export type UnspentTransactionOutput = {
  transactionInput: [transactionId: Uint8Array, index: number];
  transactionOutput: [address: Uint8Array, amount: number];
};
