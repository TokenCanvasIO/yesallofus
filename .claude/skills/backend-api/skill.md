# Backend API

## Overview

The backend is a Node.js/Express system running as multiple services. Database is Firebase Firestore. Redis is used for caching, rate limiting, duplicate payment protection, and Bull job queues. XRPL transactions use the `xrpl` library with a persistent WebSocket connection. Emails via Resend. Live pricing via CoinGecko Pro WebSocket + REST fallback.

## Architecture

```
┌─────────────────────┐
│  api.js (port 3001) │  Main API: stores, affiliates, Xaman, payouts
│  Version 3.1.1      │  Bull Queue for payouts + Xaman poll
└────────┬────────────┘
         │
┌────────┴────────────┐
│  nfc-api.index.js   │  NFC API: payments, cards, receipts, sound, display
│  (separate port)    │  Payment links, customer auto-sign
└────────┬────────────┘
         │
┌────────┴────────────┐
│  Plugin-api.js      │  Plugins API: checkout sessions (Ecwid, WooCommerce, Shopify)
│  (separate port)    │
└────────┬────────────┘
         │
┌────────┴────────────┐
│  CoinGecko WS       │  Live RLUSD/GBP price feed (port 3017)
│  (port 3017)        │  WebSocket + REST fallback + Redis cache
└────────┬────────────┘
         │
┌────────┴────────────┐
│  chainB.js          │  Chain B Worker: multi-level referral payouts
│  (polling worker)   │  Polls every 30s, processes referral chain
└────────┬────────────┘
         │
┌────────┴────────────┐
│  Cron payouts.js    │  Cron: hourly scheduled batch payout processing
└─────────────────────┘
```

## Configuration (Nano Config.js)

All config is centralized in `config.js`:

```javascript
network: 'mainnet'                          // or 'testnet'
xrpl.server: 'wss://s2.ripple.com'         // mainnet RPC
rlusd.issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'
rlusd.currencyHex: '524C555344000000000000000000000000000000'
rateLimits.globalPerMinute: 60
limits.maxSinglePayout: 10000
autoSign.defaultMaxSingle: 100
autoSign.defaultDailyLimit: 1000
fees: { free: 2.9, pro: 0.9, enterprise: 0 }  // % of commission
queue.maxRetries: 3
queue.retryBackoff: 60000                      // exponential
queue.xamanPollAttempts: 720                    // 1hr at 5s intervals
beta.maxStores: 5
```

## Database (Firestore Collections)

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `stores` | `store_{hex}` | Store/vendor accounts |
| `store_counters` | `{store_id}` | Receipt number counters |
| `receipts` | `rcpt_{hex}` | Payment receipts |
| `nfc_cards` | `{normalized_uid}` | NFC card registrations |
| `nfc_transactions` | auto-ID | NFC transaction log |
| `customers` | `{wallet_address}` | Customer records + milestones |
| `customer_autosign` | `{wallet_address}` | Auto-sign state (synced with XRPL) |
| `pending_customers` | `cust_{hex}` | Customers awaiting wallet setup |
| `affiliates` | auto-ID | Affiliate registrations |
| `payout_log` | auto-ID | Payout history |
| `payment_links` | `{payment_id}` | Payment links |
| `checkout_sessions` | `sess_{hex}` | Plugin checkout sessions |
| `xaman_payments` | `pay_{hex}` | Xaman payment requests |
| `xaman_logins` | `login_{hex}` | Xaman login requests |
| `xaman_connections` | `conn_{hex}` | Xaman wallet connections |
| `chainb_queue` | auto-ID | Referral payout queue |
| `chainb_log` | auto-ID | Referral payout history |
| `audit_log` | `log_{timestamp}_{hex}` | Audit trail (CARF 2026 compliance) |
| `waitlist` | auto-ID | Beta waitlist |
| `plugin_stores` | `{platform}_{id}` | E-commerce plugin store mappings |

## Receipt Creation

Receipts are created in multiple places when payments succeed. The pattern is consistent:

### Receipt Document Structure
```javascript
{
  receipt_id: 'rcpt_{hex}',
  receipt_number: 'R-00001',              // Sequential per store
  store_id: 'store_{hex}',
  customer_wallet: 'r...',
  items: [{ name, quantity, unit_price, line_total }],
  tip_amount: 0,                          // GBP
  subtotal: amount - tip,
  total: amount,
  amount_gbp: number,
  amount_rlusd: number,
  currency: 'GBP',
  // Split metadata
  is_split_payment: false,
  split_index: null,
  total_splits: null,
  parent_payment_id: null,
  original_amount: number,
  // Conversion rate (CARF compliant)
  conversion_rate: {
    rlusd_gbp: number,
    rlusd_usd: number,
    gbp_to_rlusd: number,
    source: 'CoinGecko Pro API',
    captured_at: 'ISO timestamp',
    price_age_ms: number
  },
  compliance: {
    standard: 'CARF 2026',
    data_source: 'CoinGecko Pro (Analyst Plan)',
    aggregated_exchanges: '600+',
    jurisdiction: 'Guernsey'
  },
  payment_method: 'xaman_qr' | 'web3auth' | 'nfc' | 'soundpay',
  payment_status: 'paid',
  payment_tx_hash: 'tx hash or xaman_direct',
  paid_at: Timestamp,
  created_at: Timestamp
}
```

### Receipt Number Generation
```javascript
const counterDoc = await db.collection('store_counters').doc(store_id).get();
const receiptNumber = counterDoc.exists ? (counterDoc.data().receipt_count || 0) + 1 : 1;
await db.collection('store_counters').doc(store_id).set(
  { receipt_count: receiptNumber },
  { merge: true }
);
// Format: R-00001
```

### Where Receipts Are Created
- **NFC payment** (nfc-api line 382): After successful NFC tap payment
- **Xaman payment poll** (api.js line 866): After XRPL ledger verification
- **Checkout session pay** (Plugin-api.js line 304): After checkout completion
- **Payment link pay** (nfc-api line ~4086): After payment link processing

## Payment Processing

### Payment Link Flow (nfc-api.index.js)

**Create** (line 3755): `POST /api/v1/payment-link/create`
- Generates unique payment ID with suffix-based collision detection
- SoundPay links expire in 5 minutes; regular links in 1 year
- Max 250 pending payments per store
- Stores in `payment_links` collection

**Tip** (line 3851): `POST /api/v1/payment-link/:id/tip`
- Updates `customer_tip` field
- Recalculates total

**Pay** (line 4086): `POST /api/v1/payment-link/:id/pay`
- Firestore transaction for atomicity
- Accepts: `card_uid`, `payer_wallet`, `tx_hash`, `tip_amount`
- Checks expiration
- Creates receipt on success

**Split** (line 3967): `POST /api/v1/payment-link/:id/split`
- 2-100 splits allowed
- 30-minute expiry on splits
- Each split gets unique suffix ID

### NFC Payment (nfc-api line 271)

```
Card tap → normalize UID → lookup card in Firestore
→ Redis duplicate check (5s card lock + 5min payment_id lock)
→ Capture live rate from CoinGecko (port 3017)
→ POST to internal XRPL payment service
→ Log transaction in nfc_transactions
→ Create receipt with conversion rate
→ Trigger commission payout if affiliate exists
→ Set first_payment_received milestone
→ Return tx_hash + receipt_id
```

### Xaman Payment (api.js)

**Create** (line 642): `POST /api/v1/xaman/payment`
- Creates Xaman payload with RLUSD payment transaction
- QR code returned for user scanning
- 5-minute expiry

**Poll** (line 718): `GET /api/v1/xaman/payment/poll/:id`
- Checks Xaman payload status
- On signed: **verifies transaction on XRPL ledger**
  - Checks `TransactionResult === 'tesSUCCESS'`
  - Verifies destination matches vendor wallet
  - 10-second timeout for ledger propagation
- Creates receipt on successful verification
- Sets `first_payment_received` milestone

### Checkout Session (Plugin-api.js)

**Create** (line 69): `POST /api/v1/checkout/session`
- Creates session + payment link in NFC API
- Supports: Ecwid, WooCommerce, Shopify, custom platforms
- 30-minute expiry

**Pay** (line 256): `POST /api/v1/checkout/session/:id/pay`
- Creates receipt with conversion rate
- Sends email receipt if `customer_email` exists
- Fires webhook callback to `callback_url`
- Split payment support with prorated tips

## Tip Handling

Tips are stored at multiple levels:

1. **Payment link**: `customer_tip` field updated via `/payment-link/:id/tip`
2. **Receipt**: `tip_amount` field stored with receipt document
3. **Checkout session**: `tip_amount` field, prorated across splits
4. **Display**: `tip` field in customer display data
5. **NFC transaction**: `tip` from request body

Tip is always in GBP. For receipts, `subtotal = total - tip_amount`.

## Sound Payment Backend

### Device Registration (nfc-api line 5088)
`POST /api/v1/sound/register`
- Links `wallet_address` → `sound_id` + `secret_key`
- Stored in `sound_devices` collection

### Sound Payment Processing (nfc-api line 5123)
`POST /api/v1/sound/pay`
- HMAC-SHA256 signature verification: `HMAC(payment_id:sound_id:timestamp, secret_key)`
- Timestamp validation (within 30 seconds)
- Checks device enabled status
- Processes XRPL payment via platform signer

### Token Shorthand (nfc-api line 5274)
`GET /api/v1/p/:token?sid={sound_id}`
- Matches payment by ID suffix to decoded audio token
- Used by customer device after audio detection

### Sound Token Generation (nfc-api line 5055)
`GET /api/v1/sound-payment/generate`
- Generates WAV audio file using ggwave-to-file service
- Cached for 1 hour

## Conversion Rate System

### CoinGecko WebSocket Service (port 3017)

**Real-time feed:**
- WebSocket: `wss://stream.coingecko.com/v1` (CoinGecko Pro)
- Subscribes to `CGSimplePrice` channel for `ripple-usd`
- Stores in Redis: `live_rlusd_gbp`, `live_rlusd_usd`, `live_rlusd_updated`
- Falls back to REST polling every 10 seconds
- Reconnects with exponential backoff (max 10 attempts)

**API endpoints:**

`GET /api/live-price/rlusd` (line 156)
- Returns cached price, fetches fresh if stale (>30s)
- Response: `{ success, rlusd: { gbp, usd, lastUpdated, age_ms } }`

`GET /api/convert/gbp-to-rlusd` (line 181)
- Always fetches fresh price (compliance requirement)
- `?capture=true` enables audit logging
- Returns rate data with compliance metadata (CARF 2026, jurisdiction: Guernsey)

### Rate Capture in Payments
Every payment captures the live rate from `http://127.0.0.1:3017/api/live-price/rlusd` and stores it with the receipt for audit trail.

## Duplicate Payment Protection (Redis)

```javascript
// Card-based: same card + same vendor within 5 seconds
const cardKey = `nfc:dup:${normalizedUID}:${vendor_wallet}`;
await redisClient.set(cardKey, 'processing', { NX: true, EX: 5 });

// Payment ID: same payment_id within 5 minutes
const paymentIdKey = `nfc:pay:${paymentId}`;
await redisClient.set(paymentIdKey, 'processed', { NX: true, EX: 300 });
```

## Chain B (Multi-Level Referral Payouts)

`chainB.js` processes referral commission payouts:

```
Sale at Store → Platform takes fee (2.9% free / 0.9% pro / 0% enterprise)
  → Chain B distributes fee to referral chain:
     Level 1: 25% of platform fee
     Level 2: 5%
     Level 3: 3%
     Level 4: 2%
     Level 5: 1%
```

- Walks up referral chain via `referred_by_store` → `store_referral_code`
- Checks RLUSD trustline before each payout
- Minimum payout: $0.01
- Retries: 3 attempts with exponential backoff (1min, 2min, 4min)
- Stuck job cleanup: resets after 5 minutes
- Polls every 30 seconds

## Auto-Sign System (Backend)

XRPL is the source of truth. Backend syncs Firebase state with XRPL ledger.

**Status check** (nfc-api line 565, api.js line ~1238):
```javascript
// Check XRPL for SignerListSet
const accountObjects = await client.request({
  command: 'account_objects',
  account: wallet,
  type: 'signer_list'
});
const hasOurSigner = accountObjects.result.account_objects?.[0]
  ?.SignerEntries?.some(e => e.SignerEntry.Account === PLATFORM_SIGNING_WALLET.address);
```

**Payment via auto-sign:**
The platform signing wallet (loaded from `DLTPAYS_SIGNING_SEED`) submits multi-signed transactions on behalf of users who have the platform in their SignerListSet.

## Audit System (Audit.JS)

Comprehensive audit logging for CARF 2026 compliance:

```javascript
const AUDIT = {
  PAYMENT_COMPLETED: 'transaction.payment_completed',
  STORE_CREATED: 'kyb.store_created',
  NFC_CARD_LINKED: 'nfc.card_linked',
  RECEIPT_CREATED: 'receipt.created',
  // ... 35+ action types
};
```

Each log entry includes:
- **WHO**: actor type (admin/merchant/customer/system), IP, user agent
- **WHAT**: action, category
- **ON WHAT**: entity type and ID
- **WITH WHAT**: sanitized data (sensitive fields redacted)
- **RESULT**: success/failure/pending
- **COMPLIANCE**: jurisdiction (Guernsey), standard (CARF 2026), data classification

Data classification: `pii` (KYC/KYB), `financial` (transactions/payouts), `general` (settings/auth)

## Email System (utils.emails.js)

Uses Resend API (`process.env.RESEND_API_KEY`):
- `sendEmail(to, subject, html)` — generic send
- `sendAlert(subject, html)` — ops alerts
- `sendPaymentFailedAlert(data, error)` — payment failure alerts
- Receipt emails sent via `POST /api/v1/receipt/email` with styled HTML

## Rate Limiting

Redis-based, IP-level:
```javascript
// 60 requests per minute per IP (configurable)
const count = await redis.incr(`ratelimit:${ip}`);
if (count === 1) await redis.expire(key, 60);
if (count > config.rateLimits.globalPerMinute) → 429
```
Fails open if Redis is down.

## Store Fee Tiers

```javascript
fees: { free: 2.9%, pro: 0.9%, enterprise: 0% }
```
50% discount for referred stores in their first month.

## Bull Queues

| Queue | Purpose | Config |
|-------|---------|--------|
| `dltpays:payouts` | Affiliate commission payouts | 3 retries, exponential backoff |
| `dltpays:xaman-poll` | Xaman payload polling | 720 attempts at 5s intervals (1hr) |

## Key Backend Files

| File | Port | Purpose |
|------|------|---------|
| `api.js` | 3001 | Main API: stores, Xaman, payouts, affiliates |
| `nfc-api.index.js` | separate | NFC/payment/receipt/sound/display API |
| `Plugin-api.js` | separate | E-commerce checkout sessions |
| `Coingecko websocket.js` | 3017 | Live RLUSD price feed |
| `chainB.js` | worker | Multi-level referral payouts |
| `Cron payouts.js` | cron | Hourly scheduled payout processing |
| `Nano Config.js` | — | Centralized configuration |
| `Audit.JS` | — | CARF 2026 audit logging |
| `utils.emails.js` | — | Resend email helpers |
| `js 18.22.15/track.js` | — | Client-side affiliate tracking SDK v1.2 |
