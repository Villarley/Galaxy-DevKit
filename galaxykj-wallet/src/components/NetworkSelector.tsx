'use client';

import { useWallet } from '@/hooks/useWallet';
import type { Network } from '@/types';
import { IconChevronDown } from './icons';

export function NetworkSelector() {
  const { network, switchNetwork, connected, loading } = useWallet();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Network;
    if (value === 'mainnet' || value === 'testnet') {
      switchNetwork(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="network-select" className="text-sm font-medium text-gray-700">
        Network
      </label>
      <select
        id="network-select"
        value={network}
        onChange={handleChange}
        disabled={loading}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        aria-label="Select network"
      >
        <option value="testnet">Testnet</option>
        <option value="mainnet">Mainnet</option>
      </select>
      <IconChevronDown className="h-4 w-4 text-gray-500" aria-hidden />
    </div>
  );
}
