import type { WalletAdapter } from '@/types';
import { getNetworkConfig } from './galaxy-sdk';
import type { Network } from '@/types';

const STELLAR_PUBLIC_KEY_LENGTH = 56;
const STELLAR_PUBLIC_KEY_PREFIX = 'G';

export function isValidPublicKey(publicKey: string): boolean {
  if (typeof publicKey !== 'string' || publicKey.length !== STELLAR_PUBLIC_KEY_LENGTH) {
    return false;
  }
  if (publicKey.charAt(0) !== STELLAR_PUBLIC_KEY_PREFIX) {
    return false;
  }
  const base32 = /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]+$/;
  return base32.test(publicKey);
}

export interface SendPaymentParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
}

export interface SendPaymentResult {
  hash: string;
  success: boolean;
}

interface HorizonAccountResponse {
  id: string;
  sequence: string;
}

async function fetchAccount(network: Network, publicKey: string): Promise<HorizonAccountResponse> {
  const config = getNetworkConfig(network);
  const res = await fetch(`${config.horizonUrl}/accounts/${publicKey}`);
  if (!res.ok) throw new Error(`Failed to load account: ${res.status}`);
  return res.json() as Promise<HorizonAccountResponse>;
}

async function submitTransaction(network: Network, xdr: string): Promise<{ hash: string; successful: boolean }> {
  const config = getNetworkConfig(network);
  const res = await fetch(`${config.horizonUrl}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(xdr)}`,
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.detail ?? data.extras?.result_codes ?? res.statusText;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return { hash: data.hash, successful: data.successful };
}

export async function sendPayment(
  wallet: WalletAdapter,
  network: Network,
  params: SendPaymentParams
): Promise<SendPaymentResult> {
  const accountData = await fetchAccount(network, params.sourcePublicKey);

  const SDK = await import('@stellar/stellar-sdk');
  const {
    Account,
    Transaction,
    TransactionBuilder,
    Operation,
    Asset,
    Memo,
    BASE_FEE,
    Networks,
  } = SDK;

  const passphrase =
    network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
  const sourceAccount = new Account(
    params.sourcePublicKey,
    accountData.sequence
  );

  const asset =
    params.assetCode === 'XLM' || params.assetCode === 'native'
      ? Asset.native()
      : new Asset(params.assetCode, params.assetIssuer!);

  let builder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      Operation.payment({
        destination: params.destination,
        asset,
        amount: params.amount,
      })
    );

  if (params.memo?.trim()) {
    builder =
      params.memo.length <= 28
        ? builder.addMemo(Memo.text(params.memo))
        : builder.addMemo(Memo.hash(Buffer.from(params.memo)));
  }

  const transaction = builder.setTimeout(30).build();
  const xdr = transaction.toEnvelope().toXDR('base64');

  const signedXdr = await wallet.signTransaction(xdr);
  const reconstructed = new Transaction(signedXdr, passphrase);
  const submitXdr = reconstructed.toEnvelope().toXDR('base64');

  const response = await submitTransaction(network, submitXdr);

  return {
    hash: response.hash,
    success: response.successful,
  };
}
