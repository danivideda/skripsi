'use client';

import { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import * as cbor from 'cbor';

export default function WalletComponent() {
  const [balance, setBalance] = useState(0.0);
  const [userAddress, setUserAddress] = useState('');
  const [buttonState, setButtonState] = useState('');

  async function handleClickConnectWallet() {
    setButtonState('loading');
    const walletApi = await window.cardano.eternl.enable();
    const balance = await walletApi.getBalance();
    const userAddress = (await walletApi.getRewardAddresses())[0];

    setBalance(cbor.decode(balance)[0]);
    setUserAddress(userAddress);
    setButtonState('');
  }

  async function handleClickDisconnectWallet() {
    setButtonState('loading');
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
