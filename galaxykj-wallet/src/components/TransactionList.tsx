'use client';

import { useWallet } from '@/hooks/useWallet';
import { useTransactions } from '@/hooks/useTransactions';
import { IconArrowUpRight, IconArrowDownLeft, IconLoader, IconExternalLink } from './icons';

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return iso;
  }
}

function formatAmount(amount: string): string {
  const n = parseFloat(amount);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7,
  });
}

export function TransactionList() {
  const { wallet, address, network } = useWallet();
  const { transactions, loading } = useTransactions(wallet, address, network);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Recent Transactions
      </h2>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <IconLoader className="h-5 w-5 animate-spin" aria-hidden />
          Loading…
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet</p>
      ) : (
        <ul className="space-y-2" role="list">
          {transactions.map((tx) => (
            <li
              key={tx.hash}
              className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                {tx.type === 'sent' ? (
                  <IconArrowUpRight
                    className="h-5 w-5 flex-shrink-0 text-red-500"
                    aria-hidden
                  />
                ) : (
                  <IconArrowDownLeft
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    aria-hidden
                  />
                )}
                <div>
                  <span className="font-medium capitalize text-gray-800">
                    {tx.type}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {formatAmount(tx.amount)} {tx.asset}
                  </span>
                  <p className="text-xs text-gray-500">{formatTime(tx.timestamp)}</p>
                </div>
              </div>
              <a
                href={tx.explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`View transaction ${tx.hash.slice(0, 8)} on Stellar Expert`}
              >
                <IconExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
