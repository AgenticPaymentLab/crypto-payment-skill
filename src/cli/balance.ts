#!/usr/bin/env node
/**
 * CLI for checking crypto balances
 * Usage: crypto-balance <address> [--network <network>] [--token <token_address>]
 */

export {}; // Make this a module

const { getBalance, getTokenBalance, parseAddressInput } = require('../balance');

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: crypto-balance <address> [--network <network>] [--token <token_address>]');
    console.error('Example: crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b');
    console.error('Example: crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    process.exit(1);
  }

  // Parse arguments
  let address = args[0];
  let network = 'ethereum';
  let tokenAddress: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      network = args[++i];
    } else if (args[i] === '--token' && i + 1 < args.length) {
      tokenAddress = args[++i];
    }
  }

  // Parse address input (may include network prefix)
  const parsed = parseAddressInput(address);
  address = parsed.address;
  if (parsed.network !== 'ethereum') {
    network = parsed.network;
  }

  try {
    let result;
    
    if (tokenAddress) {
      result = await getTokenBalance(address, tokenAddress, network);
    } else {
      result = await getBalance(address, network);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

run();
