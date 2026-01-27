# Component Patterns

## Overview

Next.js 16 app with React 19, Tailwind CSS v4, and TypeScript. All components are client-side (`'use client'`). No Redux or Context API — state is managed via `useState`/`useEffect` and passed through props.

## Project Structure

```
app/
├── globals.css               # Tailwind v4 + custom styles
├── layout.tsx                # Root layout (metadata, fonts, TourProvider)
├── (main)/                   # Route group: pages WITH header
│   ├── dashboard/page.tsx    # Vendor dashboard
│   ├── home/page.tsx
│   ├── docs/page.tsx
│   └── ...
├── (noheader)/               # Route group: pages WITHOUT header
│   ├── take-payment/page.tsx # POS interface
│   ├── display/page.tsx      # Customer display
│   └── receipts/page.tsx     # Vendor receipts
├── pay/[paymentId]/page.tsx  # Dynamic: customer payment
├── checkout/[sessionId]/page.tsx  # Dynamic: checkout
├── api/exchanges/route.ts    # API route (CoinGecko proxy)
├── analytics/page.tsx
├── affiliate-dashboard/page.tsx
└── earn/analytics/page.tsx

components/                    # 67+ shared components
lib/                           # Utilities (web3auth.ts, foodIcons.tsx, customerDisplay.ts)
utils/                         # Business logic (soundPayment.ts)
public/                        # Static assets (73 files)
```

## Configuration

**package.json:** Next.js 16.0.7, React 19.2.0, Tailwind CSS 4
**next.config.ts:** `transpilePackages: ['nextstepjs']`
**tsconfig.json:** `target: ES2017`, path alias `@/*` → `./*`
**postcss.config.mjs:** `@tailwindcss/postcss` plugin

## Styling

Tailwind CSS v4 with `@tailwindcss/postcss`. No CSS Modules.

**globals.css (lines 1-144):**
```css
@import "tailwindcss";
@theme inline {
  --color-background: var(--background);
  --font-sans: var(--font-geist-sans);
}
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

**Custom layers:**
- `@layer base` (line 37) — global cursor styles
- Tour scroll offsets (lines 81-121)
- Print styles (lines 131-144)

**Common color palette:** `emerald-*`, `sky-*`, `red-*`, `zinc-*`
**Dark theme:** Built-in via CSS variables (dark background by default)

## State Management Patterns

### Standard Page State
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const [data, setData] = useState<DataType | null>(null);
```

### Polling Pattern
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.status === 'complete') {
      clearInterval(interval);
      handleSuccess(data);
    }
  }, 2000);
  return () => clearInterval(interval);
}, [dependency]);
```

### Outside Click Detection (Header.tsx lines 14-22)
```typescript
const menuRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);
```

## Props Patterns

### Handler Callbacks
```typescript
onLogin: (wallet: string, method: 'xaman' | 'crossmark' | 'web3auth', extras?: {...}) => void
onClose: () => void
onSuccess?: (txHash: string) => void
onError?: (error: string) => void
onRefreshWallet: () => void
```

### Optional Data with Defaults
```typescript
tipAmount?: number        // defaults to 0
items?: Array<{ name: string; quantity: number; unit_price: number }>
conversionRate?: { rlusd_gbp: number; source: string; captured_at: string } | null
```

### Discriminated Status Props
```typescript
connecting: 'none' | 'xaman' | 'crossmark' | 'web3auth'
```

## Modal Pattern

All modals follow the same structure:

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... data props
}

export default function MyModal({ isOpen, onClose, ...props }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
        {/* Header with close button */}
        {/* Content */}
        {/* Action buttons */}
      </div>
    </div>
  );
}
```

**Examples:** `EmailReceiptModal.tsx`, `QRCodeModal.tsx`, `AutoSignModal.tsx`, `DeleteConfirmModal.tsx`, `SplitBillModal.tsx`, `InfoModal.tsx`

## Loading Spinner Pattern

```typescript
{loading ? (
  <>
    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
    Loading...
  </>
) : (
  'Submit'
)}
```

## Error Display Pattern

```typescript
{error && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
    <p className="text-red-400 text-sm">{error}</p>
  </div>
)}
```

## Form Pattern

```typescript
const [formField, setFormField] = useState('');
const [sending, setSending] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async () => {
  if (!formField || !formField.includes('@')) {
    setError('Validation message');
    return;
  }
  setSending(true);
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: formField })
    });
    // success state
  } catch (err) {
    setError('Failed. Please try again.');
  } finally {
    setSending(false);
  }
};
```

## Dynamic Imports

Used for heavy client-side libraries:
```typescript
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
```
**File:** `components/ProductsManager.tsx` (line 8)

## Custom Hooks

### useInfoModal (InfoModal.tsx)
Manages modal open/close state for info displays.
```typescript
const { isOpen, onOpen, onClose } = useInfoModal();
```

### Web3Auth helpers (lib/web3auth.ts)
- `getWeb3Auth()` — cached singleton instance
- `loginWithWeb3Auth()` — returns `{ address, provider }`
- `logoutWeb3Auth()` — cleanup

## Session Storage Keys

| Key | Purpose |
|-----|---------|
| `vendorWalletAddress` | Vendor wallet address |
| `vendorLoginMethod` | How vendor logged in |
| `walletAddress` | Customer/affiliate wallet |
| `loginMethod` | Customer login method |
| `storeData` | Store metadata (ID, name, logo) |
| `pendingSignup` | Pending customer signup data |

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `yesallofus_sound_id` | Sound device ID |
| `yesallofus_sound_secret` | Sound device secret |

## Next.js Patterns

- **App Router** with route groups `(main)` and `(noheader)`
- **Dynamic routes:** `[paymentId]`, `[sessionId]`
- **All components are `'use client'`** — no server components
- **Metadata** defined in `layout.tsx` (lines 16-62) with OpenGraph and Twitter cards
- **Service Worker** registered via inline script in layout (lines 81-87)
- **External scripts:** model-viewer loaded in layout (lines 75-76)
- **Fonts:** Geist Sans and Geist Mono via `next/font/local`

## QR Code Generation

**Component:** `components/QRCodeModal.tsx` (205 lines)
- Library: `qr-code-styling`
- Size: 280x280, SVG format
- Custom styling: emerald green, rounded corners
- Logo overlay: `/dltpayslogo1.png`
- Share options: WhatsApp, Twitter/X, Facebook, Telegram, Email, clipboard

## Tour System

Uses `nextstepjs` library for guided onboarding tours:
- `components/VendorDashboardTour.tsx`
- `components/AffiliateDashboardTour.tsx`
- `components/TakePaymentTour.tsx`
- Wrapped in `TourProvider` in root layout

## Key Large Components

| Component | Lines | Notes |
|-----------|-------|-------|
| `app/(noheader)/take-payment/page.tsx` | 2047 | POS system |
| `app/(main)/dashboard/page.tsx` | 3000+ | Vendor dashboard |
| `app/pay/[paymentId]/page.tsx` | 1100+ | Payment orchestrator |
| `app/(noheader)/receipts/page.tsx` | 1075 | Receipts dashboard |
| `components/OnboardingSetup.tsx` | 1043 | Onboarding wizard |
| `components/LoginScreen.tsx` | 619 | Multi-wallet auth |
| `components/LinkNFCCard.tsx` | 501 | NFC card management |
| `components/SoundPay.tsx` | 480 | Sound payment |
| `components/ProductsManager.tsx` | 465 | Product CRUD |
