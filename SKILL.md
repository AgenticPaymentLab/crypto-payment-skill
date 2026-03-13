# crypto-payment-skill

GitHub Skill for crypto payment operations: balance checks, payments, wallet management via crypto APIs.

## Overview

This skill provides GitHub-native tooling for crypto payment operations, enabling agents to check balances, send payments, and manage wallets through various crypto APIs. Supports wallet persistence, recovery, and balance monitoring.

**Key Feature: Multi-Source Balance Checking** - Never get false $0 balance again! The skill uses multiple sources in priority order and tracks all attempts.

## Commands

### Balance Operations
- `crypto-balance <address>` - Check native token balance using multi-source fallback
- `crypto-balance <network>/<address>` - Check balance on specific network
- `crypto-balance <address> --token <token_address>` - Check ERC-20 token balance
- `crypto-balance <address> --check-sufficient <amount>` - Check if balance is sufficient for amount (returns true/false)
- `crypto-balance <address> --all-chains` - Check balance across ALL supported chains
- `crypto-balance <address> --history` - Show balance check attempt history (which sources were tried)

### Send Operations
- `crypto-send <to_address> <amount>` - Send native tokens
- `crypto-send <to_address> <amount> --network <network>` - Send on specific network
- `crypto-send <to_address> <amount> --token <token_address>` - Send ERC-20 tokens
- `crypto-send <to_address> <amount> --confirm` - Wait for on-chain confirmation

### Wallet Operations
- `crypto-wallet create` - Create a new wallet (saves seed phrase + private key securely)
- `crypto-wallet list` - List managed wallets
- `crypto-wallet address <wallet_id>` - Get address for a wallet
- `crypto-wallet import <seed_phrase>` - Import wallet from seed phrase (for recovery)
- `crypto-wallet backup <wallet_id>` - Export wallet details (seed + private key) for backup
- `crypto-wallet fund` - Get wallet address for receiving funds

### Transaction Operations
- `crypto-tx <tx_hash>` - Get transaction details
- `crypto-tx status <tx_hash>` - Check transaction status (pending/confirmed/failed)
- `crypto-tx status <tx_hash> --watch` - Monitor until confirmed

### Network Operations
- `crypto-networks` - List supported networks

## Multi-Source Balance Checking

The skill now uses a **priority-based fallback system** to ensure you never get a false $0 balance:

### Priority Order
1. **Block Explorer API** (primary) - Most reliable, doesn't depend on RPC
2. **Alchemy SDK** - Fast, reliable
3. **Multiple RPC Endpoints** - Public RPCs with automatic retry
4. **Block Explorer Scraping** - Last resort fallback

### How It Works
- Each balance check attempts multiple sources in priority order
- If one source fails or returns $0, it automatically tries the next
- All attempts are logged and can be viewed with `--history`
- If ALL sources fail, you get a detailed error message showing what was tried

### Never Return False $0
```bash
# If RPC fails but explorer has balance, you'll get the real balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --history
# Output shows: block-explorer-api: OK (15.5), alchemy: FAILED (timeout), public-rpc-1: FAILED (connection refused)
```

## Multi-Chain Support

Check your total balance across multiple chains!

### Check All Chains at Once
```bash
# Get balance breakdown across all supported chains
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --all-chains

# Output:
# Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b
# Total: 25.5 ETH-equivalent
# Sources: block-explorer-api, alchemy
#
# Breakdown:
#   ethereum: 10.5 ETH [block-explorer-api]
#   polygon: 5.0 MATIC [alchemy]
#   base: 8.0 ETH [alchemy]
#   arbitrum: 2.0 ETH [block-explorer-api]
#
# Errors:
#   optimism: RPC timeout
```

### Supported Networks
- Ethereum Mainnet
- Polygon
- BSC (Binance Smart Chain)
- Arbitrum
- Optimism
- Avalanche C-Chain
- Base
- Solana

## Configuration

Set environment variables for API access. Supports multiple providers with automatic fallback:

```bash
# Required for blockchain operations (at least one recommended)
export ALCHEMY_API_KEY="your-alchemy-api-key"
export INFURA_API_KEY="your-infura-api-key"

# Optional: Block Explorer API Keys (improves reliability)
export ETHERSCAN_API_KEY="your-etherscan-api-key"
export POLYSCAN_API_KEY="your-polygonscan-api-key"
export BASESCAN_API_KEY="your-basescan-api-key"
export ARBISCAN_API_KEY="your-arbiscan-api-key"

# Optional: For sending transactions (if not using wallet-based signing)
export CRYPTO_PRIVATE_KEY="your-private-key"

# Optional: Wallet storage location
export CRYPTO_WALLET_DIR="$HOME/.crypto-wallets"
```

### Provider Fallback Order
1. Alchemy (recommended)
2. Infura
3. Multiple Public RPCs (automatic retry)
4. Block Explorer API
5. Block Explorer Scraping (last resort)

## Usage Examples

### Balance Check with Multi-Source Fallback
```bash
# Check balance - automatically uses best available source
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b

# See which sources were tried
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --history
```

### Multi-Chain Balance Check
```bash
# Check balance across ALL chains
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --all-chains

# Check specific networks only
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network polygon
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network base
```

### Balance Check with Sufficient Funds Verification
```bash
# Check if wallet has enough for payment
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --check-sufficient 10
# Returns: { "sufficient": true, "balance": "15.5", "needed": "10" }
```

### Create and Manage Wallet
```bash
# Create new wallet (automatically saves seed phrase)
crypto-wallet create
# Returns: { "walletId": "wallet_abc123", "address": "0x...", "seedPhrase": "word1 word2 ..." }

# List managed wallets
crypto-wallet list

# Get wallet address
crypto-wallet address wallet_abc123

# Backup wallet (export seed phrase + private key)
crypto-wallet backup wallet_abc123
```

### Import/Recover Wallet
```bash
# Import from seed phrase (recovery)
crypto-wallet import "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
# Returns: { "walletId": "wallet_xyz789", "address": "0x..." }
```

### Send with Confirmation
```bash
# Send tokens and wait for confirmation
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --network base --confirm
# Returns: { "txHash": "0x...", "status": "confirmed", "confirmations": 1 }
```

### Monitor Transaction
```bash
# Watch transaction until confirmed
crypto-tx status 0x123abc --watch
# Polls until confirmed or failed
```

## Error Handling

The skill includes robust error handling:

| Error | Handling |
|-------|----------|
| Insufficient funds | Returns clear error with current balance |
| Network failure | Auto-fallback to next provider (Alchemy→Infura→Public RPC→Explorer) |
| RPC timeout | Try next RPC endpoint, then block explorer API |
| All sources fail | Detailed error listing all attempted sources & URLs to check manually |
| Wallet access denied | Prompt for recovery or create new |
| Transaction failed | Returns failure reason |
| Invalid address | Validation before send |

### Example Error (All Sources Failed)
```
Error: Failed to get balance from all sources for 0x... on ethereum:
  - alchemy: FAILED: Timeout
  - infura: FAILED: Rate limited
  - public-rpc-1: FAILED: Connection refused
  - public-rpc-2: FAILED: Timeout
  - block-explorer-api: FAILED: Rate limited

If you believe this address has funds, please check:
1. The address is correct
2. The network is correct
3. Set ETHERSCAN_API_KEY for your network
4. Check the block explorer manually: https://etherscan.io/address/0x...
```

## Wallet Storage

Wallets are stored securely in `~/.crypto-wallets/` (configurable via `CRYPTO_WALLET_DIR`):

```
~/.crypto-wallets/
├── wallets.json       # Wallet metadata (IDs, addresses)
├── wallet_<id>.enc   # Encrypted seed phrases
└── backup/           # Manual backups (optional)
```

**Security:** Seed phrases are encrypted at rest. Only the agent can decrypt using the storage key.

## Integration

This skill can be invoked by agents or CLI tools. Returns structured JSON output for programmatic use.

## Recent Updates (2026-03-13)

### Multi-Source Balance Checking (NEW!)
- ✅ Block Explorer API as primary source (most reliable)
- ✅ Multiple RPC endpoints with automatic retry
- ✅ Never return false $0 balance
- ✅ Detailed error messages with all attempted sources
- ✅ Balance check history with `--history` flag

### Multi-Chain Support (NEW!)
- ✅ Check balance across ALL chains with `--all-chains`
- ✅ Aggregate total across chains
- ✅ Per-chain breakdown with source information
- ✅ Shows which sources succeeded/failed per chain

### Existing Features
- ✅ Wallet recovery via seed phrase
- ✅ Wallet backup/export
- ✅ Balance sufficiency check
- ✅ Transaction confirmation monitoring
- ✅ Provider auto-fallback (Alchemy → Infura → Public RPC)
- ✅ Base & Solana support

---

# Crypto Payment Skill

GitHub Skill for crypto payment operations: balance checks, payments, wallet management via crypto APIs.

## Installation

```bash
npm install -g crypto-payment-skill
```

## Configuration

Set the following environment variables:

```bash
# Required for blockchain operations (at least one recommended)
export ALCHEMY_API_KEY="your-alchemy-api-key"
export INFURA_API_KEY="your-infura-api-key"

# Optional: Block Explorer API Keys (improves reliability)
export ETHERSCAN_API_KEY="your-etherscan-api-key"
export POLYSCAN_API_KEY="your-polygonscan-api-key"
export BASESCAN_API_KEY="your-basescan-api-key"
export ARBISCAN_API_KEY="your-arbiscan-api-key"

# Optional: Wallet storage location
export CRYPTO_WALLET_DIR="$HOME/.crypto-wallets"
```

## New Features (Updated 2026-03-13)

### 🔒 Multi-Source Balance Checking
- Block Explorer API as primary (most reliable)
- Multiple RPC endpoints with automatic retry
- Never returns false $0 balance
- Detailed error messages with all attempted sources
- Use `--history` to see which sources were tried

### 🌐 Multi-Chain Support
- Check balance across ALL chains with `--all-chains`
- Aggregate total across chains
- Per-chain breakdown with source information

### Existing Features
- ✅ Wallet recovery via seed phrase
- ✅ Wallet backup/export
- ✅ Balance sufficiency check
- ✅ Transaction confirmation monitoring
- ✅ Provider auto-fallback
- ✅ Base & Solana support

## Commands

### Check Balance

```bash
# Check native token balance (uses multi-source fallback)
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b

# Check balance on specific network
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network polygon

# Check across ALL chains
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --all-chains

# See which sources were tried
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --history

# Check ERC-20 token balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# Check if balance is sufficient for amount
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --check-sufficient 10
```

### Multi-Chain Examples

```bash
# Get full breakdown across all chains
$ crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --all-chains
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b
Total: 25.5 ETH-equivalent
Sources: block-explorer-api, alchemy

Breakdown:
  ethereum: 10.5 ETH [block-explorer-api]
  polygon: 5.0 MATIC [alchemy]
  base: 8.0 ETH [alchemy]
  arbitrum: 2.0 ETH [block-explorer-api]

Errors:
  optimism: RPC timeout
```

### Send Transaction

```bash
# Send native tokens
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1

# Send on specific network
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --network polygon

# Send ERC-20 tokens
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 100 --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# Send and wait for confirmation
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --confirm
```

### Wallet Management

```bash
# Create new wallet (saves seed phrase securely)
crypto-wallet create

# Create wallet with label
crypto-wallet create --label "primary"

# List wallets
crypto-wallet list

# Get wallet address
crypto-wallet address <wallet_id>

# Import wallet from seed phrase (recovery)
crypto-wallet import "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"

# Backup wallet (export seed + private key)
crypto-wallet backup <wallet_id>

# Get wallet address for receiving funds
crypto-wallet fund
```

### Transaction Info

```bash
# Get transaction details
crypto-tx 0x123abc...def

# Get transaction status
crypto-tx status 0x123abc...def

# Monitor until confirmed
crypto-tx status 0x123abc...def --watch

# Specify network
crypto-tx 0x123abc...def --network polygon
```

### Networks

```bash
# List supported networks
crypto-networks
```

## Supported Networks

- Ethereum Mainnet
- Polygon
- BSC (Binance Smart Chain)
- Arbitrum
- Optimism
- Avalanche C-Chain
- Base
- Solana
- Sepolia (Testnet)

## Error Handling

| Error | Handling |
|-------|----------|
| Insufficient funds | Returns current balance |
| Network failure | Auto-fallback to next provider (tries up to 5 sources) |
| All sources fail | Detailed error with all attempted sources & manual check URLs |
| Wallet access denied | Prompt for recovery |
| Invalid address | Validation before send |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## License

MIT
