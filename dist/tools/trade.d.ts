/**
 * trade_token — Buy or sell tokens on Solana DEXes
 * detect_dex — Detect which DEX/AMM a token trades on
 *
 * Supports 12+ DEXes: PumpSwap, Raydium, Meteora, Orca, etc.
 * Requires SOLANA_PRIVATE_KEY for trade execution.
 * detect_dex is always available (read-only).
 */
import { z } from 'zod';
export declare const detectDexSchema: z.ZodObject<{
    mint: z.ZodString;
}, "strip", z.ZodTypeAny, {
    mint: string;
}, {
    mint: string;
}>;
export type DetectDexInput = z.infer<typeof detectDexSchema>;
export declare function handleDetectDex(input: DetectDexInput): Promise<string>;
export declare const tradeTokenSchema: z.ZodObject<{
    wallet: z.ZodString;
    mint: z.ZodString;
    action: z.ZodEnum<["buy", "sell"]>;
    amount: z.ZodString;
    slippage: z.ZodOptional<z.ZodNumber>;
    mode: z.ZodOptional<z.ZodEnum<["fast", "stable"]>>;
    use_jito: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    mint: string;
    wallet: string;
    action: "buy" | "sell";
    amount: string;
    mode?: "fast" | "stable" | undefined;
    slippage?: number | undefined;
    use_jito?: boolean | undefined;
}, {
    mint: string;
    wallet: string;
    action: "buy" | "sell";
    amount: string;
    mode?: "fast" | "stable" | undefined;
    slippage?: number | undefined;
    use_jito?: boolean | undefined;
}>;
export type TradeTokenInput = z.infer<typeof tradeTokenSchema>;
export declare function handleTradeToken(input: TradeTokenInput): Promise<string>;
