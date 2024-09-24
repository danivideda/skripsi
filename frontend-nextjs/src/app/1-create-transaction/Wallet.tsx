import { useContext, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import * as cbor from 'cbor';
import { Utxo, UnspentTransactionOutput, WalletStatus } from '../types';
import { bufferToHexString, encodeBech32, truncate } from '../helper';
import { WalletContext } from '../providers/wallet-provider';

export default function Wallet({
  addUtxoCallback,
  deleteUtxoCallback,
  clearUtxoListCallback,
  setStakeAddressHexCallback,
}: {
  addUtxoCallback: (utxo: Utxo) => void;
  deleteUtxoCallback: (utxo: Utxo) => void;
  clearUtxoListCallback: () => void;
  setStakeAddressHexCallback: (stakeAddressHex: string) => void;
}) {
  const [balance, setBalance] = useState(0.0);
  const [userAddress, setUserAddress] = useState('');
  const [buttonState, setButtonState] = useState('');
  const [utxos, setUtxos] = useState([] as Utxo[]);

  const walletContext = useContext(WalletContext);

  async function handleClickConnectWallet() {
    setButtonState('loading');

    const walletApi = await window.cardano.eternl.enable();
    const _userAddress = (await walletApi.getRewardAddresses())[0];
    const balanceDecoded = await cbor.decode(await walletApi.getBalance());
    const _balance = balanceDecoded === typeof Array ? balanceDecoded[0] : balanceDecoded;

    walletContext.setWalletApi(walletApi);
    setUserAddress(_userAddress);
    setBalance(_balance);

    const walletStatus = await getWalletStatus();
    if (walletStatus === 'in_queue' || walletStatus === 'in_batch' || walletStatus === 'signed') {
      initNotAvailable();
    }

    if (walletStatus === 'available') {
      await initAvailable();
    }

    async function getWalletStatus(): Promise<WalletStatus> {
      const url = `${process.env.backendUrl}/transactions/status`;
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stakeAddressHex: _userAddress,
        }),
      });
      const body = await response.json();
      return body.message;
    }

    function initNotAvailable() {
      setButtonState('');
      setStakeAddressHexCallback(_userAddress);
      walletContext.setWalletStatus(walletStatus);
      walletContext.setWalletAddress(_userAddress);
    }

    async function initAvailable() {
      const utxoListString = (await walletApi.getUtxos()) ?? [];
      const utxoListDecoded = await decodeUtxoList(utxoListString);
      setButtonState('');
      setUtxos(utxoListDecoded);
      setStakeAddressHexCallback(_userAddress);
      walletContext.setWalletStatus(walletStatus);
      walletContext.setWalletAddress(_userAddress);
    }

    async function decodeUtxoList(utxoListString: string[]) {
      return await Promise.all(
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
    }
  }

  async function handleClickDisconnectWallet() {
    setButtonState('loading');
    // artificial delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    setBalance(0.0);
    setUserAddress('');
    setButtonState('');
    clearUtxoListCallback();
    setStakeAddressHexCallback('');
    walletContext.setWalletStatus('disconnected');
    walletContext.setWalletAddress(null);
    walletContext.setWalletApi(null);
    console.log('Run disconnect wallet');
  }

  if (
    walletContext.walletStatus === 'available' ||
    walletContext.walletStatus === 'in_batch' ||
    walletContext.walletStatus === 'in_queue' ||
    walletContext.walletStatus === 'signed'
  ) {
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
          {buttonState === 'loading' ? 'Disconnecting wallet...' : 'Disconnect Wallet'}
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
          <div className="break-all">
            Wallet Address: <span className="font-mono font-semibold">{encodeBech32("stake_test",userAddress)}</span>
          </div>
          <div>
            Status:{' '}
            <span className="text-green-500 font-bold">
              {walletContext.walletStatus === 'available' && 'Available'}
            </span>
            <span className="text-orange-500 font-bold">
              {walletContext.walletStatus === 'in_queue' && 'In queue process'}
            </span>
            <span className="text-purple-500 font-bold">
              {walletContext.walletStatus === 'in_batch' && 'In aggregation process'}
            </span>
            <span className="text-blue-500 font-bold">
              {walletContext.walletStatus === 'signed' &&
                'Waiting for others to sign the aggregated transaction'}
            </span>
          </div>

          {walletContext.walletStatus === 'available' && (
            <ol className="list-decimal list-inside">
              {utxos.map((utxo_item) => {
                return (
                  <li key={utxo_item.utxoString}>
                    <span className="font-semibold">UTXO</span>:{' '}
                    {truncate(bufferToHexString(utxo_item.txOutputs.transactionInput[0]))}#
                    {utxo_item.txOutputs.transactionInput[1]},{' '}
                    <span className="font-semibold">amount</span>:{' '}
                    {utxo_item.txOutputs.transactionOutput[1]} lovelace{' '}
                    <input
                      type="checkbox"
                      name="select"
                      id="select"
                      onChange={(e) => {
                        if (e.target.checked) {
                          addUtxoCallback(utxo_item);
                        } else {
                          deleteUtxoCallback(utxo_item);
                        }
                      }}
                    />
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </>
    );
  } else {
    return (
      <button
        type="button"
        disabled={buttonState === 'loading'}
        className={
          'mx-auto mt-5 w-full bg-green-300 rounded border border-primary p-2' +
          ' ' +
          (buttonState === 'loading' ? 'text-white' : '')
        }
        onClick={handleClickConnectWallet}
      >
        {buttonState === 'loading' ? 'Connecting wallet...' : 'Connect Wallet'}
      </button>
    );
  }
}
