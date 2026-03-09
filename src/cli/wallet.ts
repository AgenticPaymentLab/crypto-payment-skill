#!/usr/bin/env node
/**
 * CLI for wallet management
 * Usage: crypto-wallet <command> [options]
 * Commands: create, list, address, delete
 */

export {}; // Make this a module

const { createWallet, listWallets, getWalletAddress, getWallet, deleteWallet } = require('../wallet');

async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.error('Usage: crypto-wallet <command> [options]');
    console.error('Commands:');
    console.error('  crypto-wallet create [--network <network>] [--label <label>]');
    console.error('  crypto-wallet list');
    console.error('  crypto-wallet address <wallet_id>');
    console.error('  crypto-wallet delete <wallet_id>');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'create': {
        let network = 'ethereum';
        let label: string | undefined;

        for (let i = 1; i < args.length; i++) {
          if (args[i] === '--network' && i + 1 < args.length) {
            network = args[++i];
          } else if (args[i] === '--label' && i + 1 < args.length) {
            label = args[++i];
          }
        }

        const wallet = createWallet({ network, label });
        
        console.log('Wallet created successfully!');
        console.log(JSON.stringify(wallet, null, 2));
        console.log('\n⚠️  Save the private key securely - it cannot be recovered!');
        break;
      }

      case 'list': {
        const wallets = listWallets();
        if (wallets.length === 0) {
          console.log('No wallets found. Create one with: crypto-wallet create');
        } else {
          console.log(JSON.stringify(wallets, null, 2));
        }
        break;
      }

      case 'address': {
        const identifier = args[1];
        if (!identifier) {
          console.error('Usage: crypto-wallet address <wallet_id>');
          process.exit(1);
        }

        const address = getWalletAddress(identifier);
        if (!address) {
          console.error(`Wallet not found: ${identifier}`);
          process.exit(1);
        }

        console.log(address);
        break;
      }

      case 'delete': {
        const identifier = args[1];
        if (!identifier) {
          console.error('Usage: crypto-wallet delete <wallet_id>');
          process.exit(1);
        }

        const deleted = deleteWallet(identifier);
        if (deleted) {
          console.log(`Wallet ${identifier} deleted successfully`);
        } else {
          console.error(`Wallet not found: ${identifier}`);
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run crypto-wallet without arguments for usage');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

run();
