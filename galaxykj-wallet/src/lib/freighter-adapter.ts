import type { WalletAdapter } from '@/types';

declare global {
  interface Window {
    freighter?: {
      isConnected(): Promise<boolean>;
      getPublicKey(): Promise<string>;
      signTransaction(xdr: string, network?: string): Promise<string>;
    };
  }
}

const FREIGHTER_URL = 'https://www.freighterapp.com/';

export function isFreighterAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.freighter);
}

export async function connectFreighter(): Promise<WalletAdapter> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet connection is only available in the browser');
  }
  if (!window.freighter) {
    throw new Error(
      'Freighter is not installed. Please install the Freighter wallet extension from ' +
        FREIGHTER_URL
    );
  }
  const connected = await window.freighter.isConnected();
  if (!connected) {
    throw new Error('Please connect your account in the Freighter extension');
  }
  return {
    async getPublicKey() {
      const key = await window.freighter!.getPublicKey();
      if (!key) throw new Error('Failed to get public key from Freighter');
      return key;
    },
    async signTransaction(xdr: string) {
      const signed = await window.freighter!.signTransaction(xdr);
      if (!signed) throw new Error('Freighter did not return a signed transaction');
      return signed;
    },
  };
}

export { FREIGHTER_URL };
