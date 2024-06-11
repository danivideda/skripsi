import { ChangeEvent, FormEvent, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Utxo } from '../types';

export default function Form({
  utxoList,
  isWalletConnected,
}: {
  utxoList: Utxo[];
  isWalletConnected: boolean;
}) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [errors, setErrors] = useState({} as { name: string; value: string });

  const addrPlaceHolder =
    'addr_test1qpgkdndedlklzkr8gkpaa8qulavjehrlee86k22jdrva9vf0d5dxpdatxft8ka436d8z4765fvacmdcxv7kjss08sg8qshp8gc';

  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const cleanString = e.target.value.replace(/,/g, '');
    const amountLovelace = parseFloat(cleanString) * 1_000_000;

    setAmount(amountLovelace);
  }

  function onAddressChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const addressString = e.target.value;
    setAddress(addressString);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // const backendUrl = "http://localhost:3001"
    // const data = {
    //   stakeAddressHex: "stake",
    // destinationAddressBech32: address,
    // utxos: utxoList,
    // lovelace: amount
    // }
    // const response = await fetch(backendUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: 
    // })
    console.log('Form submitted');
  }

  function lovelaceAmountFromUTXOInput() {
    let amount = 0;
    utxoList.forEach((utxo_item) => {
      amount = amount + utxo_item.txOutputs.transactionOutput[1];
    });
    return amount;
  }

  return (
    <>
      <form action="#" method="post" className="w-full" onSubmit={onSubmit}>
        <div className="mb-5">
          <h1 className="text-md mb-2 p-1 font-semibold">
            Destination Address
          </h1>
          <textarea
            disabled={!isWalletConnected}
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
            disabled={!isWalletConnected}
            onChange={onAmountChange}
          />
          {/* <input
            type="number"
            name="amount"
            id="amount"
            className="resize-none rounded-md shadow-inner border mx-auto w-full p-2"
            onChange={onAmountChange}
          /> */}
          Available to spend:{' '}
          <span className="font-bold">
            <NumericFormat
              displayType="text"
              thousandSeparator=","
              allowNegative={false}
              fixedDecimalScale
              decimalScale={6}
              value={lovelaceAmountFromUTXOInput() / 10 ** 6}
            />{' '}
            ADA
          </span>
        </div>
        <button
          type="submit"
          disabled={
            !isWalletConnected ||
            (!(amount > 0) && !(amount < (lovelaceAmountFromUTXOInput() - (2_000_000))))
          }
          className={
            'mx-auto w-full rounded border border-primary p-2' +
            ' ' +
            (isWalletConnected ? '' : 'bg-gray-100 text-gray-300') + ' ' +
            ((amount > 0 && amount < (lovelaceAmountFromUTXOInput() - (2_000_000))) ? 'bg-purple-300 ' : 'bg-gray-100 text-gray-300')
          }
        >
          Create Transaction
        </button>
      </form>
    </>
  );
}
