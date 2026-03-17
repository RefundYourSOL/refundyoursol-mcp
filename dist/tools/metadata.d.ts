/**
 * get_token_info — Get token metadata, price, and market data
 * get_sol_price — Get current SOL/USD price
 *
 * Both are read-only, no private key required.
 */
import { z } from 'zod';
export declare const getTokenInfoSchema: z.ZodObject<{
    mints: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strip", z.ZodTypeAny, {
    mints: string | string[];
}, {
    mints: string | string[];
}>;
export type GetTokenInfoInput = z.infer<typeof getTokenInfoSchema>;
export declare function handleGetTokenInfo(input: GetTokenInfoInput): Promise<string>;
export declare const getSolPriceSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare function handleGetSolPrice(): Promise<string>;
