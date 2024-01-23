'use client';

import { ChangeEvent, useState } from 'react';
import { NumericFormat } from 'react-number-format';

export default function FormComponent() {
  const [address, setAddress] = useState('');

  const [amount, setAmount] = useState(0.0);

  const addrPlaceHolder =
    'addr1qy9wh2lseepj9edsh6ae22ad0x0njz2zv8d5pe0jxtfl2cy9ph5tqn0eplz8m3dlgvrcu7mwwehwz35934z7hlpj9wdqwdvdku';

  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    console.log(parseFloat(e.target.value.replace(/,/g, '')));
    console.log(parseFloat(e.target.value.replace(/,/g, '')) * 1000000);
  }

  return (
    <>
      <form action="#" method="post" className="w-full">
        <div className="mb-5">
          <h1 className="text-md mb-2 p-1 font-semibold">
            Destination Address
          </h1>
          <textarea
            className="resize-none h-24 rounded-md shadow-inner border mx-auto w-full p-2"
            value={addrPlaceHolder}
            onChange={(e) => console.log(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-5">
          <h1 className="text-md mb-2 p-1 font-semibold">Amount in ADA</h1>
          <NumericFormat
            className="resize-none rounded-md shadow-inner border mx-auto w-full p-2"
            thousandSeparator=","
            placeholder="0.000000"
            allowNegative={false}
            fixedDecimalScale
            decimalScale={6}
            onChange={onAmountChange}
          />
          {/* <input
            type="number"
            name="amount"
            id="amount"
            className="resize-none rounded-md shadow-inner border mx-auto w-full p-2"
            onChange={onAmountChange}
          /> */}
        </div>
        <button
          type="submit"
          className="mx-auto w-full bg-purple-300 rounded border border-primary p-2"
        >
          Create Transaction
        </button>
      </form>
    </>
  );
}
