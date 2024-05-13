'use client';

import { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import * as cbor from 'cbor';

type Utxo = { utxoString: string; txOutputs: UnspentTransactionOutput };

export default function WalletComponent() {
  const [balance, setBalance] = useState(0.0);
  const [userAddress, setUserAddress] = useState('');
  const [buttonState, setButtonState] = useState('');
  const [utxos, setUtxos] = useState([] as Utxo[]);

  async function handleClickConnectWallet() {
    setButtonState('loading');
    const walletApi = await window.cardano.eternl.enable();
    const balance = await cbor.decode(await walletApi.getBalance());
    const userAddress = (await walletApi.getRewardAddresses())[0];
    const utxoListString = (await walletApi.getUtxos()) ?? [];
    const utxoListDecoded = await Promise.all(
      utxoListString.map(async (utxo_string) => {
        const txOutputsArray: any[] = await cbor.decode(utxo_string);
        const txOutputs: UnspentTransactionOutput = {
          transactionInput: txOutputsArray[0],
          transactionOutput: txOutputsArray[1],
        };

        return {
          utxoString: utxo_string,
          txOutputs,
        } as Utxo;
      }),
    );
    console.log(utxoListDecoded);

    setBalance(balance === typeof Array ? balance[0] : balance);
    setUserAddress(userAddress);
    setButtonState('');
    setUtxos(utxoListDecoded);
  }

  async function handleClickDisconnectWallet() {
    setButtonState('loading');
    // artificial delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    setBalance(0.0);
    setUserAddress('');
    setButtonState('');
  }

  if (balance !== 0.0) {
    return (
      <>
        <button
          type="button"
          disabled={buttonState === 'loading'}
          className={
            'mx-auto mt-5 w-full bg-red-300 rounded border border-primary p-2' +
            ' ' +
            (buttonState === 'loading' ? 'text-white' : '')
          }
          onClick={handleClickDisconnectWallet}
        >
          {buttonState === 'loading'
            ? 'Disconnecting wallet...'
            : 'Disconnect Wallet'}
        </button>
        <div className="mx-auto mt-5 w-full bg-gray-100 rounded border border-primary p-2">
          <div>
            Balance:{' '}
            <NumericFormat
              displayType="text"
              thousandSeparator=","
              allowNegative={false}
              fixedDecimalScale
              decimalScale={6}
              value={balance / 10 ** 6}
            />{' '}
            ADA
          </div>
          <div className="break-words">Address: {userAddress}</div>

          <ol className="list-decimal list-inside">
            {utxos.map((utxo_item) => {
              return (
                <li key={utxo_item.utxoString}>
                  {truncate(
                    Buffer.from(
                      utxo_item.txOutputs.transactionInput[0],
                    ).toString('hex'),
                  )}
                  #{utxo_item.txOutputs.transactionInput[1]}
                </li>
              );
            })}
            {/* <li className="">
              {Buffer.from(utxos[0].txOutputs.transactionInput[0]).toString(
                'hex',
              )}
              #{utxos[0].txOutputs.transactionInput[1]}
            </li> */}
          </ol>
        </div>
      </>
    );
  } else {
    return (
      <button
        type="button"
        disabled={buttonState === 'loading'}
        className={
          'mx-auto mt-5 w-full bg-gray-100 rounded border border-primary p-2' +
          ' ' +
          (buttonState === 'loading' ? 'text-gray-300' : '')
        }
        onClick={handleClickConnectWallet}
      >
        {buttonState === 'loading' ? 'Connecting wallet...' : 'Connect Wallet'}
      </button>
    );
  }
}

// helper function
function truncate(str: string, separator = '...'): string {
  const first = str.substring(0, 4);
  const second = str.substring(str.length - 5, str.length - 1);

  return first + separator + second;
}
