#!/usr/bin/env node
/**
 * CLI for sending crypto
 * Usage: crypto-send <to_address> <amount> [--network <network>] [--token <token_address>] [--private-key <key>]
 */

export {}; // Make this a module

const { sendTransaction, sendToken } = require('../send');

async function run() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let toAddress = '';
  let amount = '';
  let network = 'ethereum';
  let tokenAddress: string | undefined;
  let privateKey: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (!toAddress && !args[i].startsWith('--')) {
      toAddress = args[i];
    } else if (!amount && !args[i].startsWith('--')) {
      amount = args[i];
    } else if (args[i] === '--network' && i + 1 < args.length) {
      network = args[++i];
    } else if (args[i] === '--token' && i + 1 < args.length) {
      tokenAddress = args[++i];
    } else if (args[i] === '--private-key' && i + 1 < args.length) {
      privateKey = args[++i];
    }
  }

  if (!toAddress || !amount) {
    console.error('Usage: crypto-send <to_address> <amount> [--network <network>] [--token <token_address>] [--private-key <key>]');
    console.error('Example: crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1');
    console.error('Example: crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 100 --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    process.exit(1);
  }

  // Get private key from environment if not provided
  if (!privateKey) {
    privateKey = process.env.CRYPTO_PRIVATE_KEY;
  }

  if (!privateKey) {
    console.error('Error: Private key required. Set CRYPTO_PRIVATE_KEY env var or use --private-key');
    process.exit(1);
  }

  try {
    let result;
    
    if (tokenAddress) {
      result = await sendToken(toAddress, amount, tokenAddress, privateKey, { network });
    } else {
      result = await sendTransaction(toAddress, amount, privateKey, { network });
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

run();
