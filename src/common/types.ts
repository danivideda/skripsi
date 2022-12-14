interface TransactionInterface {
  destinationAddressBech32: string;
  utxos: string[];
  lovelace: number;
}

export type TransactionType = TransactionInterface;
