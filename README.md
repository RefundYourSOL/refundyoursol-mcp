# @refundyoursol/mcp

MCP (Model Context Protocol) server for [RefundYourSOL](https://refundyoursol.com) — the most widely used Solana wallet cleanup tool with 500K+ wallets processed.

Provides AI agents with tools for Solana wallet cleanup, token trading on 12+ DEXes, and token metadata/pricing.

## Tools

### Always Available (no private key needed)

| Tool | Description |
|------|-------------|
| `scan_wallet` | Scan a wallet for reclaimable SOL locked in empty token accounts (~0.002 SOL each) |
| `detect_dex` | Detect which DEX a token trades on + price, market cap, liquidity |
| `get_token_info` | Get metadata and pricing for one or more tokens |
| `get_sol_price` | Get current SOL/USD price |

### Require Private Key

| Tool | Description |
|------|-------------|
| `close_accounts` | Close empty token accounts and reclaim rent SOL |
| `burn_and_close` | Burn dust tokens and close accounts in one step |
| `trade_token` | Buy or sell tokens on 12+ DEXes (PumpSwap, Raydium, Meteora, Orca, etc.) |

## Quick Start

### Claude Desktop / Cursor / Windsurf

Add to your MCP config (`claude_desktop_config.json` or equivalent):

```json
{
  "mcpServers": {
    "refundyoursol": {
      "command": "npx",
      "args": ["-y", "@refundyoursol/mcp"],
      "env": {
        "SOLANA_PRIVATE_KEY": "your-base58-private-key",
        "SOLANA_RPC_URL": "https://your-rpc-endpoint.com"
      }
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add refundyoursol \
  -e SOLANA_PRIVATE_KEY=your-base58-key \
  -e SOLANA_RPC_URL=https://your-rpc.com \
  -- npx -y @refundyoursol/mcp
```

### Scan-Only Mode (no private key)

Omit `SOLANA_PRIVATE_KEY` to run in scan-only mode with 4 read-only tools:

```json
{
  "mcpServers": {
    "refundyoursol": {
      "command": "npx",
      "args": ["-y", "@refundyoursol/mcp"]
    }
  }
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SOLANA_PRIVATE_KEY` | — | Base58 private key for signing (optional — scan-only mode if omitted) |
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint |
| `RYS_API_URL` | `https://refundyoursol.com` | RefundYourSOL backend |
| `RYS_API_KEY` | — | API key for token metadata/pricing endpoints |
| `RYS_PRIORITY_FEE` | `50000` | Priority fee in microLamports |

## Usage Examples

Once connected, ask your AI assistant:

- "Scan my wallet for reclaimable SOL"
- "Close all empty token accounts in my wallet"
- "What DEX does this token trade on? [mint address]"
- "Buy 0.1 SOL of [token] on Solana"
- "Sell 100% of [token] with Jito MEV protection"
- "What's the current SOL price?"

## Safety

- **Dry-run first**: `close_accounts` and `burn_and_close` use a two-step pattern — first call shows a preview, second call with the execution token confirms
- **Safety Burns**: Accidental burns can be reverted (unique to RefundYourSOL)
- **Non-custodial**: Keys are used locally for signing only, never sent to any server
- **Execution tokens expire**: 60-second TTL prevents stale operations

## Features vs Competitors

| Feature | RefundYourSOL MCP | UnclaimedSOL MCP |
|---------|-------------------|------------------|
| Wallet scan | Yes | Yes |
| Close accounts | Yes | Yes |
| Burn & close | Yes | Yes |
| Safety burns (revertible) | Yes | No |
| Token trading (12+ DEXes) | Yes | No |
| DEX detection | Yes | No |
| Token metadata/pricing | Yes | No |
| Fee matching (down to 2%) | Yes | No (fixed 5%) |
| Fee Payer mode (0 SOL) | Yes | No |

## Links

- **Website**: [refundyoursol.com](https://refundyoursol.com)
- **API Docs**: [refundyoursol.com/docs](https://refundyoursol.com/docs)
- **Blog**: [refundyoursol.com/blog](https://refundyoursol.com/blog)
- **Twitter/X**: [@refundyoursol](https://x.com/refundyoursol)
- **Telegram**: [t.me/refundyoursol](https://t.me/refundyoursol)

## License

MIT
