# Crypto Payment Skill

GitHub Skill for crypto payment operations: balance checks, payments, wallet management via crypto APIs.

## Installation

```bash
npm install -g crypto-payment-skill
```

## ⚡ New: Multi-Source Balance Checking

**Never get false $0 balance again!** The skill uses a priority-based fallback system:

### Priority Order
1. **Block Explorer API** (most reliable)
2. **Alchemy SDK**
3. **Multiple RPC Endpoints** (with retry)
4. **Block Explorer Scraping** (last resort)

```bash
# See which sources were tried
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --history
# Output: alchemy: OK (15.5), public-rpc-1: FAILED (timeout)
```

## 🌐 New: Multi-Chain Support

Check your balance across ALL supported chains at once!

```bash
# Check balance across all chains
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
- ✅ Block Explorer API as primary (most reliable)
- ✅ Multiple RPC endpoints with automatic retry
- ✅ Never returns false $0 balance
- ✅ Detailed error messages with all attempted sources
- ✅ Use `--history` to see which sources were tried

### 🌐 Multi-Chain Support
- ✅ Check balance across ALL chains with `--all-chains`
- ✅ Aggregate total across chains
- ✅ Per-chain breakdown with source information

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
