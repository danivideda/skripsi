export interface Transaction {
  destinationAddressBech32: string;
  utxos: string[];
  lovelace: number;
}
