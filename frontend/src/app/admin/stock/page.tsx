'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types';
import { Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';

export default function AdminStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await apiFetch('/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (productId: string, variantId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: newStock } : v)),
          };
        }
        return p;
      })
    );
  };

  const handleSaveStock = async (product: Product) => {
    setSavingProductId(product.id);
    setSuccessMsg('');

    try {
      const res = await apiFetch(`/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
          })),
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Stock updated for ${product.name}`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to update stock');
      }
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Inventory & Stock Matrix</h1>
        <p className="text-xs text-gray-500 mt-1">
          Edit per-variant stock counts (Size/Color). Setting stock to 0 disables variant purchase on storefront without deleting the product.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading variant inventory...</div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => {
            const primaryImage =
              product.images && product.images.length > 0
                ? product.images[0].url
                : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';

            return (
              <div
                key={product.id}
                className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={getImageUrl(primaryImage)} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-ramyaa-charcoal">
                        {product.name}
                      </h3>
                      <span className="text-xs font-semibold text-ramyaa-blue">
                        Category: {product.category?.name}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveStock(product)}
                    disabled={savingProductId === product.id}
                    className="inline-flex items-center space-x-2 rounded-xl bg-ramyaa-blue px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-ramyaa-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingProductId === product.id ? 'Updating...' : 'Save Stock'}</span>
                  </button>
                </div>

                {/* Variant Stock Inputs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                        v.stock === 0
                          ? 'bg-rose-50 border-rose-200'
                          : v.stock <= 3
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-ramyaa-charcoal">Size: {v.size}</span>
                        <span className="text-ramyaa-pink text-[11px]">{v.color}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-[10px] text-gray-500 font-semibold">Qty:</label>
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) =>
                            handleStockChange(product.id, v.id, parseInt(e.target.value) || 0)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white p-1 text-center font-bold text-xs focus:ring-2 focus:ring-ramyaa-blue"
                        />
                      </div>

                      {v.stock === 0 && (
                        <span className="text-[9px] font-bold text-rose-600 block">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
