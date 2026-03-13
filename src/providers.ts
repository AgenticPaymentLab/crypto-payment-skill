/**
 * Crypto API Providers
 * Supports Alchemy, Infura, and other providers with multiple fallback endpoints
 */

import { Network } from './networks';

// Environment variable for API key
const CRYPTO_API_KEY = process.env.CRYPTO_API_KEY || process.env.ALCHEMY_API_KEY || '';
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';

export interface ProviderConfig {
  type: 'alchemy' | 'infura' | 'custom';
  apiKey: string;
  network: string;
}

export interface ProviderInfo {
  name: string;
  provider: any;
}

let alchemyInstance: Record<string, any> = {};

/**
 * Get Alchemy provider instance
 */
export function getAlchemyProvider(network: string): any {
  if (!CRYPTO_API_KEY) {
    throw new Error('ALCHEMY_API_KEY environment variable not set');
  }

  const alchemyNetwork = mapNetworkToAlchemy(network);
  
  if (alchemyInstance[alchemyNetwork]) {
    return alchemyInstance[alchemyNetwork];
  }

  try {
    const { Alchemy, Network: AlchemyNetwork } = require('alchemy-sdk');
    
    const config = {
      apiKey: CRYPTO_API_KEY,
      network: alchemyNetwork,
    };

    alchemyInstance[alchemyNetwork] = new Alchemy(config);
    return alchemyInstance[alchemyNetwork];
  } catch (error) {
    throw new Error('Failed to initialize Alchemy: ' + (error as Error).message);
  }
}

/**
 * Get ethers.js provider
 */
export function getProvider(network: string): any {
  const { providers } = require('ethers');

  // Try Alchemy first if API key is available
  if (CRYPTO_API_KEY) {
    try {
      const alchemy = getAlchemyProvider(network);
      return alchemy.config.getProvider();
    } catch {
      // Fall through to other providers
    }
  }

  // Try Infura if API key is available
  if (INFURA_API_KEY) {
    try {
      const infuraNetwork = mapNetworkToInfura(network);
      if (infuraNetwork) {
        return new providers.JsonRpcProvider(`https://${infuraNetwork}.infura.io/v3/${INFURA_API_KEY}`);
      }
    } catch {
      // Fall through
    }
  }

  // Fallback to public RPC from our list
  const rpcUrls = getPublicRpcUrls(network);
  if (rpcUrls.length > 0) {
    return new providers.JsonRpcProvider(rpcUrls[0]);
  }

  throw new Error(`No provider available for network: ${network}. Set CRYPTO_API_KEY or configure RPC URL.`);
}

/**
 * Get multiple providers for redundancy (for balance checking)
 * Returns array of providers to try in order
 */
export function getMultipleProviders(network: string): ProviderInfo[] {
  const { providers } = require('ethers');
  const result: ProviderInfo[] = [];

  // 1. Add Alchemy if available
  if (CRYPTO_API_KEY) {
    try {
      const alchemy = getAlchemyProvider(network);
      result.push({
        name: 'alchemy',
        provider: alchemy.config.getProvider(),
      });
    } catch {
      // Alchemy not available
    }
  }

  // 2. Add Infura if available
  if (INFURA_API_KEY) {
    const infuraNetwork = mapNetworkToInfura(network);
    if (infuraNetwork) {
      result.push({
        name: 'infura',
        provider: new providers.JsonRpcProvider(`https://${infuraNetwork}.infura.io/v3/${INFURA_API_KEY}`),
      });
    }
  }

  // 3. Add multiple public RPCs for redundancy
  const publicRpcs = getPublicRpcUrls(network);
  for (let i = 0; i < publicRpcs.length; i++) {
    result.push({
      name: `public-rpc-${i + 1}`,
      provider: new providers.JsonRpcProvider(publicRpcs[i]),
    });
  }

  // If no providers available, throw error
  if (result.length === 0) {
    throw new Error(`No providers available for ${network}. Set ALCHEMY_API_KEY or INFURA_API_KEY.`);
  }

  return result;
}

/**
 * Get public RPC URLs for a network (multiple for redundancy)
 */
function getPublicRpcUrls(network: string): string[] {
  const rpcUrls: Record<string, string[]> = {
    ethereum: [
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://eth.public-rpc.com',
    ],
    polygon: [
      'https://polygon.llamarpc.com',
      'https://rpc.ankr.com/polygon',
      'https://polygon-rpc.com',
    ],
    base: [
      'https://base.llamarpc.com',
      'https://rpc.ankr.com/base',
      'https://mainnet.base.org',
    ],
    arbitrum: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://arbitrum.llamarpc.com',
    ],
    optimism: [
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism',
      'https://optimism.llamarpc.com',
    ],
    bsc: [
      'https://bsc.llamarpc.com',
      'https://rpc.ankr.com/bsc',
      'https://bsc-dataseed.binance.org',
    ],
    avalanche: [
      'https://avalanche.llamarpc.com',
      'https://rpc.ankr.com/avalanche',
      'https://api.avax.network/ext/bc/C/rpc',
    ],
    sepolia: [
      'https://sepolia.llamarpc.com',
      'https://rpc.sepolia.org',
      'https://eth-sepolia.public.blastapi.io',
    ],
  };

  return rpcUrls[network.toLowerCase()] || [];
}

/**
 * Map network ID to Alchemy network enum
 */
function mapNetworkToAlchemy(networkId: string): any {
  const { Network: AlchemyNetwork } = require('alchemy-sdk');

  const mapping: Record<string, any> = {
    ethereum: AlchemyNetwork.ETH_MAINNET,
    'ethereum-mainnet': AlchemyNetwork.ETH_MAINNET,
    sepolia: AlchemyNetwork.ETH_SEPOLIA,
    'ethereum-sepolia': AlchemyNetwork.ETH_SEPOLIA,
    polygon: AlchemyNetwork.MATIC_MAINNET,
    'polygon-mainnet': AlchemyNetwork.MATIC_MAINNET,
    bsc: AlchemyNetwork.BSC_MAINNET,
    'binance-smart-chain': AlchemyNetwork.BSC_MAINNET,
    arbitrum: AlchemyNetwork.ARB_MAINNET,
    'arbitrum-mainnet': AlchemyNetwork.ARB_MAINNET,
    optimism: AlchemyNetwork.OPT_MAINNET,
    'optimism-mainnet': AlchemyNetwork.OPT_MAINNET,
    avalanche: AlchemyNetwork.AVA_MAINNET,
    'avalanche-mainnet': AlchemyNetwork.AVA_MAINNET,
  };

  return mapping[networkId.toLowerCase()] || AlchemyNetwork.ETH_MAINNET;
}

/**
 * Map network ID to Infura network name
 */
function mapNetworkToInfura(networkId: string): string | null {
  const mapping: Record<string, string> = {
    ethereum: 'mainnet',
    'ethereum-mainnet': 'mainnet',
    sepolia: 'sepolia',
    'ethereum-sepolia': 'sepolia',
    polygon: 'polygon-mainnet',
    'polygon-mainnet': 'polygon-mainnet',
    arbitrum: 'arbitrum-mainnet',
    'arbitrum-mainnet': 'arbitrum-mainnet',
    optimism: 'optimism-mainnet',
    'optimism-mainnet': 'optimism-mainnet',
  };

  return mapping[networkId.toLowerCase()] || null;
}

/**
 * Check if provider is configured
 */
export function isProviderConfigured(): boolean {
  return !!CRYPTO_API_KEY || !!INFURA_API_KEY;
}

/**
 * Get current API key (masked for logging)
 */
export function getApiKeyStatus(): { configured: boolean; provider: string } {
  if (CRYPTO_API_KEY) {
    return { configured: true, provider: 'alchemy' };
  }
  if (INFURA_API_KEY) {
    return { configured: true, provider: 'infura' };
  }
  return { configured: false, provider: 'none' };
}
