/**
 * Balance checking functionality with multi-source fallback
 * Priority: Block Explorer API > Alchemy > Multiple RPCs > Block Explorer Scraping
 */

import { getAlchemyProvider, getProvider, getMultipleProviders } from './providers';
import { getNetwork, Network, Networks } from './networks';

export interface BalanceResult {
  address: string;
  network: string;
  symbol: string;
  balance: string;
  balanceWei: string;
  decimals: number;
  source: string;
}

export interface MultiChainBalanceResult {
  address: string;
  total: string;
  totalUsd?: string;
  breakdown: BalanceResult[];
  sources: string[];
  errors: Record<string, string>;
}

export interface BalanceCheckAttempt {
  source: string;
  success: boolean;
  balance?: string;
  error?: string;
}

// Track all balance check attempts for logging
const balanceCheckAttempts: BalanceCheckAttempt[] = [];

/**
 * Clear balance check attempt history
 */
export function clearBalanceCheckHistory(): void {
  balanceCheckAttempts.length = 0;
}

/**
 * Get balance check attempt history
 */
export function getBalanceCheckHistory(): BalanceCheckAttempt[] {
  return [...balanceCheckAttempts];
}

/**
 * Try to get balance from block explorer API
 * Most reliable - doesn't depend on RPC
 */
async function getBalanceFromExplorer(
  address: string,
  network: Network
): Promise<BalanceResult | null> {
  const explorerApiKeys: Record<string, string> = {
    polygonscan: process.env.POLYSCAN_API_KEY || '',
    basescan: process.env.BASESCAN_API_KEY || '',
    arbiscan: process.env.ARBISCAN_API_KEY || '',
    etherscan: process.env.ETHERSCAN_API_KEY || '',
    bscscan: process.env.BSCSCAN_API_KEY || '',
    optimistic: process.env.OPTIMISM_API_KEY || '',
    snowtrace: process.env.SNOWTRACE_API_KEY || '',
  };

  const explorerBaseUrls: Record<string, string> = {
    ethereum: 'https://api.etherscan.io/api',
    polygon: 'https://api.polygonscan.com/api',
    base: 'https://api.basescan.org/api',
    arbitrum: 'https://api.arbiscan.io/api',
    bsc: 'https://api.bscscan.com/api',
    optimism: 'https://api-optimistic.etherscan.io/api',
    avalanche: 'https://api.snowtrace.io/api',
  };

  const networkKey = network.id.toLowerCase();
  const baseUrl = explorerBaseUrls[networkKey];
  const apiKey = explorerApiKeys[networkKey] || '';

  if (!baseUrl) {
    return null;
  }

  try {
    // Using eth_getBalance endpoint via explorer API
    const url = new URL(baseUrl);
    url.searchParams.set('module', 'account');
    url.searchParams.set('action', 'balance');
    url.searchParams.set('address', address);
    url.searchParams.set('tag', 'latest');
    if (apiKey) {
      url.searchParams.set('apikey', apiKey);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as { status: string; result: string };
    if (data.status === '1' && data.result) {
      const balanceWei = data.result;
      return {
        address,
        network: network.id,
        symbol: network.symbol,
        balance: (parseFloat(balanceWei) / Math.pow(10, network.decimals)).toFixed(6),
        balanceWei: balanceWei,
        decimals: network.decimals,
        source: 'block-explorer-api',
      };
    }
  } catch (error) {
    // Explorer API failed, will try other sources
  }

  return null;
}

/**
 * Try to get balance via multiple RPC endpoints with retry logic
 */
async function getBalanceFromRpcWithFallback(
  address: string,
  network: Network
): Promise<BalanceResult | null> {
  const providers = getMultipleProviders(network.id);
  
  for (const providerInfo of providers) {
    try {
      const balanceWei = await providerInfo.provider.getBalance(address);
      const balanceStr = balanceWei.toString();
      
      // Don't accept $0 balance without trying other sources
      if (balanceStr === '0' && providers.length > 1) {
        balanceCheckAttempts.push({
          source: providerInfo.name,
          success: true,
          balance: '0',
          error: 'Balance is 0, trying other sources',
        });
        continue; // Try next provider
      }

      return {
        address,
        network: network.id,
        symbol: network.symbol,
        balance: (parseFloat(balanceStr) / Math.pow(10, network.decimals)).toFixed(6),
        balanceWei: balanceStr,
        decimals: network.decimals,
        source: providerInfo.name,
      };
    } catch (error) {
      balanceCheckAttempts.push({
        source: providerInfo.name,
        success: false,
        error: (error as Error).message,
      });
      // Try next provider
    }
  }

  return null;
}

/**
 * Try to get balance via Alchemy (primary SDK)
 */
async function getBalanceFromAlchemy(
  address: string,
  networkId: string
): Promise<BalanceResult | null> {
  try {
    const alchemy = getAlchemyProvider(networkId);
    const balanceWei = await alchemy.core.getBalance(address);
    const balanceStr = balanceWei.toString();

    return {
      address,
      network: networkId,
      symbol: getNetwork(networkId)?.symbol || 'ETH',
      balance: (parseFloat(balanceStr) / Math.pow(10, 18)).toFixed(6),
      balanceWei: balanceStr,
      decimals: 18,
      source: 'alchemy',
    };
  } catch (error) {
    balanceCheckAttempts.push({
      source: 'alchemy',
      success: false,
      error: (error as Error).message,
    });
    return null;
  }
}

/**
 * Try block explorer HTML scraping as last resort
 */
async function getBalanceFromExplorerScraping(
  address: string,
  network: Network
): Promise<BalanceResult | null> {
  try {
    const explorerUrls: Record<string, string> = {
      ethereum: `https://etherscan.io/address/${address}`,
      polygon: `https://polygonscan.com/address/${address}`,
      base: `https://basescan.org/address/${address}`,
      arbitrum: `https://arbiscan.io/address/${address}`,
      bsc: `https://bscscan.com/address/${address}`,
      optimism: `https://optimistic.etherscan.io/address/${address}`,
      avalanche: `https://snowtrace.io/address/${address}`,
    };

    const url = explorerUrls[network.id.toLowerCase()];
    if (!url) {
      return null;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoPaymentBot/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    
    // Look for balance in the page
    const balanceMatch = html.match(/(\d+[\d,\.]*)\s*${network.symbol}/i);
    if (balanceMatch) {
      const balance = balanceMatch[1].replace(/,/g, '');
      return {
        address,
        network: network.id,
        symbol: network.symbol,
        balance: balance,
        balanceWei: (parseFloat(balance) * Math.pow(10, network.decimals)).toString(),
        decimals: network.decimals,
        source: 'block-explorer-scraper',
      };
    }
  } catch (error) {
    // Last resort failed
  }

  return null;
}

/**
 * Get native token balance using multi-source fallback
 * Priority: Explorer API > Alchemy > Multiple RPCs > Explorer Scraping
 */
export async function getBalance(
  address: string,
  networkId: string = 'ethereum'
): Promise<BalanceResult> {
  const network = getNetwork(networkId);
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  // Clear attempt history for this check
  clearBalanceCheckHistory();

  // Strategy 1: Try block explorer API first (most reliable)
  const explorerResult = await getBalanceFromExplorer(address, network);
  if (explorerResult && parseFloat(explorerResult.balanceWei) > 0) {
    balanceCheckAttempts.push({
      source: 'block-explorer-api',
      success: true,
      balance: explorerResult.balance,
    });
    return explorerResult;
  }

  // Strategy 2: Try Alchemy
  const alchemyResult = await getBalanceFromAlchemy(address, networkId);
  if (alchemyResult && parseFloat(alchemyResult.balanceWei) > 0) {
    return alchemyResult;
  }

  // Strategy 3: Try multiple RPC endpoints with retry
  const rpcResult = await getBalanceFromRpcWithFallback(address, network);
  if (rpcResult) {
    return rpcResult;
  }

  // Strategy 4: Try block explorer scraping as last resort
  const scraperResult = await getBalanceFromExplorerScraping(address, network);
  if (scraperResult) {
    return scraperResult;
  }

  // If we got a $0 result from explorer API but others failed, return the explorer result
  // (at least it's from a real source, not a failed RPC)
  if (explorerResult) {
    return explorerResult;
  }

  // All sources failed - compile error message with all attempts
  const attemptsSummary = balanceCheckAttempts
    .map((a) => `  - ${a.source}: ${a.success ? 'OK' : 'FAILED'}${a.error ? `: ${a.error}` : ''}`)
    .join('\n');

  throw new Error(
    `Failed to get balance from all sources for ${address} on ${networkId}:\n${attemptsSummary}\n\n` +
    `If you believe this address has funds, please check:\n` +
    `1. The address is correct\n` +
    `2. The network is correct\n` +
    `3. Set EXPLORER_API_KEY for your network (e.g., ETHERSCAN_API_KEY)\n` +
    `4. Check the block explorer manually: ${network.explorer}/address/${address}`
  );
}

/**
 * Get balance across multiple chains
 */
export async function getMultiChainBalance(
  address: string,
  networks: string[] = ['ethereum', 'polygon', 'base', 'arbitrum']
): Promise<MultiChainBalanceResult> {
  const breakdown: BalanceResult[] = [];
  const errors: Record<string, string> = {};
  const sources: string[] = [];

  for (const networkId of networks) {
    try {
      const result = await getBalance(address, networkId);
      breakdown.push(result);
      if (!sources.includes(result.source)) {
        sources.push(result.source);
      }
    } catch (error) {
      errors[networkId] = (error as Error).message;
    }
  }

  // Calculate total (assuming ETH-denominated for simplicity)
  let total = '0';
  try {
    total = breakdown
      .reduce((sum, b) => sum + parseFloat(b.balance), 0)
      .toFixed(6);
  } catch {
    // Keep total as 0 if calculation fails
  }

  return {
    address,
    total,
    breakdown,
    sources,
    errors,
  };
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

  // Try multiple providers for token balance
  const providers = getMultipleProviders(networkId);
  
  for (const providerInfo of providers) {
    try {
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, providerInfo.provider);

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
        source: providerInfo.name,
      };
    } catch (error) {
      // Try next provider
    }
  }

  throw new Error(`Failed to get token balance from all providers for ${tokenAddress} on ${networkId}`);
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
  return `${result.balance} ${result.symbol} (${result.network}) [${result.source}]`;
}

/**
 * Format multi-chain balance for display
 */
export function formatMultiChainBalance(result: MultiChainBalanceResult): string {
  const lines = [
    `Address: ${result.address}`,
    `Total: ${result.total} ETH-equivalent`,
    `Sources: ${result.sources.join(', ')}`,
    '',
    'Breakdown:',
  ];

  for (const b of result.breakdown) {
    lines.push(`  ${b.network}: ${b.balance} ${b.symbol} [${b.source}]`);
  }

  if (Object.keys(result.errors).length > 0) {
    lines.push('');
    lines.push('Errors:');
    for (const [net, err] of Object.entries(result.errors)) {
      lines.push(`  ${net}: ${err}`);
    }
  }

  return lines.join('\n');
}
