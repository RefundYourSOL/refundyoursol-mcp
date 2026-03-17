/**
 * RefundYourSOL API client
 * Wraps all backend API calls used by the MCP tools
 */

import { config, getApiHeaders } from '../config.js';

interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<ApiResponse> {
  const url = `${config.apiUrl}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<ApiResponse>;
}

async function apiGet(path: string, params?: Record<string, string>): Promise<ApiResponse> {
  const url = new URL(`${config.apiUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  if (config.apiKey) {
    url.searchParams.set('apiKey', config.apiKey);
  }

  const res = await fetch(url.toString(), {
    headers: getApiHeaders(),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<ApiResponse>;
}

// ============================================================================
// Wallet Scanning
// ============================================================================

export interface ScanResult {
  success: boolean;
  totalAccounts: number;
  totalSolRecoverable: number;
  tokenAccounts: Array<{
    pubkey: string;
    mint: string;
    amount: number;
    rentLamports: number;
  }>;
  burnAccounts: Array<{
    pubkey: string;
    mint: string;
    amount: number;
    rentLamports: number;
  }>;
  error?: string;
}

export async function scanWallet(walletAddress: string): Promise<ScanResult> {
  const data = await apiPost('/api/checkTokenAccounts', {
    walletAddresses: [walletAddress],
  });

  if (!data.success) {
    return {
      success: false,
      totalAccounts: 0,
      totalSolRecoverable: 0,
      tokenAccounts: [],
      burnAccounts: [],
      error: data.error as string || 'Scan failed',
    };
  }

  // API returns { wallets: [{ address, emptyAccounts, potentialReward, accounts: [...] }] }
  const wallets = data.wallets as Array<Record<string, unknown>> || [];
  const wallet = wallets[0] || {};
  const accounts = (wallet.accounts as Array<Record<string, unknown>>) || [];

  const tokenAccounts = accounts
    .filter(a => !a.hasBalance || Number(a.balance || 0) === 0)
    .map(a => ({
      pubkey: String(a.pubkey || a.address || ''),
      mint: String(a.mint || ''),
      amount: 0,
      rentLamports: 2039280,
    }));

  const burnAccounts = accounts
    .filter(a => a.hasBalance && Number(a.balance || 0) > 0)
    .map(a => ({
      pubkey: String(a.pubkey || a.address || ''),
      mint: String(a.mint || ''),
      amount: Number(a.balance || 0),
      rentLamports: 2039280,
    }));

  const totalAccounts = tokenAccounts.length + burnAccounts.length;
  const totalSolRecoverable = Number(wallet.potentialReward || 0) || totalAccounts * 0.00204;

  return {
    success: true,
    totalAccounts,
    totalSolRecoverable,
    tokenAccounts,
    burnAccounts,
  };
}

// ============================================================================
// Account Closure
// ============================================================================

export interface CloseResult {
  success: boolean;
  signature?: string;
  accountsClosed?: number;
  solRecovered?: number;
  error?: string;
}

export async function closeAccounts(
  walletAddress: string,
  privateKey: string,
  accounts: string[],
): Promise<CloseResult> {
  const data = await apiPost('/api/closeAccounts', {
    wallets: [{ address: walletAddress, privateKey }],
    mode: 'close',
  });

  return {
    success: data.success,
    signature: data.signature as string,
    accountsClosed: data.accountsClosed as number,
    solRecovered: data.solRecovered as number,
    error: data.error as string,
  };
}

export async function burnAndClose(
  walletAddress: string,
  privateKey: string,
  accounts: Array<{ pubkey: string; mint: string; amount: number }>,
): Promise<CloseResult> {
  const data = await apiPost('/api/closeAccounts', {
    wallets: [{ address: walletAddress, privateKey }],
    mode: 'all',
  });

  return {
    success: data.success,
    signature: data.signature as string,
    accountsClosed: data.accountsClosed as number,
    solRecovered: data.solRecovered as number,
    error: data.error as string,
  };
}

// ============================================================================
// Trading
// ============================================================================

export interface TradeResult {
  success: boolean;
  signature?: string;
  dex?: string;
  amountIn?: number;
  amountOut?: number;
  processingTime?: number;
  error?: string;
}

export async function trade(params: {
  wallet: string;
  mint: string;
  action: 'buy' | 'sell';
  amount: string;
  privateKey?: string;
  slippage?: number;
  mode?: 'fast' | 'stable';
  returnTx?: boolean;
  useJito?: boolean;
  poolAddress?: string;
  amm?: string;
}): Promise<TradeResult> {
  const data = await apiPost('/api/trade', {
    ...params,
    slippage: params.slippage || 15,
    mode: params.mode || 'stable',
  });

  return {
    success: data.success,
    signature: data.signature as string,
    dex: data.dex as string,
    amountIn: data.amountIn as number,
    amountOut: data.amountOut as number,
    processingTime: data.processingTime as number,
    error: data.error as string,
  };
}

// ============================================================================
// DEX Detection
// ============================================================================

export interface DetectResult {
  success: boolean;
  amm?: string;
  dex?: string;
  poolAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  priceUsd?: number;
  marketCapUsd?: number;
  liquidityUsd?: number;
  error?: string;
}

export async function detectDex(mint: string): Promise<DetectResult> {
  const data = await apiGet(`/api/trade/detect/${mint}`);

  return {
    success: data.success,
    amm: data.amm as string,
    dex: data.dex as string,
    poolAddress: data.poolAddress as string,
    tokenName: data.tokenName as string,
    tokenSymbol: data.tokenSymbol as string,
    priceUsd: data.priceUsd as number,
    marketCapUsd: data.marketCapUsd as number,
    liquidityUsd: data.liquidityUsd as number,
    error: data.error as string,
  };
}

// ============================================================================
// Token Metadata & Pricing
// ============================================================================

export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  price?: number;
}

export async function getTokenMetadata(mints: string[]): Promise<TokenMetadata[]> {
  const data = await apiPost('/api/token-metadata', {
    mints,
    apiKey: config.apiKey,
  });

  if (!data.success) return [];
  return (data.tokens as TokenMetadata[]) || [];
}

export async function getSolPrice(): Promise<number> {
  const data = await apiGet('/api/solana-price');
  return (data.solanaPrice as number) || 0;
}
