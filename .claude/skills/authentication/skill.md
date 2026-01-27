# Authentication

## Overview

The app uses wallet-based authentication with three providers: Web3Auth (social/biometric login), Xaman (formerly XUMM, QR-based), and Crossmark (browser extension). There are no passwords or traditional sessions — wallet addresses serve as identity. Two separate auth contexts exist: vendor (store owner) and customer/affiliate.

## Login Methods

### Web3Auth (Social/Biometric)
**File:** `lib/web3auth.ts` (77 lines)

- **SDK:** `@web3auth/modal` with `XrplPrivateKeyProvider`
- **Network:** `SAPPHIRE_MAINNET`
- **Social providers:** Google, Apple, GitHub, Discord, Twitter/X, Facebook
- **Chain:** XRPL Mainnet (`https://xrplcluster.com`)
- **Key method:** `xrpl_getAccounts` returns XRPL wallet address
- **Provider detection:** `userInfo?.authConnection` identifies which social login was used
- **Instance caching:** Singleton pattern (lines 8-15) — cached for reuse across sessions

**Functions:**
```typescript
getWeb3Auth()          // Initialize or return cached instance
loginWithWeb3Auth()    // Returns { address: string, provider: string }
logoutWeb3Auth()       // Clear cached instance + logout
```

### Xaman (QR-Based)
- **Login flow:** `POST /api/v1/xaman/login` → returns QR PNG + deep link
- **Polling:** `GET /api/v1/xaman/login/poll/{loginId}` every 3 seconds
- **Returns:** wallet address + Xaman user token
- **Files:** `components/WalletSettings.tsx` (lines 109-159), `components/LoginScreen.tsx` (lines 135-156)
- **Note:** Cannot use auto-sign — must switch to Web3Auth for tap-to-pay

### Crossmark (Browser Extension)
- **SDK:** `https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js`
- **Access:** `window.xrpl.crossmark`
- **Method:** `sdk.request({ method: 'xrpl_signTransaction', params: { transaction } })`
- **Files:** `components/TapToPaySettings.tsx` (lines 261-277), `app/(main)/connect/page.tsx`

## Login Screen

**Component:** `components/LoginScreen.tsx` (619 lines)

Multi-wallet auth component with:
- Wallet method selection (Xaman, Crossmark, Web3Auth)
- QR code display for Xaman
- Trustline confirmation step
- Terms acceptance
- Customer signup flow

**Props:**
```typescript
onLogin: (wallet: string, method: string, extras?: {
  xamanToken?: string;
  provider?: string;
}) => void
requireTrustline?: boolean
storagePrefix?: 'vendor' | 'affiliate'
```

**State:**
```typescript
connecting: 'none' | 'xaman' | 'crossmark' | 'web3auth'
xamanQR: string | null
loginId: string | null
trustlineConfirmed: boolean
```

## Session Storage

Two auth contexts (vendor vs customer/affiliate):

### Vendor
| Key | Value |
|-----|-------|
| `vendorWalletAddress` | XRPL wallet address |
| `vendorLoginMethod` | `'xaman'` \| `'crossmark'` \| `'web3auth'` |
| `storeData` | JSON: `{ store_id, store_name, store_logo }` |

### Customer/Affiliate
| Key | Value |
|-----|-------|
| `walletAddress` | XRPL wallet address |
| `loginMethod` | `'xaman'` \| `'crossmark'` \| `'web3auth'` |
| `pendingSignup` | JSON: `{ email, storeId }` (pending customer) |

### localStorage
| Key | Value |
|-----|-------|
| `yesallofus_sound_id` | Sound device ID |
| `yesallofus_sound_secret` | Sound device secret |

## Customer Signup Flow

For new customers without a wallet:

1. Customer provides email at POS
2. `POST /nfc/api/v1/nfc/complete-customer-signup` with `{ email, store_id }`
3. Stored in `pendingSignup` sessionStorage
4. Customer later completes wallet setup via Web3Auth
5. Wallet linked to existing customer record

**File:** `components/LoginScreen.tsx` (lines 53-105)

## Wallet Connection Page

`app/(main)/connect/page.tsx`:
- Standalone wallet connection flow
- Xaman QR-based: `POST /api/v1/xaman/connect` → poll with `GET /api/v1/xaman/poll/{id}`
- Saves wallet: `POST /api/v1/store/save-wallet-public`

## API Authentication

The backend does not use bearer tokens for most frontend calls. Identity is derived from:
- Wallet address passed in request body or URL path
- Store ID from session storage
- Xaman user token (for Xaman-specific operations)

**Exception:** E-commerce webhook integration uses `Authorization: Bearer {apiSecret}` header for the payout endpoint.

## Social Provider Icons

`components/WalletSettings.tsx` (lines 17-82) maps auth providers to display icons for showing which social account is connected.

## Auto-Sign (Delegated Signing)

Enables the platform to sign XRPL transactions on behalf of the user. Required for NFC and SoundPay.

**Setup:** Submits a `SignerListSet` transaction adding the platform as a signer.
**Limits:** £25 per transaction, £100 daily (configurable).
**See:** `.claude/skills/xrpl-transactions/skill.md` for full details.

## Key Files

| File | Role |
|------|------|
| `lib/web3auth.ts` | Web3Auth SDK initialization and helpers |
| `components/LoginScreen.tsx` | Multi-method login UI |
| `components/WalletSettings.tsx` | Wallet management + auto-sign |
| `components/TapToPaySettings.tsx` | Auto-sign setup for customers |
| `components/AutoSignModal.tsx` | Auto-sign confirmation modal |
| `app/(main)/connect/page.tsx` | Standalone wallet connection |
| `app/(main)/dashboard/page.tsx` | Vendor auth + wallet management |
| `app/affiliate-dashboard/page.tsx` | Affiliate auth context |
