'use client';

import { useEffect, useState } from 'react';
import { truncate } from '../helper';

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
    <div className="w-full h-full mt-5 bg-gray-100 rounded border border-primary p-2">
      <h1>hello there</h1>
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
    <div>
      {list.populated.map((item: transactionResponseObj) => {
        return (
          <div key={item.stakeAddress}>
            {truncate(item.stakeAddress, undefined, 8)}
          </div>
        );
      })}
    </div>
  );
}
