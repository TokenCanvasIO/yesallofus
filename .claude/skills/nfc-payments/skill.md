# NFC Payments

## Overview

NFC tap-to-pay uses the Web NFC API (`NDEFReader`) to read card UIDs from physical NFC cards linked to customer wallets. Only supported on Android Chrome. Cards are managed via a linking system that associates card UIDs with XRPL wallet addresses.

## NFC Payment Flow

```
1. Customer taps NFC card on POS device
2. NDEFReader reads card UID (serialNumber)
3. POST /payment-link/{paymentId}/pay with card_uid
4. Backend looks up wallet by card UID
5. Platform signs XRPL transaction (auto-sign)
6. Returns tx_hash + receipt_id
7. Display success + receipt options
```

## Components

### NFCTapPay.tsx (161 lines)
Main NFC payment component.

**Detection (line 38, PaymentOptions.tsx line 62):**
```typescript
'NDEFReader' in window  // Only Android Chrome
```

**Card Reading (page.tsx lines 290-402):**
```typescript
const reader = new NDEFReader();
await reader.scan();
reader.onreading = (event) => {
  const cardUid = event.serialNumber;  // line 312
  // POST to pay endpoint with card_uid
};
```

**Two API paths:**
- Payment links: `POST /nfc/api/v1/payment-link/{paymentId}/pay` (line 337)
- Checkout sessions: `POST /plugins/api/v1/checkout/session/{sessionId}/pay` (NFCTapPay.tsx line 43)

**Vibration feedback:** `navigator.vibrate([50, 50, 50])` on success (line 98)

### LinkNFCCard.tsx (501 lines)
Card management — link, unlink, rename cards.

**Features:**
- Max 5 cards per wallet
- Auto-registration of sound devices on card link (lines 40-70)
- Card CRUD operations (lines 73-226)
- Card name editing

**API Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/nfc/api/v1/nfc/link-card` | POST | Link card UID to wallet |
| `/nfc/api/v1/nfc/unlink-card` | POST | Remove card |
| `/nfc/api/v1/nfc/card/{uid}/name` | PUT | Rename card |
| `/nfc/api/v1/nfc/cards-by-wallet/{wallet}` | GET | List linked cards |
| `/nfc/api/v1/sound/register` | POST | Register sound device (auto on link) |

## Auto-Sign Requirement

NFC payments require auto-sign to be enabled so the platform can sign transactions without manual wallet approval. Without auto-sign, the error `NO_SIGNER_AUTHORITY` is returned.

Setup flow is documented in `.claude/skills/xrpl-transactions/skill.md`.

## Error Handling

| Error | Cause |
|-------|-------|
| `NO_SIGNER_AUTHORITY` | Auto-sign not enabled |
| `INSUFFICIENT_FUNDS` | Not enough RLUSD |
| `SELF_PAYMENT_NOT_ALLOWED` | Card owner is vendor |
| Card not found / not linked | UID not in database |

## NFC Detection in Payment Options

`components/PaymentOptions.tsx` (line 62):
```typescript
const hasNFC = typeof window !== 'undefined' && 'NDEFReader' in window;
```
NFC option only shown when `hasNFC` is true.

Android detection also used in checkout page (line 71):
```typescript
const isAndroid = /android/i.test(navigator.userAgent);
```

## Customer Display Integration

When NFC payment completes, the customer display is updated:
```typescript
updateCustomerDisplay(storeId, {
  status: 'success',
  total: amount,
  // ...
});
```
See `lib/customerDisplay.ts`.

## Key Files

| File | Role |
|------|------|
| `components/NFCTapPay.tsx` | Main NFC payment component |
| `components/LinkNFCCard.tsx` | Card linking/management |
| `components/PaymentOptions.tsx` | Payment method selector (NFC detection) |
| `app/pay/[paymentId]/page.tsx` | NFC reading logic (lines 290-402) |
| `components/TapToPaySettings.tsx` | Auto-sign setup for NFC |
| `components/WalletSettings.tsx` | Wallet + auto-sign management |
