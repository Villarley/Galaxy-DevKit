import type { Network, NetworkConfig } from '@/types';

const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  testnet: {
    network: 'testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    network: 'mainnet',
    horizonUrl: 'https://horizon.stellar.org',
    passphrase: 'Public Global Stellar Network ; September 2015',
  },
};

export function getNetworkConfig(network: Network): NetworkConfig {
  if (process.env.NEXT_PUBLIC_NETWORK && process.env.NEXT_PUBLIC_HORIZON_URL) {
    const horizonUrl = process.env.NEXT_PUBLIC_HORIZON_URL;
    const passphrase =
      network === 'testnet'
        ? 'Test SDF Network ; September 2015'
        : 'Public Global Stellar Network ; September 2015';
    return { network, horizonUrl, passphrase };
  }
  return NETWORK_CONFIGS[network];
}

export function getStellarExpertTxUrl(hash: string, network: Network): string {
  const subdomain = network === 'testnet' ? 'testnet' : 'stellar';
  return `https://${subdomain}.stellarexpert.io/explorer/public/tx/${hash}`;
}
