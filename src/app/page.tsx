import { IBM_Plex_Serif } from 'next/font/google';

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
    <div className="container mx-auto py-2 min-h-screen">
      <div className="flex flex-col min-h-screen justify-center items-center">
        <div className="w-1/2">
          <h2
            className={`${ibm_500.className} text-2xl text-center text-primary`}
          >
            lowfee.
          </h2>
          <h1 className={`${ibm_700.className} text-5xl text-center`}>
            Lower your transaction fees on Cardano.
          </h1>
        </div>
      </div>
    </div>
  );
}
