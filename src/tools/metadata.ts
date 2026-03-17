/**
 * get_token_info — Get token metadata, price, and market data
 * get_sol_price — Get current SOL/USD price
 *
 * Both are read-only, no private key required.
 */

import { z } from 'zod';
import { getTokenMetadata, getSolPrice, detectDex } from '../services/api.js';

// ============================================================================
// Token Info (metadata + price + market data)
// ============================================================================

export const getTokenInfoSchema = z.object({
  mints: z.union([
    z.string().min(32).max(44),
    z.array(z.string().min(32).max(44)),
  ]).describe('Token mint address(es) — single string or array of up to 10 mints'),
});

export type GetTokenInfoInput = z.infer<typeof getTokenInfoSchema>;

export async function handleGetTokenInfo(input: GetTokenInfoInput): Promise<string> {
  try {
    const mintList = Array.isArray(input.mints) ? input.mints : [input.mints];

    if (mintList.length > 10) {
      return JSON.stringify({ success: false, error: 'Maximum 10 mints per request' });
    }

    // Fetch metadata and market data in parallel
    const [metadata, ...detections] = await Promise.all([
      getTokenMetadata(mintList),
      ...mintList.map(mint => detectDex(mint).catch(() => null)),
    ]);

    const tokens = mintList.map((mint, i) => {
      const meta = metadata.find(m => m.mint === mint);
      const detection = detections[i];

      return {
        mint,
        name: meta?.name || detection?.tokenName || 'Unknown',
        symbol: meta?.symbol || detection?.tokenSymbol || 'Unknown',
        image: meta?.image,
        priceUsd: meta?.price || detection?.priceUsd,
        dex: detection?.dex,
        poolAddress: detection?.poolAddress,
        marketCapUsd: detection?.marketCapUsd,
        liquidityUsd: detection?.liquidityUsd,
      };
    });

    return JSON.stringify({
      success: true,
      tokens,
    }, null, 2);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// SOL Price
// ============================================================================

export const getSolPriceSchema = z.object({});

export async function handleGetSolPrice(): Promise<string> {
  try {
    const price = await getSolPrice();
    return JSON.stringify({
      success: true,
      solPriceUsd: price,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
