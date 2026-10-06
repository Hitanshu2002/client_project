'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/api';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';

  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images[1].url
      : primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      const availableVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
      addToCart(product, availableVariant, 1);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-xl transition-all duration-300">
      {/* Image Container with Hover Swap */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={getImageUrl(isHovered ? secondaryImage : primaryImage)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges Container - Section 3.4 */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="rounded-full bg-ramyaa-pink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              NEW ARRIVAL
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded-full bg-ramyaa-blue px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Discount % Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-ramyaa-gold px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* Quick Add Button */}
        {product.inStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ramyaa-charcoal shadow-lg backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-ramyaa-pink hover:text-white"
            title="Quick Add to Bag"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        )}
      </Link>

      {/* Details Container */}
      <div className="flex flex-1 flex-col justify-between p-4 bg-white">
        <div>
          {/* Category */}
          <span className="text-[11px] font-semibold text-ramyaa-blue/80 uppercase tracking-widest">
            {product.category?.name || 'Rajasthani Textile'}
          </span>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 font-serif text-sm font-bold text-ramyaa-charcoal line-clamp-2 hover:text-ramyaa-pink transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3">
          {/* Rating */}
          {product.avgRating ? (
            <div className="flex items-center space-x-1 mb-1.5">
              <Star className="h-3.5 w-3.5 fill-ramyaa-gold text-ramyaa-gold" />
              <span className="text-xs font-semibold text-gray-800">{product.avgRating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>
          ) : null}

          {/* Pricing - Section 3.5 */}
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-extrabold text-ramyaa-charcoal">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
