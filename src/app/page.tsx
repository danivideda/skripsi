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
            <NumberBox>1</NumberBox>
            <Title>Create New Transaction</Title>
            <CreateTransaction />
          </ContainerBox>
          {/* item 2 */}
          <ContainerBox>
            <NumberBox>2</NumberBox>
            <Title>Transaction Aggregation Queue</Title>
            <TransactionQueue />
          </ContainerBox>
        </div>

        {/* second row */}
        <div className="flex flex-row justify-between w-full gap-x-5">
          {/* item 1 */}
          <ContainerBox>
            <NumberBox>3</NumberBox>
            <Title>Aggregated Transaction Detail</Title>
            <AggregatedTransaction />
          </ContainerBox>
          {/* item 2 */}
          <ContainerBox>
            <NumberBox>4</NumberBox>
            <Title>Sign and Submit Aggregated Transaction</Title>
          </ContainerBox>
        </div>
      </div>
    </div>
  );
}

function ContainerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-1/2 min-h-[500px] flex flex-col items-center justify-start p-5 bg-white my-5 rounded-md drop-shadow-xl mx-auto">
      {children}
    </div>
  );
}

function NumberBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 text-lg font-bold w-8 h-8 leading-6 text-center border-4 border-purple-300 text-purple-600 rounded-full">
      {children}
    </span>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="font-bold text-lg w-full text-center border-b-2 pb-3 mb-3">{children}</h1>;
}
