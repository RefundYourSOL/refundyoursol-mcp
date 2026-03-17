/**
 * close_accounts — Close empty token accounts and reclaim SOL rent
 * burn_and_close — Burn dust tokens and close accounts in one step
 *
 * Requires SOLANA_PRIVATE_KEY to be configured.
 * Uses a dry-run/confirm pattern for safety.
 */

import { z } from 'zod';
import { scanWallet, closeAccounts, burnAndClose } from '../services/api.js';
import { config } from '../config.js';

// Execution tokens for dry-run/confirm pattern
const executionTokens = new Map<string, { wallet: string; type: string; accounts: unknown[]; expires: number }>();

function generateToken(): string {
  const chars = '0123456789abcdef';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function cleanExpiredTokens() {
  const now = Date.now();
  for (const [key, val] of executionTokens) {
    if (val.expires < now) executionTokens.delete(key);
  }
}

// ============================================================================
// Close Empty Accounts
// ============================================================================

export const closeAccountsSchema = z.object({
  wallet: z.string().min(32).max(44).describe('Solana wallet address (base58)'),
  confirm_token: z.string().optional().describe('Execution token from dry run — pass this to confirm and execute the close'),
});

export type CloseAccountsInput = z.infer<typeof closeAccountsSchema>;

export async function handleCloseAccounts(input: CloseAccountsInput): Promise<string> {
  try {
    cleanExpiredTokens();

    // If confirm token provided, execute
    if (input.confirm_token) {
      const stored = executionTokens.get(input.confirm_token);
      if (!stored) {
        return JSON.stringify({ success: false, error: 'Invalid or expired execution token. Run close_accounts without confirm_token first to get a new one.' });
      }
      if (stored.wallet !== input.wallet || stored.type !== 'close') {
        return JSON.stringify({ success: false, error: 'Token does not match this wallet/operation.' });
      }
      executionTokens.delete(input.confirm_token);

      const accounts = stored.accounts as string[];
      const result = await closeAccounts(input.wallet, config.privateKey, accounts);
      return JSON.stringify({
        success: result.success,
        accountsClosed: result.accountsClosed,
        solRecovered: result.solRecovered ? `${result.solRecovered.toFixed(4)} SOL` : undefined,
        signature: result.signature,
        error: result.error,
      }, null, 2);
    }

    // Dry run — scan and return preview
    const scan = await scanWallet(input.wallet);
    if (!scan.success || scan.tokenAccounts.length === 0) {
      return JSON.stringify({
        success: true,
        message: 'No empty token accounts found to close.',
        wallet: input.wallet,
      });
    }

    const token = generateToken();
    const accountPubkeys = scan.tokenAccounts.map(a => a.pubkey);
    executionTokens.set(token, {
      wallet: input.wallet,
      type: 'close',
      accounts: accountPubkeys,
      expires: Date.now() + 60000, // 60 seconds
    });

    return JSON.stringify({
      success: true,
      dryRun: true,
      wallet: input.wallet,
      accountsToClose: scan.tokenAccounts.length,
      estimatedSolRecoverable: `${(scan.tokenAccounts.length * 0.00204).toFixed(4)} SOL`,
      confirm_token: token,
      expiresIn: '60 seconds',
      instruction: `To execute, call close_accounts again with wallet="${input.wallet}" and confirm_token="${token}"`,
    }, null, 2);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// Burn & Close (dust accounts)
// ============================================================================

export const burnAndCloseSchema = z.object({
  wallet: z.string().min(32).max(44).describe('Solana wallet address (base58)'),
  confirm_token: z.string().optional().describe('Execution token from dry run — pass this to confirm and execute the burn+close'),
});

export type BurnAndCloseInput = z.infer<typeof burnAndCloseSchema>;

export async function handleBurnAndClose(input: BurnAndCloseInput): Promise<string> {
  try {
    cleanExpiredTokens();

    // If confirm token provided, execute
    if (input.confirm_token) {
      const stored = executionTokens.get(input.confirm_token);
      if (!stored) {
        return JSON.stringify({ success: false, error: 'Invalid or expired execution token. Run burn_and_close without confirm_token first to get a new one.' });
      }
      if (stored.wallet !== input.wallet || stored.type !== 'burn') {
        return JSON.stringify({ success: false, error: 'Token does not match this wallet/operation.' });
      }
      executionTokens.delete(input.confirm_token);

      const accounts = stored.accounts as Array<{ pubkey: string; mint: string; amount: number }>;
      const result = await burnAndClose(input.wallet, config.privateKey, accounts);
      return JSON.stringify({
        success: result.success,
        accountsClosed: result.accountsClosed,
        solRecovered: result.solRecovered ? `${result.solRecovered.toFixed(4)} SOL` : undefined,
        signature: result.signature,
        error: result.error,
      }, null, 2);
    }

    // Dry run
    const scan = await scanWallet(input.wallet);
    if (!scan.success || scan.burnAccounts.length === 0) {
      return JSON.stringify({
        success: true,
        message: 'No dust token accounts found to burn and close.',
        wallet: input.wallet,
      });
    }

    const token = generateToken();
    executionTokens.set(token, {
      wallet: input.wallet,
      type: 'burn',
      accounts: scan.burnAccounts.map(a => ({ pubkey: a.pubkey, mint: a.mint, amount: a.amount })),
      expires: Date.now() + 60000,
    });

    return JSON.stringify({
      success: true,
      dryRun: true,
      wallet: input.wallet,
      accountsToBurn: scan.burnAccounts.length,
      estimatedSolRecoverable: `${(scan.burnAccounts.length * 0.00204).toFixed(4)} SOL`,
      note: 'These accounts contain small worthless token balances (dust). They will be burned and closed in one transaction.',
      confirm_token: token,
      expiresIn: '60 seconds',
      instruction: `To execute, call burn_and_close again with wallet="${input.wallet}" and confirm_token="${token}"`,
    }, null, 2);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
