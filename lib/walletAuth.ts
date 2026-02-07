/**
 * Wallet Authentication Helper
 *
 * Provides HMAC-signed authentication for protected API endpoints.
 * The backend verifies wallet ownership via x-wallet-signature header.
 *
 * Usage:
 *   import { getWalletAuthHeaders, refreshWalletAuth } from '@/lib/walletAuth';
 *
 *   // After login, refresh the auth token
 *   await refreshWalletAuth(walletAddress);
 *
 *   // Include headers in protected requests
 *   const headers = getWalletAuthHeaders(walletAddress);
 *   fetch('/api/v1/affiliate/dashboard/' + wallet, { headers });
 */

const API_URL = 'https://api.dltpays.com/api/v1';

interface WalletAuthToken {
  wallet_address: string;
  signature: string;
  timestamp: string;
  expires_at: number; // Unix timestamp when token expires
}

// In-memory cache for auth tokens (per wallet)
const authTokenCache = new Map<string, WalletAuthToken>();

// Refresh buffer - refresh token 60 seconds before expiry
const REFRESH_BUFFER_MS = 60 * 1000;

/**
 * Fetch a new auth token from the backend
 */
export async function refreshWalletAuth(walletAddress: string): Promise<boolean> {
  if (!walletAddress) return false;

  try {
    const res = await fetch(`${API_URL}/wallet/auth-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress })
    });

    if (!res.ok) {
      console.error('Failed to get wallet auth token:', res.status);
      return false;
    }

    const data = await res.json();

    if (!data.success || !data.signature || !data.timestamp) {
      console.error('Invalid auth token response:', data);
      return false;
    }

    // Cache the token with expiry time
    const expiresAt = Date.now() + (data.expires_in || 5 * 60 * 1000) - REFRESH_BUFFER_MS;

    authTokenCache.set(walletAddress, {
      wallet_address: walletAddress,
      signature: data.signature,
      timestamp: data.timestamp,
      expires_at: expiresAt
    });

    console.log('Wallet auth token refreshed for:', walletAddress.substring(0, 8) + '...');
    return true;
  } catch (err) {
    console.error('Error refreshing wallet auth:', err);
    return false;
  }
}

/**
 * Get the cached auth token, refreshing if needed
 */
async function getAuthToken(walletAddress: string): Promise<WalletAuthToken | null> {
  if (!walletAddress) return null;

  const cached = authTokenCache.get(walletAddress);

  // If no cache or expired, refresh
  if (!cached || Date.now() >= cached.expires_at) {
    const success = await refreshWalletAuth(walletAddress);
    if (!success) return null;
    return authTokenCache.get(walletAddress) || null;
  }

  return cached;
}

/**
 * Get headers for authenticated requests (synchronous - uses cached token)
 * Call refreshWalletAuth() first to ensure token is cached
 */
export function getWalletAuthHeaders(walletAddress: string): Record<string, string> {
  if (!walletAddress) return {};

  const cached = authTokenCache.get(walletAddress);

  if (!cached || Date.now() >= cached.expires_at) {
    // Token missing or expired - return empty (caller should refresh first)
    console.warn('Wallet auth token missing or expired. Call refreshWalletAuth() first.');
    return {};
  }

  return {
    'x-wallet-signature': cached.signature,
    'x-wallet-timestamp': cached.timestamp
  };
}

/**
 * Get headers for authenticated requests (async - auto-refreshes if needed)
 */
export async function getWalletAuthHeadersAsync(walletAddress: string): Promise<Record<string, string>> {
  if (!walletAddress) return {};

  const token = await getAuthToken(walletAddress);

  if (!token) {
    console.warn('Failed to get wallet auth token');
    return {};
  }

  return {
    'x-wallet-signature': token.signature,
    'x-wallet-timestamp': token.timestamp
  };
}

/**
 * Make an authenticated fetch request
 */
export async function authenticatedFetch(
  walletAddress: string,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getWalletAuthHeadersAsync(walletAddress);

  const headers = {
    ...options.headers,
    ...authHeaders
  };

  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Clear cached auth token (call on logout)
 */
export function clearWalletAuth(walletAddress?: string): void {
  if (walletAddress) {
    authTokenCache.delete(walletAddress);
  } else {
    authTokenCache.clear();
  }
}

/**
 * Check if we have a valid (non-expired) auth token cached
 */
export function hasValidAuthToken(walletAddress: string): boolean {
  if (!walletAddress) return false;

  const cached = authTokenCache.get(walletAddress);
  return cached !== undefined && Date.now() < cached.expires_at;
}
