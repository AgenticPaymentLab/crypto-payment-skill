/**
 * Transaction querying functionality
 */

import { getAlchemyProvider, getProvider } from './providers';
import { getNetwork } from './networks';

export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  symbol: string;
  gasUsed: string;
  gasPrice: string;
  status: 'confirmed' | 'pending' | 'failed';
  network: string;
  nonce: number;
  transactionIndex: number;
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash: string, networkId: string = 'ethereum'): Promise<Transaction> {
  const network = getNetwork(networkId);
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  try {
    const alchemy = getAlchemyProvider(networkId);
    const tx = await alchemy.core.getTransaction(txHash);
    
    if (!tx) {
      throw new Error(`Transaction not found: ${txHash}`);
    }

    const receipt = await alchemy.core.getTransactionReceipt(txHash);

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber || 0,
      timestamp: 0, // Would need block info for this
      from: tx.from,
      to: tx.to || '',
      value: tx.value?.toString() || '0',
      symbol: network.symbol,
      gasUsed: receipt?.gasUsed?.toString() || '0',
      gasPrice: tx.gasPrice?.toString() || '0',
      status: receipt?.status === 1 ? 'confirmed' : receipt?.status === 0 ? 'failed' : 'pending',
      network: networkId,
      nonce: tx.nonce,
      transactionIndex: tx.transactionIndex || 0,
    };
  } catch (error) {
    // Fallback to ethers.js
    try {
      const provider = getProvider(networkId);
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        throw new Error(`Transaction not found: ${txHash}`);
      }

      const receipt = await provider.getTransactionReceipt(txHash);

      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber || 0,
        timestamp: 0,
        from: tx.from,
        to: tx.to || '',
        value: tx.value?.toString() || '0',
        symbol: network.symbol,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        gasPrice: tx.gasPrice?.toString() || '0',
        status: receipt?.status === 1 ? 'confirmed' : receipt?.status === 0 ? 'failed' : 'pending',
        network: networkId,
        nonce: tx.nonce,
        transactionIndex: tx.index || 0,
      };
    } catch (fallbackError) {
      throw new Error(`Failed to get transaction: ${(fallbackError as Error).message}`);
    }
  }
}

/**
 * Get transaction status only
 */
export async function getTransactionStatus(
  txHash: string,
  networkId: string = 'ethereum'
): Promise<{ status: 'confirmed' | 'pending' | 'failed'; confirmations: number; blockNumber?: number }> {
  const network = getNetwork(networkId);
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  try {
    const provider = getProvider(networkId);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      // Transaction might be pending
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new Error(`Transaction not found: ${txHash}`);
      }
      
      return {
        status: 'pending',
        confirmations: 0,
      };
    }

    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      confirmations: receipt.confirmations,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    throw new Error(`Failed to get transaction status: ${(error as Error).message}`);
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  networkId: string = 'ethereum',
  confirmations: number = 1,
  timeout: number = 300000
): Promise<Transaction> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const status = await getTransactionStatus(txHash, networkId);
    
    if (status.status !== 'pending') {
      return getTransaction(txHash, networkId);
    }

    // Wait 5 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
}

/**
 * Format transaction for display
 */
export function formatTransaction(tx: Transaction): string {
  const { formatEther } = require('ethers');
  
  return `
Transaction: ${tx.hash}
Status: ${tx.status.toUpperCase()}
Network: ${tx.network}
From: ${tx.from}
To: ${tx.to}
Value: ${formatEther(tx.value)} ${tx.symbol}
Gas Used: ${tx.gasUsed}
Block: ${tx.blockNumber}
Nonce: ${tx.nonce}
  `.trim();
}
