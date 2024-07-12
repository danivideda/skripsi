'use client';

import { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../providers/wallet-provider';
import { AggregatedTransactionContext } from '../providers/aggregated-transaction-provider';

type AggregatedTransactionDetail = {
  in_batch: boolean;
  signed: boolean;
  data: {
    aggregatedTxId: string;
    aggregatedTxData: {
      stakeAddressList: Array<string>;
      transactionFullCborHex: string;
      witnessSignatureList: Array<string>;
      signedList: Array<string>;
      feeTotal: number;
      feePerParticipant: number;
      totalInputUtxoCount: number;
      txByteSize: number;
    };
  };
};
export default function AggregatedTransaction() {
  const walletContext = useContext(WalletContext);
  const aggregatedTransactionContext = useContext(AggregatedTransactionContext);
  useEffect(() => {
    if (
      (walletContext.walletStatus === 'in_batch' || walletContext.walletStatus === 'signed') &&
      walletContext.walletAddress
    ) {
      fetchAggregatedTransactionDetail();
    }

    async function fetchAggregatedTransactionDetail() {
      const url = `${process.env.backendUrl}/batches`;
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stakeAddressHex: walletContext.walletAddress,
        }),
      });
      const body = await response.json();
      aggregatedTransactionContext.setAggregatedTransactionDetail(body);
    }
  }, [aggregatedTransactionContext, walletContext.walletAddress, walletContext.walletStatus]);

  if (walletContext.walletStatus === 'disconnected') {
    return 'Please connect your wallet first.';
  }

  if (walletContext.walletStatus === 'in_batch') {
    if (!aggregatedTransactionContext.aggregatedTransactionDetail) {
      return 'loading...';
    }
    return (
      <AggregatedTransactionDetail
        aggregatedTransactionDetail={aggregatedTransactionContext.aggregatedTransactionDetail}
      />
    );
  }

  return 'No aggregated transaction';
}

function AggregatedTransactionDetail({
  aggregatedTransactionDetail,
}: {
  aggregatedTransactionDetail: AggregatedTransactionDetail;
}) {
  return (
    <div className="flex flex-col border border-gray-500 rounded-md px-3">
      <Item label="TxId" content={aggregatedTransactionDetail.data.aggregatedTxId} />
      <Item
        label="Number of participants"
        content={aggregatedTransactionDetail.data.aggregatedTxData.stakeAddressList.length}
      />
      <Item
        label="Total input UTXOs"
        content={aggregatedTransactionDetail.data.aggregatedTxData.totalInputUtxoCount}
      />
      <Item
        label="Transaction size (bytes)"
        content={aggregatedTransactionDetail.data.aggregatedTxData.txByteSize}
      />
      <Item
        label="Total transaction fee (ADA)"
        content={aggregatedTransactionDetail.data.aggregatedTxData.feeTotal / 1_000_000}
      />
      <Item
        label="Transaction fee per participant (ADA)"
        content={aggregatedTransactionDetail.data.aggregatedTxData.feePerParticipant / 1_000_000}
      />
      <Item
        label="Concise Binary Object Notation (CBOR)"
        // content={truncate(aggregatedTransactionDetail.data.aggregatedTxData.transactionFullCborHex, undefined, 30)}
        content={aggregatedTransactionDetail.data.aggregatedTxData.transactionFullCborHex}
      />
    </div>
  );
}

function Item({ label, content }: { label: string; content: string | number }) {
  return (
    <div className="border-b border-b-gray-200 py-2">
      <span className="text-sm italic mb-2 text-gray-500">{label}</span>
      <p className="pl-1 text-md break-all font-mono">{content}</p>
    </div>
  );
}
