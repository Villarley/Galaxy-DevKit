'use client';

import { useState, useEffect } from 'react';
import type { WalletAdapter } from '@/types';
import type { Network } from '@/types';
import { fetchTransactionHistory } from '@/lib/horizon';
import type { TransactionListItem } from '@/types';

export function useTransactions(
  wallet: WalletAdapter | null,
  address: string,
  network: Network
) {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet || !address) {
      setTransactions([]);
      return;
    }

    const fetchTx = async () => {
      setLoading(true);
      try {
        const list = await fetchTransactionHistory(address, network, 10);
        setTransactions(list);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
    const interval = setInterval(fetchTx, 30000);
    return () => clearInterval(interval);
  }, [wallet, address, network]);

  return { transactions, loading };
}
