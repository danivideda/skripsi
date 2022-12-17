export type Transaction = {
  destinationAddressBech32: string;
  utxos: string[];
  lovelace: number;
};