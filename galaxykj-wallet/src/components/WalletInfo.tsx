'use client';

import { useWallet } from '@/hooks/useWallet';
import { useBalance } from '@/hooks/useBalance';
import { IconCopy, IconCheck, IconLoader } from './icons';
import { useState } from 'react';

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatBalance(balance: string): string {
  const n = parseFloat(balance);
  if (Number.isNaN(n)) return '0.00';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function WalletInfo() {
  const { address, wallet, network } = useWallet();
  const { xlmBalance, loading } = useBalance(wallet, address, network);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Your Wallet
      </h2>
      <div className="flex items-center gap-2">
        <code className="flex-1 font-mono text-sm text-gray-800">
          {truncateAddress(address)}
        </code>
        <button
          type="button"
          onClick={copyAddress}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Copy address"
        >
          {copied ? (
            <IconCheck className="h-4 w-4 text-green-600" aria-hidden />
          ) : (
            <IconCopy className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <IconLoader className="h-6 w-6 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-800">
            {formatBalance(xlmBalance)} <span className="text-gray-500">XLM</span>
          </p>
        )}
      </div>
    </div>
  );
}
