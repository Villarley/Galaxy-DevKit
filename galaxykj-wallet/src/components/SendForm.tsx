'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useBalance } from '@/hooks/useBalance';
import { sendPayment, isValidPublicKey } from '@/lib/send-payment';
import { getStellarExpertTxUrl } from '@/lib/galaxy-sdk';
import { IconSend, IconLoader, IconCheckCircle } from './icons';
import type { AssetBalance } from '@/types';

function formatBalance(balance: string): string {
  const n = parseFloat(balance);
  if (Number.isNaN(n)) return '0.00';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function SendForm() {
  const { wallet, address, network } = useWallet();
  const { xlmBalance, assets } = useBalance(wallet, address, network);
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<{ code: string; issuer?: string }>({ code: 'XLM' });
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);

  const assetOptions: { code: string; issuer?: string }[] = [
    { code: 'XLM' },
    ...assets.map((a) => ({ code: a.code, issuer: a.issuer })),
  ];

  const selectedBalance =
    selectedAsset.code === 'XLM'
      ? xlmBalance
      : assets.find((a) => a.code === selectedAsset.code && a.issuer === selectedAsset.issuer)?.balance ?? '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !address) return;
    setError(null);
    setSuccessHash(null);

    if (!destination.trim()) {
      setError('Enter destination address');
      return;
    }
    if (!isValidPublicKey(destination.trim())) {
      setError('Invalid Stellar address');
      return;
    }
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }
    const balanceNum = parseFloat(selectedBalance);
    if (amountNum > balanceNum) {
      setError('Insufficient balance');
      return;
    }
    if (selectedAsset.code !== 'XLM' && !selectedAsset.issuer) {
      setError('Asset issuer required for non-XLM assets');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPayment(wallet, network, {
        sourcePublicKey: address,
        destination: destination.trim(),
        amount: amount,
        assetCode: selectedAsset.code,
        assetIssuer: selectedAsset.issuer,
        memo: memo.trim() || undefined,
      });
      setSuccessHash(result.hash);
      setDestination('');
      setAmount('');
      setMemo('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      console.error('Send payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Send Payment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="send-destination" className="mb-1 block text-sm font-medium text-gray-700">
            To
          </label>
          <input
            id="send-destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="GXXX..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
            aria-invalid={!!error && error.includes('address')}
          />
        </div>
        <div>
          <label htmlFor="send-amount" className="mb-1 block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            id="send-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
            aria-invalid={!!error && (error.includes('amount') || error.includes('balance'))}
          />
          <p className="mt-1 text-xs text-gray-500">
            Balance: {formatBalance(selectedBalance)} {selectedAsset.code}
          </p>
        </div>
        <div>
          <label htmlFor="send-asset" className="mb-1 block text-sm font-medium text-gray-700">
            Asset
          </label>
          <select
            id="send-asset"
            value={selectedAsset.code + (selectedAsset.issuer ?? '')}
            onChange={(e) => {
              const val = e.target.value;
              const opt = assetOptions.find(
                (o) => o.code + (o.issuer ?? '') === val
              );
              if (opt) setSelectedAsset(opt);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
          >
            {assetOptions.map((opt) => (
              <option
                key={opt.code + (opt.issuer ?? '')}
                value={opt.code + (opt.issuer ?? '')}
              >
                {opt.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="send-memo" className="mb-1 block text-sm font-medium text-gray-700">
            Memo (optional)
          </label>
          <input
            id="send-memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Optional memo"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {successHash && (
          <p className="flex items-center gap-2 text-sm text-green-600" role="status">
            <IconCheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden />
            <a
              href={getStellarExpertTxUrl(successHash, network)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Transaction {successHash.slice(0, 8)}...
            </a>
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Send payment"
        >
          {loading ? (
            <IconLoader className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <IconSend className="h-4 w-4" aria-hidden />
          )}
          Send
        </button>
      </form>
    </div>
  );
}
