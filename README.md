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

# Optional: For sending transactions
export CRYPTO_PRIVATE_KEY="your-private-key"
```

## Commands

### Check Balance

```bash
# Check native token balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b

# Check balance on specific network
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network polygon

# Check ERC-20 token balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

### Send Transaction

```bash
# Send native tokens
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1

# Send on specific network
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --network polygon

# Send ERC-20 tokens
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 100 --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

### Wallet Management

```bash
# Create new wallet
crypto-wallet create

# Create wallet with label
crypto-wallet create --label "primary"

# List wallets
crypto-wallet list

# Get wallet address
crypto-wallet address <wallet_id>

# Delete wallet
crypto-wallet delete <wallet_id>
```

### Transaction Info

```bash
# Get transaction details
crypto-tx 0x123abc...def

# Get transaction status
crypto-tx status 0x123abc...def

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
- Sepolia (Testnet)

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
