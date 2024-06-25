'use client';

import { useEffect, useState } from 'react';
import { truncate } from '../helper';
import { NumericFormat } from 'react-number-format';

export default function TransactionQueue() {
  const [queueList, setQueueList] = useState({} as any);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    const url = `${process.env.backendUrl}/transactions/queue`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });
    const body = await response.json();
    setQueueList(body);
  }

  return (
    <div className="w-full">
      {!queueList.queue_list ? 'loading' : <QueueList list={queueList} />}
    </div>
  );
}

function QueueList({ list }: { list: any }) {
  type transactionResponseObj = {
    stakeAddress: string;
    utxos: string[];
    lovelace: number;
    destinationAddressBech32: string;
  };

  return (
    <>
      <h1 className="text-lg w-full text-center">Transaction Aggregation Queue</h1>
      <div>
        <h1 className="font-semibold">Number of queue: {list.queue_list.length}</h1>
        <table className="w-full border-2 border-black mt-2">
          <thead>
            <tr>
              <th className="border-y-2 border-x border-black p-1">No.</th>
              <th className="border-y-2 border-x border-black p-1">User</th>
              <th className="border-y-2 border-x border-black p-1">Destination</th>
              <th className="border-y-2 border-x border-black p-1">Amount</th>
            </tr>
          </thead>
          <tbody className="font-normal">
            {list.queue_list.length === 0 ? (
              <tr>Queue empty</tr>
            ) : (
              list.queue_list.map((item: transactionResponseObj, index: number) => {
                return (
                  <tr key={item.stakeAddress} className="">
                    <td className="p-1 px-3 text-center border border-black break-words">
                      {index + 1}
                    </td>
                    <td className="p-1 px-3 text-left border border-black break-all font-mono">
                      <div className="group flex relative">
                        {truncate(item.stakeAddress, undefined, 10)}
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
                    <td className="p-1 px-3 text-left border border-black break-words">
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
