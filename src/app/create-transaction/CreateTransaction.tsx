'use client';

import { useState } from 'react';
import Form from './Form';
import Wallet from './Wallet';
import { Utxo } from '../types';
import { truncate, bufferToHexString } from '../helper';

export default function CreateTransaction() {
  const [utxoList, setUtxoList] = useState([] as Utxo[]);

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

  console.log('UtxoList: ', utxoList);

  return (
    <>
      <h1 className="text-xl w-full text-center">Create New Transaction</h1>
      <Form />
      <ol className="list-decimal list-inside">
        {utxoList.map((utxo_item) => {
          return (
            <li key={utxo_item.utxoString}>
              {truncate(
                bufferToHexString(utxo_item.txOutputs.transactionInput[0]),
              )}
              #{utxo_item.txOutputs.transactionInput[1]}
              <input
                type="checkbox"
                name="select"
                id="select"
                onChange={(e) => {
                  if (e.target.checked) {
                    addUtxo(utxo_item);
                  } else {
                    deleteUtxo(utxo_item);
                  }
                }}
              />
            </li>
          );
        })}
      </ol>
      <Wallet addUtxoCallback={addUtxo} deleteUtxoCallback={deleteUtxo} />
    </>
  );
}
