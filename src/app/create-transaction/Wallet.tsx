import { useContext, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import * as cbor from 'cbor';
import { Utxo, UnspentTransactionOutput } from '../types';
import { bufferToHexString, truncate } from '../helper';
import { WalletContext } from '../wallet-provider';

export default function Wallet({
  addUtxoCallback,
  deleteUtxoCallback,
  clearUtxoListCallback,
  setStakeAddressHexCallback,
}: {
  addUtxoCallback: (utxo: Utxo) => void;
  deleteUtxoCallback: (utxo: Utxo) => void;
  clearUtxoListCallback: () => void;
  setIsWalletConnectedCallback: (isConnected: boolean) => void;
  isWalletConnected: boolean;
  setStakeAddressHexCallback: (stakeAddressHex: string) => void;
}) {
  const [balance, setBalance] = useState(0.0);
  const [userAddress, setUserAddress] = useState('');
  const [buttonState, setButtonState] = useState('');
  const [utxos, setUtxos] = useState([] as Utxo[]);

  const walletContext = useContext(WalletContext);
  console.log(walletContext.walletStatus);

  async function handleClickConnectWallet() {
    setButtonState('loading');
    const walletApi = await window.cardano.eternl.enable();
    walletContext.setWalletApi!(walletApi);

    async function checkInQueue() {
      const url = `${process.env.backendUrl}/transactions/queue`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });
      const body = await response.json();
      return body.message === 'Not in queue' ? 'available' : 'in_queue';
    }

    if ((await checkInQueue()) === 'in_queue') {
      const balance = await cbor.decode(await walletApi.getBalance());
      const userAddress = (await walletApi.getRewardAddresses())[0];
      setBalance(balance === typeof Array ? balance[0] : balance);
      setUserAddress(userAddress);
      setButtonState('');
      setStakeAddressHexCallback(userAddress);
      walletContext.setWalletStatus!('in_queue')

      return;
    }

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

    setBalance(balance === typeof Array ? balance[0] : balance);
    setUserAddress(userAddress);
    setButtonState('');
    setUtxos(utxoListDecoded);
    setStakeAddressHexCallback(userAddress);
    // setIsWalletConnectedCallback(true);
    walletContext.setWalletStatus!('available')
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
    // setIsWalletConnectedCallback(false);
    walletContext.setWalletStatus!('disconnected')
  }

  // if (isWalletConnected) {
  if (walletContext.walletStatus !== 'disconnected') {
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
          <div className="break-all">Address: {userAddress}</div>

          <ol className="list-decimal list-inside">
            {utxos.map((utxo_item) => {
              return (
                <li key={utxo_item.utxoString}>
                  <span className="font-semibold">UTXO</span>:{' '}
                  {truncate(
                    bufferToHexString(utxo_item.txOutputs.transactionInput[0]),
                  )}
                  #{utxo_item.txOutputs.transactionInput[1]},{' '}
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
          (buttonState === 'loading' ? 'text-gray-300' : '')
        }
        onClick={handleClickConnectWallet}
      >
        {buttonState === 'loading' ? 'Connecting wallet...' : 'Connect Wallet'}
      </button>
    );
  }
}
