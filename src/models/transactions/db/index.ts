import { Schema, Entity } from 'redis-om';

class RawTransaction extends Entity {}
class BatchTransaction extends Entity {}

export default function createSchemas() {
  const rawTransactionSchema = new Schema(
    RawTransaction,
    {
      destinationAddress: { type: 'string' },
      utxos: { type: 'string' },
      lovelace: { type: 'number' },
      isProcessed: { type: 'boolean' },
    },
    {
      dataStructure: 'JSON',
    },
  );

  const batchTransactionSchema = new Schema(
    BatchTransaction,
    {
      utxos: { type: 'string' },
      lovelace: { type: 'number' },
      isProcessed: { type: 'boolean' },
      id: { type: 'string[]' },
    },
    {
      dataStructure: 'JSON',
    },
  );

  return {
    rawTransactionSchema,
    batchTransactionSchema,
  };
}
