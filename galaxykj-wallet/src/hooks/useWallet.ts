'use client';

import { useState, useCallback, useEffect } from 'react';
import type { WalletAdapter } from '@/types';
import { connectFreighter } from '@/lib/freighter-adapter';
import { getNetworkConfig } from '@/lib/galaxy-sdk';
import type { Network } from '@/types';

const STORAGE_ADDRESS = 'wallet_address';
const STORAGE_NETWORK = 'wallet_network';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletAdapter | null>(null);
  const [address, setAddress] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>('testnet');

  const connect = useCallback(async (selectedNetwork: Network = network) => {
    setLoading(true);
    setError(null);
    try {
      const adapter = await connectFreighter();
      const addr = await adapter.getPublicKey();
      const config = getNetworkConfig(selectedNetwork);

      setWallet(adapter);
      setAddress(addr);
      setNetwork(selectedNetwork);
      setConnected(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ADDRESS, addr);
        localStorage.setItem(STORAGE_NETWORK, selectedNetwork);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [network]);

  const disconnect = useCallback(() => {
    setWallet(null);
    setAddress('');
    setConnected(false);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_ADDRESS);
      localStorage.removeItem(STORAGE_NETWORK);
    }
  }, []);

  const switchNetwork = useCallback(
    async (newNetwork: Network) => {
      await disconnect();
      await connect(newNetwork);
    },
    [disconnect, connect]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedAddress = localStorage.getItem(STORAGE_ADDRESS);
    const savedNetwork = localStorage.getItem(STORAGE_NETWORK) as Network | null;
    if (savedAddress && savedNetwork && (savedNetwork === 'mainnet' || savedNetwork === 'testnet')) {
      setNetwork(savedNetwork);
      connect(savedNetwork).catch(() => {
        disconnect();
      });
    }
  }, []);

  return {
    wallet,
    address,
    connected,
    loading,
    error,
    network,
    connect,
    disconnect,
    switchNetwork,
  };
}
