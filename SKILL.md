# crypto-payment-skill Technical Reference

This document provides complete technical documentation for the crypto-payment-skill. For a user-friendly introduction, see [README.md](README.md).

## Overview

This skill provides GitHub-native tooling for crypto payment operations, enabling AI agents to:
- Check balances across multiple chains with multi-source fallback
- Send native tokens and ERC-20 tokens
- Create, manage, import, and backup wallets
- Monitor transaction status

## Command Reference

### Balance Operations

```bash
# Check native token balance (uses multi-source fallback)
crypto-balance <address>

# Check balance on specific network
crypto-balance <address> --network <network>

# Check balance across ALL supported chains
crypto-balance <address> --all-chains

# Show balance check attempt history
crypto-balance <address> --history

# Check ERC-20 token balance
crypto-balance <address> --token <token_address>

# Check if balance is sufficient for amount
crypto-balance <address> --check-sufficient <amount>
```

### Send Operations

```bash
# Send native tokens
crypto-send <to_address> <amount>

# Send on specific network
crypto-send <to_address> <amount> --network <network>

# Send ERC-20 tokens
crypto-send <to_address> <amount> --token <token_address>

# Send and wait for on-chain confirmation
crypto-send <to_address> <amount> --confirm
```

### Wallet Operations

```bash
# Create a new wallet
crypto-wallet create

# Create wallet with custom label
crypto-wallet create --label "<label>"

# List all managed wallets
crypto-wallet list

# Get wallet address by ID
crypto-wallet address <wallet_id>

# Import wallet from seed phrase (recovery)
crypto-wallet import "<seed_phrase>"

# Backup wallet (export seed + private key)
crypto-wallet backup <wallet_id>

# Get address for receiving funds
crypto-wallet fund
```

### Transaction Operations

```bash
# Get transaction details
crypto-tx <tx_hash>

# Check transaction status
crypto-tx status <tx_hash>

# Monitor until confirmed
crypto-tx status <tx_hash> --watch

# Specify network
crypto-tx <tx_hash> --network <network>
```

### Network Operations

```bash
# List supported networks
crypto-networks
```

## Multi-Source Balance Checking

The skill uses a priority-based fallback system to ensure accurate balance checks:

### Priority Order

1. **Block Explorer API** (primary) - Most reliable, doesn't depend on RPC
2. **Alchemy SDK** - Fast, reliable
3. **Multiple RPC Endpoints** - Public RPCs with automatic retry
4. **Block Explorer Scraping** - Last resort fallback

### Behavior

- Each balance check attempts multiple sources in priority order
- If one source fails or returns $0, it automatically tries the next
- All attempts are logged and viewable with `--history`
- If ALL sources fail, returns detailed error showing what was tried

## Supported Networks

| Network | Chain ID | Native Token |
|---------|----------|--------------|
| Ethereum | 1 | ETH |
| Polygon | 137 | MATIC |
| BSC | 56 | BNB |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |
| Avalanche C-Chain | 43114 | AVAX |
| Base | 8453 | ETH |
| Solana | - | SOL |
| Sepolia | 11155111 | ETH |

## Configuration

### Environment Variables

```bash
# Required for blockchain operations (at least one recommended)
export ALCHEMY_API_KEY="your-alchemy-api-key"
export INFURA_API_KEY="your-infura-api-key"

# Optional: Block Explorer API Keys (improves reliability)
export ETHERSCAN_API_KEY="your-etherscan-api-key"
export POLYSCAN_API_KEY="your-polygonscan-api-key"
export BASESCAN_API_KEY="your-basescan-api-key"
export ARBISCAN_API_KEY="your-arbiscan-api-key"

# Optional: For direct transaction signing
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

## Wallet Storage

Wallets are stored in `~/.crypto-wallets/` (configurable):

```
~/.crypto-wallets/
├── wallets.json       # Wallet metadata (IDs, addresses)
├── wallet_<id>.enc   # Encrypted seed phrases
└── backup/           # Manual backups (optional)
```

**Security:** Seed phrases are encrypted at rest using the storage key.

## Error Handling

| Error | Handling |
|-------|----------|
| Insufficient funds | Returns current balance |
| Network failure | Auto-fallback to next provider |
| RPC timeout | Try next RPC, then block explorer API |
| All sources fail | Detailed error listing all attempted sources |
| Wallet access denied | Prompt for recovery or create new |
| Transaction failed | Returns failure reason |
| Invalid address | Validation before send |

### Example: All Sources Failed

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

## Output Format

All commands return structured JSON for programmatic use:

```bash
# Balance check
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b
# Returns: { "balance": "15.5", "symbol": "ETH", "network": "ethereum" }

# Sufficient funds check
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --check-sufficient 10
# Returns: { "sufficient": true, "balance": "15.5", "needed": "10" }

# Wallet creation
crypto-wallet create
# Returns: { "walletId": "wallet_abc123", "address": "0x...", "seedPhrase": "word1 word2 ..." }

# Transaction send
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --confirm
# Returns: { "txHash": "0x...", "status": "confirmed", "confirmations": 1 }
```
