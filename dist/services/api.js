/**
 * RefundYourSOL API client
 * Wraps all backend API calls used by the MCP tools
 */
import { config, getApiHeaders } from '../config.js';
async function apiPost(path, body) {
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
    return res.json();
}
async function apiGet(path, params) {
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
    return res.json();
}
export async function scanWallet(walletAddress) {
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
            error: data.error || 'Scan failed',
        };
    }
    // API returns { wallets: [{ address, emptyAccounts, potentialReward, accounts: [...] }] }
    const wallets = data.wallets || [];
    const wallet = wallets[0] || {};
    const accounts = wallet.accounts || [];
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
export async function closeAccounts(walletAddress, privateKey, accounts) {
    const data = await apiPost('/api/closeAccounts', {
        wallets: [{ address: walletAddress, privateKey }],
        mode: 'close',
    });
    return {
        success: data.success,
        signature: data.signature,
        accountsClosed: data.accountsClosed,
        solRecovered: data.solRecovered,
        error: data.error,
    };
}
export async function burnAndClose(walletAddress, privateKey, accounts) {
    const data = await apiPost('/api/closeAccounts', {
        wallets: [{ address: walletAddress, privateKey }],
        mode: 'all',
    });
    return {
        success: data.success,
        signature: data.signature,
        accountsClosed: data.accountsClosed,
        solRecovered: data.solRecovered,
        error: data.error,
    };
}
export async function trade(params) {
    const data = await apiPost('/api/trade', {
        ...params,
        slippage: params.slippage || 15,
        mode: params.mode || 'stable',
    });
    return {
        success: data.success,
        signature: data.signature,
        dex: data.dex,
        amountIn: data.amountIn,
        amountOut: data.amountOut,
        processingTime: data.processingTime,
        error: data.error,
    };
}
export async function detectDex(mint) {
    const data = await apiGet(`/api/trade/detect/${mint}`);
    return {
        success: data.success,
        amm: data.amm,
        dex: data.dex,
        poolAddress: data.poolAddress,
        tokenName: data.tokenName,
        tokenSymbol: data.tokenSymbol,
        priceUsd: data.priceUsd,
        marketCapUsd: data.marketCapUsd,
        liquidityUsd: data.liquidityUsd,
        error: data.error,
    };
}
export async function getTokenMetadata(mints) {
    const data = await apiPost('/api/token-metadata', {
        mints,
        apiKey: config.apiKey,
    });
    if (!data.success)
        return [];
    return data.tokens || [];
}
export async function getSolPrice() {
    const data = await apiGet('/api/solana-price');
    return data.solanaPrice || 0;
}
//# sourceMappingURL=api.js.map