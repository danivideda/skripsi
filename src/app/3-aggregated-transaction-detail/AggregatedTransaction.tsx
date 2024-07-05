'use client';

import { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../wallet-provider';
import { WalletContextType } from '../types';

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
    };
  };
};
export default function AggregatedTransaction() {
  const walletContext = useContext(WalletContext);
  const [aggregatedTransactionDetail, setAggregatedTransactionDetail] =
    useState<AggregatedTransactionDetail | null>(null);

  useEffect(() => {
    if (walletContext.walletStatus === 'in_batch' && walletContext.walletAddress) {
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
      setAggregatedTransactionDetail(body);
    }
  }, [walletContext.walletAddress, walletContext.walletStatus]);

  if (walletContext.walletStatus === 'disconnected') {
    return 'Please connect your wallet first.';
  }

  if (walletContext.walletStatus === 'in_batch') {
    if (!aggregatedTransactionDetail) {
      return 'loading...';
    }
    return aggregatedTransactionDetail.data.aggregatedTxId;
  }

  return 'No aggregated transaction';

  // return (
  //   <AggregatedTransactionDetail
  //     walletContext={walletContext}
  //     aggregatedTransactionDetail={aggregatedTransactionDetail}
  //   />
  // );
}

function AggregatedTransactionDetail({
  walletContext,
  aggregatedTransactionDetail,
}: {
  walletContext: WalletContextType;
  aggregatedTransactionDetail: AggregatedTransactionDetail | null;
}) {
  return (
    <div>
      {walletContext.walletStatus === 'disconnected'
        ? 'Please connect wallet first'
        : !aggregatedTransactionDetail
        ? 'loading'
        : aggregatedTransactionDetail.data.aggregatedTxId}
    </div>
  );
}
