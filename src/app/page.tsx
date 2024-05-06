import { IBM_Plex_Serif } from 'next/font/google';
import FormComponent from './components/FormComponent';
import WalletComponent from './components/WalletComponent';

const ibm_500 = IBM_Plex_Serif({
  weight: '500',
  subsets: ['latin'],
});

const ibm_700 = IBM_Plex_Serif({
  weight: '700',
  subsets: ['latin'],
});

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen">
      <div className="flex flex-col min-h-screen justify-center items-center">
        <div className="w-full">
          <h2
            className={`${ibm_500.className} text-2xl text-center text-primary mb-2`}
          >
            lowfee.
          </h2>
        </div>
        <div className="w-[650px] min-h-full text-neutral-700">
          <h1 className={`${ibm_700.className} text-5xl text-center mb-2`}>
            Lower your transaction fees on Cardano.
          </h1>
          <p className="text-center text-base">
            A simple <b>fee sharing</b> tool using
            ‘transactions-within-transaction’ capability on <u>Cardano</u> to
            reduce your transaction fees by around <b>80%</b>{' '}
          </p>
        </div>
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
