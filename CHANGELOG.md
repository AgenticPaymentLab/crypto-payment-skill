# Changelog

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-13

### Added
- **Multi-Source Balance Checking** - Implemented priority-based fallback system to prevent false $0 balances:
  - Block Explorer API as primary source (most reliable)
  - Alchemy SDK integration
  - Multiple RPC endpoints with automatic retry
  - Block Explorer scraping as last resort
  - `--history` flag to see which sources were attempted

- **Multi-Chain Support** - Added ability to check balances across all supported chains:
  - `--all-chains` flag for aggregate balance across chains
  - Per-chain breakdown with source information
  - Shows success/failure status per chain

### Existing Features
- Wallet creation with secure seed phrase storage
- Wallet recovery via seed phrase import
- Wallet backup/export functionality
- Balance sufficiency check (`--check-sufficient`)
- Transaction sending (native and ERC-20 tokens)
- Transaction confirmation monitoring
- Provider auto-fallback (Alchemy → Infura → Public RPC)
- Multi-network support (Ethereum, Polygon, Base, Arbitrum, Optimism, Avalanche, BSC, Solana)

### Configuration
- Environment variables for API keys (ALCHEMY_API_KEY, INFURA_API_KEY)
- Block Explorer API keys for improved reliability
- Configurable wallet storage directory

---

## [0.x.x] - Previous Versions

Earlier versions included basic wallet management and balance checking capabilities with single-source RPC providers.
