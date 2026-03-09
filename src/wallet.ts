/**
 * Wallet management functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const WALLET_FILE = path.join(os.homedir(), '.crypto-payment-skill', 'wallets.json');

export interface Wallet {
  id: string;
  address: string;
  createdAt: string;
  network: string;
  label?: string;
}

interface WalletStore {
  wallets: Wallet[];
}

/**
 * Ensure wallet storage directory exists
 */
function ensureWalletDir(): void {
  const dir = path.dirname(WALLET_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Load wallets from storage
 */
function loadWallets(): WalletStore {
  ensureWalletDir();
  
  if (!fs.existsSync(WALLET_FILE)) {
    return { wallets: [] };
  }

  try {
    const data = fs.readFileSync(WALLET_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { wallets: [] };
  }
}

/**
 * Save wallets to storage
 */
function saveWallets(store: WalletStore): void {
  ensureWalletDir();
  fs.writeFileSync(WALLET_FILE, JSON.stringify(store, null, 2));
}

/**
 * Generate a random wallet
 */
function generateWallet(): { address: string; privateKey: string } {
  const { Wallet, randomBytes } = require('ethers');
  
  // Generate random private key
  const privateKey = '0x' + randomBytes(32).toString('hex');
  const wallet = new Wallet(privateKey);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

/**
 * Generate a HD wallet from mnemonic
 */
function generateHDWallet(index: number = 0, mnemonic?: string): { address: string; privateKey: string; mnemonic: string } {
  const { Wallet, MnemonicNode } = require('ethers');
  const { hdkey } = require('hdkey');
  const { mnemonicToSeedSync } = require('bip39');

  let mnemon: string;
  
  if (mnemonic) {
    mnemon = mnemonic;
  } else {
    // Generate new mnemonic
    mnemon = Wallet.createRandom().mnemonic.phrase;
  }

  const seed = mnemonicToSeedSync(mnemon);
  const hdWallet = hdkey.fromMasterSeed(seed);
  
  // Derive path: m/44'/60'/0'/0/index (Ethereum)
  const path = `m/44'/60'/0'/0/${index}`;
  const child = hdWallet.derivePath(path);
  
  const wallet = new Wallet(child.getPrivateKey());

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: mnemon,
  };
}

/**
 * Create a new wallet
 */
export function createWallet(options: {
  network?: string;
  label?: string;
  mnemonic?: string;
  index?: number;
} = {}): Wallet & { privateKey: string; mnemonic?: string } {
  const network = options.network || 'ethereum';
  
  // Generate wallet
  let result;
  if (options.mnemonic || options.index !== undefined) {
    result = generateHDWallet(options.index || 0, options.mnemonic);
  } else {
    const generated = generateWallet();
    result = {
      address: generated.address,
      privateKey: generated.privateKey,
    };
  }

  // Create wallet record
  const wallet: Wallet = {
    id: generateWalletId(),
    address: result.address,
    createdAt: new Date().toISOString(),
    network,
    label: options.label,
  };

  // Save to storage
  const store = loadWallets();
  store.wallets.push(wallet);
  saveWallets(store);

  // Return with sensitive data
  return {
    ...wallet,
    privateKey: result.privateKey,
    mnemonic: (result as any).mnemonic,
  };
}

/**
 * Generate unique wallet ID
 */
function generateWalletId(): string {
  const { randomBytes } = require('ethers');
  return 'wallet_' + randomBytes(4).toString('hex');
}

/**
 * List all managed wallets
 */
export function listWallets(): Wallet[] {
  const store = loadWallets();
  return store.wallets;
}

/**
 * Get wallet address by ID or label
 */
export function getWalletAddress(identifier: string): string | undefined {
  const store = loadWallets();
  
  return store.wallets.find(
    (w) => w.id === identifier || w.label === identifier || w.address === identifier
  )?.address;
}

/**
 * Get full wallet by ID or address
 */
export function getWallet(identifier: string): Wallet | undefined {
  const store = loadWallets();
  
  return store.wallets.find(
    (w) => w.id === identifier || w.label === identifier || w.address === identifier
  );
}

/**
 * Delete a wallet
 */
export function deleteWallet(identifier: string): boolean {
  const store = loadWallets();
  const initialLength = store.wallets.length;
  
  store.wallets = store.wallets.filter(
    (w) => w.id !== identifier && w.label !== identifier && w.address !== identifier
  );

  if (store.wallets.length < initialLength) {
    saveWallets(store);
    return true;
  }

  return false;
}

/**
 * Export wallet (with private key - requires additional auth in production)
 */
export function exportWallet(identifier: string): { wallet: Wallet; privateKey: string } | undefined {
  // Note: In production, this should require additional authentication
  // For now, this is a placeholder that would need secure implementation
  const wallet = getWallet(identifier);
  
  if (!wallet) {
    return undefined;
  }

  // In a real implementation, private keys would be stored encrypted
  // and this function would require additional verification
  throw new Error('Wallet export not implemented - requires secure key storage');
}
