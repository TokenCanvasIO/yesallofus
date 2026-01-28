# Security Audit & Fix Roadmap

## Overview

This document contains a comprehensive security audit of the YesAllOfUs payment platform, covering both the Next.js frontend and Node.js/Express backend. Audit performed January 2026.

## Executive Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| **Critical** | 9 | No API auth tokens, wallet spoofing, receipt enumeration, affiliate data exposure, split rounding |
| **High** | 11 | Stale closures in payments, race conditions, missing cleanup, TOCTOU vulnerabilities |
| **Medium** | 6 | Input validation, division by zero, email validation, rate staleness |
| **Low** | 7 | Silent failures, partial Promise.all, hardcoded config |

---

## Critical Findings

### Backend Authorization Failures

#### No Auth at All

| Endpoint | File:Line | Issue |
|----------|-----------|-------|
| `GET /api/v1/affiliate/dashboard/:wallet` | `api.js:3763` | Anyone can view any affiliate's earnings, payouts, and linked stores by knowing a wallet address |
| `POST /api/v1/affiliate/delete` | `api.js:6222` | Anyone can delete any affiliate record + customer data + NFC cards |
| `GET /api/v1/receipts/:receipt_id` | `nfc-api.index.js:1875` | Anyone can fetch any receipt — contains customer_wallet, items, amounts, tx_hash |
| `POST /api/v1/ecwid/register` | `Plugin-api.js:572` | Anyone can register an Ecwid store with any vendor_wallet |

#### Client-Provided Wallet Without Signature

These endpoints check wallet matches the store record but accept wallet as a plain string — no cryptographic proof:

| Endpoint | File:Line | Risk |
|----------|-----------|------|
| `POST /api/v1/store/settings` | `api.js:4350` | Modify any store's settings |
| `POST /api/v1/store/delete` | `api.js:4684` | Delete any store |
| `GET /api/v1/store/:id/payouts` | `api.js:5725` | View any store's payout history |
| `GET /api/v1/store/:id/affiliates` | `api.js:5671` | View any store's affiliate list |
| `POST /api/v1/store/:id/milestones` | `api.js:3105` | Set milestones on any store |
| `POST /api/v1/customer/:wallet/milestones` | `api.js:3459` | Modify any customer's milestones |
| `POST /api/v1/store/autosign-settings` | `api.js:5202` | Modify auto-sign config |
| `PUT /api/v1/nfc/card/:uid/name` | `nfc-api.index.js:1086` | Rename any NFC card |
| `DELETE /api/v1/nfc/card/:uid` | `nfc-api.index.js:1193` | Delete any NFC card |
| `POST /api/v1/nfc/unlink-card` | `nfc-api.index.js:1131` | Unlink any NFC card |
| `POST /api/v1/customer/revoke-autosign` | `nfc-api.index.js:1327` | Revoke auto-sign for any wallet |

### Frontend Critical Issues

| Issue | File:Line | Risk |
|-------|-----------|------|
| Split rounding loss | `components/SplitBillModal.tsx:28` | £100/3 = £99.99, £0.01 lost |
| Split display 3 decimals | `app/pay/[paymentId]/page.tsx:962` | Shows £33.333 for GBP |
| SoundPayButton double-submit | `components/SoundPayButton.tsx:126-142` | Duplicate payment links |
| sessionStorage crashes | 142 locations | App crashes in Safari private browsing |

---

## Fix Roadmap

### Critical Priority — Immediate Action Required

| # | Issue | File:Line | Est. Time | Fix Description |
|---|-------|-----------|-----------|-----------------|
| C1 | Split rounding loss | `components/SplitBillModal.tsx:28` | 15 min | Use `Math.ceil` on last split: `lastSplit = total - (eachPays * (count - 1))` |
| C2 | Split display 3 decimals | `app/pay/[paymentId]/page.tsx:962` | 5 min | Change `.toFixed(3)` to `.toFixed(2)` |
| C3 | SoundPayButton double-submit | `components/SoundPayButton.tsx:126-142` | 15 min | `await` the display update fetch, only set `idle` after all promises resolve |
| C4 | sessionStorage crashes | All components using sessionStorage | 30 min | Create `lib/safeStorage.ts` wrapper with try/catch |
| C5 | Receipt endpoint no auth | `nfc-api.index.js:1875` | 30 min | Add wallet ownership check: require wallet_address, verify against receipt.customer_wallet OR store owner |
| C6 | Affiliate dashboard no auth | `api.js:3763` | 30 min | Add wallet signature verification middleware |
| C7 | Affiliate delete no auth | `api.js:6222` | 20 min | Require wallet signature + confirmation token |
| C8 | Ecwid register no validation | `Plugin-api.js:572` | 20 min | Validate Ecwid OAuth token ownership |
| C9 | Add wallet signature verification | Backend middleware | 1 hr | Create `verifyWalletSignature(wallet, signature, nonce)` middleware |

### High Priority — Race Conditions & Data Integrity

| # | Issue | File:Line | Est. Time | Fix Description |
|---|-------|-----------|-----------|-----------------|
| H1 | Stale closure in NFC handler | `app/pay/[paymentId]/page.tsx:326,330,362` | 20 min | Use `useRef` for `currentSplitIndex`, read `.current` inside event listener |
| H2 | Xaman poll split index race | `app/pay/[paymentId]/page.tsx:199,216` | 20 min | Remove `currentSplitIndex` from deps, use functional updater with ref |
| H3 | TOCTOU in split creation | `app/pay/[paymentId]/page.tsx:407-420` | 15 min | Add idempotency key to split request; disable button before `if` check |
| H4 | Missing `res.ok` checks | `EmailReceiptModal.tsx:68`, `SoundPaySend.tsx:107`, `pay/page.tsx:154`, `InstantPay.tsx:58,91` | 20 min | Add `if (!res.ok) throw new Error(res.statusText)` before `.json()` |
| H5 | SendPaymentLink memory leak | `components/SendPaymentLink.tsx:152-164` | 5 min | Add `return () => clearInterval(pollInterval)` |
| H6 | NFC listener accumulation | `components/LinkNFCCard.tsx:110,124`, `pay/page.tsx:308,389` | 15 min | Use `AbortController` signal, abort on cleanup |
| H7 | InstantPay double-click | `components/InstantPay.tsx:308-311,394` | 10 min | Set `setPaying(true)` as first line before async work |
| H8 | Store settings wallet spoof | `api.js:4350` | 20 min | Require Bearer token (api_secret) instead of wallet_address |
| H9 | Store delete wallet spoof | `api.js:4684` | 20 min | Require Bearer token + wallet signature |
| H10 | Payouts/affiliates wallet spoof | `api.js:5671,5725` | 20 min | Require wallet signature verification |
| H11 | NFC card operations wallet spoof | `nfc-api.index.js:1086,1131,1193` | 30 min | Require wallet signature for card modifications |

### Medium Priority — Input Validation & Edge Cases

| # | Issue | File:Line | Est. Time | Fix Description |
|---|-------|-----------|-----------|-----------------|
| M1 | No tip validation | `components/TipSelector.tsx:31-32` | 10 min | Clamp: `Math.max(0, Math.min(parseFloat(value), MAX_TIP))` |
| M2 | Unvalidated route params | `pay/[paymentId]/page.tsx:46`, `checkout/[sessionId]/page.tsx:45` | 10 min | Validate with regex `/^[a-zA-Z0-9_-]+$/` |
| M3 | Division by zero (3 sites) | `pay/page.tsx:110`, `checkout/page.tsx:144`, `SplitBillModal.tsx:28` | 10 min | Guard: `if (!denominator \|\| denominator <= 0) return` |
| M4 | Weak email validation | `EmailReceiptModal.tsx:46`, `SendPaymentLink.tsx:115`, `receipts/page.tsx:822` | 10 min | Use `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex |
| M5 | Rate staleness not enforced | `app/pay/[paymentId]/page.tsx:108` | 15 min | If `priceAge > 30000`, show warning and block payment |
| M6 | Rate polling interval churn | `app/pay/[paymentId]/page.tsx:97-123` | 15 min | Extract amount into `useRef`, reduce dependencies |

### Low Priority — Error Handling & Code Quality

| # | Issue | File:Line | Est. Time | Fix Description |
|---|-------|-----------|-----------|-----------------|
| L1 | Silent tip save failure | `pay/[paymentId]/page.tsx:229-230` | 10 min | Set error state in catch |
| L2 | Silent rate fetch failure | `pay/[paymentId]/page.tsx:115-117` | 10 min | Set `rateError` state, show warning |
| L3 | Silent poll failure | `pay/[paymentId]/page.tsx:210-212` | 10 min | Count failures, show retry after 3 |
| L4 | Promise.all partial failure | `components/StoreActivity.tsx:62-65` | 10 min | Use `Promise.allSettled` |
| L5 | Display update fire-and-forget | `display/page.tsx:99,192` | 10 min | Await and show toast on failure |
| L6 | Web3Auth client ID hardcoded | `lib/web3auth.ts:5` | 5 min | Move to `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` |
| L7 | Error message info disclosure | `InstantPay.tsx:128,147`, `AutoSignModal.tsx:84` | 15 min | Map error codes to user-friendly messages |

---

## Backend Endpoint Authorization Reference

### Properly Protected (Bearer Token)

These endpoints correctly use `verifyStoreAuth(req)` which validates API secret:

| Endpoint | File:Line |
|----------|-----------|
| `POST /api/v1/payout` | `api.js:1762` |
| `POST /api/v1/payout/:id/approve` | `api.js:3636` |
| `POST /api/v1/affiliate/register` | `api.js:3686` |
| `GET /api/v1/store/stats` | `api.js:3874` |
| `DELETE /api/v1/store` | `api.js:3918` |

### Using verifyStoreOwner (Wallet Match)

These nfc-api endpoints use `verifyStoreOwner()` — wallet-match protection (not cryptographic):

| Endpoint | File:Line |
|----------|-----------|
| `POST /api/v1/store/:id/products` | `nfc-api.index.js:1557` |
| `GET /api/v1/store/:id/products` | `nfc-api.index.js:1624` |
| `PUT /api/v1/store/:id/products/:pid` | `nfc-api.index.js:1673` |
| `DELETE /api/v1/store/:id/products/:pid` | `nfc-api.index.js:1721` |
| `GET /api/v1/store/:id/receipts` | `nfc-api.index.js:1811` |
| `GET/POST/PUT/DELETE /api/v1/store/:id/staff/*` | `nfc-api.index.js:3028-3212` |

### Legitimately Public

| Endpoint | File:Line | Why Safe |
|----------|-----------|----------|
| `GET /health` | all files | Health check only |
| `GET /api/v1/store/public/:id` | `api.js:6200` | Returns only name/URL |
| `GET /api/v1/stores/public` | `api.js:5431` | Directory listing |
| `GET /api/v1/payment-link/:id` | nfc-api | Payment page (unpredictable ID) |
| `POST /api/v1/payment-link/:id/pay` | nfc-api | Payer submits own wallet/tx |

---

## Root Cause Analysis

### Primary Issue: No Cryptographic Wallet Verification

The backend has a `verifyStoreOwner(storeId, walletAddress)` helper in `nfc-api.index.js:94`:

```javascript
async function verifyStoreOwner(storeId, walletAddress) {
  const storeDoc = await db.collection('stores').doc(storeId).get();
  if (!storeDoc.exists) return null;
  const store = storeDoc.data();
  if (store.wallet_address !== walletAddress) return null;
  return store;
}
```

This compares client-provided `walletAddress` to the database value. **No cryptographic proof** that the client owns that wallet. An attacker can provide any wallet address.

### Recommended Fix: Challenge-Response Signature

XRPL supports message signing. Implement:

1. Client requests a nonce: `GET /api/v1/auth/nonce?wallet=rABC...`
2. Backend returns a random nonce, stores it with expiry
3. Client signs the nonce: `xrpl.Wallet.sign(nonce)`
4. Client sends signature: `POST /api/v1/auth/verify` with `{ wallet, signature, nonce }`
5. Backend verifies signature matches wallet public key
6. Backend issues a short-lived JWT for subsequent requests

This makes all wallet-authenticated endpoints cryptographically secure.

---

## Totals

| Priority | Issues | Est. Time |
|----------|--------|-----------|
| Critical | 9 | ~4.5 hrs |
| High | 11 | ~3.5 hrs |
| Medium | 6 | ~1.25 hrs |
| Low | 7 | ~1.25 hrs |
| **Total** | **33** | **~10.5 hrs** |

---

## Audit Metadata

- **Audit Date**: January 2026
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Node.js/Express, Firebase Firestore, Redis, XRPL
- **Files Audited**:
  - Frontend: 50+ components, 15+ pages
  - Backend: `api.js`, `nfc-api.index.js`, `Plugin-api.js`, `chainB.js`, `Audit.JS`
