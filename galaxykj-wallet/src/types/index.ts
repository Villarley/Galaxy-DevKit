export type Network = 'mainnet' | 'testnet';

export interface AssetBalance {
  code: string;
  issuer?: string;
  balance: string;
}

export type TransactionDirection = 'sent' | 'received';

export interface TransactionListItem {
  hash: string;
  type: TransactionDirection;
  amount: string;
  asset: string;
  timestamp: string;
  explorerLink: string;
  destination?: string;
  source?: string;
}

export interface NetworkConfig {
  network: Network;
  horizonUrl: string;
  passphrase: string;
}

export interface WalletAdapter {
  getPublicKey(): Promise<string>;
  signTransaction(xdr: string): Promise<string>;
}
