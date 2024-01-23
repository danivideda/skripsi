'use client';

import { useEffect, useState } from 'react';
import * as cbor from 'cbor';

export default function WalletComponent() {
  const [balance, setBalance] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [buttonState, setButtonState] = useState('');

  async function handleClick() {
    setButtonState('connecting');
    const walletApi = await window.cardano.eternl.enable();
    const balance = await walletApi.getBalance();
    const userAddress = (await walletApi.getRewardAddresses())[0];

    setBalance(cbor.decode(balance)[0]);
    setUserAddress(userAddress);
  }

  if (balance !== null) {
    return (
      <>
        <div className="mx-auto mt-5 w-full bg-gray-100 rounded border border-primary p-2">
          <div>Balance: {balance}</div>
          <div className="break-words">Address: {userAddress}</div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <button
          type="button"
          disabled={buttonState === 'connecting'}
          className={
            'mx-auto mt-5 w-full bg-gray-100 rounded border border-primary p-2' +
            ' ' +
            (buttonState === 'connecting' ? 'text-gray-300' : '')
          }
          onClick={handleClick}
        >
          {buttonState === 'connecting'
            ? 'Connecting wallet...'
            : 'Connect Wallet'}
        </button>
      </>
    );
  }
}
