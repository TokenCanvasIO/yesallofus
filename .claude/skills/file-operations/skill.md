# File Operations

## Overview

Patterns for file uploads, CSV parsing, bulk imports, and batch operations. Used for importing products, exporting data, and handling file uploads in the YesAllOfUs platform.

## CSV Parsing Library

**Papa Parse** - robust CSV parser with streaming support.

```bash
npm install papaparse
npm install -D @types/papaparse
```

## CSV Import Component Pattern

### Full Import Modal
```tsx
'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
  templateColumns: string[];
  templateName: string;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  rowIndex: number;
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onImport,
  templateColumns,
  templateName
}: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setParseErrors(['Please select a CSV file']);
      return;
    }

    setFile(selectedFile);
    setParseErrors([]);
    setParsedData([]);
    setResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];

        // Check for required columns
        const headers = results.meta.fields || [];
        const missingColumns = templateColumns.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        // Parse errors from Papa Parse
        if (results.errors.length > 0) {
          results.errors.forEach(err => {
            errors.push(`Row ${err.row}: ${err.message}`);
          });
        }

        if (errors.length > 0) {
          setParseErrors(errors);
          return;
        }

        // Validate each row
        const parsed: ParsedRow[] = results.data.map((row: any, index: number) => {
          const rowErrors: string[] = [];

          // Validate required fields
          templateColumns.forEach(col => {
            if (!row[col] || row[col].trim() === '') {
              rowErrors.push(`${col} is required`);
            }
          });

          return {
            data: row,
            errors: rowErrors,
            rowIndex: index + 2 // +2 for header row and 0-index
          };
        });

        setParsedData(parsed);
      },
      error: (error) => {
        setParseErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.errors.length === 0);
    if (validRows.length === 0) return;

    setImporting(true);
    setProgress(0);

    try {
      const importResult = await onImport(validRows.map(r => r.data));
      setResult(importResult);
    } catch (err: any) {
      setResult({
        success: 0,
        failed: validRows.length,
        errors: [err.message || 'Import failed']
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse({
      fields: templateColumns,
      data: []
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter(r => r.errors.length === 0).length;
  const invalidCount = parsedData.filter(r => r.errors.length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Import {templateName}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Template download */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV Template
            </button>
          </div>

          {/* Drop zone */}
          {!file && !result && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-zinc-400 mb-2">Drag and drop your CSV file here</p>
              <p className="text-zinc-500 text-sm mb-4">or</p>
              <label className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 font-medium mb-2">Errors found:</p>
              <ul className="text-sm text-red-300 space-y-1">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && !result && (
            <div>
              {/* Summary */}
              <div className="flex gap-4 mb-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                  <span className="text-emerald-400 font-bold">{validCount}</span>
                  <span className="text-zinc-400 text-sm ml-2">valid rows</span>
                </div>
                {invalidCount > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    <span className="text-red-400 font-bold">{invalidCount}</span>
                    <span className="text-zinc-400 text-sm ml-2">invalid rows</span>
                  </div>
                )}
              </div>

              {/* Preview table */}
              <div className="border border-zinc-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-zinc-400">Row</th>
                      {templateColumns.map(col => (
                        <th key={col} className="px-3 py-2 text-left text-zinc-400">{col}</th>
                      ))}
                      <th className="px-3 py-2 text-left text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((row) => (
                      <tr key={row.rowIndex} className="border-t border-zinc-800">
                        <td className="px-3 py-2 text-zinc-500">{row.rowIndex}</td>
                        {templateColumns.map(col => (
                          <td key={col} className="px-3 py-2 text-white truncate max-w-[150px]">
                            {row.data[col] || '-'}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="text-emerald-400">Valid</span>
                          ) : (
                            <span className="text-red-400" title={row.errors.join(', ')}>
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <div className="p-3 text-center text-zinc-500 text-sm bg-zinc-800/50">
                    Showing first 50 of {parsedData.length} rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Importing...</span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4">
              <div className={`rounded-lg p-4 ${
                result.failed === 0
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <p className={`font-medium ${result.failed === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Import Complete
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {result.success} imported successfully
                  {result.failed > 0 && `, ${result.failed} failed`}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-400 space-y-1">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <button
            onClick={() => {
              setFile(null);
              setParsedData([]);
              setParseErrors([]);
              setResult(null);
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl"
          >
            {result ? 'Import Another' : 'Reset'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl"
            >
              {importing ? 'Importing...' : `Import ${validCount} Items`}
            </button>
          )}
          {result && (
            <button
              onClick={onClose}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Product CSV Import

### Template Columns
```typescript
const PRODUCT_CSV_COLUMNS = [
  'name',      // Required: Product name
  'price',     // Required: Price in GBP (number)
  'category',  // Optional: Category name
  'barcode',   // Optional: Barcode/EAN
  'sku',       // Optional: Internal SKU
  'quantity',  // Optional: Initial stock (default: 0)
  'low_stock_threshold', // Optional: Alert threshold (default: 5)
];
```

### Example CSV
```csv
name,price,category,barcode,sku,quantity,low_stock_threshold
Latte,3.50,Drinks,5901234123457,LATTE-001,50,10
Croissant,2.50,Food,5901234123458,CROISS-001,25,5
Espresso,2.00,Drinks,,ESP-001,100,20
```

### Validation Function
```typescript
function validateProductRow(row: Record<string, string>): string[] {
  const errors: string[] = [];

  // Required: name
  if (!row.name?.trim()) {
    errors.push('Name is required');
  }

  // Required: price (must be valid number)
  const price = parseFloat(row.price);
  if (isNaN(price) || price < 0) {
    errors.push('Price must be a valid positive number');
  }
  if (price > 99999.99) {
    errors.push('Price exceeds maximum (99999.99)');
  }

  // Optional: quantity (must be integer >= 0)
  if (row.quantity) {
    const qty = parseInt(row.quantity);
    if (isNaN(qty) || qty < 0) {
      errors.push('Quantity must be a non-negative integer');
    }
  }

  // Optional: barcode (validate format if present)
  if (row.barcode && !/^[0-9A-Za-z\-]+$/.test(row.barcode)) {
    errors.push('Invalid barcode format');
  }

  return errors;
}
```

### Import Handler
```typescript
const handleProductImport = async (rows: Record<string, string>[]) => {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  // Batch into chunks of 50
  const chunks = chunkArray(rows, 50);

  for (const chunk of chunks) {
    try {
      const products = chunk.map(row => ({
        name: row.name.trim(),
        price: parseFloat(row.price),
        category: row.category?.trim() || null,
        barcode: row.barcode?.trim() || null,
        sku: row.sku?.trim() || null,
        track_stock: true,
        quantity: parseInt(row.quantity) || 0,
        low_stock_threshold: parseInt(row.low_stock_threshold) || 5,
        allow_negative_stock: false,
      }));

      const res = await fetch(`${API_URL}/store/${storeId}/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, wallet_address: walletAddress })
      });

      const data = await res.json();

      if (data.success) {
        results.success += data.created || chunk.length;
        if (data.errors) {
          results.errors.push(...data.errors);
          results.failed += data.errors.length;
        }
      } else {
        results.failed += chunk.length;
        results.errors.push(data.error || 'Batch import failed');
      }
    } catch (err: any) {
      results.failed += chunk.length;
      results.errors.push(err.message || 'Network error');
    }
  }

  return results;
};

// Helper to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

## Batch API Pattern (Backend)

### Bulk Create Endpoint
```javascript
// POST /api/v1/store/:id/products/bulk
app.post('/api/v1/store/:id/products/bulk', async (req, res) => {
  const { id: storeId } = req.params;
  const { products, wallet_address } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.json({ success: false, error: 'Products array required' });
  }

  if (products.length > 500) {
    return res.json({ success: false, error: 'Maximum 500 products per batch' });
  }

  const results = { created: 0, errors: [] };
  const batch = db.batch();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Validate
    if (!product.name || typeof product.price !== 'number') {
      results.errors.push(`Row ${i + 1}: Invalid product data`);
      continue;
    }

    // Check for duplicate barcode
    if (product.barcode) {
      const existing = await db.collection('stores').doc(storeId)
        .collection('products')
        .where('barcode', '==', product.barcode)
        .limit(1)
        .get();

      if (!existing.empty) {
        results.errors.push(`Row ${i + 1}: Barcode ${product.barcode} already exists`);
        continue;
      }
    }

    // Create product
    const productId = `prod_${crypto.randomBytes(8).toString('hex')}`;
    const productRef = db.collection('stores').doc(storeId)
      .collection('products').doc(productId);

    batch.set(productRef, {
      product_id: productId,
      name: product.name,
      price: product.price,
      category: product.category || null,
      barcode: product.barcode || null,
      sku: product.sku || null,
      track_stock: product.track_stock ?? true,
      quantity: product.quantity || 0,
      low_stock_threshold: product.low_stock_threshold || 5,
      allow_negative_stock: product.allow_negative_stock || false,
      emoji: null,
      icon_id: null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });

    results.created++;
  }

  await batch.commit();

  res.json({
    success: true,
    created: results.created,
    errors: results.errors
  });
});
```

## CSV Export Pattern

### Export Function
```typescript
const exportProductsCSV = () => {
  const csv = Papa.unparse({
    fields: ['name', 'price', 'category', 'barcode', 'sku', 'quantity', 'low_stock_threshold'],
    data: products.map(p => ({
      name: p.name,
      price: p.price,
      category: p.category || '',
      barcode: p.barcode || '',
      sku: p.sku || '',
      quantity: p.quantity || 0,
      low_stock_threshold: p.low_stock_threshold || 5
    }))
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
```

### Export Button
```tsx
<button
  onClick={exportProductsCSV}
  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
  Export CSV
</button>
```

## Image Upload Pattern

For product images (using existing Cloudinary integration):

```typescript
const uploadProductImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'product_images');

  try {
    const res = await fetch('https://tokencanvas.io/api/cloudinary/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.secure_url) {
      return data.secure_url;
    }
  } catch (err) {
    console.error('Image upload failed:', err);
  }

  return null;
};
```

## File Size and Type Validation

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CSV_TYPES = ['text/csv', 'application/vnd.ms-excel'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File, allowedTypes: string[], maxSize: number): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
  }

  if (file.size > maxSize) {
    return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  return null;
}
```

## Progress Indicator Pattern

For long-running batch operations:

```tsx
interface ProgressState {
  current: number;
  total: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  message: string;
}

const [progress, setProgress] = useState<ProgressState>({
  current: 0,
  total: 0,
  status: 'idle',
  message: ''
});

// During batch processing
for (let i = 0; i < chunks.length; i++) {
  setProgress({
    current: i * chunkSize,
    total: totalItems,
    status: 'processing',
    message: `Processing batch ${i + 1} of ${chunks.length}...`
  });

  await processChunk(chunks[i]);
}

// Progress bar component
{progress.status === 'processing' && (
  <div className="mt-4">
    <div className="flex justify-between text-sm mb-2">
      <span className="text-zinc-400">{progress.message}</span>
      <span className="text-white">
        {progress.current} / {progress.total}
      </span>
    </div>
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${(progress.current / progress.total) * 100}%` }}
      />
    </div>
  </div>
)}
```

## Key Files

| File | Role |
|------|------|
| `components/CSVImportModal.tsx` | Generic CSV import modal (NEW) |
| `components/ProductsManager.tsx` | Add import/export buttons |
| `nfc-api.index.js` | Add bulk product endpoint |

## Dependencies

```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14"
}
```

## Implementation Order

1. Install Papa Parse dependency
2. Create CSVImportModal component
3. Add bulk create endpoint to backend
4. Integrate import button in ProductsManager
5. Add export functionality
6. Test with sample CSV files
