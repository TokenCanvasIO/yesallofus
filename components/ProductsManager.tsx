'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Product {
  product_id: string;
  name: string;
  price: number;
  sku: string;
  category: string | null;
  emoji?: string | null;
}

interface ProductsManagerProps {
  storeId: string;
  walletAddress: string;
}

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

// Emoji categories for picker
const emojiCategories: Record<string, string[]> = {
  'Hot Drinks': ['☕', '🍵', '🫖', '🧉', '🍫'],
  'Cold Drinks': ['🥤', '🧃', '🥛', '💧', '🧊', '🍹', '🍸', '🍺', '🍷', '🥂', '🍾'],
  'Breakfast': ['🥐', '🥯', '🍞', '🥖', '🧇', '🥞', '🍳', '🥚', '🥓', '🧈'],
  'Lunch': ['🥪', '🌯', '🥙', '🍔', '🍟', '🌭', '🍕', '🥗', '🍲', '🍜', '🍝'],
  'Snacks': ['🍪', '🧁', '🍰', '🎂', '🍩', '🍿', '🥨', '🥜', '🍫', '🍬', '🍭'],
  'Fruit': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🥝', '🥭', '🍑', '🍒'],
  'Food': ['🍽️', '🥘', '🍛', '🍣', '🍱', '🥟', '🥡', '🍤', '🥩', '🍗', '🥓'],
  'Desserts': ['🍦', '🍨', '🧁', '🍰', '🎂', '🍮', '🍯', '🍡', '🥧'],
  'Other': ['📦', '🛒', '🎁', '💰', '⭐', '❤️', '✨', '🔥', '👍', '🏷️']
};

// Product name to emoji mapping for auto-detect
const productEmojis: Record<string, string> = {
  // Hot drinks
  'coffee': '☕', 'latte': '☕', 'cappuccino': '☕', 'espresso': '☕', 'americano': '☕',
  'flat white': '☕', 'mocha': '☕', 'macchiato': '☕', 'cortado': '☕',
  'tea': '🍵', 'chai': '🍵', 'matcha': '🍵', 'green tea': '🍵',
  'hot chocolate': '🍫', 'cocoa': '🍫',
  
  // Cold drinks
  'water': '💧', 'sparkling': '💧',
  'juice': '🧃', 'orange juice': '🧃', 'apple juice': '🧃',
  'smoothie': '🥤', 'milkshake': '🥤', 'frappe': '🥤',
  'soda': '🥤', 'cola': '🥤', 'lemonade': '🍋',
  'iced coffee': '🧊', 'iced tea': '🧊', 'cold brew': '🧊',
  'beer': '🍺', 'wine': '🍷', 'cocktail': '🍸', 'champagne': '🥂',
  
  // Breakfast
  'croissant': '🥐', 'pastry': '🥐', 'danish': '🥐', 'pain au chocolat': '🥐',
  'bagel': '🥯', 'toast': '🍞', 'bread': '🍞', 'baguette': '🥖',
  'waffle': '🧇', 'pancake': '🥞', 'pancakes': '🥞',
  'egg': '🥚', 'eggs': '🥚', 'omelette': '🍳', 'scrambled': '🍳',
  'bacon': '🥓', 'sausage': '🌭',
  'cereal': '🥣', 'porridge': '🥣', 'oatmeal': '🥣',
  'yogurt': '🥛', 'granola': '🥣',
  
  // Lunch
  'sandwich': '🥪', 'panini': '🥪', 'sub': '🥪',
  'wrap': '🌯', 'burrito': '🌯', 'taco': '🌮',
  'burger': '🍔', 'cheeseburger': '🍔',
  'fries': '🍟', 'chips': '🍟',
  'pizza': '🍕', 'slice': '🍕',
  'salad': '🥗', 'bowl': '🥗',
  'soup': '🍲', 'stew': '🍲',
  'pasta': '🍝', 'noodles': '🍜', 'ramen': '🍜',
  'sushi': '🍣', 'rice': '🍚',
  'chicken': '🍗', 'wings': '🍗',
  'fish': '🐟', 'salmon': '🐟',
  
  // Snacks & Desserts
  'cookie': '🍪', 'cookies': '🍪', 'biscuit': '🍪',
  'muffin': '🧁', 'cupcake': '🧁',
  'cake': '🍰', 'cheesecake': '🍰', 'brownie': '🍫',
  'donut': '🍩', 'doughnut': '🍩',
  'ice cream': '🍦', 'gelato': '🍨', 'sundae': '🍨',
  'chocolate': '🍫', 'candy': '🍬',
  'popcorn': '🍿', 'pretzel': '🥨', 'nuts': '🥜',
  'pie': '🥧', 'tart': '🥧',
  'fruit': '🍎', 'apple': '🍎', 'banana': '🍌', 'orange': '🍊',
  
  // Other
  'snack': '🍿', 'treat': '🍬', 'special': '⭐', 'combo': '🍽️', 'meal': '🍽️',
  'kids': '🧒', 'vegan': '🌱', 'gluten free': '🌾',
};

function getAutoEmoji(name: string, category: string | null): string {
  const nameLower = name.toLowerCase();
  
  for (const [key, emoji] of Object.entries(productEmojis)) {
    if (nameLower.includes(key)) return emoji;
  }
  
  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes('hot') || catLower.includes('coffee')) return '☕';
    if (catLower.includes('cold') || catLower.includes('drink')) return '🥤';
    if (catLower.includes('breakfast')) return '🥐';
    if (catLower.includes('lunch')) return '🥪';
    if (catLower.includes('snack')) return '🍪';
    if (catLower.includes('dessert') || catLower.includes('sweet')) return '🧁';
    if (catLower.includes('food')) return '🍽️';
  }
  
  return '📦';
}

export default function ProductsManager({ storeId, walletAddress }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formEmoji, setFormEmoji] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/store/${storeId}/products?wallet_address=${walletAddress}`
      );
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (storeId && walletAddress) {
      fetchProducts();
    }
  }, [storeId, walletAddress]);

  // Auto-detect emoji when name changes
  useEffect(() => {
    if (formName && !editingProduct) {
      const autoEmoji = getAutoEmoji(formName, formCategory);
      setFormEmoji(autoEmoji);
    }
  }, [formName, formCategory, editingProduct]);

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormSku('');
    setFormCategory('');
    setFormEmoji('');
    setEditingProduct(null);
    setShowForm(false);
    setShowEmojiPicker(false);
    setError(null);
  };

  // Open edit form
  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormSku(product.sku);
    setFormCategory(product.category || '');
    setFormEmoji(product.emoji || getAutoEmoji(product.name, product.category));
    setShowForm(true);
  };

  // Save product (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim() || !formPrice) {
      setError('Name and price are required');
      return;
    }

    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = editingProduct
        ? `${API_URL}/store/${storeId}/products/${editingProduct.product_id}`
        : `${API_URL}/store/${storeId}/products`;

      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          name: formName.trim(),
          price: price,
          sku: formSku.trim() || undefined,
          category: formCategory.trim() || null,
          emoji: formEmoji || null
        })
      });

      const data = await res.json();

      if (data.success) {
        await fetchProducts();
        resetForm();
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch (err) {
      setError('Failed to save product');
    }

    setSaving(false);
  };

  // Delete product
  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(
        `${API_URL}/store/${storeId}/products/${product.product_id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: walletAddress })
        }
      );

      const data = await res.json();

      if (data.success) {
        setProducts(products.filter(p => p.product_id !== product.product_id));
      } else {
        setError(data.error || 'Failed to delete product');
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Products</h2>
          <p className="text-zinc-500 text-sm">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 text-xs mt-1 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                onClick={resetForm}
                className="text-zinc-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Emoji Selector */}
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Icon</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-16 h-16 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl flex items-center justify-center text-4xl transition"
                  >
                    {formEmoji || '📦'}
                  </button>
                  <div className="text-zinc-500 text-sm">
                    <p>Tap to choose an icon</p>
                    <p className="text-zinc-600 text-xs">Auto-detected from name</p>
                  </div>
                </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
  <div className="mt-3">
    <EmojiPicker
      onEmojiClick={(emojiData) => {
        setFormEmoji(emojiData.emoji);
        setShowEmojiPicker(false);
      }}
      theme={Theme.DARK}
      width="100%"
      height={350}
    />
  </div>
)}
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Flat White"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Price (£) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  Category <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Hot Drinks"
                  list="categories"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                {categories.length > 0 && (
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                )}
              </div>

              <div>
                <label className="text-zinc-400 text-sm block mb-1">
                  SKU <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                  placeholder="e.g. FLATWHT"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-zinc-600 text-xs mt-1">Auto-generated if left blank</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                      Saving...
                    </span>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
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
          {/* Group by category */}
          {categories.length > 0 ? (
            <>
              {categories.map(category => (
                <div key={category} className="mb-4">
                  <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {products
                      .filter(p => p.category === category)
                      .map(product => (
                        <ProductRow
                          key={product.product_id}
                          product={product}
                          onEdit={() => openEditForm(product)}
                          onDelete={() => handleDelete(product)}
                        />
                      ))}
                  </div>
                </div>
              ))}
              {/* Uncategorized */}
              {products.filter(p => !p.category).length > 0 && (
                <div>
                  <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    Uncategorized
                  </h3>
                  <div className="space-y-2">
                    {products
                      .filter(p => !p.category)
                      .map(product => (
                        <ProductRow
                          key={product.product_id}
                          product={product}
                          onEdit={() => openEditForm(product)}
                          onDelete={() => handleDelete(product)}
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
              />
            ))
          )}
        </div>
      )}

      {/* Summary */}
      {products.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-sm">
          <span className="text-zinc-500">{products.length} product{products.length !== 1 ? 's' : ''}</span>
          {categories.length > 0 && (
            <span className="text-zinc-500">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Product row component
function ProductRow({
  product,
  onEdit,
  onDelete
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const emoji = product.emoji || getAutoEmoji(product.name, product.category);
  
  return (
    <div className="flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 rounded-lg p-3 transition group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{product.name}</p>
          <p className="text-zinc-500 text-xs font-mono">{product.sku}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-emerald-400 font-semibold">£{product.price.toFixed(2)}</span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}