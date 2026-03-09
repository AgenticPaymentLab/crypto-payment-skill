/**
 * Transaction sending functionality
 */

import { getProvider } from './providers';
import { getNetwork } from './networks';

export interface SendResult {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  network: string;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
}

export interface SendOptions {
  network?: string;
  privateKey?: string;
  gasLimit?: string;
  gasPrice?: string;
}

/**
 * Send native tokens (ETH, MATIC, etc.)
 */
export async function sendTransaction(
  toAddress: string,
  amount: string,
  fromPrivateKey: string,
  options: SendOptions = {}
): Promise<SendResult> {
  const networkId = options.network || 'ethereum';
  const network = getNetwork(networkId);
  
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  if (!fromPrivateKey || !fromPrivateKey.startsWith('0x')) {
    throw new Error('Invalid private key. Must start with 0x');
  }

  const { Wallet, parseEther, formatEther } = require('ethers');

  try {
    const provider = getProvider(networkId);
    const wallet = new Wallet(fromPrivateKey, provider);

    // Parse amount
    const amountWei = parseEther(amount);

    // Build transaction
    const tx: any = {
      to: toAddress,
      value: amountWei,
    };

    // Add optional gas params
    if (options.gasLimit) {
      tx.gasLimit = options.gasLimit;
    }
    if (options.gasPrice) {
      tx.gasPrice = options.gasPrice;
    }

    // Send transaction
    const response = await wallet.sendTransaction(tx);

    return {
      txHash: response.hash,
      from: wallet.address,
      to: toAddress,
      amount,
      symbol: network.symbol,
      network: networkId,
      nonce: response.nonce,
      gasLimit: response.gasLimit?.toString(),
      gasPrice: response.gasPrice?.toString(),
    };
  } catch (error) {
    throw new Error(`Failed to send transaction: ${(error as Error).message}`);
  }
}

/**
 * ERC-20 Token ABI (for transfers)
 */
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

/**
 * Send ERC-20 tokens
 */
export async function sendToken(
  toAddress: string,
  amount: string,
  tokenAddress: string,
  fromPrivateKey: string,
  options: SendOptions = {}
): Promise<SendResult> {
  const networkId = options.network || 'ethereum';
  const network = getNetwork(networkId);
  
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  if (!fromPrivateKey || !fromPrivateKey.startsWith('0x')) {
    throw new Error('Invalid private key. Must start with 0x');
  }

  const { Contract, Wallet, parseUnits, formatUnits } = require('ethers');

  try {
    const provider = getProvider(networkId);
    const wallet = new Wallet(fromPrivateKey, provider);

    // Get token contract for decimals and symbol
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const [decimals, symbol] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol(),
    ]);

    // Parse amount
    const amountWei = parseUnits(amount, decimals);

    // Create transfer contract
    const transferContract = new Contract(tokenAddress, ERC20_ABI, wallet);

    // Build transaction
    const tx = await transferContract.transfer(toAddress, amountWei);

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      from: wallet.address,
      to: toAddress,
      amount,
      symbol,
      network: networkId,
    };
  } catch (error) {
    throw new Error(`Failed to send token: ${(error as Error).message}`);
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  toAddress: string,
  amount: string,
  fromAddress: string,
  networkId: string = 'ethereum',
  isToken: boolean = false,
  tokenAddress?: string
): Promise<string> {
  const provider = getProvider(networkId);

  if (isToken && tokenAddress) {
    const { Contract } = require('ethers');
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const data = tokenContract.interface.encodeFunctionData('transfer', [toAddress, amount]);
    
    const estimate = await provider.estimateGas({
      from: fromAddress,
      to: tokenAddress,
      data,
    });
    
    return estimate.toString();
  }

  const { parseEther } = require('ethers');
  const estimate = await provider.estimateGas({
    from: fromAddress,
    to: toAddress,
    value: parseEther(amount),
  });

  return estimate.toString();
}
