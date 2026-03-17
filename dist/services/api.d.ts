/**
 * RefundYourSOL API client
 * Wraps all backend API calls used by the MCP tools
 */
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
export declare function scanWallet(walletAddress: string): Promise<ScanResult>;
export interface CloseResult {
    success: boolean;
    signature?: string;
    accountsClosed?: number;
    solRecovered?: number;
    error?: string;
}
export declare function closeAccounts(walletAddress: string, privateKey: string, accounts: string[]): Promise<CloseResult>;
export declare function burnAndClose(walletAddress: string, privateKey: string, accounts: Array<{
    pubkey: string;
    mint: string;
    amount: number;
}>): Promise<CloseResult>;
export interface TradeResult {
    success: boolean;
    signature?: string;
    dex?: string;
    amountIn?: number;
    amountOut?: number;
    processingTime?: number;
    error?: string;
}
export declare function trade(params: {
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
}): Promise<TradeResult>;
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
export declare function detectDex(mint: string): Promise<DetectResult>;
export interface TokenMetadata {
    mint: string;
    name: string;
    symbol: string;
    image?: string;
    price?: number;
}
export declare function getTokenMetadata(mints: string[]): Promise<TokenMetadata[]>;
export declare function getSolPrice(): Promise<number>;
