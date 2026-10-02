'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Promotion } from '@/types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export const PromoBanner: React.FC = () => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    apiFetch('/promotions')
      .then((res) => res.json())
      .then((data) => {
        if (data.promotions && data.promotions.length > 0) {
          setPromotion(data.promotions[0]);
        }
      })
      .catch((err) => console.error('Failed to load promotion banner', err));
  }, []);

  if (!promotion || !promotion.isActive) return null;

  return (
    <div className="relative my-8 overflow-hidden rounded-3xl bg-gradient-to-r from-ramyaa-blue via-ramyaa-pink to-ramyaa-charcoal p-6 md:p-10 text-white shadow-xl">
      {/* Background Overlay Image */}
      {promotion.bannerImage && (
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <Image
            src={promotion.bannerImage}
            alt={promotion.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl text-center md:text-left space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-ramyaa-gold" />
            <span>Active Sale Event</span>
          </div>

          <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-tight text-white">
            {promotion.title}
          </h2>

          <p className="text-sm md:text-base font-medium text-ramyaa-cream">
            {promotion.offerText}
          </p>

          {promotion.description && (
            <p className="text-xs text-white/80 max-w-xl hidden sm:block">
              {promotion.description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {promotion.code && (
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
              <span className="text-[10px] text-white/70 block uppercase">Use Coupon Code</span>
              <span className="font-mono text-base font-bold text-ramyaa-gold">{promotion.code}</span>
            </div>
          )}

          <Link
            href="/category/festive-collection"
            className="flex items-center space-x-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-ramyaa-charcoal shadow-lg hover:bg-ramyaa-cream hover:scale-105 transition-all"
          >
            <span>Shop Sale</span>
            <ArrowRight className="h-4 w-4 text-ramyaa-pink" />
          </Link>
        </div>
      </div>
    </div>
  );
};
