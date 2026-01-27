# API Endpoints

## Overview

The frontend calls a backend API at `api.dltpays.com` with three path prefixes. API URLs are hardcoded in components (no environment variables). All requests use `fetch()` with JSON payloads. No bearer token auth — identity is derived from wallet addresses.

## Base URLs

```
https://api.dltpays.com/api/v1          — General API (stores, wallets, Xaman)
https://api.dltpays.com/nfc/api/v1      — NFC/Payment/Receipt API
https://api.dltpays.com/plugins/api/v1  — E-commerce plugin API (checkout sessions)
https://api.dltpays.com/convert         — Currency conversion
```

Third-party:
```
https://tokencanvas.io/api/cloudinary/upload     — Image uploads
https://tokencanvas.io/api/coingecko/...         — Exchange rate data
```

## Standard Response Format

```json
{
  "success": boolean,
  "error"?: string,
  "message"?: string,
  "data"?: object | array
}
```

## Payment Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/nfc/api/v1/payment-link/create` | POST | Create payment link | SendPaymentLink.tsx:54 |
| `/nfc/api/v1/payment-link/{id}` | GET | Fetch payment data | pay/page.tsx:154 |
| `/nfc/api/v1/payment-link/{id}/pay` | POST | Process payment | pay/page.tsx:337 |
| `/nfc/api/v1/payment-link/{id}/tip` | POST | Save tip amount | pay/page.tsx:223 |
| `/nfc/api/v1/payment-link/{id}/split` | POST | Split bill | pay/page.tsx:417 |
| `/nfc/api/v1/payment-link/send-email` | POST | Email payment link | pay/page.tsx:1044 |
| `/nfc/api/v1/nfc/payment` | POST | Create NFC payment | take-payment/page.tsx:631 |
| `/nfc/api/v1/p/{token}?sid={soundId}` | GET | Sound payment completion | SoundPay.tsx:225 |

## Checkout Session Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/plugins/api/v1/checkout/session/{id}` | GET | Fetch session | checkout/page.tsx:115 |
| `/plugins/api/v1/checkout/session/{id}/pay` | POST | Process checkout payment | NFCTapPay.tsx:43 |

## Xaman (Wallet) Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/api/v1/xaman/login` | POST | Generate login QR | dashboard/page.tsx:813 |
| `/api/v1/xaman/login/poll/{loginId}` | GET | Poll login status | dashboard/page.tsx:429 |
| `/api/v1/xaman/payment` | POST | Create payment QR | pay/page.tsx:257 |
| `/api/v1/xaman/payment/poll/{id}` | GET | Poll payment status | pay/page.tsx:179 |
| `/api/v1/xaman/connect` | POST | Initiate wallet connection | connect/page.tsx:57 |
| `/api/v1/xaman/poll/{connectionId}` | GET | Poll connection status | connect/page.tsx:36 |
| `/api/v1/xaman/setup-autosign` | POST | Setup auto-signing | dashboard/page.tsx:950 |
| `/api/v1/xaman/verify-autosign` | GET | Verify auto-sign | dashboard/page.tsx:964 |
| `/api/v1/xaman/revoke-autosign` | POST | Revoke auto-signing | dashboard/page.tsx:1254 |

## Wallet & Customer Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/nfc/api/v1/wallet/status/{wallet}` | GET | Check balance/trustline | InstantPay.tsx:91 |
| `/api/v1/wallet/status/{wallet}` | GET | Check wallet status | dashboard/page.tsx:157 |
| `/api/v1/wallet/by-wallet/{wallet}` | GET | Load store by wallet | dashboard/page.tsx |
| `/api/v1/wallet/link-wallet` | POST | Link wallet to store | dashboard/page.tsx |
| `/nfc/api/v1/nfc/customer/autosign-status/{wallet}` | GET | Check auto-sign | InstantPay.tsx:58 |
| `/nfc/api/v1/nfc/customer/setup-autosign` | POST | Setup auto-sign | InstantPay.tsx:258 |
| `/nfc/api/v1/nfc/customer/enable-autosign` | POST | Enable auto-sign | AutoSignModal.tsx:87 |
| `/nfc/api/v1/nfc/customer/verify-autosign/{wallet}` | GET | Verify auto-sign | TapToPaySettings.tsx:171 |
| `/nfc/api/v1/nfc/customer/revoke-autosign` | POST | Revoke auto-sign | WalletSettings.tsx:294 |
| `/nfc/api/v1/nfc/complete-customer-signup` | POST | Complete email signup | LoginScreen.tsx:76 |
| `/nfc/api/v1/customer/{wallet}/logo` | PUT | Update customer logo | affiliate-dashboard |

## Store Management Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/api/v1/store/register` | POST | Register new store | cli/index.js:391 |
| `/api/v1/store/public/{storeId}` | GET | Public store data | take-payment/page.tsx:268 |
| `/api/v1/store/by-claim/{token}` | GET | Store by claim token | dashboard/page.tsx:338 |
| `/api/v1/store/by-wallet/{wallet}` | GET | Store by wallet | dashboard/page.tsx:580 |
| `/api/v1/store/claim` | POST | Claim store ownership | dashboard/page.tsx:550 |
| `/api/v1/store/link-wallet` | POST | Link wallet to store | dashboard/page.tsx:631 |
| `/api/v1/store/save-wallet-public` | POST | Save wallet address | connect/page.tsx:92 |
| `/api/v1/store/save-xaman-wallet` | POST | Save Xaman wallet | dashboard/page.tsx:615 |
| `/api/v1/store/settings` | POST | Save store settings | dashboard/page.tsx:780 |
| `/api/v1/store/regenerate-secret` | POST | Regenerate API secret | dashboard/page.tsx:752 |
| `/api/v1/store/disconnect-wallet` | POST | Disconnect wallet | dashboard/page.tsx:852 |
| `/api/v1/store/delete` | POST | Delete store | dashboard/page.tsx:1349 |
| `/api/v1/store/set-platform-return` | POST | Set return URL | dashboard/page.tsx:597 |
| `/api/v1/store/clear-platform-return` | POST | Clear return URL | dashboard/page.tsx:2976 |
| `/api/v1/store/generate-claim-token` | POST | Generate claim token | dashboard/page.tsx:2964 |
| `/nfc/api/v1/store/{id}/logo` | GET/POST | Store logo | dashboard/page.tsx:225 |
| `/api/v1/store/{id}/milestone` | GET | Store milestone | dashboard/page.tsx:306 |
| `/api/v1/store/{id}/affiliate-count` | GET | Affiliate count | dashboard/page.tsx:396 |
| `/api/v1/store/{id}/referred-vendors` | GET | Referred vendors | dashboard/page.tsx:410 |
| `/api/v1/store/lookup-referral/{code}` | GET | Lookup referral | cli/index.js:375 |

## Receipt Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/nfc/api/v1/receipts/{receiptId}` | GET | Fetch receipt | ReceiptActions.tsx:49 |
| `/nfc/api/v1/receipt/email` | POST | Email receipt | EmailReceiptModal.tsx:89 |
| `/nfc/api/v1/store/{id}/receipts` | GET | Store receipts list | analytics/page.tsx:76 |
| `/nfc/api/v1/store/{id}/pending-payments` | GET | Pending payments | PendingPayments.tsx:44 |

## NFC Card Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/nfc/api/v1/nfc/link-card` | POST | Link NFC card | LinkNFCCard.tsx |
| `/nfc/api/v1/nfc/unlink-card` | POST | Remove NFC card | LinkNFCCard.tsx |
| `/nfc/api/v1/nfc/card/{uid}/name` | PUT | Update card name | LinkNFCCard.tsx |
| `/nfc/api/v1/nfc/cards-by-wallet/{wallet}` | GET | List cards | LinkNFCCard.tsx |

## Sound Payment Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/nfc/api/v1/sound/register` | POST | Register device | LinkNFCCard.tsx |
| `/nfc/api/v1/sound/device-by-wallet/{wallet}` | GET | Get device ID | SoundPay.tsx:183 |

## Conversion Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/convert/gbp-to-rlusd?amount={n}&capture=true` | GET | Convert GBP to RLUSD | pay/page.tsx:103 |

## Display Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/nfc/api/v1/display/update` | POST | Update customer display | customerDisplay.ts:24 |
| `/api/v1/display/{storeId}` | GET | Get display config | take-payment/page.tsx:341 |
| `/api/v1/display/{storeId}/reset-confirm` | POST | Confirm display reset | take-payment/page.tsx:484 |
| `/api/v1/display/{storeId}/status` | POST | Update display status | dashboard/page.tsx:2560 |

## Affiliate Endpoints

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/api/v1/affiliate/register-public` | POST | Register affiliate | LoginScreen.tsx:117 |
| `/api/v1/store/{id}/affiliates` | GET | List affiliates | StoreActivity.tsx |
| `/api/v1/store/{id}/payouts` | GET | Payout history | StoreActivity.tsx |

## Webhook / E-commerce Integration

**Payout endpoint (for Stripe/WooCommerce/Shopify/custom):**
```
POST https://api.dltpays.com/api/v1/payout
Headers: Authorization: Bearer {apiSecret}
Body: { order_id, order_total, referral_code }
```
Documented in `cli/index.js` (lines 254-313)

## Next.js API Routes

| Route | Purpose |
|-------|---------|
| `/api/exchanges` | Proxy to CoinGecko for XRP exchange data |

## Error Handling Pattern

```typescript
try {
  const res = await fetch(url);
  const data = await res.json();
  if (data.success) { /* handle */ }
  else { setError(data.error || 'Default error'); }
} catch (err) {
  console.error('Error:', err);
  setError('Fallback error message');
}
```

## Known Error Codes

| Code | Meaning |
|------|---------|
| `NO_SIGNER_AUTHORITY` | Wallet not set up for tap-to-pay |
| `INSUFFICIENT_FUNDS` | Not enough RLUSD |
| `SELF_PAYMENT_NOT_ALLOWED` | Paying own wallet |
| `WALLET_NOT_READY` | Not funded or no trustline |

## Polling Summary

| What | Interval | Duration |
|------|----------|----------|
| Xaman payment | 2s | Until signed/cancelled/expired |
| Xaman login | 3s | Until signed |
| Pending payments | 3s | Continuous |
| Conversion rate | 10s | While payment page open |
| SoundPay status | 500ms | 8s per attempt, 3 attempts |

## Caching

- Service worker skips API calls: `public/sw.js` (lines 24-26)
- Critical fetches use `cache: 'no-store'`
- Wallet addresses cached in sessionStorage
