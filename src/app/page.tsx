import CreateTransaction from './1-create-transaction/CreateTransaction';
import TransactionQueue from './2-transaction-aggregation-queue/TransactionQueue';
import AggregatedTransaction from './3-aggregated-transaction-detail/AggregatedTransaction';
import HeadingSkripsi from './landing-page/HeadingSkripsi';

export default function Root() {
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
            <TransactionQueue />
          </ContainerBox>
        </div>

        {/* second row */}
        <div className="flex flex-row justify-between w-full gap-x-5">
          {/* item 1 */}
          <ContainerBox>
            <h1 className="text-lg mb-5">Aggregated Transaction Detail</h1>
            <AggregatedTransaction />
          </ContainerBox>
          {/* item 2 */}
          <ContainerBox>
            <h1 className="text-lg">Sign and Submit Aggregated Transaction</h1>
          </ContainerBox>
        </div>
      </div>
    </div>
  );
}

function ContainerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-1/2 flex flex-col items-center justify-start p-5 bg-white min-h-[500px] my-5 rounded-md drop-shadow-xl mx-auto">
      {children}
    </div>
  );
}
