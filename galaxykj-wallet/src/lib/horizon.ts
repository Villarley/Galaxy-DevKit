import type { Network } from '@/types';
import { getNetworkConfig } from './galaxy-sdk';
import type { AssetBalance } from '@/types';
import type { TransactionListItem } from '@/types';

interface HorizonBalance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

interface HorizonAccountResponse {
  balances: HorizonBalance[];
}

interface HorizonTxRecord {
  hash: string;
  source_account: string;
  created_at: string;
  successful: boolean;
}

interface HorizonOpRecord {
  type: string;
  to?: string;
  destination?: string;
  account?: string;
  amount?: string;
  starting_balance?: string;
  asset_type?: string;
  asset_code?: string;
}

interface HorizonOperationsResponse {
  records: HorizonOpRecord[];
}

interface HorizonTransactionsResponse {
  records: HorizonTxRecord[];
}

async function horizonFetch<T>(network: Network, path: string): Promise<T> {
  const config = getNetworkConfig(network);
  const url = `${config.horizonUrl}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Horizon error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchAccountBalances(
  publicKey: string,
  network: Network
): Promise<{ xlmBalance: string; assets: AssetBalance[] }> {
  const account = await horizonFetch<HorizonAccountResponse>(
    network,
    `/accounts/${publicKey}`
  );
  let xlmBalance = '0';
  const assets: AssetBalance[] = [];

  for (const balance of account.balances) {
    if (balance.asset_type === 'native') {
      xlmBalance = balance.balance;
    } else if (
      balance.asset_type === 'credit_alphanum4' ||
      balance.asset_type === 'credit_alphanum12'
    ) {
      assets.push({
        code: balance.asset_code ?? 'UNKNOWN',
        issuer: balance.asset_issuer,
        balance: balance.balance,
      });
    }
  }

  return { xlmBalance, assets };
}

export async function fetchTransactionHistory(
  publicKey: string,
  network: Network,
  limit: number = 10
): Promise<TransactionListItem[]> {
  const config = getNetworkConfig(network);
  const subdomain = network === 'testnet' ? 'testnet' : 'stellar';
  const baseUrl = `https://${subdomain}.stellarexpert.io/explorer/public/tx`;

  const txResponse = await horizonFetch<HorizonTransactionsResponse>(
    network,
    `/accounts/${publicKey}/transactions?order=desc&limit=${limit}`
  );

  const items: TransactionListItem[] = [];

  for (const tx of txResponse.records) {
    try {
      const opsResponse = await horizonFetch<HorizonOperationsResponse>(
        network,
        `/transactions/${tx.hash}/operations`
      );
      const paymentOp = opsResponse.records.find(
        (op) => op.type === 'payment' || op.type === 'create_account'
      );

      let destination = '';
      if (paymentOp) {
        if (paymentOp.type === 'payment') {
          destination = paymentOp.to ?? paymentOp.destination ?? '';
        } else if (paymentOp.type === 'create_account') {
          destination = paymentOp.account ?? '';
        }
      }

      let asset = 'XLM';
      if (
        paymentOp?.asset_type === 'credit_alphanum4' ||
        paymentOp?.asset_type === 'credit_alphanum12'
      ) {
        asset = paymentOp.asset_code ?? 'UNKNOWN';
      }

      const amount =
        paymentOp?.amount ?? paymentOp?.starting_balance ?? '0';
      const type =
        destination === publicKey ||
        (paymentOp?.type === 'create_account' && paymentOp?.account === publicKey)
          ? 'received'
          : 'sent';

      items.push({
        hash: tx.hash,
        type,
        amount,
        asset,
        timestamp: tx.created_at,
        explorerLink: `${baseUrl}/${tx.hash}`,
        destination: destination || undefined,
        source: tx.source_account,
      });
    } catch {
      items.push({
        hash: tx.hash,
        type: 'sent',
        amount: '0',
        asset: 'XLM',
        timestamp: tx.created_at,
        explorerLink: `${baseUrl}/${tx.hash}`,
        source: tx.source_account,
      });
    }
  }

  return items;
}
