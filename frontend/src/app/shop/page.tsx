import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: { sort?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sort = searchParams.sort;
  const orderBy =
    sort === 'price-asc'
      ? { sellingPrice: 'asc' as const }
      : sort === 'price-desc'
        ? { sellingPrice: 'desc' as const }
        : { createdAt: 'desc' as const };

  const productsData = await prisma.product.findMany({
    orderBy,
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      variants: true,
      reviews: { select: { rating: true } },
    },
  });

  const products = productsData.map((product) => ({
    ...product,
    avgRating:
      product.reviews.length > 0
        ? Math.round((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length) * 10) / 10
        : undefined,
    reviewCount: product.reviews.length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-3xl border border-ramyaa-sand bg-ramyaa-cream p-8 text-center sm:p-10">
        <span className="text-xs font-bold uppercase tracking-widest text-ramyaa-pink">House of Ramyaa</span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ramyaa-charcoal sm:text-4xl">Shop All</h1>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-gray-600">
          Explore handcrafted Rajasthani clothing, festive drapes, and everyday heritage styles.
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row">
        <span className="text-xs font-bold text-gray-500">
          Showing <span className="text-ramyaa-charcoal">{products.length}</span> items
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center text-xs font-semibold text-gray-600">
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-ramyaa-blue" /> Sort By:
          </span>
          <Link href="/shop?sort=newest" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${!sort || sort === 'newest' ? 'bg-ramyaa-blue text-white' : 'bg-gray-100 text-gray-600'}`}>Newest</Link>
          <Link href="/shop?sort=price-asc" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sort === 'price-asc' ? 'bg-ramyaa-blue text-white' : 'bg-gray-100 text-gray-600'}`}>Price: Low to High</Link>
          <Link href="/shop?sort=price-desc" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sort === 'price-desc' ? 'bg-ramyaa-blue text-white' : 'bg-gray-100 text-gray-600'}`}>Price: High to Low</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product as any} />)}
      </div>
    </div>
  );
}
