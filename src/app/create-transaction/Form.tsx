import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Utxo } from '../types';

export default function Form({
  utxoList,
  isWalletConnected,
  stakeAddressHex,
}: {
  utxoList: Utxo[];
  isWalletConnected: boolean;
  stakeAddressHex: string;
}) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [amountInAdaForInputValue, setAmountInAdaForInputValue] = useState(0.0);
  const [errors, setErrors] = useState({} as { name: string; value: string });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isWalletConnected) {
      setAddress('');
      setAmount(0);
      setAmountInAdaForInputValue(0.0);
    }
  }, [isWalletConnected]);

  const addrPlaceHolder =
    'addr_test1qpgkdndedlklzkr8gkpaa8qulavjehrlee86k22jdrva9vf0d5dxpdatxft8ka436d8z4765fvacmdcxv7kjss08sg8qshp8gc';

  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const cleanString = e.target.value.replace(/,/g, '');
    const amountInAda = parseFloat(cleanString);
    const amountLovelace = amountInAda * 1_000_000;

    setAmountInAdaForInputValue(amountInAda);
    setAmount(amountLovelace);
  }

  function onAddressChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const addressString = e.target.value;
    setAddress(addressString);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const backendUrl = 'http://localhost:3001/v0/transactions/create';
    try {
      const data = {
        stakeAddressHex: stakeAddressHex,
        destinationAddressBech32: address,
        utxos: utxoList.map((utxo_item) => {
          return utxo_item.utxoString;
        }),
        lovelace: amount,
      };
      const response = await fetch(backendUrl, {
        method: 'POST',
        // mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setSuccess(true);
        setAmountInAdaForInputValue(0.0);
        setAmount(0);
      }
      console.log(await response.json());
    } catch (error) {
      console.log(error);
    }
  }

  function lovelaceAmountFromUTXOInput() {
    let amount = 0;
    utxoList.forEach((utxo_item) => {
      amount = amount + utxo_item.txOutputs.transactionOutput[1];
    });
    return amount;
  }

  function isButtonDisabled() {
    return (
      !isWalletConnected ||
      !(address.length === 108) ||
      !(amount > 0) ||
      !(amount < lovelaceAmountFromUTXOInput() - 2_000_000)
    );
  }

  return (
    <>
      <form action="#" method="post" className="w-full" onSubmit={onSubmit}>
        <div className="mb-5">
          <h1 className="text-md mb-2 p-1 font-semibold">Destination Address</h1>
          <textarea
            disabled={!isWalletConnected}
            className="resize-none h-24 rounded-md shadow-inner border mx-auto w-full p-2"
            value={!isWalletConnected ? '' : address}
            placeholder={addrPlaceHolder}
            onChange={onAddressChange}
          ></textarea>
        </div>
        <div className="mb-5">
          <h1 className="text-md mb-2 p-1 font-semibold">Amount in ADA</h1>
          <NumericFormat
            className="resize-none rounded-md shadow-inner border mx-auto w-full p-2"
            value={
              amountInAdaForInputValue === 0 || !isWalletConnected ? '' : amountInAdaForInputValue
            }
            // value={amountInAda}
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
          disabled={isButtonDisabled()}
          className={
            'mx-auto w-full rounded border border-primary p-2' +
            ' ' +
            (isButtonDisabled() ? 'bg-gray-100 text-gray-300' : 'bg-purple-300')
          }
          // className={
          //   'mx-auto w-full rounded border border-primary p-2' +
          //   ' ' +
          //   (isWalletConnected
          //     ? 'bg-gray-100 text-gray-300'
          //     : amount < lovelaceAmountFromUTXOInput()
          //     ? 'bg-purple-300'
          //     : 'bg-gray-100 text-gray-300')
          // }
        >
          Create Transaction
        </button>
      </form>
    </>
  );
}
