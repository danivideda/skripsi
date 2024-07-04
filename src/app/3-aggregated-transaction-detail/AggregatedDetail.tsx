'use client';

import { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../wallet-provider';

export default function AggregatedDetail() {
  const walletContext = useContext(WalletContext);
  const [aggregatedTransactionDetail, setAggregatedTransactionDetail] =
    useState<aggregatedTransaction | null>(null);

  type aggregatedTransaction = {
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

  return (
    <div>
      <div>
        {walletContext.walletStatus === 'disconnected'
          ? 'Please connect wallet first'
          : !aggregatedTransactionDetail
          ? 'loading'
          : aggregatedTransactionDetail.data.aggregatedTxId}
      </div>
    </div>
  );
}
