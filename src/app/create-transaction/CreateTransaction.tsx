'use client';

import { useState } from 'react';
import Form from './Form';
import Wallet from './Wallet';
import { Utxo } from '../types';
import { truncate, bufferToHexString } from '../helper';

export default function CreateTransaction() {
  const [utxoList, setUtxoList] = useState([] as Utxo[]);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  function addUtxo(utxo: Utxo) {
    const newUtxoList = [...utxoList];
    newUtxoList.push(utxo);
    setUtxoList(newUtxoList);
  }

  function deleteUtxo(utxo: Utxo) {
    const newUtxoList = utxoList.filter(
      (utxo_item) => utxo_item.utxoString !== utxo.utxoString,
    );
    setUtxoList(newUtxoList);
  }

  function clearUtxoList() {
    setUtxoList([] as Utxo[]);
  }

  function setIsWalletConnectedStatus(isConnected: boolean) {
    setIsWalletConnected(isConnected);
  }


  return (
    <>
      <h1 className="text-xl w-full text-center">Create New Transaction</h1>
      <Form utxoList={utxoList} isWalletConnected={isWalletConnected} />
      <Wallet
        addUtxoCallback={addUtxo}
        deleteUtxoCallback={deleteUtxo}
        clearUtxoListCallback={clearUtxoList}
        setIsWalletConnectedStatusCallback={setIsWalletConnectedStatus}
        isWalletConnected={isWalletConnected}
      />
    </>
  );
}
