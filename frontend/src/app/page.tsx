import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { HeroBanner } from '@/components/home/HeroBanner';
import { PromoBanner } from '@/components/home/PromoBanner';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight, Sparkles, Star, Quote } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  // Fetch Categories
  const categories = await prisma.category.findMany({
    take: 8,
    orderBy: { name: 'asc' },
  });

  // Fetch New Arrivals (isNewArrival = true)
  const newArrivalsData = await prisma.product.findMany({
    where: { isNewArrival: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      variants: true,
      reviews: { select: { rating: true } },
    },
  });

  // Fetch Best Sellers (isBestSeller = true)
  const bestSellersData = await prisma.product.findMany({
    where: { isBestSeller: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      variants: true,
      reviews: { select: { rating: true } },
    },
  });

  const formatProduct = (p: any) => ({
    ...p,
    avgRating:
      p.reviews.length > 0
        ? Math.round((p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length) * 10) / 10
        : undefined,
    reviewCount: p.reviews.length,
  });

  const newArrivals = newArrivalsData.map(formatProduct);
  const bestSellers = bestSellersData.map(formatProduct);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Active Sale Promo Banner */}
      <PromoBanner />

      {/* 3. Shop by Category Tiles */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-ramyaa-pink tracking-widest uppercase">
              Artisanal Categories
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ramyaa-charcoal mt-1">
              Shop by Craft Heritage
            </h2>
          </div>
          <Link
            href="/category/bandhani"
            className="mt-2 sm:mt-0 flex items-center text-xs font-bold text-ramyaa-blue hover:text-ramyaa-pink transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-sm hover:shadow-lg transition-all"
            >
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-ramyaa-pink transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-white/80 font-medium tracking-wide">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. New Arrivals Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-ramyaa-pink tracking-widest uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Fresh Loom Drops</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ramyaa-charcoal mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/category/new-collection"
            className="mt-2 sm:mt-0 flex items-center text-xs font-bold text-ramyaa-pink hover:underline"
          >
            <span>Explore All New Arrivals</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-ramyaa-blue tracking-widest uppercase">
              Most Loved Drapes
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ramyaa-charcoal mt-1">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/category/festive-collection"
            className="mt-2 sm:mt-0 flex items-center text-xs font-bold text-ramyaa-blue hover:underline"
          >
            <span>Shop Best Sellers</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 6. Testimonials Strip */}
      <section className="rounded-3xl bg-ramyaa-cream p-8 sm:p-12 border border-ramyaa-sand shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <Quote className="h-8 w-8 text-ramyaa-pink/40 mx-auto mb-2" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ramyaa-charcoal">
            Loved by Women Across India
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real reviews from our verified patrons</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
            <div className="flex text-ramyaa-gold space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-ramyaa-gold" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              "The Bandhani Anarkali suit set I ordered for Teej is absolute perfection! The Gota Patti lace border has real gold sheen and pure georgette feels weightless."
            </p>
            <div className="text-xs font-bold text-ramyaa-charcoal pt-1">— Sunita R., Jaipur</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
            <div className="flex text-ramyaa-gold space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-ramyaa-gold" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              "Fast shipping and super convenient UPI payment process. The Leheriya saree colors match the photos 100%. House of Ramyaa is my go-to festive brand."
            </p>
            <div className="text-xs font-bold text-ramyaa-charcoal pt-1">— Neha Sharma, Delhi</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
            <div className="flex text-ramyaa-gold space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-ramyaa-gold" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              "Pure cotton Kota Doria sarees with genuine zari work. The packaging felt like opening a royal gift from Rajasthan. Highly recommended!"
            </p>
            <div className="text-xs font-bold text-ramyaa-charcoal pt-1">— Priyanka Verma, Mumbai</div>
          </div>
        </div>
      </section>

      {/* 7. Brand Craftsmanship Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-ramyaa-charcoal to-ramyaa-blue p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-ramyaa-gold">
            Preserving Handloom Crafts
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Handcrafted with Pride by Rajasthan's Master Weavers
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
            Each House of Ramyaa garment supports native artisan families across Jaipur, Sanganer, Bagru, and Jodhpur. We combine ancient tie-dye traditions with refined contemporary silhouettes.
          </p>
        </div>
      </section>
    </div>
  );
}
