'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Promotion } from '@/types';
import { Plus, Edit3, Trash2, X, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [title, setTitle] = useState('');
  const [offerText, setOfferText] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromotions = async () => {
    try {
      const res = await apiFetch('/promotions?all=true');
      const data = await res.json();
      if (data.promotions) setPromotions(data.promotions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const openAddModal = () => {
    setEditingPromo(null);
    setTitle('FESTIVE HERITAGE SALE');
    setOfferText('✨ UP TO 30% OFF ON HERO BANDHANI & GOTA PATTI SUITS ✨');
    setDescription('Elevate your wardrobe with pure Jaipuri silk suits, hand-dyed Leheriya sarees, and heritage drapes.');
    setBannerImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop');
    setCode('RAMYAA30');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Promotion) => {
    setEditingPromo(p);
    setTitle(p.title);
    setOfferText(p.offerText);
    setDescription(p.description || '');
    setBannerImage(p.bannerImage || '');
    setCode(p.code || '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      const res = await apiFetch(`/promotions/${promo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (res.ok) fetchPromotions();
    } catch (err) {
      alert('Error toggling promotion status');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingPromo ? `/promotions/${editingPromo.id}` : '/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ title, offerText, description, bannerImage, code, isActive }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        alert('Failed to save promotion');
      }
    } catch (err) {
      alert('Error saving promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const res = await apiFetch(`/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPromotions();
    } catch (err) {
      alert('Error deleting promotion');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Promotions & Sale Banners</h1>
          <p className="text-xs text-gray-500 mt-1">Manage active promotional banners displayed on the homepage</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue px-6 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Sale Banner</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading promotions...</div>
      ) : (
        <div className="space-y-4">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.isActive ? 'Active on Storefront' : 'Disabled'}
                  </span>
                  {p.code && (
                    <span className="font-mono text-xs font-bold text-ramyaa-blue bg-ramyaa-blue-50 px-2.5 py-0.5 rounded-md">
                      Code: {p.code}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl font-bold text-ramyaa-charcoal">{p.title}</h3>
                <p className="text-xs font-bold text-ramyaa-pink">{p.offerText}</p>
                {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    p.isActive
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {p.isActive ? 'Deactivate' : 'Activate Live'}
                </button>

                <button
                  onClick={() => openEditModal(p)}
                  className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-ramyaa-blue hover:text-white transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal">
                {editingPromo ? 'Edit Sale Banner' : 'Create Sale Banner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Offer Banner Text *</label>
                <input
                  type="text"
                  required
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-blue focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs font-bold text-emerald-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-600"
                />
                <span>Active Banner (Display on Homepage)</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Promotion Banner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
