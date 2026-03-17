/**
 * trade_token — Buy or sell tokens on Solana DEXes
 * detect_dex — Detect which DEX/AMM a token trades on
 *
 * Supports 12+ DEXes: PumpSwap, Raydium, Meteora, Orca, etc.
 * Requires SOLANA_PRIVATE_KEY for trade execution.
 * detect_dex is always available (read-only).
 */
import { z } from 'zod';
import { trade, detectDex } from '../services/api.js';
import { config } from '../config.js';
// ============================================================================
// Detect DEX
// ============================================================================
export const detectDexSchema = z.object({
    mint: z.string().min(32).max(44).describe('Token mint address (base58)'),
});
export async function handleDetectDex(input) {
    try {
        const result = await detectDex(input.mint);
        if (!result.success) {
            return JSON.stringify({
                success: false,
                error: result.error || 'Token not found on any supported DEX',
            });
        }
        return JSON.stringify({
            success: true,
            mint: input.mint,
            dex: result.dex,
            amm: result.amm,
            poolAddress: result.poolAddress,
            token: {
                name: result.tokenName,
                symbol: result.tokenSymbol,
                priceUsd: result.priceUsd,
                marketCapUsd: result.marketCapUsd,
                liquidityUsd: result.liquidityUsd,
            },
        }, null, 2);
    }
    catch (error) {
        return JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
// ============================================================================
// Trade Token
// ============================================================================
export const tradeTokenSchema = z.object({
    wallet: z.string().min(32).max(44).describe('Solana wallet address (base58)'),
    mint: z.string().min(32).max(44).describe('Token mint address to trade'),
    action: z.enum(['buy', 'sell']).describe('"buy" (SOL to token) or "sell" (token to SOL)'),
    amount: z.string().describe('Amount to trade. For buy: SOL amount (e.g. "0.1"). For sell: token amount or percentage (e.g. "100%" to sell all)'),
    slippage: z.number().optional().describe('Slippage tolerance in percent (default: 15)'),
    mode: z.enum(['fast', 'stable']).optional().describe('"fast" for ~150-400ms (fire-and-forget), "stable" for full confirmation (default)'),
    use_jito: z.boolean().optional().describe('Use Jito bundle for MEV protection (sandwich-resistant)'),
});
export async function handleTradeToken(input) {
    try {
        if (!config.privateKey) {
            return JSON.stringify({
                success: false,
                error: 'Trading requires SOLANA_PRIVATE_KEY to be configured.',
            });
        }
        const result = await trade({
            wallet: input.wallet,
            mint: input.mint,
            action: input.action,
            amount: input.amount,
            privateKey: config.privateKey,
            slippage: input.slippage || 15,
            mode: input.mode || 'stable',
            useJito: input.use_jito,
        });
        if (!result.success) {
            return JSON.stringify({
                success: false,
                error: result.error || 'Trade failed',
            });
        }
        return JSON.stringify({
            success: true,
            action: input.action,
            dex: result.dex,
            amountIn: result.amountIn,
            amountOut: result.amountOut,
            signature: result.signature,
            processingTime: result.processingTime ? `${result.processingTime}ms` : undefined,
        }, null, 2);
    }
    catch (error) {
        return JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
//# sourceMappingURL=trade.js.map