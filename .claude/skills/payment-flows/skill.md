# Payment Flows

## Overview

The app supports four payment methods: InstantPay (Web3Auth biometrics), NFC tap-to-pay, SoundPay (acoustic FSK), and Xaman wallet (QR-based). All methods converge through the payment page orchestrator and end at the same receipt/success flow.

## Payment Lifecycle

```
1. Create Payment Link  →  POST /nfc/api/v1/payment-link/create
2. Customer Opens Link  →  GET  /nfc/api/v1/payment-link/{paymentId}
3. Select Tip           →  POST /nfc/api/v1/payment-link/{paymentId}/tip
4. Choose Method        →  InstantPay | NFC | SoundPay | Xaman
5. Process Payment      →  POST /nfc/api/v1/payment-link/{paymentId}/pay
6. Receive Confirmation →  tx_hash + receipt_id returned
7. Show Success         →  PaymentSuccess → ReceiptActions → EmailReceiptModal
```

## Page Orchestrator

`app/pay/[paymentId]/page.tsx` is the main orchestrator (1100+ lines). It manages:

### State (lines 44-92)
```typescript
payment          // Core PaymentData object
loading, error   // Flow states
processing       // Active payment in progress
txHash           // XRPL transaction hash
receiptId        // Generated receipt ID
splits           // SplitData[] for bill splitting
currentSplitIndex
xamanQR          // Xaman QR code data
xamanPaymentId   // Xaman polling ID
tipAmount        // Selected tip
liveRate         // Current GBP→RLUSD rate
rlusdAmount      // Converted amount
conversionRate   // Rate metadata (source, timestamp)
```

### PaymentData Interface (lines 15-34)
```typescript
interface PaymentData {
  payment_id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  vendor_wallet: string;
  amount: number;
  currency: string;
  items: any[];
  tip: number;
  customer_tip?: number;
  status: 'pending' | 'paid' | 'expired' | 'split';
  split_index: number | null;
  total_splits: number | null;
  expires_at: string | null;
  payer_wallet: string | null;
  receipt_id?: string | null;
}
```

## Payment Methods

### InstantPay (Web3Auth Biometrics)
- **Component:** `components/InstantPay.tsx` (412 lines)
- **Flow:** Web3Auth login → check auto-sign status → SignerListSet if needed → process payment
- **Key endpoints:**
  - `GET /nfc/api/v1/wallet/status/{wallet}` — check funding/trustline (line 91)
  - `GET /nfc/api/v1/nfc/customer/autosign-status/{wallet}` — check auto-sign (line 58)
  - `POST /nfc/api/v1/nfc/customer/setup-autosign` — setup signer (line 258)
- **Rendered at:** page.tsx line 679

### NFC Tap-to-Pay
- **Component:** `components/NFCTapPay.tsx` (161 lines)
- **Requires:** `'NDEFReader' in window` (Android Chrome)
- **Flow:** Start NFC scan → read card UID → POST to pay endpoint with `card_uid`
- **Key code:** page.tsx lines 290-402
- **Rendered at:** page.tsx line 710

### SoundPay
- **Component:** `components/SoundPay.tsx` (480 lines)
- **Flow:** Broadcast payment token as audio → poll backend → confirm payment
- **See:** `.claude/skills/sound-payments/skill.md` for full details
- **Rendered at:** page.tsx line 740

### Xaman Wallet
- **Flow:** Create QR → display to user → poll for signature
- **Key endpoints:**
  - `POST /api/v1/xaman/payment` — generate QR (page.tsx line 257)
  - `GET /api/v1/xaman/payment/poll/{id}` — poll status every 2s (page.tsx line 179)
- **Status values:** `signed`, `expired`, `cancelled`, `failed`
- **Rendered at:** page.tsx line 789

## Split Payments

**Component:** `components/SplitBillModal.tsx` (118 lines)

### SplitData Interface (page.tsx lines 36-42)
```typescript
interface SplitData {
  payment_id: string;
  amount: number;
  split_index: number;
  status: string;
  tip: number;
}
```

### Flow
1. User taps "Split Bill" → modal opens (page.tsx line 931)
2. Select split count → `POST /nfc/api/v1/payment-link/{paymentId}/split` (line 417)
3. Each split gets its own `payment_id`
4. Current split processed, remaining shared via link/QR/email
5. Share options: copy link, QR code, email, native share API (lines 811-879)

## Payment Link Creation

**Component:** `components/SendPaymentLink.tsx` (lines 48-90)
- **Endpoint:** `POST /nfc/api/v1/payment-link/create`
- **Params:** `store_id`, `amount`, `items`, `currency` ('GBP')
- **Returns:** `payment_url`, `payment_id`
- **URL format:** `https://yesallofus.com/pay/{paymentId}`

## Pending Payment Management

**Component:** `components/PendingPayments.tsx`
- **Endpoint:** `GET /nfc/api/v1/store/{storeId}/pending-payments` (line 44)
- **Poll interval:** 3 seconds (line 61)
- **Actions:** Share, copy, email, cancel

## Polling Intervals

| What | Interval | Endpoint |
|------|----------|----------|
| Xaman payment | 2s | `/api/v1/xaman/payment/poll/{id}` |
| Pending payments | 3s | `/nfc/api/v1/store/{id}/pending-payments` |
| Conversion rate | 10s | `/convert/gbp-to-rlusd?amount={amt}&capture=true` |
| SoundPay status | 500ms | `/nfc/api/v1/payment-link/{id}` |

## Checkout Sessions

Alternative entry point: `app/checkout/[sessionId]/page.tsx`
- Uses `PaymentOptions` component with same payment methods
- Plugin API: `POST /plugins/api/v1/checkout/session/{sessionId}/pay`
- Same tip/split/NFC support

## Take Payment (POS)

`app/(noheader)/take-payment/page.tsx` (2047 lines)
- Cart building with products
- Staff selector
- SoundPay buttons
- Live conversion widget
- Customer display updates
- Payment link creation

## Key Files

| File | Role |
|------|------|
| `app/pay/[paymentId]/page.tsx` | Payment orchestrator |
| `app/checkout/[sessionId]/page.tsx` | Checkout session entry |
| `app/(noheader)/take-payment/page.tsx` | POS interface |
| `components/InstantPay.tsx` | Web3Auth biometric payment |
| `components/NFCTapPay.tsx` | NFC card payment |
| `components/SoundPay.tsx` | Sound-based payment |
| `components/PaymentOptions.tsx` | Payment method selector |
| `components/PaymentSuccess.tsx` | Success screen |
| `components/SendPaymentLink.tsx` | Link creation |
| `components/PendingPayments.tsx` | Pending payment management |
| `components/SplitBillModal.tsx` | Bill splitting |
| `components/TipSelector.tsx` | Tip selection |
