import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { Search } from 'lucide-react';

export const revalidate = 0;

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  let products: any[] = [];
  if (query.trim()) {
    const rawProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
          { fabric: { contains: query } },
        ],
      },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    products = rawProducts.map((p) => ({
      ...p,
      avgRating:
        p.reviews.length > 0
          ? Math.round((p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length) * 10) / 10
          : undefined,
      reviewCount: p.reviews.length,
    }));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="rounded-3xl bg-ramyaa-cream p-8 sm:p-10 border border-ramyaa-sand text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ramyaa-pink-50 text-ramyaa-pink">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">
          Search Results {query ? `for "${query}"` : ''}
        </h1>
        <p className="text-xs text-gray-500">
          Showing {products.length} products matching your query
        </p>

        {/* Search Bar Input */}
        <form action="/search" method="GET" className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search Bandhani, Suits, Dupattas, Kurtis..."
            className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink shadow-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-ramyaa-pink px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-ramyaa-pink-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {products.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="font-serif text-lg font-bold text-gray-700">No matching products found</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try searching for traditional terms like "Bandhani", "Leheriya", "Gota Patti", "Kota Doria", or "Suits".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
