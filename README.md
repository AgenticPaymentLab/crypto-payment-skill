# Crypto Payment Skill

GitHub Skill for crypto payment operations: balance checks, payments, wallet management via crypto APIs.

## Installation

```bash
npm install -g crypto-payment-skill
```

## Configuration

Set the following environment variables:

```bash
# Required for blockchain operations
export ALCHEMY_API_KEY="your-alchemy-api-key"

# Optional: Fallback providers
export INFURA_API_KEY="your-infura-api-key"

# Optional: Wallet storage location
export CRYPTO_WALLET_DIR="$HOME/.crypto-wallets"
```

## New Features (Updated 2026-03-13)

- ✅ Wallet recovery via seed phrase
- ✅ Wallet backup/export
- ✅ Balance sufficiency check
- ✅ Transaction confirmation monitoring
- ✅ Provider auto-fallback
- ✅ Base & Solana support

## Commands

### Check Balance

```bash
# Check native token balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b

# Check balance on specific network
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network polygon

# Check ERC-20 token balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# Check if balance is sufficient for amount
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --check-sufficient 10
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
| Network failure | Auto-fallback to next provider |
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
