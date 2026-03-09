# crypto-payment-skill

GitHub Skill for crypto payment operations: balance checks, payments, wallet management via crypto APIs.

## Overview

This skill provides GitHub-native tooling for crypto payment operations, enabling agents to check balances, send payments, and manage wallets through various crypto APIs.

## Commands

- `crypto-balance <address>` - Check native token balance for an address
- `crypto-balance <network>/<address>` - Check balance on specific network
- `crypto-balance <address> --token <token_address>` - Check ERC-20 token balance
- `crypto-send <to_address> <amount>` - Send native tokens
- `crypto-send <to_address> <amount> --network <network>` - Send on specific network
- `crypto-send <to_address> <amount> --token <token_address>` - Send ERC-20 tokens
- `crypto-wallet create` - Create a new wallet
- `crypto-wallet list` - List managed wallets
- `crypto-wallet address <wallet_id>` - Get address for a wallet
- `crypto-tx <tx_hash>` - Get transaction details
- `crypto-tx status <tx_hash>` - Check transaction status
- `crypto-networks` - List supported networks

## Supported Networks

- Ethereum Mainnet
- Polygon
- BSC (Binance Smart Chain)
- Arbitrum
- Optimism
- Avalanche C-Chain

## Configuration

Set `CRYPTO_API_KEY` in environment variables for API access. Currently supports:
- Alchemy (recommended)
- Infura
- CoinGecko (for price lookups)

## Usage Examples

```bash
# Check ETH balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b

# Check token balance
crypto-balance 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# Send tokens
crypto-send 0x742d35Cc6634C0532925a3b844Bc9e7595f4fC5b 0.1 --network ethereum

# Create wallet
crypto-wallet create

# Check transaction
crypto-tx 0x123...abc
```

## Integration

This skill can be invoked by agents or CLI tools. Returns structured JSON output for programmatic use.
