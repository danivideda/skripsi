export type CreateTransactionData = {
  destinationAddressBech32: string,
  utxos: Array<string>,
  lovelace: number
}
