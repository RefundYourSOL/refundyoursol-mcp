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
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { hasSigningCapability } from './config.js';
// Tool handlers
import { scanWalletSchema, handleScanWallet } from './tools/scan.js';
import { closeAccountsSchema, handleCloseAccounts, burnAndCloseSchema, handleBurnAndClose } from './tools/close.js';
import { detectDexSchema, handleDetectDex, tradeTokenSchema, handleTradeToken } from './tools/trade.js';
import { getTokenInfoSchema, handleGetTokenInfo, getSolPriceSchema, handleGetSolPrice } from './tools/metadata.js';
async function main() {
    const server = new McpServer({
        name: 'refundyoursol',
        version: '1.0.0',
    });
    // ========================================================================
    // Read-only tools (always available)
    // ========================================================================
    server.tool('scan_wallet', 'Scan a Solana wallet for reclaimable SOL locked in empty token accounts. Returns count of closeable accounts and estimated SOL recoverable. Free, read-only — no private key needed.', scanWalletSchema.shape, async (input) => ({
        content: [{ type: 'text', text: await handleScanWallet(input) }],
    }));
    server.tool('detect_dex', 'Detect which DEX/AMM a Solana token trades on. Returns DEX name, pool address, token name/symbol, price, market cap, and liquidity. Supports PumpSwap, Raydium, Meteora, Orca, and more.', detectDexSchema.shape, async (input) => ({
        content: [{ type: 'text', text: await handleDetectDex(input) }],
    }));
    server.tool('get_token_info', 'Get metadata and pricing for one or more Solana tokens. Returns name, symbol, image, USD price, DEX, market cap, and liquidity. Pass a single mint or array of up to 10.', getTokenInfoSchema.shape, async (input) => ({
        content: [{ type: 'text', text: await handleGetTokenInfo(input) }],
    }));
    server.tool('get_sol_price', 'Get the current SOL/USD price.', getSolPriceSchema.shape, async () => ({
        content: [{ type: 'text', text: await handleGetSolPrice() }],
    }));
    // ========================================================================
    // Signing tools (require SOLANA_PRIVATE_KEY)
    // ========================================================================
    if (hasSigningCapability()) {
        server.tool('close_accounts', 'Close empty Solana token accounts and reclaim rent SOL (~0.002 SOL per account). First call returns a dry-run preview with a confirm_token. Call again with the confirm_token to execute. Safety Burns: accidental burns can be reverted.', closeAccountsSchema.shape, async (input) => ({
            content: [{ type: 'text', text: await handleCloseAccounts(input) }],
        }));
        server.tool('burn_and_close', 'Burn worthless dust tokens and close the accounts in one step, reclaiming rent SOL. For accounts with small leftover token balances that cannot be closed directly. Uses dry-run/confirm pattern.', burnAndCloseSchema.shape, async (input) => ({
            content: [{ type: 'text', text: await handleBurnAndClose(input) }],
        }));
        server.tool('trade_token', 'Buy or sell tokens on Solana. Supports 12+ DEXes (PumpSwap, Raydium, Meteora, Orca, etc.) with automatic routing. Fast mode (~150-400ms) or stable mode (full confirmation). Optional Jito MEV protection.', tradeTokenSchema.shape, async (input) => ({
            content: [{ type: 'text', text: await handleTradeToken(input) }],
        }));
        console.error('[RefundYourSOL MCP] Started with signing capability (7 tools)');
    }
    else {
        console.error('[RefundYourSOL MCP] Started in scan-only mode (4 tools) — set SOLANA_PRIVATE_KEY to enable trading and account closure');
    }
    // Connect via stdio
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error('[RefundYourSOL MCP] Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map