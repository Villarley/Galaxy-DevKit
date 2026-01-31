'use client';

import { useState, useEffect } from 'react';
import type { WalletAdapter } from '@/types';
import type { Network } from '@/types';
import { fetchAccountBalances } from '@/lib/horizon';
import type { AssetBalance } from '@/types';

export function useBalance(
  wallet: WalletAdapter | null,
  address: string,
  network: Network
) {
  const [xlmBalance, setXlmBalance] = useState<string>('0');
  const [assets, setAssets] = useState<AssetBalance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet || !address) {
      setXlmBalance('0');
      setAssets([]);
      return;
    }

    const fetchBalances = async () => {
      setLoading(true);
      try {
        const { xlmBalance: xlm, assets: list } = await fetchAccountBalances(
          address,
          network
        );
        setXlmBalance(xlm);
        setAssets(list);
      } catch (err) {
        console.error('Error fetching balances:', err);
        setXlmBalance('0');
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [wallet, address, network]);

  return { xlmBalance, assets, loading };
}
