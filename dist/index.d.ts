#!/usr/bin/env node
/**
 * RefundYourSOL MCP Server
 *
 * Provides Solana wallet cleanup, token trading, and metadata tools
 * for AI agents via the Model Context Protocol.
 *
 * Tools (always available):
 *   - scan_wallet: Scan a wallet for reclaimable SOL (free, read-only)
 *   - detect_dex: Detect which DEX a token trades on + market data
 *   - get_token_info: Get token metadata, price, and market data
 *   - get_sol_price: Get current SOL/USD price
 *
 * Tools (require SOLANA_PRIVATE_KEY):
 *   - close_accounts: Close empty token accounts and reclaim rent SOL
 *   - burn_and_close: Burn dust tokens and close accounts in one step
 *   - trade_token: Buy or sell tokens on 12+ Solana DEXes
 *
 * Configuration via environment variables:
 *   - SOLANA_PRIVATE_KEY: Base58 private key (optional — scan-only mode if omitted)
 *   - SOLANA_RPC_URL: RPC endpoint (default: mainnet)
 *   - RYS_API_URL: Backend URL (default: https://refundyoursol.com)
 *   - RYS_API_KEY: Optional API key
 *   - RYS_PRIORITY_FEE: Priority fee in microLamports (default: 50000)
 *
 * Usage with Claude Desktop / Cursor / Claude Code:
 *   npx @refundyoursol/mcp
 */
export {};
