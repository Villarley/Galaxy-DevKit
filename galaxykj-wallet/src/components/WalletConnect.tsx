'use client';

import { useWallet } from '@/hooks/useWallet';
import { isFreighterAvailable, FREIGHTER_URL } from '@/lib/freighter-adapter';
import { IconWallet, IconLogOut, IconLoader } from './icons';

export function WalletConnect() {
  const { connected, loading, error, connect, disconnect } = useWallet();
  const available = typeof window !== 'undefined' && isFreighterAvailable();

  if (connected) {
    return (
      <button
        type="button"
        onClick={disconnect}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Disconnect wallet"
      >
        {loading ? (
          <IconLoader className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <IconLogOut className="h-4 w-4" aria-hidden />
        )}
        Disconnect
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
          {!available && (
            <a
              href={FREIGHTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              Install Freighter
            </a>
          )}
        </p>
      )}
      <button
        type="button"
        onClick={() => connect()}
        disabled={loading || !available}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Connect wallet"
      >
        {loading ? (
          <IconLoader className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <IconWallet className="h-4 w-4" aria-hidden />
        )}
        Connect Wallet
      </button>
      {!available && !error && (
        <p className="text-xs text-gray-500">
          <a
            href={FREIGHTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Install Freighter
          </a>{' '}
          to connect
        </p>
      )}
    </div>
  );
}
