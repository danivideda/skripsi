import { IBM_Plex_Serif } from 'next/font/google';

const ibm = IBM_Plex_Serif({
  weight: '500',
  subsets: ['latin'],
});

export default function Home() {
  return (
    <div className="container ml-5 mr-5">
      <h1 className={`${ibm.className} text-lg`}>lowfee.</h1>
    </div>
  );
}
