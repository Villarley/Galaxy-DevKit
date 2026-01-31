'use client';

import { useWallet } from '@/hooks/useWallet';
import { useBalance } from '@/hooks/useBalance';
import { IconLoader } from './icons';

function formatBalance(balance: string): string {
  const n = parseFloat(balance);
  if (Number.isNaN(n)) return '0.00';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function AssetList() {
  const { wallet, address, network } = useWallet();
  const { assets, loading } = useBalance(wallet, address, network);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Your Assets
      </h2>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <IconLoader className="h-5 w-5 animate-spin" aria-hidden />
          Loading…
        </div>
      ) : assets.length === 0 ? (
        <p className="text-gray-500">No other assets</p>
      ) : (
        <ul className="space-y-2" role="list">
          {assets.map((asset) => (
            <li
              key={asset.code + (asset.issuer ?? '')}
              className="flex justify-between border-b border-gray-100 py-2 last:border-0"
            >
              <span className="font-medium text-gray-800">{asset.code}</span>
              <span className="text-gray-600">
                {formatBalance(asset.balance)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
