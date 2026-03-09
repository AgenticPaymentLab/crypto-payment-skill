/**
 * Network configurations for supported blockchain networks
 */

export interface Network {
  id: string;
  name: string;
  chainId: number;
  symbol: string;
  rpcUrl: string;
  explorer: string;
  decimals: number;
}

export const Networks: Record<string, Network> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    symbol: 'ETH',
    rpcUrl: '',
    explorer: 'https://etherscan.io',
    decimals: 18,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    symbol: 'MATIC',
    rpcUrl: '',
    explorer: 'https://polygonscan.com',
    decimals: 18,
  },
  bsc: {
    id: 'bsc',
    name: 'Binance Smart Chain',
    chainId: 56,
    symbol: 'BNB',
    rpcUrl: '',
    explorer: 'https://bscscan.com',
    decimals: 18,
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    symbol: 'ETH',
    rpcUrl: '',
    explorer: 'https://arbiscan.io',
    decimals: 18,
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    symbol: 'ETH',
    rpcUrl: '',
    explorer: 'https://optimistic.etherscan.io',
    decimals: 18,
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    chainId: 43114,
    symbol: 'AVAX',
    rpcUrl: '',
    explorer: 'https://snowtrace.io',
    decimals: 18,
  },
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    symbol: 'ETH',
    rpcUrl: '',
    explorer: 'https://sepolia.etherscan.io',
    decimals: 18,
  },
};

/**
 * Get network by ID or chain ID
 */
export function getNetwork(networkId: string): Network | undefined {
  // Direct lookup by ID
  if (Networks[networkId]) {
    return Networks[networkId];
  }

  // Lookup by chain ID
  const chainId = parseInt(networkId, 10);
  if (!isNaN(chainId)) {
    return Object.values(Networks).find((n) => n.chainId === chainId);
  }

  return undefined;
}

/**
 * List all supported networks
 */
export function listNetworks(): Network[] {
  return Object.values(Networks);
}

/**
 * Get network from mixed input (e.g., "ethereum" or "1" or "0x1")
 */
export function resolveNetwork(input: string): Network | undefined {
  // Try as network ID first
  if (Networks[input.toLowerCase()]) {
    return Networks[input.toLowerCase()];
  }

  // Try as chain ID (decimal or hex)
  const chainId = input.startsWith('0x')
    ? parseInt(input, 16)
    : parseInt(input, 10);

  if (!isNaN(chainId)) {
    return Object.values(Networks).find((n) => n.chainId === chainId);
  }

  return undefined;
}
