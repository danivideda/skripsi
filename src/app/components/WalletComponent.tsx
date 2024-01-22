'use client';

import { useEffect, useState } from 'react';
import * as cbor from 'cbor';

export default function WalletComponent() {
  const [balance, setBalance] = useState(null);
  const [buttonState, setButtonState] = useState('');

  async function handleClick() {
    setButtonState('connecting');
    const walletApi = await window.cardano.eternl.enable();
    const balance = await walletApi.getBalance();
    setBalance(cbor.decode(balance)[0]);
  }

  if (balance !== null) {
    return (
      <>
        <span className="mx-auto mt-5 w-full bg-gray-100 rounded border border-primary p-2">
          Balance: {balance}
        </span>
      </>
    );
  } else {
    return (
      <>
        <button
          type="button"
          className="mx-auto mt-5 w-full bg-gray-100 rounded border border-primary p-2"
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
