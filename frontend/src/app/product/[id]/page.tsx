'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { ReviewsList } from '@/components/product/ReviewsList';
import { RatingStars } from '@/components/product/RatingStars';
import { ProductCard } from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Heart, Share2, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const fetchProduct = async () => {
    try {
      const res = await apiFetch(`/products/${params.id}`);
      if (!res.ok) return setProduct(null);
      const data = await res.json();
      setProduct(data.product);

      if (data.product.variants && data.product.variants.length > 0) {
        // Find first available variant or default to first
        const inStockVar = data.product.variants.find((v: ProductVariant) => v.stock > 0) || data.product.variants[0];
        setSelectedSize(inStockVar.size);
        setSelectedColor(inStockVar.color);
        setSelectedVariant(inStockVar);
      }

      // Fetch Related Products from same category
      if (data.product.category?.slug) {
        const relRes = await apiFetch(`/products?category=${data.product.category.slug}`);
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelatedProducts(relData.products.filter((p: Product) => p.id !== data.product.id).slice(0, 4));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  // Update selected variant when size or color changes
  useEffect(() => {
    if (product && product.variants) {
      const found = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      setSelectedVariant(found || null);
    }
  }, [selectedSize, selectedColor, product]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ramyaa-pink border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-gray-800">Product Not Found</h2>
        <Link href="/" className="mt-4 inline-block text-xs font-bold text-ramyaa-pink underline">
          Back to Homepage
        </Link>
      </div>
    );
  }

  const isAddToCartDisabled = !selectedVariant || selectedVariant.stock <= 0 || !product.inStock;

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.stock > 0) {
      addToCart(product, selectedVariant, 1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-ramyaa-pink">Home</Link>
        <span>/</span>
        <Link href={`/category/${product.category?.slug}`} className="hover:text-ramyaa-pink">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Product Details & Buying Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Badges - Section 3.4 */}
          <div className="flex flex-wrap gap-2">
            {product.isNewArrival && (
              <span className="rounded-full bg-ramyaa-pink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                NEW ARRIVAL
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-ramyaa-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                BEST SELLER
              </span>
            )}
            <span className="rounded-full bg-ramyaa-cream border border-ramyaa-sand px-3 py-1 text-[10px] font-semibold text-ramyaa-charcoal">
              {product.category?.name}
            </span>
          </div>

          {/* Title & Rating */}
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ramyaa-charcoal leading-tight">
              {product.name}
            </h1>

            {product.avgRating ? (
              <div className="flex items-center space-x-2">
                <RatingStars rating={product.avgRating} size="sm" />
                <span className="text-xs font-bold text-gray-800">{product.avgRating} / 5</span>
                <span className="text-xs text-gray-400">({product.reviewCount} customer reviews)</span>
              </div>
            ) : null}
          </div>

          {/* Pricing Box - Section 3.5 */}
          <div className="rounded-2xl bg-ramyaa-cream p-4 border border-ramyaa-sand flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-ramyaa-charcoal">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="rounded-full bg-ramyaa-gold px-2.5 py-0.5 text-xs font-extrabold text-white">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
            <span className="ml-auto text-[10px] text-gray-500">Taxes Included</span>
          </div>

          {/* Interactive Size & Color Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedVariant={selectedVariant}
          />

          {/* Add to Cart CTA Button */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-2xl py-4 text-sm font-bold text-white shadow-xl transition-all ${
                isAddToCartDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue hover:opacity-95'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{isAddToCartDisabled ? 'Out of Stock' : 'Add to Bag'}</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6 text-center text-[11px] text-gray-600">
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-ramyaa-pink mb-1" />
              <span>100% Genuine Jaipuri Handloom</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="h-5 w-5 text-ramyaa-blue mb-1" />
              <span>Free Express Shipping &gt; ₹2,999</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-5 w-5 text-ramyaa-gold mb-1" />
              <span>7 Days Size Exchange</span>
            </div>
          </div>

          {/* Product Description & Craft Details */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="font-serif text-lg font-bold text-ramyaa-charcoal">Description & Craftsmanship</h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-sans">
              {product.description}
            </p>

            {product.fabric && (
              <div className="text-xs text-gray-800">
                <span className="font-bold text-ramyaa-blue">Fabric: </span>
                {product.fabric}
              </div>
            )}

            {product.careInstructions && (
              <div className="text-xs text-gray-800">
                <span className="font-bold text-ramyaa-pink">Wash & Care: </span>
                {product.careInstructions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Purchase-Verified Reviews */}
      <ReviewsList
        productId={product.id}
        reviews={product.reviews || []}
        onReviewSubmitted={fetchProduct}
      />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-100 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-ramyaa-charcoal">
              More from {product.category?.name}
            </h3>
            <Link
              href={`/category/${product.category?.slug}`}
              className="text-xs font-bold text-ramyaa-pink hover:underline"
            >
              View Full Category →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
