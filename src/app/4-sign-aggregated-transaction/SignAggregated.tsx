'use client';

import { useContext } from 'react';
import { AggregatedTransactionContext } from '../providers/aggregated-transaction-provider';
import { WalletContext } from '../providers/wallet-provider';
import { bufferToHexString, truncate } from '../helper';
import * as cbor from 'cbor';

export default function SignAggregated() {
  const aggregatedTransactionContext = useContext(AggregatedTransactionContext);
  const walletContext = useContext(WalletContext);

  if (walletContext.walletStatus === 'disconnected') {
    return 'Please connect your wallet first.';
  }

  if (!(walletContext.walletStatus === 'in_batch' || walletContext.walletStatus === 'signed')) {
    return 'No aggregated transaction for this user';
  }

  if (!aggregatedTransactionContext.aggregatedTransactionDetail) {
    return 'loading...';
  }

  const aggregatedTxData =
    aggregatedTransactionContext.aggregatedTransactionDetail.data.aggregatedTxData;
  const totalParticipant: number = aggregatedTxData.stakeAddressList.length;
  const totalSigned: number = aggregatedTxData.witnessSignatureList.length;

  async function handleSignButton() {
    const signature = await walletContext.walletApi?.signTx(
      aggregatedTxData.transactionFullCborHex,
      true,
    );

    if (!signature) {
      console.log('User reject the sign');
      return;
    }

    const url = `${process.env.backendUrl}/batches/sign`;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stakeAddressHex: walletContext.walletAddress,
        signatureCborHex: signature,
      }),
    });
    const body = await response.json();
    if (response.status !== 200) {
      console.log('exception occured');
      return;
    }

    walletContext.setWalletStatus('signed');
  }

  async function handleSubmitButton() {
    const txId = await walletContext.walletApi?.submitTx(aggregatedTxData.transactionFullCborHex);
    console.log('Successfully submitted Transaction: ', txId);

    const url = `${process.env.backendUrl}/batches/submit`;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregatedTxId:
          aggregatedTransactionContext.aggregatedTransactionDetail?.data.aggregatedTxId,
      }),
    });
    // const body = await response.json();
    if (response.status !== 200) {
      console.log('exception occured');
      return;
    }

    walletContext.setWalletStatus('disconnected');
  }

  // aggregatedTxData.witnessSignatureList.length === 0
  //   ? 'Empty'
  //   : aggregatedTxData.witnessSignatureList.map((item, index) =>
  //       console.log('Decoding CBOR::: ',cbor.decodeFirstSync(item).get(0)[0][1].toString('hex')),
  //     );

  return (
    <div className="flex flex-col w-full text-center">
      <Card label="Already signed">
        <div className="text-4xl text-purple-600 font-bold">{totalSigned}</div>
        <div className="text-md text-black">participant(s)</div>
      </Card>
      <Card label="Signature List">
        <ul>
          {aggregatedTxData.witnessSignatureList.length === 0
            ? 'Empty'
            : aggregatedTxData.witnessSignatureList.map((item) => {
                return (
                  <li
                    key={item.toString()}
                    className="group flex relative justify-center font-mono rounded-md bg-white p-1 mt-2 border break-all"
                  >
                    {truncate(cbor.decodeFirstSync(item).get(0)[0][1].toString('hex'), '...', 15)}
                    <span className="group-hover:opacity-100 group-hover:visible transition-opacity bg-gray-800 px-1 text-sm text-gray-100 rounded-md absolute -translate-x-[90%] opacity-0 invisible m-1 mx-auto z-10">
                      {cbor.decodeFirstSync(item).get(0)[0][1].toString('hex')}
                    </span>
                  </li>
                );
              })}
        </ul>
      </Card>
      {totalSigned === totalParticipant ? (
        <>
          <div className='text-blue-500 font-semibold'>Multisignature has been collected.</div>
          <div className='text-blue-500 font-semibold'>Ready to submit transaction!</div>
        </>
      ) : (
        <div>Need {totalParticipant - totalSigned} more signature(s) from the participant</div>
      )}
      <SignButton
        handler={handleSignButton}
        signed={aggregatedTransactionContext.aggregatedTransactionDetail.signed}
      />
      <SubmitButton handler={handleSubmitButton} allSigned={totalSigned === totalParticipant} />
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="my-2 bg-gray-100 rounded-md text-center p-3">
      <div className="text-sm text-gray-600 mb-3">{label}</div>
      {children}
    </div>
  );
}

function SignButton({ handler, signed = false }: { handler?: () => void; signed?: boolean }) {
  return (
    <button
      className={`my-2 p-3 border border-gray-300 rounded-md ${
        signed ? 'bg-gray-300 text-gray-500' : 'bg-green-300'
      }`}
      onClick={handler}
      disabled={signed}
    >
      Sign Transaction
    </button>
  );
}

function SubmitButton({
  handler,
  allSigned = false,
}: {
  handler?: () => void;
  allSigned?: boolean;
}) {
  return (
    <button
      className={`my-2 p-3 border border-gray-300 rounded-md ${
        !allSigned ? 'bg-gray-300 text-gray-500' : 'bg-blue-300'
      }`}
      onClick={handler}
      disabled={!allSigned}
    >
      Submit Transaction
    </button>
  );
}
