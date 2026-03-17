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

export const config = {
  apiUrl: process.env.RYS_API_URL || 'https://refundyoursol.com',
  apiKey: process.env.RYS_API_KEY || '',
  privateKey: process.env.SOLANA_PRIVATE_KEY || '',
  rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  priorityFee: parseInt(process.env.RYS_PRIORITY_FEE || '50000', 10),
};

export function hasSigningCapability(): boolean {
  return config.privateKey.length > 0;
}

export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-RYS-Source': 'mcp',
  };
  if (config.apiKey) {
    headers['x-api-key'] = config.apiKey;
  }
  return headers;
}
