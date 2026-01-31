'use client';

import { useWallet } from '@/hooks/useWallet';
import { NetworkSelector } from '@/components/NetworkSelector';

export default function SettingsPage() {
  const { network, switchNetwork, connected } = useWallet();

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Network
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Current network: <strong className="capitalize">{network}</strong>.
          Changing the network will reconnect your wallet on the selected
          network.
        </p>
        <NetworkSelector />
      </section>
      {connected && (
        <p className="text-sm text-gray-500">
          Your wallet address and network preference are stored locally and
          used to auto-reconnect on refresh.
        </p>
      )}
    </div>
  );
}
