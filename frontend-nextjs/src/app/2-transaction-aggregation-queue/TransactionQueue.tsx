'use client';

import { useContext, useEffect, useState } from 'react';
import { encodeBech32, truncate } from '../helper';
import { NumericFormat } from 'react-number-format';
import { WalletContext } from '../providers/wallet-provider';
import { WalletStatus } from '../types';

export default function TransactionQueue() {
  const [queueList, setQueueList] = useState<any>({});
  const [isFetching, setIsFetching] = useState(false);
  const walletContext = useContext(WalletContext);

  useEffect(() => {
    // first time fetch
    fetchQueue();

    // interval fetch every 5 sec
    const intervalFetch = setInterval(() => {
      fetchQueue();
      console.log('refreshed');
    }, 6 * 1000);

    return () => {
      clearInterval(intervalFetch);
    };

    async function fetchQueue() {
      setIsFetching(true);

      if (walletContext.walletStatus !== 'disconnected') {
        const walletStatus = await getWalletStatus();
        if (walletStatus === 'in_batch' || walletStatus === 'signed') {
          walletContext.setWalletStatus(walletStatus);
          console.log('fetch status', walletStatus);
        }
      }
      const url = `${process.env.backendUrl}/transactions/queue`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });
      const body = await response.json();
      setQueueList(body);
      setTimeout(() => {
        setIsFetching(false);
      }, 500);
    }

    async function getWalletStatus(): Promise<WalletStatus> {
      const url = `${process.env.backendUrl}/transactions/status`;
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
      return body.message;
    }
  }, [walletContext]);

  return (
    <div className="w-full">
      {!queueList.queue_list ? 'loading' : <QueueList list={queueList} isFetching={isFetching} />}
    </div>
  );
}

function QueueList({ list, isFetching }: { list: any; isFetching: boolean }) {
  type transactionResponseObj = {
    stakeAddress: string;
    utxos: string[];
    lovelace: number;
    destinationAddressBech32: string;
  };

  return (
    <>
      <div className="flex justify-between">
        <div>
          <h1 className="text-md">
            Number of queue: <span className="font-semibold">{list.queue_list.length}</span>
          </h1>
          <h1 className="text-md">
            Needed for aggregation: <span className="font-semibold">{list.aggregation_count}</span>
          </h1>
        </div>
        {isFetching && <h1 className="font-light italic">Fetching...</h1>}
      </div>
      <div className="overflow-x-hidden h-[400px]">
        <table className="w-full border-2 border-black mt-2">
          <thead>
            <tr className="bg-orange-200">
              <th className="border-y-2 border-x border-black p-1">No.</th>
              <th className="border-y-2 border-x border-black p-1">User</th>
              <th className="border-y-2 border-x border-black p-1">Destination</th>
              <th className="border-y-2 border-x border-black p-1">Amount</th>
            </tr>
          </thead>
          <tbody className="font-normal">
            {list.queue_list.length === 0 ? (
              <tr className="bg-gray-200">
                <td className="p-1 px-3 text-center border border-black break-words"></td>
                <td className="p-1 px-3 text-center border border-black break-words"></td>
                <td className="p-1 px-3 text-center border border-black break-words"></td>
                <td className="p-1 px-3 text-center border border-black break-words"></td>
              </tr>
            ) : (
              list.queue_list.map((item: transactionResponseObj, index: number) => {
                return (
                  <tr key={item.stakeAddress} className="">
                    <td className="p-1 px-3 text-center border border-black break-words">
                      {index + 1}
                    </td>
                    <td className="p-1 px-3 text-left border border-black break-all font-mono">
                      <div className="group flex relative">
                        {truncate(encodeBech32("stake_test",item.stakeAddress), undefined, 10)}
                        <span className="group-hover:opacity-100 group-hover:visible transition-opacity bg-gray-800 px-1 text-sm text-gray-100 rounded-md absolute translate-x-full opacity-0 invisible m-1 mx-auto z-10">
                          {item.stakeAddress}
                        </span>
                      </div>
                    </td>
                    <td className="p-1 px-3 text-left border border-black break-all font-mono">
                      <div className="group flex relative">
                        {truncate(item.destinationAddressBech32, undefined, 10)}
                        <span className="group-hover:opacity-100 group-hover:visible transition-opacity bg-gray-800 px-1 text-sm text-gray-100 rounded-md absolute translate-x-full opacity-0 invisible m-1 mx-auto z-10">
                          {item.destinationAddressBech32}
                        </span>
                      </div>
                    </td>
                    <td className="p-1 px-3 text-left border border-black break-words font-mono">
                      <NumericFormat
                        displayType="text"
                        thousandSeparator=","
                        allowNegative={false}
                        fixedDecimalScale
                        decimalScale={6}
                        value={item.lovelace / 10 ** 6}
                      />{' '}
                      ADA
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
