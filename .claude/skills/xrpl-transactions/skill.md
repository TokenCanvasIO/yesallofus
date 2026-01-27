# XRPL Transactions

## Overview

The app operates on the XRP Ledger (XRPL) mainnet using RLUSD (Ripple's USD stablecoin) for payments. Three wallet providers are supported: Web3Auth (social/biometric login), Xaman (formerly XUMM), and Crossmark. Transactions are signed client-side and submitted to the ledger.

## RLUSD Token

```typescript
const RLUSD_HEX = '524C555344000000000000000000000000000000';  // 40-char hex encoding
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De';   // Ripple's official issuer
```

Defined in: `components/WithdrawRLUSD.tsx` (lines 5-6), `components/WalletFunding.tsx` (lines 8-9), `components/OnboardingSetup.tsx` (lines 26-31)

Additional token: USDC is also referenced:
```typescript
const USDC_CURRENCY = '5553444300000000000000000000000000000000';
```

## Wallet Providers

### Web3Auth (lib/web3auth.ts)
- **Client ID:** line 5
- **Network:** `SAPPHIRE_MAINNET` (line 39)
- **RPC:** `https://xrplcluster.com` (line 25)
- **WebSocket:** `wss://xrplcluster.com` (line 26)
- **Block Explorer:** `https://livenet.xrpl.org` (line 27)
- **Social providers:** Google, Apple, GitHub, Discord, Twitter, Facebook
- **Key method:** `xrpl_getAccounts` returns wallet address (line 55)
- **Submit method:** `xrpl_submitTransaction` (used in WithdrawRLUSD.tsx line 101)
- **Instance caching:** Singleton pattern at lines 8-15 for reuse across withdrawals

### Xaman (formerly XUMM)
- **Login:** `POST /api/v1/xaman/login` → returns QR + deep link
- **Poll:** `GET /api/v1/xaman/login/poll/{loginId}` every 3s
- **Payment:** `POST /api/v1/xaman/payment` → QR for payment signing
- **Poll payment:** `GET /api/v1/xaman/payment/poll/{id}` every 2s
- **Status values:** `signed`, `expired`, `cancelled`, `failed`
- **Files:** `components/WalletSettings.tsx` (lines 109-159), `components/LoginScreen.tsx` (lines 135-156)

### Crossmark
- **SDK:** `https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js`
- **Method:** `window.xrpl.crossmark.request({ method: 'xrpl_signTransaction', params: { transaction } })`
- **Files:** `components/TapToPaySettings.tsx` (lines 261-277), `app/(main)/dashboard/page.tsx` (lines 990-1009)

## Transaction Types

### 1. Payment (RLUSD Transfer)
```typescript
{
  TransactionType: 'Payment',
  Account: walletAddress,
  Destination: destinationAddress,
  Amount: {
    currency: RLUSD_HEX,
    issuer: RLUSD_ISSUER,
    value: amount.toString()
  }
}
```
**File:** `components/WithdrawRLUSD.tsx` (lines 89-99)

### 2. TrustSet (Enable RLUSD)
```typescript
{
  TransactionType: 'TrustSet',
  Account: walletAddress,
  LimitAmount: {
    currency: RLUSD_HEX,
    issuer: RLUSD_ISSUER,
    value: '1000000'
  }
}
```
**Files:** `components/WalletFunding.tsx` (line 316), `app/(main)/dashboard/page.tsx` (line 934), `app/(noheader)/take-payment/page.tsx` (line 927)

### 3. SignerListSet (Auto-Sign)
```typescript
{
  TransactionType: 'SignerListSet',
  Account: walletAddress,
  SignerQuorum: 1,
  SignerEntries: [{
    SignerEntry: {
      Account: platformSignerAddress,
      SignerWeight: 1
    }
  }]
}
```
**Files:** `components/TapToPaySettings.tsx` (lines 145-157), `components/WalletSettings.tsx` (lines 243-255)

## Auto-Sign System

Allows the platform to sign transactions on behalf of the user (for tap-to-pay and sound payments).

### Setup Flow
1. `POST /nfc/api/v1/nfc/customer/setup-autosign` → returns `platformSignerAddress`
2. Build SignerListSet transaction adding platform as signer
3. Submit via Web3Auth/Xaman/Crossmark
4. Wait 2 seconds for ledger confirmation
5. `GET /nfc/api/v1/nfc/customer/verify-autosign/{wallet}` → confirms setup
6. Register sound device for SoundPay

### Limits
- Max single payout: £25 (configurable)
- Daily limit: £100 (configurable)
- Tracked server-side

### Revocation
- `POST /nfc/api/v1/nfc/customer/revoke-autosign` removes platform signer
- Re-enables manual approval

### Status Check
- `GET /nfc/api/v1/nfc/customer/autosign-status/{wallet}` returns enabled/disabled

## Transaction Verification

- XRPL Explorer link: `https://livenet.xrpl.org/transactions/{txHash}`
- Shown in `PaymentSuccess.tsx` (line 124) and `SoundPaymentPage.tsx` (lines 412-420)
- Transaction hash (`tx_hash`) returned from payment API and stored with receipt

## Wallet Address Validation

```typescript
const validateXRPAddress = (address: string): boolean => {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
};
```
**File:** `components/WithdrawRLUSD.tsx` (lines 43-45)

## Conversion Rate System

- **Endpoint:** `GET /convert/gbp-to-rlusd?amount={amount}&capture=true`
- **Poll interval:** 10 seconds (page.tsx line 121)
- **Fallback rate:** 1.35 GBP to RLUSD (page.tsx line 137)
- **Response:**
  ```typescript
  {
    rate: {
      gbp_to_rlusd: number,
      rlusd_gbp: number,
      source: string,       // "CoinGecko Pro API"
      captured_at: string   // ISO timestamp
    },
    rlusd: number,
    price_age_ms: number
  }
  ```
- Rate displayed with CoinGecko attribution and <0.1% variance note

## Wallet Status Checking

**Endpoint:** `GET /nfc/api/v1/wallet/status/{walletAddress}`

Returns:
- XRP balance
- RLUSD balance
- Funding status (wallet activated on ledger)
- Trustline status (RLUSD trustline exists)

## Key Files

| File | Role |
|------|------|
| `lib/web3auth.ts` | Web3Auth initialization, login, logout |
| `components/WithdrawRLUSD.tsx` | RLUSD withdrawal with address validation |
| `components/WalletSettings.tsx` | Auto-sign setup/revocation, wallet management |
| `components/TapToPaySettings.tsx` | Customer tap-to-pay auto-sign setup |
| `components/WalletFunding.tsx` | Wallet status display, trustline setup |
| `components/LoginScreen.tsx` | Multi-wallet login (Xaman/Web3Auth/Crossmark) |
| `components/TopUpRLUSD.tsx` | RLUSD top-up flows |
| `components/OnboardingSetup.tsx` | First-time wallet + trustline onboarding |
| `app/(main)/trustline/page.tsx` | Trustline setup guide |
| `app/(main)/dashboard/page.tsx` | Store dashboard with wallet management |
