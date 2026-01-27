# Receipt System

## Overview

The receipt system handles payment receipts including tips, conversion rates (GBP to RLUSD), email delivery, and print previews. It spans customer-facing payment pages and a vendor-facing receipts dashboard.

## Component Chain

```
app/pay/[paymentId]/page.tsx          -- Main payment page orchestrator
  |
  +--> components/TipSelector.tsx     -- Tip selection UI (presets + custom)
  +--> components/InstantPay.tsx      -- Web3Auth payment (receives tipAmount)
  +--> components/SoundPay.tsx        -- Audio-based payment (saves tip before processing)
  |
  +--> components/PaymentSuccess.tsx  -- Post-payment success screen
         |
         +--> components/ReceiptActions.tsx    -- Email + Print buttons
                |
                +--> components/EmailReceiptModal.tsx  -- Email input + send
                +--> Print Preview (inline in ReceiptActions, lines 122-289)
```

Vendor dashboard: `app/(noheader)/receipts/page.tsx` -- Lists all receipts with filtering, sorting, pagination, and its own email/print functionality.

## Props Flow

Each component passes receipt data down via props:

### PaymentSuccess receives from page.tsx (lines 499-514):
- `amount`, `tip`, `txHash`, `receiptId`
- `rlusdAmount`, `conversionRate`
- `items`, `storeName`, `storeId`, `storeLogo`
- `isSplit`, `splitAmount`, `splitTip`

### ReceiptActions receives from PaymentSuccess (lines 134-145):
- `receiptId`, `txHash`, `storeName`, `storeId`, `storeLogo`
- `amount`, `rlusdAmount`, `tipAmount`
- `items`, `conversionRate`

### EmailReceiptModal receives from ReceiptActions (lines 107-119):
- Same as ReceiptActions minus `storeLogo`

### Shared conversionRate shape:
```typescript
{
  rlusd_gbp: number;
  source: string;
  captured_at: string;
}
```

## Tips

### Selection
`components/TipSelector.tsx` offers preset percentages (10%, 15%, 20%) and a custom input. Calls `onTipChange(amount)` on selection.

### Persistence
On tip change, `page.tsx` (lines 218-235) saves to backend:
```
POST /payment-link/{paymentId}/tip
Body: { tip_amount: number }
```

SoundPay also saves the tip before processing (`components/SoundPay.tsx`, lines 70-83).

### Display
- **ReceiptActions print preview** (lines 203-218): Shows tip as a line item if > 0.
- **Receipts dashboard** (lines 948-964): Shows tip with heart icon, converted to GBP via `tip_amount * conversion_rate.rlusd_gbp`.
- **EmailReceiptModal**: Includes `tip_amount` in email payload (line 62).

## Conversion Rates

### Fetching
`page.tsx` (lines 96-123) polls every 10 seconds:
```
GET /convert/gbp-to-rlusd?amount={amount}&capture=true
```
The `capture=true` parameter records the rate at the moment of the request.

### Response shape:
```typescript
{
  success: boolean,
  rate: {
    gbp_to_rlusd: number,
    rlusd_gbp: number,
    source: string,         // e.g. "CoinGecko Pro API"
    captured_at: string     // ISO timestamp
  },
  rlusd: number,
  price_age_ms: number
}
```

### Settlement Details Display
Both ReceiptActions (lines 230-258) and the receipts dashboard (lines 976-1004) show:
- Amount Quoted (GBP)
- Amount Settled (RLUSD, 6 decimal places)
- Exchange Rate (RLUSD per GBP)
- Rate Source and Timestamp

## Email Receipts

`components/EmailReceiptModal.tsx` has two payload construction paths:

1. **Direct props** (lines 55-65): Used when no `receiptId` exists. Builds payload from component props.
2. **API fetch** (lines 67-87): When `receiptId` exists, fetches full receipt from `GET /receipts/{receiptId}` and merges with props as fallbacks.

Sends via:
```
POST /nfc/api/v1/receipt/email
```
Payload includes: email, store info, amount, rlusd_amount, items, tip_amount, tx_hash, conversion_rate.

## Receipt Data Model

From the receipts dashboard (`app/(noheader)/receipts/page.tsx`, lines 15-37):
```typescript
interface Receipt {
  receipt_id: string;
  receipt_number: string;
  customer_wallet: string;
  items: ReceiptItem[];
  tip_amount?: number;
  subtotal?: number;
  total: number;
  amount_rlusd?: number;
  currency: string;
  payment_method?: string;
  payment_status: string;
  payment_tx_hash: string;
  paid_at: string;
  created_at: string;
  conversion_rate?: {
    rlusd_gbp: number;
    gbp_to_rlusd?: number;
    source?: string;
    captured_at?: string;
    price_age_ms?: number;
  };
}
```

## Key Files

| File | Role |
|------|------|
| `app/pay/[paymentId]/page.tsx` | Payment orchestrator, tip state, rate polling |
| `app/(noheader)/receipts/page.tsx` | Vendor receipts dashboard |
| `components/PaymentSuccess.tsx` | Post-payment UI, passes props to ReceiptActions |
| `components/ReceiptActions.tsx` | Email/print buttons and print preview |
| `components/EmailReceiptModal.tsx` | Email input form and API call |
| `components/TipSelector.tsx` | Tip percentage/custom selection |
| `components/SoundPay.tsx` | SoundPay payment with tip saving |
| `components/InstantPay.tsx` | Web3Auth payment with tip prop |
| `components/LiveConversionWidget.tsx` | Real-time rate display widget |
