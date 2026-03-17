/**
 * scan_wallet — Free, read-only scan of a Solana wallet for reclaimable SOL
 *
 * Identifies empty token accounts (closeable) and dust accounts (burnable)
 * holding locked rent deposits (~0.002 SOL each).
 * No private key required.
 */
import { z } from 'zod';
import { scanWallet } from '../services/api.js';
export const scanWalletSchema = z.object({
    wallet: z.string().min(32).max(44).describe('Solana wallet address (base58)'),
});
export async function handleScanWallet(input) {
    try {
        const result = await scanWallet(input.wallet);
        if (!result.success) {
            return JSON.stringify({
                success: false,
                error: result.error || 'Failed to scan wallet',
            });
        }
        const summary = {
            success: true,
            wallet: input.wallet,
            totalCloseableAccounts: result.tokenAccounts.length,
            totalBurnableAccounts: result.burnAccounts.length,
            totalAccounts: result.totalAccounts,
            estimatedSolRecoverable: `${result.totalSolRecoverable.toFixed(4)} SOL`,
            breakdown: {
                emptyAccounts: {
                    count: result.tokenAccounts.length,
                    description: 'Token accounts with 0 balance — can be closed directly to reclaim rent',
                    solRecoverable: `${(result.tokenAccounts.length * 0.00204).toFixed(4)} SOL`,
                },
                dustAccounts: {
                    count: result.burnAccounts.length,
                    description: 'Token accounts with small worthless balances — burn tokens first, then close',
                    solRecoverable: `${(result.burnAccounts.length * 0.00204).toFixed(4)} SOL`,
                },
            },
            note: result.totalAccounts > 0
                ? `Found ${result.totalAccounts} reclaimable accounts. Use close_accounts to close empty accounts, or burn_and_close for dust accounts.`
                : 'No reclaimable accounts found in this wallet.',
        };
        return JSON.stringify(summary, null, 2);
    }
    catch (error) {
        return JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
//# sourceMappingURL=scan.js.map