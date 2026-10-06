import React from 'react';
import { notFound } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import { Category, Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import Link from 'next/link';
import { Filter, SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { sort?: string; size?: string; color?: string; inStock?: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const response = await serverApiFetch(`/categories/${params.slug}`);
  const data = response.ok ? await response.json() : { category: null };
  const category = data.category;
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} Collection | House of Ramyaa`,
    description: category.description || `Explore luxury ${category.name} Rajasthani clothing at House of Ramyaa.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const isNewCollection = params.slug === 'new-collection';
  const isFestiveCollection = params.slug === 'festive-collection';

  const categoryResponse = await serverApiFetch(`/categories/${params.slug}`);
  const categoryData = categoryResponse.ok ? await categoryResponse.json() : { category: null };
  const category = categoryData.category;

  if (!category && !isFestiveCollection) {
    notFound();
  }

  const { sort, size, color, inStock } = searchParams;

  const productParams = new URLSearchParams();
  if (isNewCollection) productParams.set('isNewArrival', 'true');
  else if (isFestiveCollection) productParams.set('sale', 'true');
  else productParams.set('category', params.slug);
  if (sort) productParams.set('sort', sort);
  if (size) productParams.set('size', size);
  if (color) productParams.set('color', color);
  if (inStock === 'true') productParams.set('inStock', 'true');

  const [productsResponse, categoriesResponse] = await Promise.all([
    serverApiFetch(`/products?${productParams.toString()}`),
    serverApiFetch('/categories'),
  ]);
  const productsData = await productsResponse.json();
  const categoriesData = await categoriesResponse.json();
  const products: Product[] = productsData.products || [];
  const allCategories: Category[] = categoriesData.categories || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header */}
      <div className="rounded-3xl bg-ramyaa-cream p-8 sm:p-10 border border-ramyaa-sand text-center space-y-2">
        <span className="text-xs font-bold text-ramyaa-pink uppercase tracking-widest">
          Artisan Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ramyaa-charcoal">
          {category?.name || 'Festive Sale'}
        </h1>
        {(category?.description || isFestiveCollection) && (
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {category?.description || 'Celebrate in handcrafted Rajasthani styles selected for festive occasions.'}
          </p>
        )}
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {allCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              cat.slug === params.slug
                ? 'bg-ramyaa-pink text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Main Grid & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <span className="text-xs font-bold text-gray-500">
          Showing <span className="text-ramyaa-charcoal">{products.length}</span> items
        </span>

        {/* Sorting Controls */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-gray-600 flex items-center">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-ramyaa-blue" /> Sort By:
          </label>
          <div className="flex gap-1.5">
            <Link
              href={`/category/${params.slug}?sort=newest`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                !sort || sort === 'newest'
                  ? 'bg-ramyaa-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/category/${params.slug}?sort=price-asc`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                sort === 'price-asc'
                  ? 'bg-ramyaa-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/category/${params.slug}?sort=price-desc`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                sort === 'price-desc'
                  ? 'bg-ramyaa-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="font-serif text-lg font-bold text-gray-700">No products found in this category.</p>
          <p className="text-xs text-gray-500">Try selecting another category or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
