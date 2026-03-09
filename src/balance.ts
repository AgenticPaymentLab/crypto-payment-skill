/**
 * Balance checking functionality
 */

import { getAlchemyProvider, getProvider } from './providers';
import { getNetwork, Network } from './networks';

export interface BalanceResult {
  address: string;
  network: string;
  symbol: string;
  balance: string;
  balanceWei: string;
  decimals: number;
}

/**
 * Get native token balance for an address
 */
export async function getBalance(address: string, networkId: string = 'ethereum'): Promise<BalanceResult> {
  const network = getNetwork(networkId);
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  try {
    const alchemy = getAlchemyProvider(networkId);
    const balanceWei = await alchemy.core.getBalance(address);

    return {
      address,
      network: networkId,
      symbol: network.symbol,
      balance: (parseFloat(balanceWei) / Math.pow(10, network.decimals)).toFixed(6),
      balanceWei: balanceWei.toString(),
      decimals: network.decimals,
    };
  } catch (error) {
    // Fallback to ethers.js
    try {
      const provider = getProvider(networkId);
      const balanceWei = await provider.getBalance(address);

      return {
        address,
        network: networkId,
        symbol: network.symbol,
        balance: (parseFloat(balanceWei.toString()) / Math.pow(10, network.decimals)).toFixed(6),
        balanceWei: balanceWei.toString(),
        decimals: network.decimals,
      };
    } catch (fallbackError) {
      throw new Error(`Failed to get balance: ${(fallbackError as Error).message}`);
    }
  }
}

/**
 * ERC-20 Token ABI (minimal for balanceOf)
 */
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

/**
 * Get ERC-20 token balance for an address
 */
export async function getTokenBalance(
  address: string,
  tokenAddress: string,
  networkId: string = 'ethereum'
): Promise<BalanceResult> {
  const network = getNetwork(networkId);
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  const { Contract } = require('ethers');

  try {
    const provider = getProvider(networkId);
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

    const [balanceWei, decimals, symbol] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals(),
      tokenContract.symbol(),
    ]);

    return {
      address,
      network: networkId,
      symbol,
      balance: (parseFloat(balanceWei.toString()) / Math.pow(10, decimals)).toFixed(6),
      balanceWei: balanceWei.toString(),
      decimals,
    };
  } catch (error) {
    throw new Error(`Failed to get token balance: ${(error as Error).message}`);
  }
}

/**
 * Parse address with optional network prefix
 * Format: [network/]address
 */
export function parseAddressInput(input: string): { address: string; network: string } {
  const parts = input.split('/');
  
  if (parts.length === 1) {
    return { address: parts[0], network: 'ethereum' };
  }

  return { address: parts[1], network: parts[0] };
}

/**
 * Format balance for display
 */
export function formatBalance(result: BalanceResult): string {
  return `${result.balance} ${result.symbol} (${result.network})`;
}
