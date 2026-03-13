# crypto-payment-skill

GitHub Skill for crypto payment operations: balance checks, payments, wallet management via crypto APIs.

## Overview

This skill provides GitHub-native tooling for crypto payment operations, enabling agents to check balances, send payments, and manage wallets through various crypto APIs. Supports wallet persistence, recovery, and balance monitoring.

## Commands

### Balance Operations
- `crypto-balance <address>` - Check native token balance for an address
- `crypto-balance <network>/<address>` - Check balance on specific network
- `crypto-balance <address> --token <token_address>` - Check ERC-20 token balance
- `crypto-balance <address> --check-sufficient <amount>` - Check if balance is sufficient for amount (returns true/false)

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

## Supported Networks

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
# Required for blockchain operations
export ALCHEMY_API_KEY="your-alchemy-api-key"

# Optional: Fallback providers
export INFURA_API_KEY="your-infura-api-key"

# Optional: For sending transactions (if not using wallet-based signing)
export CRYPTO_PRIVATE_KEY="your-private-key"

# Optional: Wallet storage location
export CRYPTO_WALLET_DIR="$HOME/.crypto-wallets"
```

### Provider Fallback Order
1. Alchemy (recommended)
2. Infura
3. Public RPC (fallback only)

## Usage Examples

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
| Network failure | Auto-fallback to next provider |
| Wallet access denied | Prompt for recovery or create new |
| Transaction failed | Returns failure reason |
| Invalid address | Validation before send |

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

- Added wallet recovery via seed phrase import
- Added wallet backup/export functionality
- Added balance sufficiency check before payments
- Added transaction confirmation monitoring
- Added provider fallback (Alchemy → Infura → public RPC)
- Added Base and Solana network support
- Improved error messages with actionable guidance
