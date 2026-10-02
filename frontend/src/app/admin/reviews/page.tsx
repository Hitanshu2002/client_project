'use client';

import React, { useEffect, useState } from 'react';
import { Review, Product } from '@/types';
import { RatingStars } from '@/components/product/RatingStars';
import { Plus, Trash2, X, MessageSquare, Star, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Admin Adding Custom Review
  const [productId, setProductId] = useState('');
  const [customAuthorName, setCustomAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviewsAndProducts = async () => {
    try {
      const [revRes, prodRes] = await Promise.all([
        apiFetch('/admin/reviews'),
        apiFetch('/products'),
      ]);

      const revData = await revRes.json();
      const prodData = await prodRes.json();

      if (revData.reviews) setReviews(revData.reviews);
      if (prodData.products) {
        setProducts(prodData.products);
        if (prodData.products.length > 0 && !productId) {
          setProductId(prodData.products[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndProducts();
  }, []);

  const openAddModal = () => {
    setCustomAuthorName('');
    setRating(5);
    setComment('');
    if (products.length > 0) setProductId(products[0].id);
    setIsModalOpen(true);
  };

  const handleCreateAdminReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/admin/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          customAuthorName,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchReviewsAndProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create review');
      }
    } catch (err) {
      alert('Error creating review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment/review?')) return;
    try {
      const res = await apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReviewsAndProducts();
      } else {
        alert('Failed to delete review');
      }
    } catch (err) {
      alert('Error deleting review');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Reviews & Comments Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Check product reviews, moderate customer comments, and add testimonials with custom author names.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue px-6 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all w-max"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Review / Comment</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading comments and reviews...</div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">No product comments or reviews found.</div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-serif font-bold text-base text-ramyaa-charcoal flex items-center">
                      <User className="h-4 w-4 mr-1 text-ramyaa-pink" />
                      {rev.customAuthorName || rev.user?.name || 'Verified Buyer'}
                    </span>
                    <RatingStars rating={rev.rating} size="sm" />
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-ramyaa-blue font-bold">
                    Product: {rev.product?.name || 'Catalog Item'}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-sans">{rev.comment}</p>
                </div>

                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="inline-flex items-center space-x-1 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-colors w-max"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Comment</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Custom Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal">
                Add Custom Review / Testimonial
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Author Name (Any Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy, Maharani Patron, Jaipur Weaves Fan"
                  value={customAuthorName}
                  onChange={(e) => setCustomAuthorName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Star Rating *</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? 'fill-ramyaa-gold text-ramyaa-gold' : 'fill-gray-100 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review Comment *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write the customer comment or testimonial text..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing Review...' : 'Publish Review / Comment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
