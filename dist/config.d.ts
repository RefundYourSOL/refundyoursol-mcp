/**
 * RefundYourSOL MCP Configuration
 *
 * Environment variables:
 * - RYS_API_URL: Backend API URL (default: https://refundyoursol.com)
 * - RYS_API_KEY: Optional API key for authenticated requests
 * - SOLANA_PRIVATE_KEY: Base58 private key for signing transactions (optional — scan-only mode if omitted)
 * - SOLANA_RPC_URL: Solana RPC endpoint (default: https://api.mainnet-beta.solana.com)
 * - RYS_PRIORITY_FEE: Priority fee in microLamports (default: 50000)
 */
export declare const config: {
    apiUrl: string;
    apiKey: string;
    privateKey: string;
    rpcUrl: string;
    priorityFee: number;
};
export declare function hasSigningCapability(): boolean;
export declare function getApiHeaders(): Record<string, string>;
