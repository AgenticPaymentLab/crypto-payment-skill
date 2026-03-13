# Crypto Payment Skill

A GitHub-native skill for AI agents to handle cryptocurrency payments, balance checks, and wallet management across multiple blockchains.

## What This Skill Does

The **crypto-payment-skill** enables AI agents to:

- **Check cryptocurrency balances** across multiple chains with reliable multi-source fallback
- **Send crypto payments** (native tokens and ERC-20 tokens)
- **Create and manage wallets** with secure seed phrase storage
- **Monitor transactions** and wait for confirmations
- **Recover wallets** from seed phrases

### Key Features

- 🔄 **Multi-Source Balance Checking** — Never get a false $0 balance. The skill automatically tries multiple sources (Block Explorer API → Alchemy → RPC endpoints) to ensure accuracy.
- 🌐 **Multi-Chain Support** — Check balances across Ethereum, Polygon, Base, Arbitrum, Optimism, Avalanche, BSC, and Solana.
- 🔒 **Secure Wallet Storage** — Seed phrases are encrypted at rest.
- 🔁 **Provider Auto-Fallback** — If one provider fails, it automatically tries the next.

## Quick Start

### Installation

```bash
npm install -g crypto-payment-skill
```

### Configuration

Set up your API keys for blockchain access:

```bash
# Recommended: Alchemy or Infura (at least one)
export ALCHEMY_API_KEY="your-alchemy-api-key"
export INFURA_API_KEY="your-infura-api-key"

# Optional: Block Explorer APIs for improved reliability
export ETHERSCAN_API_KEY="your-etherscan-api-key"
export POLYSCAN_API_KEY="your-polygonscan-api-key"
export BASESCAN_API_KEY="your-basescan-api-key"
```

### Check Balance

```bash
# Check ETH balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b

# Check on specific network
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --network polygon

# Check across all chains
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --all-chains
```

### Send Crypto

```bash
# Send native tokens
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1

# Send and wait for confirmation
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --confirm

# Send ERC-20 tokens (e.g., USDC)
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 100 --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

### Wallet Management

```bash
# Create a new wallet
crypto-wallet create

# List your wallets
crypto-wallet list

# Get wallet address for receiving funds
crypto-wallet fund

# Import/Recover a wallet from seed phrase
crypto-wallet import "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"

# Backup wallet (export seed phrase + private key)
crypto-wallet backup <wallet_id>
```

### Transaction Monitoring

```bash
# Check transaction status
crypto-tx status 0x123abc...def

# Monitor until confirmed
crypto-tx status 0x123abc...def --watch
```

## Supported Networks

| Network | Native Token | Chain ID |
|---------|--------------|----------|
| Ethereum | ETH | 1 |
| Polygon | MATIC | 137 |
| Base | ETH | 8453 |
| Arbitrum | ETH | 42161 |
| Optimism | ETH | 10 |
| Avalanche C-Chain | AVAX | 43114 |
| BSC | BNB | 56 |
| Solana | SOL | - |
| Sepolia (Testnet) | ETH | 11155111 |

## Error Handling

The skill handles common errors gracefully:

| Issue | What Happens |
|-------|--------------|
| Insufficient funds | Returns current balance with error |
| Network failure | Auto-fallback to next provider |
| All sources fail | Detailed error listing what was tried |
| Invalid address | Validation before any operation |

## For Developers

See [SKILL.md](SKILL.md) for full technical documentation including:
- Complete command reference
- API configuration details
- Wallet storage architecture
- Error handling details

## License

MIT
