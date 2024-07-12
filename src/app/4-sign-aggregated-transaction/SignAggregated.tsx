'use client';

export default function SignAggregated() {
  return (
    <div className="flex flex-col">
      <Card label="Already signed">
        <div className="text-4xl text-purple-600 font-bold">3</div>
        <div className='text-md text-black'>participant(s)</div>
      </Card>
      <Card label='Signature List'>
        <ul>
          <li>list</li>
          <li>list</li>
          <li>list</li>
          <li>list</li>
        </ul>
      </Card>
      <div>Need 2 more signature(s) from the participant</div>
      <button>Sign Transaction</button>
      <button>Submit</button>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="my-2 bg-gray-100 rounded-md text-center py-3 px-2">
      <div className="text-sm text-gray-600 mb-3">{label}</div>
      {children}
    </div>
  );
}
