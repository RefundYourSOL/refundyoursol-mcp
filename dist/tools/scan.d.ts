/**
 * scan_wallet — Free, read-only scan of a Solana wallet for reclaimable SOL
 *
 * Identifies empty token accounts (closeable) and dust accounts (burnable)
 * holding locked rent deposits (~0.002 SOL each).
 * No private key required.
 */
import { z } from 'zod';
export declare const scanWalletSchema: z.ZodObject<{
    wallet: z.ZodString;
}, "strip", z.ZodTypeAny, {
    wallet: string;
}, {
    wallet: string;
}>;
export type ScanWalletInput = z.infer<typeof scanWalletSchema>;
export declare function handleScanWallet(input: ScanWalletInput): Promise<string>;
