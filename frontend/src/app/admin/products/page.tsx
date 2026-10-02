'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import { formatPrice, calculateSellingPrice } from '@/lib/utils';
import { apiFetch, getImageUrl } from '@/lib/api';
import { Plus, Edit3, Trash2, X, ImagePlus, Package, Sparkles, Upload, Link as LinkIcon } from 'lucide-react';

interface VariantRow {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const PRESET_COLORS = [
  { name: 'Rose Pink', hex: '#E785B1' },
  { name: 'Maroon', hex: '#800020' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Mustard Yellow', hex: '#D4A017' },
  { name: 'Deep Red', hex: '#B91C1C' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Ivory White', hex: '#FFFFF0' },
  { name: 'Black', hex: '#1F2937' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mrp, setMrp] = useState<number>(4999);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [categoryId, setCategoryId] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFestive, setIsFestive] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [fabric, setFabric] = useState('Pure Georgette & Organza Dupatta');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-Image state
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant Matrix state
  const [variantsMatrix, setVariantsMatrix] = useState<VariantRow[]>([
    { size: 'S', color: 'Rose Pink', colorHex: '#E785B1', stock: 5 },
    { size: 'M', color: 'Rose Pink', colorHex: '#E785B1', stock: 8 },
  ]);

  const computedSellingPrice = calculateSellingPrice(mrp, discountPercent);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !categoryId) {
          setCategoryId(catData.categories[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setMrp(4999);
    setDiscountPercent(20);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setIsFestive(false);
    setInStock(true);
    setFabric('Pure Georgette & Organza Dupatta');
    setImagesList([]);
    setImageUrl('');
    setVariantsMatrix([
      { size: 'S', color: 'Rose Pink', colorHex: '#E785B1', stock: 5 },
      { size: 'M', color: 'Rose Pink', colorHex: '#E785B1', stock: 8 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setMrp(product.mrp);
    setDiscountPercent(product.discountPercent);
    setCategoryId(product.categoryId);
    setIsNewArrival(product.isNewArrival);
    setIsBestSeller(product.isBestSeller);
    setIsFestive(product.isFestive || false);
    setInStock(product.inStock);
    setFabric(product.fabric || '');
    setImagesList(product.images ? product.images.map((i) => i.url) : []);
    setImageUrl('');
    setVariantsMatrix(
      product.variants && product.variants.length > 0
        ? product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || '#E785B1',
            stock: v.stock,
          }))
        : [{ size: 'Free Size', color: 'Standard', colorHex: '#E785B1', stock: 10 }]
    );
    setIsModalOpen(true);
  };

  // ── Image Management ──────────────────────────────
  const handleAddImage = () => {
    const trimmed = imageUrl.trim();
    if (trimmed && !imagesList.includes(trimmed)) {
      setImagesList([...imagesList, trimmed]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  // ── File Upload from System ───────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await apiFetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.urls) {
        setImagesList((prev) => [...prev, ...data.urls]);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading files');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Variant Management ────────────────────────────
  const handleAddVariant = () => {
    setVariantsMatrix([
      ...variantsMatrix,
      { size: 'M', color: 'Rose Pink', colorHex: '#E785B1', stock: 5 },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variantsMatrix.length <= 1) return;
    setVariantsMatrix(variantsMatrix.filter((_, i) => i !== index));
  };

  const getColorNameFromHex = (hex: string): string => {
    const upperHex = hex.toUpperCase();
    const preset = PRESET_COLORS.find((c) => c.hex.toUpperCase() === upperHex);
    if (preset) return preset.name;

    const colorMap: { [key: string]: string } = {
      '#E785B1': 'Rose Pink',
      '#800020': 'Maroon',
      '#2563EB': 'Royal Blue',
      '#047857': 'Emerald Green',
      '#D4A017': 'Mustard Yellow',
      '#B91C1C': 'Deep Red',
      '#0D9488': 'Teal',
      '#7C3AED': 'Purple',
      '#FFFFF0': 'Ivory White',
      '#1F2937': 'Black',
      '#0000FF': 'Royal Blue',
      '#FF0000': 'Deep Red',
      '#00FF00': 'Emerald Green',
      '#FFFF00': 'Mustard Yellow',
      '#FFA500': 'Amber Orange',
      '#FFC0CB': 'Rose Pink',
      '#C0C0C0': 'Silver',
      '#FFD700': 'Gold',
    };

    if (colorMap[upperHex]) return colorMap[upperHex];

    const r = parseInt(upperHex.slice(1, 3), 16) || 0;
    const g = parseInt(upperHex.slice(3, 5), 16) || 0;
    const b = parseInt(upperHex.slice(5, 7), 16) || 0;

    if (b > 180 && r < 120 && g < 150) return 'Royal Blue';
    if (r > 180 && g < 100 && b < 100) return 'Deep Red';
    if (g > 150 && r < 100 && b < 100) return 'Emerald Green';
    if (r > 180 && g > 180 && b < 100) return 'Mustard Yellow';
    if (r > 180 && g < 150 && b > 150) return 'Rose Pink';
    if (r < 60 && g < 60 && b < 60) return 'Black';
    if (r > 200 && g > 200 && b > 200) return 'Ivory White';

    return `Color (${upperHex})`;
  };

  const handleVariantChange = (index: number, field: keyof VariantRow, value: string | number) => {
    const updated = [...variantsMatrix];
    if (field === 'stock') {
      updated[index][field] = typeof value === 'number' ? value : parseInt(value) || 0;
    } else if (field === 'colorHex') {
      const hex = value as string;
      updated[index].colorHex = hex;
      updated[index].color = getColorNameFromHex(hex);
    } else {
      updated[index][field] = value as string;
    }
    setVariantsMatrix(updated);
  };

  const handleQuickAddSize = (size: string) => {
    const alreadyExists = variantsMatrix.some((v) => v.size === size);
    if (!alreadyExists) {
      const lastVariant = variantsMatrix[variantsMatrix.length - 1];
      setVariantsMatrix([
        ...variantsMatrix,
        {
          size,
          color: lastVariant?.color || 'Rose Pink',
          colorHex: lastVariant?.colorHex || '#E785B1',
          stock: 5,
        },
      ]);
    }
  };

  const handleQuickAddColor = (colorName: string, colorHex: string) => {
    const alreadyExists = variantsMatrix.some((v) => v.color === colorName);
    if (!alreadyExists) {
      const lastVariant = variantsMatrix[variantsMatrix.length - 1];
      setVariantsMatrix([
        ...variantsMatrix,
        {
          size: lastVariant?.size || 'M',
          color: colorName,
          colorHex,
          stock: 5,
        },
      ]);
    }
  };

  // ── Save Product ──────────────────────────────────
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      description,
      mrp,
      discountPercent,
      categoryId,
      isNewArrival,
      isBestSeller,
      isFestive,
      inStock,
      fabric,
      images:
        imagesList.length > 0
          ? imagesList
          : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'],
      variants: variantsMatrix,
    };

    try {
      const url = editingProduct ? `/products/${editingProduct.id}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProductsAndCategories();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await apiFetch(`/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchProductsAndCategories();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Get unique colors from variants
  const getProductColors = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return [];
    const colorMap = new Map<string, string>();
    product.variants.forEach((v) => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, v.colorHex || '#ccc');
      }
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Product Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage luxury clothing catalog, prices, and badges</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue px-6 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all w-max"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading catalog...</div>
      ) : (
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Colors</th>
                <th className="p-4">MRP / Discount</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Badges</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const primaryImage =
                  p.images && p.images.length > 0
                    ? p.images[0].url
                    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';

                const colors = getProductColors(p);

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={primaryImage} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-ramyaa-charcoal line-clamp-1 max-w-xs block">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {p.images?.length || 0} img · {p.variants?.length || 0} variants
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-ramyaa-blue">{p.category?.name}</td>
                    <td className="p-4">
                      {colors.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {colors.map((c, i) => (
                            <div
                              key={i}
                              title={c.name}
                              className="h-5 w-5 rounded-full border-2 border-white shadow-sm cursor-default"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          {colors.length > 0 && (
                            <span className="text-[9px] text-gray-400 ml-1">{colors.length}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="line-through text-gray-400">{formatPrice(p.mrp)}</span>
                      <span className="ml-1 text-ramyaa-gold font-bold">({p.discountPercent}% OFF)</span>
                    </td>
                    <td className="p-4 font-extrabold text-ramyaa-pink text-sm">
                      {formatPrice(p.sellingPrice)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {p.isNewArrival && (
                          <span className="rounded-full bg-ramyaa-pink/10 text-ramyaa-pink px-2 py-0.5 text-[9px] font-bold uppercase w-max">
                            NEW ARRIVAL
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="rounded-full bg-ramyaa-blue/10 text-ramyaa-blue px-2 py-0.5 text-[9px] font-bold uppercase w-max">
                            BEST SELLER
                          </span>
                        )}
                        {p.isFestive && (
                          <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[9px] font-bold uppercase w-max">
                            🪔 FESTIVAL SPECIAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-ramyaa-blue hover:text-white transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          Add / Edit Product Modal
          ═══════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-serif text-xl font-bold text-ramyaa-charcoal">
                {editingProduct ? 'Edit Product' : 'Add New Rajasthani Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* ── Basic Details ── */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-blue focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fabric</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                    placeholder="e.g. Pure Georgette & Organza Dupatta"
                  />
                </div>
              </div>

              {/* ── Pricing Grid ── */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-ramyaa-cream border border-ramyaa-sand">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-ramyaa-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount % *</label>
                  <input
                    type="number"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-ramyaa-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ramyaa-blue mb-1">Selling Price</label>
                  <div className="text-base font-extrabold text-ramyaa-pink pt-2">
                    {formatPrice(computedSellingPrice)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rich Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              {/* ══════════════════════════════════════════════
                  MULTI-IMAGE MANAGEMENT (Upload + URL)
                  ══════════════════════════════════════════════ */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <ImagePlus className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-gray-700">Product Images</span>
                  <span className="text-[10px] text-gray-400 ml-1">({imagesList.length} added)</span>
                </div>

                {/* Upload from System */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-white p-4 text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="h-5 w-5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload from your system'}</span>
                    <span className="text-[9px] text-gray-400 font-normal">(JPG, PNG, WebP — max 5MB each)</span>
                  </button>
                </div>

                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-[10px] text-gray-400 font-bold">OR paste URL</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Add image URL input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={handleImageKeyDown}
                      placeholder="Paste image URL and press Enter"
                      className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-colors whitespace-nowrap"
                  >
                    + Add
                  </button>
                </div>

                {/* Image thumbnail grid */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {imagesList.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white aspect-square"
                      >
                        <Image
                          src={url}
                          alt={`Product image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        {/* Order badge */}
                        <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {idx + 1}
                        </div>
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[8px] font-bold text-center py-0.5">
                            PRIMARY
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {imagesList.length === 0 && (
                  <p className="text-[10px] text-gray-400 italic">
                    No images added yet. Upload from your system or paste a URL. A default placeholder will be used if empty.
                  </p>
                )}
              </div>

              {/* ══════════════════════════════════════════════
                  SIZE / VARIANT MANAGEMENT + MULTI-COLOR
                  ══════════════════════════════════════════════ */}
              <div className="rounded-2xl border border-teal-100 bg-teal-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-bold text-gray-700">Sizes, Colors &amp; Variants</span>
                    <span className="text-[10px] text-gray-400 ml-1">({variantsMatrix.length} variants)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="rounded-xl bg-teal-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-teal-600 transition-colors"
                  >
                    + Add Variant
                  </button>
                </div>

                {/* Quick-add size buttons */}
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1.5">Quick Add Sizes</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SIZES.map((size) => {
                      const exists = variantsMatrix.some((v) => v.size === size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => !exists && handleQuickAddSize(size)}
                          className={`rounded-lg px-3 py-1 text-[10px] font-bold transition-colors ${
                            exists
                              ? 'bg-teal-600 text-white cursor-default'
                              : 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-100 cursor-pointer'
                          }`}
                        >
                          {size}
                          {exists && ' ✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick-add color buttons */}
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1.5">Quick Add Colors</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((color) => {
                      const exists = variantsMatrix.some((v) => v.color === color.name);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => !exists && handleQuickAddColor(color.name, color.hex)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors flex items-center gap-1.5 ${
                            exists
                              ? 'bg-teal-600 text-white cursor-default'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-full border border-gray-300 inline-block flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                          {exists && ' ✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variant rows */}
                <div className="space-y-2">
                  {variantsMatrix.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-100"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Size</label>
                          <select
                            value={variant.size}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 p-1.5 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-none"
                          >
                            {PRESET_SIZES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Color</label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 p-1.5 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-none"
                            placeholder="Color name"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Hex</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={variant.colorHex}
                              onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                              className="h-7 w-7 rounded border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={variant.colorHex}
                              onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 p-1.5 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Stock</label>
                          <input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-gray-200 p-1.5 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        disabled={variantsMatrix.length <= 1}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove variant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Badge Toggles ── */}
              <div className="flex flex-wrap gap-5 pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-ramyaa-pink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-ramyaa-pink focus:ring-ramyaa-pink"
                  />
                  <span>Flag as NEW ARRIVAL</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-ramyaa-blue cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-ramyaa-blue focus:ring-ramyaa-blue"
                  />
                  <span>Flag as BEST SELLER</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-amber-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFestive}
                    onChange={(e) => setIsFestive(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>🪔 FESTIVAL SPECIAL</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-emerald-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>In Stock Flag</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Product...' : 'Save & Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
