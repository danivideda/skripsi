import FormComponent from './components/FormComponent';
import WalletComponent from './components/WalletComponent';
import HeadingSkripsi from './components/landing-page/heading-skripsi';

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen">
      <div className="flex flex-col min-h-screen justify-center items-center">
        <HeadingSkripsi />
        <div className="flex flex-row justify-between w-full gap-x-5">
          <div className="flex flex-col items-center justify-start p-5 bg-white w-3/4 min-h-[500px] my-5 rounded-md drop-shadow-xl mx-auto">
            <h1 className="text-xl w-full text-center">
              Create New Transaction
            </h1>
            <FormComponent />
            <WalletComponent />
          </div>
          <div className="flex flex-col items-center justify-start p-5 bg-white w-3/4 min-h-[500px] my-5 rounded-md drop-shadow-xl mx-auto">
            <h1 className="text-lg">Transaction Aggregation List</h1>
          </div>
        </div>
        <div className="flex flex-row justify-between w-full gap-x-5">
          <div className="flex flex-col items-center justify-start p-5 bg-white w-3/4 min-h-[500px] my-5 rounded-md drop-shadow-xl mx-auto">
            <h1 className="text-lg">Sign Aggregated Transaction</h1>
          </div>
          <div className="flex flex-col items-center justify-start p-5 bg-white w-3/4 min-h-[500px] my-5 rounded-md drop-shadow-xl mx-auto">
            <h1 className="text-lg">Submit Aggregated Transaction</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
