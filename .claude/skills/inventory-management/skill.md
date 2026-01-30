# Inventory Management

## Overview

Stock tracking, barcode scanning, and inventory management for store products. Extends the existing ProductsManager with quantity tracking, low-stock alerts, and barcode/SKU support.

## Extended Product Schema

### Current Schema (ProductsManager.tsx)
```typescript
interface Product {
  product_id: string;
  name: string;
  price: number;
  category: string | null;
  emoji?: string;
  icon_id?: string | null;
}
```

### Extended Schema (with inventory)
```typescript
interface Product {
  product_id: string;
  name: string;
  price: number;
  category: string | null;
  emoji?: string;
  icon_id?: string | null;
  // Inventory fields
  barcode?: string | null;        // EAN-13, UPC-A, Code128, etc.
  sku?: string | null;            // Internal SKU
  track_stock: boolean;           // Whether to track inventory
  quantity: number;               // Current stock level
  low_stock_threshold: number;    // Alert when quantity <= this
  allow_negative_stock: boolean;  // Allow sales when out of stock
}
```

### Firestore Document Structure
```javascript
// Collection: stores/{store_id}/products/{product_id}
{
  product_id: 'prod_abc123',
  name: 'Coffee',
  price: 3.50,
  category: 'Drinks',
  emoji: '☕',
  icon_id: null,
  barcode: '5901234123457',
  sku: 'COFFEE-001',
  track_stock: true,
  quantity: 50,
  low_stock_threshold: 10,
  allow_negative_stock: false,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## API Endpoints

### Products (existing + extended)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/nfc/api/v1/store/:id/products` | GET | List all products |
| `/nfc/api/v1/store/:id/products` | POST | Create product |
| `/nfc/api/v1/store/:id/products/:pid` | PUT | Update product |
| `/nfc/api/v1/store/:id/products/:pid` | DELETE | Delete product |
| `/nfc/api/v1/store/:id/products/barcode/:code` | GET | Lookup by barcode |
| `/nfc/api/v1/store/:id/products/sku/:sku` | GET | Lookup by SKU |
| `/nfc/api/v1/store/:id/products/bulk` | POST | Bulk create/update |
| `/nfc/api/v1/store/:id/products/low-stock` | GET | List low-stock items |

### Inventory
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/nfc/api/v1/store/:id/inventory/adjust` | POST | Adjust stock (add/remove) |
| `/nfc/api/v1/store/:id/inventory/history` | GET | Stock adjustment history |
| `/nfc/api/v1/store/:id/inventory/count` | POST | Stock count reconciliation |

## Stock Decrement on Sale

When a payment is completed, stock should be decremented for tracked products.

### Pattern (in payment processing)
```javascript
// After successful payment, decrement stock
async function decrementStock(storeId, items) {
  const batch = db.batch();

  for (const item of items) {
    if (!item.product_id) continue;

    const productRef = db.collection('stores').doc(storeId)
      .collection('products').doc(item.product_id);

    const product = await productRef.get();
    if (!product.exists || !product.data().track_stock) continue;

    const currentQty = product.data().quantity || 0;
    const newQty = currentQty - (item.quantity || 1);

    // Check if negative stock allowed
    if (newQty < 0 && !product.data().allow_negative_stock) {
      throw new Error(`Insufficient stock for ${product.data().name}`);
    }

    batch.update(productRef, {
      quantity: newQty,
      updated_at: FieldValue.serverTimestamp()
    });

    // Log adjustment
    const historyRef = db.collection('stores').doc(storeId)
      .collection('inventory_history').doc();
    batch.set(historyRef, {
      product_id: item.product_id,
      adjustment: -(item.quantity || 1),
      reason: 'sale',
      receipt_id: receiptId,
      previous_quantity: currentQty,
      new_quantity: newQty,
      created_at: FieldValue.serverTimestamp()
    });
  }

  await batch.commit();
}
```

### Integration Points
- `nfc-api.index.js` line ~382 (NFC payment success)
- `api.js` line ~866 (Xaman payment poll success)
- `Plugin-api.js` line ~304 (Checkout session pay)
- `nfc-api.index.js` line ~4086 (Payment link pay)

## Low-Stock Alerts

### Check Pattern
```typescript
function checkLowStock(products: Product[]): Product[] {
  return products.filter(p =>
    p.track_stock &&
    p.quantity <= p.low_stock_threshold
  );
}
```

### Alert Display (Component Pattern)
```tsx
{lowStockProducts.length > 0 && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
    <div className="flex items-center gap-2 text-amber-400 mb-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="font-semibold">Low Stock Alert</span>
    </div>
    <ul className="text-sm text-zinc-400 space-y-1">
      {lowStockProducts.map(p => (
        <li key={p.product_id}>
          {p.name}: {p.quantity} remaining (threshold: {p.low_stock_threshold})
        </li>
      ))}
    </ul>
  </div>
)}
```

## Barcode Scanning

### Recommended Library
**html5-qrcode** - supports barcodes and QR codes, good mobile support.

```bash
npm install html5-qrcode
```

### Supported Formats
- EAN-13, EAN-8 (retail products)
- UPC-A, UPC-E (US retail)
- Code128, Code39 (general purpose)
- QR Code (can encode product URLs)
- DataMatrix, PDF417

### Scanner Component Pattern
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onError, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const scannerId = 'barcode-scanner';

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // Back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778,
          },
          (decodedText) => {
            // Vibrate on success
            if (navigator.vibrate) navigator.vibrate(100);
            scanner.stop();
            onScan(decodedText);
          },
          () => {} // Ignore scan failures
        );

        setHasPermission(true);
      } catch (err: any) {
        console.error('Scanner error:', err);
        setHasPermission(false);
        onError?.(err.message || 'Camera access denied');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan, onError]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-white font-bold">Scan Barcode</h2>
        <button onClick={onClose} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scanner viewport */}
      <div className="flex-1 relative">
        <div id="barcode-scanner" className="w-full h-full" />

        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-emerald-400 rounded-lg">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />
          </div>
        </div>
      </div>

      {/* Permission denied message */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center p-6">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h3 className="text-white font-bold mb-2">Camera Access Denied</h3>
            <p className="text-zinc-400 text-sm">Please enable camera permissions in your browser settings.</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 text-center">
        <p className="text-zinc-400 text-sm">
          Position the barcode within the frame
        </p>
      </div>
    </div>
  );
}
```

### Barcode Lookup in POS
```tsx
const handleBarcodeScan = async (barcode: string) => {
  setShowScanner(false);

  try {
    const res = await fetch(
      `${API_URL}/store/${storeId}/products/barcode/${encodeURIComponent(barcode)}`
    );
    const data = await res.json();

    if (data.success && data.product) {
      // Add to cart
      addToCart(data.product);
    } else {
      setError(`Product not found for barcode: ${barcode}`);
    }
  } catch (err) {
    setError('Failed to lookup barcode');
  }
};
```

### Manual Barcode Entry (Fallback)
```tsx
<div className="flex gap-2">
  <input
    type="text"
    value={manualBarcode}
    onChange={(e) => setManualBarcode(e.target.value)}
    placeholder="Enter barcode manually"
    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
  />
  <button
    onClick={() => handleBarcodeScan(manualBarcode)}
    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg"
  >
    Lookup
  </button>
</div>
```

## Stock Adjustment Modal

For manual stock adjustments (receiving inventory, corrections, etc.):

```tsx
interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAdjust: (adjustment: number, reason: string) => Promise<void>;
}

export default function StockAdjustmentModal({
  isOpen, onClose, product, onAdjust
}: StockAdjustmentModalProps) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (adjustment === 0) return;
    setSaving(true);
    try {
      await onAdjust(adjustment, reason);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const newQuantity = product.quantity + adjustment;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Adjust Stock</h2>
        <p className="text-zinc-400 mb-4">{product.name}</p>

        <div className="space-y-4">
          {/* Current stock */}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Current stock:</span>
            <span className="text-white font-medium">{product.quantity}</span>
          </div>

          {/* Adjustment */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Adjustment</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdjustment(a => a - 1)}
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-xl"
              >
                -
              </button>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-center"
              />
              <button
                onClick={() => setAdjustment(a => a + 1)}
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* New quantity preview */}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">New stock:</span>
            <span className={`font-medium ${newQuantity < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {newQuantity}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select reason...</option>
              <option value="received">Stock Received</option>
              <option value="returned">Customer Return</option>
              <option value="damaged">Damaged/Expired</option>
              <option value="correction">Inventory Correction</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={adjustment === 0 || saving}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Inventory History

### Firestore Collection
```javascript
// Collection: stores/{store_id}/inventory_history
{
  id: auto,
  product_id: 'prod_abc123',
  product_name: 'Coffee',  // Denormalized for quick display
  adjustment: -1,          // Negative for sales, positive for receiving
  reason: 'sale' | 'received' | 'returned' | 'damaged' | 'correction' | 'other',
  receipt_id: 'rcpt_xyz',  // If from a sale
  notes: 'string',         // Optional notes
  previous_quantity: 51,
  new_quantity: 50,
  adjusted_by: 'wallet_address',
  created_at: Timestamp
}
```

### History Display Pattern
```tsx
<div className="space-y-2">
  {history.map((entry) => (
    <div key={entry.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
      <div>
        <p className="text-white font-medium">{entry.product_name}</p>
        <p className="text-sm text-zinc-500">
          {entry.reason} • {formatDate(entry.created_at)}
        </p>
      </div>
      <div className={`font-bold ${entry.adjustment > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
      </div>
    </div>
  ))}
</div>
```

## Key Files

| File | Role |
|------|------|
| `components/ProductsManager.tsx` | Product CRUD (extend for inventory) |
| `components/BarcodeScanner.tsx` | Camera barcode scanning (NEW) |
| `components/StockAdjustmentModal.tsx` | Manual stock adjustments (NEW) |
| `components/LowStockAlert.tsx` | Low stock warning banner (NEW) |
| `app/(noheader)/take-payment/page.tsx` | POS - integrate barcode lookup |
| `nfc-api.index.js` | Backend product & inventory endpoints |

## Implementation Order

1. **Backend first:** Add inventory fields to product schema, create endpoints
2. **ProductsManager:** Add stock fields to product form
3. **BarcodeScanner:** Create scanner component
4. **POS integration:** Add scan button, barcode lookup
5. **Stock decrement:** Hook into payment success flows
6. **Low stock alerts:** Add to dashboard/POS
7. **Inventory history:** Create adjustment modal and history view
