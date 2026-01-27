# Store Management

## Overview

Stores (vendors) are the merchant accounts that accept payments. Each store has a wallet address, settings, products, affiliates, and receipts. Stores can be created via CLI or dashboard and claimed by linking a wallet.

## Store Lifecycle

```
1. Register store    →  POST /api/v1/store/register (CLI or dashboard)
2. Get claim token   →  POST /api/v1/store/generate-claim-token
3. Claim ownership   →  POST /api/v1/store/claim (with wallet + token)
4. Link wallet       →  POST /api/v1/store/link-wallet
5. Set trustline     →  TrustSet transaction on XRPL
6. Configure         →  POST /api/v1/store/settings
7. Accept payments   →  POS, payment links, checkout sessions
```

## Key Pages

### Vendor Dashboard
`app/(main)/dashboard/page.tsx` (3000+ lines) — the main vendor control panel:
- Store settings (name, logo, commission rates)
- Wallet connection (Web3Auth, Xaman, Crossmark)
- Trustline setup
- Auto-sign configuration
- Affiliate management
- API key display and regeneration
- Store deletion

### Take Payment (POS)
`app/(noheader)/take-payment/page.tsx` (2047 lines):
- Product catalog with cart building
- Staff selector
- SoundPay send buttons
- Live conversion widget
- Payment link creation
- Pending payments panel
- Customer display updates

### Receipts Dashboard
`app/(noheader)/receipts/page.tsx` (1075 lines):
- Receipt history with filtering and pagination
- Email and print functionality
- Settlement details (RLUSD amounts, conversion rates)

### Analytics
`app/analytics/page.tsx`:
- Receipt data by time period (today, week, month, all)
- Revenue tracking

## Store Data

**Registration Response (cli/index.js):**
```json
{
  "store_id": "string",
  "api_key": "string",
  "api_secret": "string",
  "store_referral_code": "string",
  "claim_token": "string"
}
```

**Session Storage:**
- `storeData` — JSON with store ID, name, logo
- `vendorWalletAddress` — vendor wallet
- `vendorLoginMethod` — login method

## Products Management

**Component:** `components/ProductsManager.tsx` (465 lines)

Features:
- Product CRUD (name, price, SKU, category)
- Emoji picker for product icons (dynamic import)
- SVG icon support via `lib/foodIcons.tsx` (55K+ lines of icon data)
- Cloudinary image upload for custom icons
- Category-based organization

**Product Interface:**
```typescript
interface Product {
  product_id: string;
  name: string;
  price: number;
  category: string | null;
  emoji?: string;
  icon_id?: string | null;
}
interface CartItem extends Product {
  quantity: number;
}
```

## Store Logo Upload

- **Upload to Cloudinary:** `POST https://tokencanvas.io/api/cloudinary/upload` (preset: `store_logos`)
- **Save URL:** `POST /nfc/api/v1/store/{storeId}/logo`
- **Fetch:** `GET /nfc/api/v1/store/{storeId}/logo`
- Used in dashboard (line 212) and affiliate dashboard

## Affiliate System

Stores can have affiliate partners who earn commissions on referred sales.

**Key endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/affiliate/register-public` | POST | Register affiliate |
| `/api/v1/store/{id}/affiliates` | GET | List affiliates |
| `/api/v1/store/{id}/payouts` | GET | Payout history |
| `/api/v1/store/{id}/affiliate-count` | GET | Count |
| `/api/v1/store/{id}/referred-vendors` | GET | Referred stores |

**Component:** `components/StoreActivity.tsx` — affiliate and payout tables with pagination and sorting (rank, oldest, newest, lowest).

**Affiliate Dashboard:** `app/affiliate-dashboard/page.tsx` — separate dashboard for affiliates with commission tracking.

## Customer Display

Real-time POS display updates via API.

**Utility:** `lib/customerDisplay.ts` (46 lines)
- `updateCustomerDisplay(storeId, data)` — POST to `/nfc/api/v1/display/update`
- `clearCustomerDisplay(storeId)` — reset display

**Display statuses:** `idle`, `ready`, `processing`, `success`, `error`, `qr`, `signup`, `split_pending`, `link_pending`

**Display data:** cart items, total, status, QR code, tip amount

**Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/display/{storeId}` | GET | Get config |
| `/nfc/api/v1/display/update` | POST | Push update |
| `/api/v1/display/{storeId}/reset-confirm` | POST | Confirm reset |
| `/api/v1/display/{storeId}/status` | POST | Update status |

## Onboarding

**Component:** `components/OnboardingSetup.tsx` (1043 lines) — multi-step wizard:
1. Connect wallet
2. Fund wallet with XRP
3. Set RLUSD trustline
4. Configure store settings

**Milestone tracking:** `components/MilestoneChecklist.tsx`
- `GET /api/v1/store/{id}/milestone`
- Progress indicators for setup steps

## Guided Tours

- `components/VendorDashboardTour.tsx` — vendor onboarding tour
- `components/TakePaymentTour.tsx` — POS tutorial
- `components/AffiliateDashboardTour.tsx` — affiliate tutorial
- Uses `nextstepjs` library, wrapped in `TourProvider` at root layout

## E-commerce Integrations

Documented in `cli/index.js`:

**Stripe:** Webhook on `checkout.session.completed` → `POST /api/v1/payout`
**WooCommerce:** WordPress plugin with shortcodes
**Shopify:** Shopify Flow webhook → custom backend → API
**Generic:** Track `?ref=` parameter, POST to payout on order completion

## Store API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/store/register` | POST | Create store |
| `/api/v1/store/public/{id}` | GET | Public store info |
| `/api/v1/store/by-claim/{token}` | GET | Lookup by claim token |
| `/api/v1/store/by-wallet/{wallet}` | GET | Lookup by wallet |
| `/api/v1/store/claim` | POST | Claim ownership |
| `/api/v1/store/link-wallet` | POST | Link wallet |
| `/api/v1/store/settings` | POST | Save settings |
| `/api/v1/store/regenerate-secret` | POST | New API secret |
| `/api/v1/store/disconnect-wallet` | POST | Disconnect wallet |
| `/api/v1/store/delete` | POST | Delete store |
| `/api/v1/store/set-platform-return` | POST | Set return URL |
| `/api/v1/store/clear-platform-return` | POST | Clear return URL |
| `/api/v1/store/generate-claim-token` | POST | New claim token |

## Key Files

| File | Role |
|------|------|
| `app/(main)/dashboard/page.tsx` | Vendor dashboard |
| `app/(noheader)/take-payment/page.tsx` | POS interface |
| `app/(noheader)/receipts/page.tsx` | Receipts dashboard |
| `app/analytics/page.tsx` | Analytics |
| `app/affiliate-dashboard/page.tsx` | Affiliate dashboard |
| `components/ProductsManager.tsx` | Product CRUD |
| `components/StoreActivity.tsx` | Affiliates and payouts |
| `components/OnboardingSetup.tsx` | Setup wizard |
| `components/MilestoneChecklist.tsx` | Progress tracking |
| `lib/customerDisplay.ts` | Display API utility |
| `lib/foodIcons.tsx` | Product icon library |
| `cli/index.js` | CLI store registration |
