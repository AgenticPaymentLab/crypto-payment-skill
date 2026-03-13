#!/usr/bin/env node
/**
 * CLI for checking crypto balances
 * Usage: crypto-balance <address> [--network <network>] [--token <token_address>] [--all-chains]
 */

export {}; // Make this a module

const { 
  getBalance, 
  getTokenBalance, 
  getMultiChainBalance,
  parseAddressInput,
  formatMultiChainBalance,
  getBalanceCheckHistory,
  clearBalanceCheckHistory
} = require('../balance');

const { listNetworks } = require('../networks');

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: crypto-balance <address> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --network <network>     Check specific network (ethereum, polygon, base, arbitrum, etc.)');
    console.error('  --token <address>        Check ERC-20 token balance');
    console.error('  --all-chains             Check balance across all supported chains');
    console.error('  --check-sufficient <amt> Check if balance is sufficient for amount');
    console.error('  --history                Show balance check attempt history');
    console.error('');
    console.error('Examples:');
    console.error('  crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b');
    console.error('  crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network polygon');
    console.error('  crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --all-chains');
    console.error('  crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    process.exit(1);
  }

  // Parse arguments
  let address = args[0];
  let network = 'ethereum';
  let tokenAddress: string | undefined;
  let checkAllChains = false;
  let checkSufficient: string | undefined;
  let showHistory = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      network = args[++i];
    } else if (args[i] === '--token' && i + 1 < args.length) {
      tokenAddress = args[++i];
    } else if (args[i] === '--all-chains') {
      checkAllChains = true;
    } else if (args[i] === '--check-sufficient' && i + 1 < args.length) {
      checkSufficient = args[++i];
    } else if (args[i] === '--history') {
      showHistory = true;
    }
  }

  // Parse address input (may include network prefix)
  const parsed = parseAddressInput(address);
  address = parsed.address;
  if (parsed.network !== 'ethereum') {
    network = parsed.network;
  }

  try {
    // Multi-chain balance check
    if (checkAllChains) {
      const networks = listNetworks().map(n => n.id);
      const result = await getMultiChainBalance(address, networks);
      
      if (showHistory) {
        console.log('=== Balance Check History ===');
        const history = getBalanceCheckHistory();
        for (const attempt of history) {
          console.log(`  ${attempt.source}: ${attempt.success ? 'OK' : 'FAILED'}${attempt.balance ? ` (${attempt.balance})` : ''}${attempt.error ? ` - ${attempt.error}` : ''}`);
        }
        console.log('');
      }
      
      console.log(formatMultiChainBalance(result));
      process.exit(0);
    }

    let result;
    
    if (tokenAddress) {
      result = await getTokenBalance(address, tokenAddress, network);
    } else {
      result = await getBalance(address, network);
    }

    // Show history if requested or if balance is 0
    if (showHistory || result.balance === '0.000000') {
      console.log('=== Balance Check History ===');
      const history = getBalanceCheckHistory();
      for (const attempt of history) {
        console.log(`  ${attempt.source}: ${attempt.success ? 'OK' : 'FAILED'}${attempt.balance ? ` (${attempt.balance})` : ''}${attempt.error ? ` - ${attempt.error}` : ''}`);
      }
      console.log('');
    }

    // Check sufficient funds if requested
    if (checkSufficient) {
      const needed = parseFloat(checkSufficient);
      const current = parseFloat(result.balance);
      const sufficient = current >= needed;
      
      console.log(JSON.stringify({
        sufficient,
        balance: result.balance,
        needed: checkSufficient,
        symbol: result.symbol,
        network: result.network,
        source: result.source,
      }, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    // Show history on error too
    if (showHistory) {
      console.log('=== Balance Check History ===');
      const history = getBalanceCheckHistory();
      for (const attempt of history) {
        console.log(`  ${attempt.source}: ${attempt.success ? 'OK' : 'FAILED'}${attempt.error ? ` - ${attempt.error}` : ''}`);
      }
      console.log('');
    }
    
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

run();
