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

export type UnspentTransactionOutput = {
  transactionInput: [Uint8Array, number];
  transactionOutput: [Uint8Array, number];
};
