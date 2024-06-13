import React from 'react';
import CreateTransaction from './create-transaction/CreateTransaction';
import HeadingSkripsi from './landing-page/HeadingSkripsi';
import TransactionQueue from './transaction-aggregation-queue/TransactionQueue';

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen">
      <div className="flex flex-col min-h-screen justify-center items-center">
        <HeadingSkripsi />
        {/* first row */}
        <div className="flex flex-row justify-between w-full gap-x-5">
          {/* item 1 */}
          <ContainerBox>
            <CreateTransaction />
          </ContainerBox>
          {/* item 2 */}
          <ContainerBox>
            <h1 className="text-lg">Transaction Aggregation Queue</h1>
            <TransactionQueue />
          </ContainerBox>
        </div>

        {/* first row */}
        <div className="flex flex-row justify-between w-full gap-x-5">
          {/* item 1 */}
          <ContainerBox>
            <h1 className="text-lg">Sign Aggregated Transaction</h1>
          </ContainerBox>
          {/* item 2 */}
          <ContainerBox>
            <h1 className="text-lg">Submit Aggregated Transaction</h1>
          </ContainerBox>
        </div>
      </div>
    </div>
  );
}

function ContainerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-start p-5 bg-white w-3/4 min-h-[500px] my-5 rounded-md drop-shadow-xl mx-auto">
      {children}
    </div>
  );
}
