'use client'

import { useState } from 'react';
import Form from './Form';
import Wallet from './Wallet';
import { Utxo } from '../types';

export default function CreateTransaction() {
  const [utxoList, setUtxoList] = useState([] as Utxo[]);

  return (
    <>
      <h1 className="text-xl w-full text-center">Create New Transaction</h1>
      <Form />
      <Wallet setUtxoList={setUtxoList} utxoList={utxoList}/>
    </>
  );
}
