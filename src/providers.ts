/**
 * Crypto API Providers
 * Supports Alchemy, Infura, and other providers
 */

import { Network } from './networks';

// Environment variable for API key
const CRYPTO_API_KEY = process.env.CRYPTO_API_KEY || process.env.ALCHEMY_API_KEY || '';

export interface ProviderConfig {
  type: 'alchemy' | 'infura' | 'custom';
  apiKey: string;
  network: string;
}

let alchemyInstance: any = null;

/**
 * Get Alchemy provider instance
 */
export function getAlchemyProvider(network: string): any {
  if (!CRYPTO_API_KEY) {
    throw new Error('ALCHEMY_API_KEY environment variable not set');
  }

  if (alchemyInstance && alchemyInstance.config.network === mapNetworkToAlchemy(network)) {
    return alchemyInstance;
  }

  try {
    const { Alchemy, Network: AlchemyNetwork } = require('alchemy-sdk');
    
    const config = {
      apiKey: CRYPTO_API_KEY,
      network: mapNetworkToAlchemy(network),
    };

    alchemyInstance = new Alchemy(config);
    return alchemyInstance;
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

  // Fallback to public RPC
  const networkConfig = require('./networks').getNetwork(network);
  if (networkConfig?.rpcUrl) {
    return new providers.JsonRpcProvider(networkConfig.rpcUrl);
  }

  throw new Error(`No provider available for network: ${network}. Set CRYPTO_API_KEY or configure RPC URL.`);
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
 * Check if provider is configured
 */
export function isProviderConfigured(): boolean {
  return !!CRYPTO_API_KEY;
}

/**
 * Get current API key (masked for logging)
 */
export function getApiKeyStatus(): { configured: boolean; provider: string } {
  if (CRYPTO_API_KEY) {
    return { configured: true, provider: 'alchemy' };
  }
  return { configured: false, provider: 'none' };
}
