'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Category } from '@/types';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = editingCategory ? `/categories/${editingCategory.id}` : '/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({ name, description, image }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save category');
      }
    } catch (err) {
      alert('Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productCount?: number) => {
    if (productCount && productCount > 0) {
      alert(`Cannot delete: ${productCount} product(s) are assigned to this category.\nPlease delete those products first.`);
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await apiFetch(`/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Category Management</h1>
          <p className="text-xs text-gray-500 mt-1">Organize clothing categories and shop-by-craft tiles</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue px-6 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex space-x-4 items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-16 w-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={getImageUrl(cat.image) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ramyaa-charcoal">{cat.name}</h3>
                  <span className="text-[10px] text-ramyaa-blue font-semibold">
                    {cat.productCount || 0} products
                  </span>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-ramyaa-blue hover:text-white transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.productCount)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-blue focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
