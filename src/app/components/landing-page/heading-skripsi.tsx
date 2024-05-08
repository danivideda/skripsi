import { IBM_Plex_Serif } from 'next/font/google';

const ibm_500 = IBM_Plex_Serif({
  weight: '500',
  subsets: ['latin'],
});

const ibm_700 = IBM_Plex_Serif({
  weight: '700',
  subsets: ['latin'],
});

export default function HeadingSkripsi() {
  return (
    <>
      <div className="w-full">
        <h2
          className={`${ibm_500.className} text-2xl text-center text-primary mb-2`}
        >
          implementasi.
        </h2>
      </div>
      <div className="w-[650px] min-h-full text-neutral-700">
        <h1 className={`${ibm_700.className} text-5xl text-center mb-2`}>
        Skripsi
        </h1>
        <p className="text-center text-base">
          aplikasi agregasi transaksi untuk mengurangi biaya transaksi di Cardano.
        </p>
      </div>
    </>
  );
}
