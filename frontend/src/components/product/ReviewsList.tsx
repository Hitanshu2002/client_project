'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import { RatingStars } from './RatingStars';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, MessageSquarePlus, Star } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ReviewsListProps {
  productId: string;
  reviews: Review[];
  onReviewSubmitted?: () => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ productId, reviews, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ productId, rating, comment }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Review submitted successfully!');
        setComment('');
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        setErrorMsg(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setErrorMsg('Network error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-ramyaa-charcoal">Customer Reviews</h3>
          {reviews.length > 0 ? (
            <div className="flex items-center space-x-2 mt-1">
              <RatingStars rating={avgRating} size="md" />
              <span className="font-bold text-sm text-gray-800">{avgRating} out of 5</span>
              <span className="text-xs text-gray-500">({reviews.length} verified reviews)</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-1">No customer reviews yet.</p>
          )}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 rounded-full border border-ramyaa-pink bg-ramyaa-pink-50 px-5 py-2.5 text-xs font-bold text-ramyaa-pink hover:bg-ramyaa-pink hover:text-white transition-all w-max"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Write a Verified Review</span>
        </button>
      </div>

      {/* Review Submission Form Modal / Box */}
      {showForm && (
        <div className="mb-10 rounded-2xl bg-ramyaa-cream p-6 border border-ramyaa-sand shadow-sm">
          <h4 className="font-serif font-bold text-base text-ramyaa-charcoal mb-2">
            Write Your Verified Review
          </h4>
          <p className="text-xs text-gray-600 mb-4 flex items-center">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mr-1" />
            Reviews are verified against completed orders for this product.
          </p>

          {!user ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
              Please <a href="/account/login" className="underline text-ramyaa-pink font-bold">Sign In</a> to write a review.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Star Rating</label>
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
                          star <= rating
                            ? 'fill-ramyaa-gold text-ramyaa-gold'
                            : 'fill-gray-100 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about fit, fabric texture, craft quality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-ramyaa-pink px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-ramyaa-pink-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying & Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm text-ramyaa-charcoal">
                  {rev.customAuthorName || rev.user?.name || 'Verified Buyer'}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3 mr-0.5" /> Verified Review
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <RatingStars rating={rev.rating} size="sm" />

            <p className="text-xs text-gray-700 leading-relaxed font-sans pt-1">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
