'use client';

import { useWallet } from '@/hooks/useWallet';
import { WalletInfo } from '@/components/WalletInfo';
import { AssetList } from '@/components/AssetList';
import { SendForm } from '@/components/SendForm';
import { TransactionList } from '@/components/TransactionList';
import { IconWallet } from '@/components/icons';

export default function HomePage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 px-6 text-center">
        <IconWallet className="mb-4 h-16 w-16 text-gray-400" aria-hidden />
        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Connect your wallet
        </h2>
        <p className="max-w-sm text-gray-600">
          Use the Connect Wallet button above to connect with Freighter and view
          your balances, send payments, and see transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WalletInfo />
      <AssetList />
      <SendForm />
      <TransactionList />
    </div>
  );
}
