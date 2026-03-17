/**
 * close_accounts — Close empty token accounts and reclaim SOL rent
 * burn_and_close — Burn dust tokens and close accounts in one step
 *
 * Requires SOLANA_PRIVATE_KEY to be configured.
 * Uses a dry-run/confirm pattern for safety.
 */
import { z } from 'zod';
export declare const closeAccountsSchema: z.ZodObject<{
    wallet: z.ZodString;
    confirm_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    wallet: string;
    confirm_token?: string | undefined;
}, {
    wallet: string;
    confirm_token?: string | undefined;
}>;
export type CloseAccountsInput = z.infer<typeof closeAccountsSchema>;
export declare function handleCloseAccounts(input: CloseAccountsInput): Promise<string>;
export declare const burnAndCloseSchema: z.ZodObject<{
    wallet: z.ZodString;
    confirm_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    wallet: string;
    confirm_token?: string | undefined;
}, {
    wallet: string;
    confirm_token?: string | undefined;
}>;
export type BurnAndCloseInput = z.infer<typeof burnAndCloseSchema>;
export declare function handleBurnAndClose(input: BurnAndCloseInput): Promise<string>;
