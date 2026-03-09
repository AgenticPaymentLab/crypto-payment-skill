#!/usr/bin/env node
/**
 * CLI for transaction queries
 * Usage: crypto-tx <tx_hash> [--network <network>]
 * Usage: crypto-tx status <tx_hash> [--network <network>]
 */

export {}; // Make this a module

const { getTransaction, getTransactionStatus } = require('../transaction');

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: crypto-tx <tx_hash> [--network <network>]');
    console.error('Usage: crypto-tx status <tx_hash> [--network <network>]');
    console.error('Example: crypto-tx 0x123abc...def');
    console.error('Example: crypto-tx status 0x123abc...def');
    process.exit(1);
  }

  // Check for status subcommand
  let command = 'get';
  let txHash = args[0];
  let network = 'ethereum';

  if (txHash === 'status') {
    command = 'status';
    txHash = args[1];
    if (!txHash) {
      console.error('Usage: crypto-tx status <tx_hash> [--network <network>]');
      process.exit(1);
    }
  }

  // Parse remaining args
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      network = args[++i];
    }
  }

  // Validate tx hash
  if (!txHash.startsWith('0x')) {
    console.error('Invalid transaction hash. Must start with 0x');
    process.exit(1);
  }

  try {
    let result;
    
    if (command === 'status') {
      result = await getTransactionStatus(txHash, network);
      console.log(JSON.stringify(result, null, 2));
    } else {
      result = await getTransaction(txHash, network);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

run();
