/**
 * Wallet Authentication — ECDSA Client-Side Signing
 *
 * Signs SHA-256(wallet:timestamp) with the XRPL-derived private key.
 * Server verifies signature and derives address from the public key.
 * No shared secrets — cryptographic wallet ownership proof.
 *
 * Usage:
 *   import { getAuthHeaders, authenticatedFetch, clearWalletAuth } from '@/lib/walletAuth';
 *
 *   // Include headers in protected requests
 *   const headers = await getAuthHeaders(walletAddress);
 *   fetch('/api/v1/affiliate/dashboard/' + wallet, { headers });
 */

import { getPrivateKey } from './web3auth';

// =====================================================================
// XRPL Key Derivation (matches iOS XRPLKeyDerivation / Android XRPLKeyDerivation)
// =====================================================================

const CURVE_ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

/** Import noble libraries dynamically to avoid SSR issues */
async function getNoble() {
  const [secp, hashes] = await Promise.all([
    import('@noble/secp256k1'),
    import('@noble/hashes/sha512')
  ]);
  return { secp, sha512: hashes.sha512 };
}

async function getSha256() {
  const mod = await import('@noble/hashes/sha256');
  return mod.sha256;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function bigintToBytes32(n: bigint): Uint8Array {
  const hex = n.toString(16).padStart(64, '0');
  return hexToBytes(hex);
}

function bytesToBigint(bytes: Uint8Array): bigint {
  return BigInt('0x' + bytesToHex(bytes));
}

/** Replicates ripple-keypairs deriveScalar */
async function deriveScalar(
  bytes: Uint8Array,
  discriminator: number | null,
  sha512fn: (data: Uint8Array) => Uint8Array
): Promise<bigint> {
  for (let counter = 0; counter <= 0xFFFFFFFF; counter++) {
    // Build input: bytes [+ discriminator_u32be] + counter_u32be
    const parts: Uint8Array[] = [bytes];
    if (discriminator !== null) {
      const disc = new Uint8Array(4);
      new DataView(disc.buffer).setUint32(0, discriminator, false);
      parts.push(disc);
    }
    const cnt = new Uint8Array(4);
    new DataView(cnt.buffer).setUint32(0, counter, false);
    parts.push(cnt);

    const totalLen = parts.reduce((s, p) => s + p.length, 0);
    const input = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
      input.set(p, offset);
      offset += p.length;
    }

    const digest = sha512fn(input);
    const first256 = digest.slice(0, 32);
    const val = bytesToBigint(first256);

    if (val > BigInt(0) && val < CURVE_ORDER) {
      return val;
    }
  }
  throw new Error('Could not derive scalar');
}

/** Derive XRPL signing keypair from Web3Auth secp256k1 key (matches iOS/Android) */
async function deriveXrplKeypair(web3AuthKeyHex: string): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  const { secp, sha512 } = await getNoble();

  // 1. Pad to 64 hex (32 bytes), take first 16 bytes as seed entropy
  const paddedHex = web3AuthKeyHex.padStart(64, '0');
  const fullKey = hexToBytes(paddedHex);
  const seedEntropy = fullKey.slice(0, 16);

  // 2. Root private generator
  const rootPrivGen = await deriveScalar(seedEntropy, null, sha512);

  // 3. Public generator (compressed)
  const pubGenPoint = secp.ProjectivePoint.BASE.multiply(rootPrivGen);
  const pubGenBytes = pubGenPoint.toRawBytes(true); // compressed

  // 4. Account scalar with discriminator 0
  const accountScalar = await deriveScalar(pubGenBytes, 0, sha512);

  // 5. Final private key = (accountScalar + rootPrivGen) mod curveOrder
  const finalPrivKey = (accountScalar + rootPrivGen) % CURVE_ORDER;

  // 6. Final public key (compressed)
  const finalPubPoint = secp.ProjectivePoint.BASE.multiply(finalPrivKey);
  const finalPubBytes = finalPubPoint.toRawBytes(true); // compressed

  return {
    privateKey: bigintToBytes32(finalPrivKey),
    publicKey: finalPubBytes
  };
}

// =====================================================================
// ECDSA Signing
// =====================================================================

/** Encode a BigInt as a DER integer (with leading 0x00 pad if high bit set). */
function derEncodeInteger(n: bigint): Uint8Array {
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  // Pad with 0x00 if high bit is set (DER signed integer)
  if (parseInt(hex[0], 16) >= 8) hex = '00' + hex;
  return hexToBytes(hex);
}

/**
 * Sign a message with ECDSA secp256k1 and return DER-encoded signature hex.
 */
async function ecdsaSign(messageHash: Uint8Array, privateKey: Uint8Array): Promise<string> {
  const secp = await import('@noble/secp256k1');
  const { hmac } = await import('@noble/hashes/hmac');
  const sha256 = await getSha256();
  // noble/secp256k1 v2 requires hmacSha256Sync for deterministic signing
  secp.etc.hmacSha256Sync = (k: Uint8Array, ...m: Uint8Array[]) =>
    hmac(sha256, k, secp.etc.concatBytes(...m));
  const sig = secp.sign(messageHash, privateKey);
  // DER encode: SEQUENCE { INTEGER r, INTEGER s }
  const rBytes = derEncodeInteger(sig.r);
  const sBytes = derEncodeInteger(sig.s);
  const rTlv = new Uint8Array([0x02, rBytes.length, ...rBytes]);
  const sTlv = new Uint8Array([0x02, sBytes.length, ...sBytes]);
  const inner = new Uint8Array([...rTlv, ...sTlv]);
  const der = new Uint8Array([0x30, inner.length, ...inner]);
  return bytesToHex(der);
}

// =====================================================================
// Public API
// =====================================================================

/**
 * Get ECDSA auth headers for authenticated requests.
 * Returns headers with wallet address, timestamp, signature, and public key.
 */
export async function getAuthHeaders(walletAddress: string): Promise<Record<string, string>> {
  if (!walletAddress) return {};

  try {
    const rawKey = await getPrivateKey();
    if (!rawKey) {
      console.warn('No Web3Auth private key available for ECDSA signing');
      return {};
    }

    // Derive XRPL keypair from Web3Auth key
    const keypair = await deriveXrplKeypair(rawKey);

    // Build message and hash
    const timestamp = Date.now().toString();
    const message = `${walletAddress}:${timestamp}`;
    const sha256 = await getSha256();
    const msgHash = sha256(new TextEncoder().encode(message));

    // Sign
    const signatureHex = await ecdsaSign(msgHash, keypair.privateKey);
    const publicKeyHex = bytesToHex(keypair.publicKey);

    return {
      'x-wallet-address': walletAddress,
      'x-wallet-timestamp': timestamp,
      'x-wallet-signature': signatureHex,
      'x-wallet-publickey': publicKeyHex
    };
  } catch (err) {
    console.error('ECDSA auth signing failed:', err);
    return {};
  }
}

/**
 * Make an authenticated fetch request with ECDSA headers.
 */
export async function authenticatedFetch(
  walletAddress: string,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders(walletAddress);

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
 * Clear wallet auth state (no-op with ECDSA since there's no cache).
 * Kept for API compatibility.
 */
export function clearWalletAuth(_walletAddress?: string): void {
  // No cache to clear with ECDSA — signing is done fresh each request
}

/**
 * Check if auth is available (Web3Auth session must be active).
 */
export function hasValidAuthToken(_walletAddress: string): boolean {
  // With ECDSA, auth is available as long as Web3Auth is connected
  return typeof window !== 'undefined';
}

// Legacy exports for backwards compatibility during migration
export const refreshWalletAuth = async (_walletAddress: string) => true;
export const getWalletAuthHeaders = (_walletAddress: string) => ({});
export const getWalletAuthHeadersAsync = getAuthHeaders;
