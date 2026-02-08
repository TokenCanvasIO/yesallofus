'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
import { Theme } from 'emoji-picker-react';
import { foodIcons, foodIconCategories, findIconForProduct, getIconById, FoodIcon } from '@/lib/foodIcons';
import CSVImportModal from './CSVImportModal';
import InventoryHistoryModal from './InventoryHistoryModal';
import { getAuthHeaders } from '@/lib/walletAuth';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Product {
  product_id: string;
  name: string;
  price: number;
  sku: string;
  category: string | null;
  emoji?: string | null;
  icon_id?: string | null;
  image_url?: string | null;
  // Inventory fields
  barcode?: string | null;
  track_stock?: boolean;
  quantity?: number;
  low_stock_threshold?: number;
  allow_negative_stock?: boolean;
}

interface ProductsManagerProps {
  storeId: string;
  walletAddress: string;
  autoOpenImport?: boolean;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

const productEmojis: Record<string, string> = {
  'coffee': '☕', 'latte': '☕', 'cappuccino': '☕', 'espresso': '☕',
  'tea': '🍵', 'hot chocolate': '🍫', 'water': '💧', 'juice': '🧃',
  'smoothie': '🥤', 'soda': '🥤', 'beer': '🍺', 'wine': '🍷',
  'croissant': '🥐', 'bagel': '🥯', 'toast': '🍞', 'waffle': '🧇',
  'pancake': '🥞', 'egg': '🥚', 'bacon': '🥓', 'sandwich': '🥪',
  'burger': '🍔', 'pizza': '🍕', 'salad': '🥗', 'soup': '🍲',
  'pasta': '🍝', 'sushi': '🍣', 'cookie': '🍪', 'cake': '🍰',
  'donut': '🍩', 'ice cream': '🍦', 'fries': '🍟', 'taco': '🌮',
};

function getAutoEmoji(name: string, category: string | null): string {
  const nameLower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(productEmojis)) {
    if (nameLower.includes(key)) return emoji;
  }
  return '📦';
}

function ProductIcon({ product, size = 40 }: { product: Product; size?: number }) {
  if (product.image_url) {
    return (
      <img 
        src={product.image_url} 
        alt={product.name}
        className="object-cover rounded-lg"
        style={{ width: size, height: size }}
      />
    );
  }
  
  if (product.icon_id) {
    const icon = getIconById(product.icon_id);
    if (icon) {
      return (
        <div 
          className="bg-zinc-700 rounded-lg flex items-center justify-center text-emerald-400"
          style={{ width: size, height: size, padding: size * 0.15 }}
          dangerouslySetInnerHTML={{ __html: icon.svg }}
        />
      );
    }
  }
  
  const emoji = product.emoji || getAutoEmoji(product.name, product.category);
  return (
    <div 
      className="bg-zinc-700 rounded-lg flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}

export default function ProductsManager({ storeId, walletAddress, autoOpenImport }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconTab, setIconTab] = useState<'icons' | 'emoji' | 'upload'>('icons');
  const [iconSearch, setIconSearch] = useState('');
  const [selectedIconCategory, setSelectedIconCategory] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formEmoji, setFormEmoji] = useState('');
  const [formIconId, setFormIconId] = useState<string | null>(null);
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  // Inventory form fields
  const [formBarcode, setFormBarcode] = useState('');
  const [formTrackStock, setFormTrackStock] = useState(false);
  const [formQuantity, setFormQuantity] = useState('');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState('5');

  // CSV Import/Export
  const [showImportModal, setShowImportModal] = useState(false);

  // Auto-open import modal when redirected from POS bulk import
  useEffect(() => {
    if (autoOpenImport) {
      setShowImportModal(true);
    }
  }, [autoOpenImport]);

  // Inventory History
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const authHeaders = await getAuthHeaders(walletAddress);
      const res = await fetch(`${API_URL}/store/${storeId}/products?wallet_address=${walletAddress}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setProducts(data.products);
      else setError(data.error || 'Failed to load products');
    } catch {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (storeId && walletAddress) fetchProducts();
  }, [storeId, walletAddress]);

  // CSV Import Handler
  const handleCSVImport = async (rows: Record<string, string>[]): Promise<{ success: number; failed: number; errors: string[] }> => {
    try {
      const products = rows.map(row => ({
        name: row.name?.trim(),
        price: parseFloat(row.price),
        category: row.category?.trim() || null,
        sku: row.sku?.trim() || null,
        barcode: row.barcode?.trim() || null,
        track_stock: row.quantity !== undefined && row.quantity !== '',
        quantity: parseInt(row.quantity) || 0,
        low_stock_threshold: parseInt(row.low_stock_threshold) || 5
      }));

      const authHeaders = await getAuthHeaders(walletAddress);
      const res = await fetch(`${API_URL}/store/${storeId}/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          wallet_address: walletAddress,
          products
        })
      });

      const data = await res.json();

      if (data.success) {
        await fetchProducts(); // Refresh the product list
        return {
          success: data.created || 0,
          failed: data.errors?.length || 0,
          errors: data.errors || []
        };
      } else {
        return {
          success: 0,
          failed: rows.length,
          errors: [data.error || 'Import failed']
        };
      }
    } catch (err: any) {
      return {
        success: 0,
        failed: rows.length,
        errors: [err.message || 'Network error']
      };
    }
  };

  // CSV Export Handler
  const handleCSVExport = () => {
    const csv = Papa.unparse({
      fields: ['name', 'price', 'category', 'sku', 'barcode', 'quantity', 'low_stock_threshold'],
      data: products.map(p => ({
        name: p.name,
        price: p.price.toFixed(2),
        category: p.category || '',
        sku: p.sku || '',
        barcode: p.barcode || '',
        quantity: p.track_stock ? (p.quantity || 0).toString() : '',
        low_stock_threshold: p.track_stock ? (p.low_stock_threshold || 5).toString() : ''
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

  useEffect(() => {
    if (formName && !editingProduct && !formIconId && !formImageUrl) {
      const icon = findIconForProduct(formName, formCategory);
      if (icon) {
        setFormIconId(icon.id);
        setFormEmoji('');
      } else {
        setFormEmoji(getAutoEmoji(formName, formCategory));
        setFormIconId(null);
      }
    }
  }, [formName, formCategory, editingProduct, formIconId, formImageUrl]);

  const resetForm = () => {
    setFormName(''); setFormPrice(''); setFormSku(''); setFormCategory('');
    setFormEmoji(''); setFormIconId(null); setFormImageUrl(null);
    setFormBarcode(''); setFormTrackStock(false); setFormQuantity(''); setFormLowStockThreshold('5');
    setEditingProduct(null); setShowForm(false); setShowIconPicker(false);
    setIconSearch(''); setSelectedIconCategory(null); setError(null);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormSku(product.sku);
    setFormCategory(product.category || '');
    setFormEmoji(product.emoji || '');
    setFormIconId(product.icon_id || null);
    setFormImageUrl(product.image_url || null);
    // Inventory fields
    setFormBarcode(product.barcode || '');
    setFormTrackStock(product.track_stock || false);
    setFormQuantity(product.quantity?.toString() || '0');
    setFormLowStockThreshold(product.low_stock_threshold?.toString() || '5');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) { setError('Name and price are required'); return; }
    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) { setError('Please enter a valid price'); return; }

    setSaving(true); setError(null);
    try {
      const url = editingProduct
        ? `${API_URL}/store/${storeId}/products/${editingProduct.product_id}`
        : `${API_URL}/store/${storeId}/products`;

      const authHeaders = await getAuthHeaders(walletAddress);
      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          wallet_address: walletAddress,
          name: formName.trim(),
          price,
          sku: formSku.trim() || undefined,
          category: formCategory.trim() || null,
          emoji: formIconId || formImageUrl ? null : (formEmoji || null),
          icon_id: formIconId || null,
          image_url: formImageUrl || null,
          // Inventory fields
          barcode: formBarcode.trim() || null,
          track_stock: formTrackStock,
          quantity: parseInt(formQuantity) || 0,
          low_stock_threshold: parseInt(formLowStockThreshold) || 5
        })
      });
      const data = await res.json();
      if (data.success) { await fetchProducts(); resetForm(); }
      else setError(data.error || 'Failed to save product');
    } catch { setError('Failed to save product'); }
    setSaving(false);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      const authHeaders = await getAuthHeaders(walletAddress);
      const res = await fetch(`${API_URL}/store/${storeId}/products/${product.product_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      const data = await res.json();
      if (data.success) setProducts(products.filter(p => p.product_id !== product.product_id));
      else setError(data.error || 'Failed to delete product');
    } catch { setError('Failed to delete product'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { 
    setError('Image must be less than 5MB'); 
    return; 
  }

  setUploading(true); 
  setError(null);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 't7wy0r6e');
    formData.append('eager', 'q_auto,f_auto,w_400,h_400,c_limit');
    
    const res = await fetch('https://api.cloudinary.com/v1_1/dghhmw3q3/image/upload', { 
      method: 'POST', 
      body: formData 
    });
    const data = await res.json();
    
    if (data.secure_url) {
      setFormImageUrl(data.secure_url);
      setFormIconId(null); 
      setFormEmoji(''); 
      setShowIconPicker(false);
    } else {
      setError('Failed to upload image');
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError('Failed to upload image');
  }
  
  setUploading(false);
};

  const selectIcon = (icon: FoodIcon) => {
    setFormIconId(icon.id); setFormEmoji(''); setFormImageUrl(null); setShowIconPicker(false);
  };

  const selectEmoji = (emoji: string) => {
    setFormEmoji(emoji); setFormIconId(null); setFormImageUrl(null); setShowIconPicker(false);
  };

  const filteredIcons = foodIcons.filter(icon => {
    if (selectedIconCategory && icon.category !== selectedIconCategory) return false;
    if (iconSearch) {
      const search = iconSearch.toLowerCase();
      return icon.name.toLowerCase().includes(search) || icon.keywords.some(k => k.includes(search));
    }
    return true;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  const currentPreview = formImageUrl ? (
    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
  ) : formIconId ? (
    <div className="w-full h-full flex items-center justify-center text-emerald-400 p-2" dangerouslySetInnerHTML={{ __html: getIconById(formIconId)?.svg || '' }} />
  ) : (
    <span className="text-4xl">{formEmoji || '📦'}</span>
  );

  return (
    <div className="bg-zinc-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Products</h2>
          <p className="text-zinc-500 text-sm">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import/Export dropdown for mobile, buttons for desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            {products.length > 0 && (
              <button
                onClick={handleCSVExport}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )}
          </div>
          {/* Mobile: compact buttons */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg transition"
              title="Import CSV"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            {products.length > 0 && (
              <button
                onClick={handleCSVExport}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg transition"
                title="Export CSV"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 text-xs mt-1 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Low Stock Alert */}
      {(() => {
        const lowStockProducts = products.filter(p =>
          p.track_stock && (p.quantity || 0) <= (p.low_stock_threshold || 5)
        );
        if (lowStockProducts.length === 0) return null;

        const outOfStock = lowStockProducts.filter(p => (p.quantity || 0) === 0);

        return (
          <div className={`rounded-lg p-4 mb-4 ${outOfStock.length > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-5 h-5 ${outOfStock.length > 0 ? 'text-red-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className={`font-semibold ${outOfStock.length > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                {outOfStock.length > 0 ? `${outOfStock.length} out of stock` : 'Low Stock Alert'}
              </span>
            </div>
            <ul className="text-sm text-zinc-400 space-y-1">
              {lowStockProducts.slice(0, 5).map(p => (
                <li key={p.product_id} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className={`font-mono ${(p.quantity || 0) === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {p.quantity || 0} left
                  </span>
                </li>
              ))}
              {lowStockProducts.length > 5 && (
                <li className="text-zinc-500">...and {lowStockProducts.length - 5} more</li>
              )}
            </ul>
          </div>
        );
      })()}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={resetForm} className="text-zinc-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Icon</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-16 h-16 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition overflow-hidden">
                    {currentPreview}
                  </button>
                  <div className="text-zinc-500 text-sm">
                    <p>Tap to choose</p>
                    <p className="text-zinc-600 text-xs">{formImageUrl ? 'Custom image' : formIconId ? 'SVG icon' : 'Emoji'}</p>
                  </div>
                </div>

                {showIconPicker && (
                  <div className="mt-3 bg-zinc-800 rounded-xl p-4">
                    <div className="flex gap-1 mb-4 bg-zinc-900 rounded-lg p-1">
                      {(['icons', 'emoji', 'upload'] as const).map(tab => (
                        <button key={tab} type="button" onClick={() => setIconTab(tab)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${iconTab === tab ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}>
                          {tab === 'icons' ? '🎨 Icons' : tab === 'emoji' ? '😀 Emoji' : '📷 Upload'}
                        </button>
                      ))}
                    </div>

                    {iconTab === 'icons' && (
                      <div>
                        <input type="text" placeholder="Search icons..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} className="w-full bg-zinc-900 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        <div className="flex flex-wrap gap-1 mb-3">
                          <button type="button" onClick={() => setSelectedIconCategory(null)} className={`px-2 py-1 rounded text-xs transition ${!selectedIconCategory ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>All</button>
                          {foodIconCategories.map(cat => (
                            <button key={cat} type="button" onClick={() => setSelectedIconCategory(cat)} className={`px-2 py-1 rounded text-xs transition ${selectedIconCategory === cat ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>{cat}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                          {filteredIcons.map(icon => (
                            <button key={icon.id} type="button" onClick={() => selectIcon(icon)} title={icon.name} className={`w-10 h-10 rounded-lg flex items-center justify-center text-emerald-400 transition hover:bg-zinc-600 ${formIconId === icon.id ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-zinc-700'}`}>
                              <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {iconTab === 'emoji' && (
                      <EmojiPicker onEmojiClick={(data) => selectEmoji(data.emoji)} theme={Theme.DARK} width="100%" height={300} />
                    )}

                    {iconTab === 'upload' && (
                      <div className="text-center py-8">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-lg transition disabled:opacity-50">
                          {uploading ? 'Uploading...' : '📷 Choose Image'}
                        </button>
                        <p className="text-zinc-500 text-xs mt-2">Max 5MB, JPG/PNG</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">Product Name <span className="text-red-400">*</span></label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Flat White" className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" autoFocus />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">Price (£) <span className="text-red-400">*</span></label>
                <input type="number" step="0.01" min="0" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0.00" className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">Category <span className="text-zinc-600">(optional)</span></label>
                <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Hot Drinks" list="categories" className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                {categories.length > 0 && <datalist id="categories">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>}
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">SKU <span className="text-zinc-600">(optional)</span></label>
                <input type="text" value={formSku} onChange={e => setFormSku(e.target.value.toUpperCase())} placeholder="e.g. FLATWHT" className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono" />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">Barcode <span className="text-zinc-600">(optional)</span></label>
                <input type="text" value={formBarcode} onChange={e => setFormBarcode(e.target.value)} placeholder="e.g. 5901234123457" className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono" />
              </div>

              {/* Inventory Section */}
              <div className="border-t border-zinc-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-zinc-300 text-sm font-medium">Track Stock</label>
                    <p className="text-zinc-500 text-xs">Monitor inventory levels</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormTrackStock(!formTrackStock)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formTrackStock ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formTrackStock ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {formTrackStock && (
                  <div className="space-y-4 bg-zinc-800/50 rounded-lg p-4">
                    <div>
                      <label className="text-zinc-400 text-sm block mb-1">Current Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formQuantity}
                        onChange={e => setFormQuantity(e.target.value)}
                        placeholder="0"
                        className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-sm block mb-1">Low Stock Alert</label>
                      <p className="text-zinc-500 text-xs mb-2">Alert when stock falls to this level</p>
                      <input
                        type="number"
                        min="0"
                        value={formLowStockThreshold}
                        onChange={e => setFormLowStockThreshold(e.target.value)}
                        placeholder="5"
                        className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-semibold transition disabled:opacity-50">
                  {saving ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-zinc-800/50 rounded-xl">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-zinc-400 mb-2">No products yet</p>
          <p className="text-zinc-500 text-sm">Add products to enable quick checkout</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.length > 0 ? (
            <>
              {categories.map(category => (
                <div key={category} className="mb-4">
                  <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-2">{category}</h3>
                  <div className="space-y-2">
                    {products.filter(p => p.category === category).map(product => (
                      <ProductRow
                        key={product.product_id}
                        product={product}
                        onEdit={() => openEditForm(product)}
                        onDelete={() => handleDelete(product)}
                        onHistory={() => { setHistoryProduct(product); setShowHistoryModal(true); }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {products.filter(p => !p.category).length > 0 && (
                <div>
                  <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-2">Uncategorized</h3>
                  <div className="space-y-2">
                    {products.filter(p => !p.category).map(product => (
                      <ProductRow
                        key={product.product_id}
                        product={product}
                        onEdit={() => openEditForm(product)}
                        onDelete={() => handleDelete(product)}
                        onHistory={() => { setHistoryProduct(product); setShowHistoryModal(true); }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            products.map(product => (
              <ProductRow
                key={product.product_id}
                product={product}
                onEdit={() => openEditForm(product)}
                onDelete={() => handleDelete(product)}
                onHistory={() => { setHistoryProduct(product); setShowHistoryModal(true); }}
              />
            ))
          )}
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-4 pt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-4">
            {(() => {
              const tracked = products.filter(p => p.track_stock);
              const lowStock = tracked.filter(p => (p.quantity || 0) <= (p.low_stock_threshold || 5));
              if (tracked.length === 0) return null;
              return (
                <>
                  <span className={lowStock.length > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                    {lowStock.length > 0 ? `${lowStock.length} low stock` : `${tracked.length} tracked`}
                  </span>
                  <button
                    onClick={() => { setHistoryProduct(null); setShowHistoryModal(true); }}
                    className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </button>
                </>
              );
            })()}
            {categories.length > 0 && <span>{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</span>}
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleCSVImport}
        templateColumns={['name', 'price', 'category', 'sku', 'barcode', 'quantity', 'low_stock_threshold']}
        requiredColumns={['name', 'price']}
        templateName="Products"
      />

      {/* Inventory History Modal */}
      {showHistoryModal && (
        <InventoryHistoryModal
          storeId={storeId}
          walletAddress={walletAddress}
          productId={historyProduct?.product_id}
          productName={historyProduct?.name}
          onClose={() => {
            setShowHistoryModal(false);
            setHistoryProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductRow({ product, onEdit, onDelete, onHistory }: { product: Product; onEdit: () => void; onDelete: () => void; onHistory?: () => void }) {
  const isLowStock = product.track_stock && (product.quantity || 0) <= (product.low_stock_threshold || 5);
  const isOutOfStock = product.track_stock && (product.quantity || 0) === 0;

  return (
    <div className="flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 rounded-lg p-3 transition group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <ProductIcon product={product} size={40} />
          {isOutOfStock && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">0</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{product.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-zinc-500 text-xs font-mono">{product.sku}</p>
            {product.barcode && (
              <p className="text-zinc-600 text-xs">• {product.barcode}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {product.track_stock && (
          <div className={`text-xs px-2 py-1 rounded-full font-medium ${
            isOutOfStock ? 'bg-red-500/20 text-red-400' :
            isLowStock ? 'bg-amber-500/20 text-amber-400' :
            'bg-zinc-700 text-zinc-400'
          }`}>
            {product.quantity || 0} in stock
          </div>
        )}
        <span className="text-emerald-400 font-semibold">£{product.price.toFixed(2)}</span>
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
          {product.track_stock && onHistory && (
            <button onClick={onHistory} className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700 rounded-lg transition" title="View history">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          )}
          <button onClick={onEdit} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition" title="Edit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={onDelete} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
