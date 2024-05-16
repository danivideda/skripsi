'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { NumericFormat } from 'react-number-format';

export default function Form() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [errors, setErrors] = useState({} as {name: string, value: string})

  const addrPlaceHolder =
    'addr_test1qpgkdndedlklzkr8gkpaa8qulavjehrlee86k22jdrva9vf0d5dxpdatxft8ka436d8z4765fvacmdcxv7kjss08sg8qshp8gc';

  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const cleanString = e.target.value.replace(/,/g, '');
    const amountLovelace = parseFloat(cleanString) * 1_000_000;
    console.log('Amount in Lovelace: ', amountLovelace);

    setAmount(amountLovelace);
  }

  function onAddressChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const addressString = e.target.value;
    setAddress(addressString);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('Form submitted');
  }

  return (
    <>
      <form action="#" method="post" className="w-full" onSubmit={onSubmit}>
        <div className="mb-5">
          <h1 className="text-md mb-2 p-1 font-semibold">
            Destination Address
          </h1>
          <textarea
            className="resize-none h-24 rounded-md shadow-inner border mx-auto w-full p-2"
            // value={addrPlaceHolder}
            placeholder={addrPlaceHolder}
            onChange={onAddressChange}
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