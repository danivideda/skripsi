import { IBM_Plex_Serif } from 'next/font/google';

const ibm_500 = IBM_Plex_Serif({
  weight: '500',
  subsets: ['latin'],
});

const ibm_700 = IBM_Plex_Serif({
  weight: '700',
  subsets: ['latin'],
});

export default function HeadingLowfee() {
  return (
    <>
      <div className="w-full">
        <h2 className={`${ibm_500.className} text-2xl text-center text-primary mb-2`}>lowfee.</h2>
      </div>
      <div className="w-[650px] min-h-full text-neutral-700">
        <h1 className={`${ibm_700.className} text-5xl text-center mb-2`}>
          Lower your transaction fees on Cardano.
        </h1>
        <p className="text-center text-base">
          A simple <b>fee sharing</b> tool using ‘transactions-within-transaction’ capability on{' '}
          <u>Cardano</u> to reduce your transaction fees by around <b>80%</b>{' '}
        </p>
      </div>
    </>
  );
}
