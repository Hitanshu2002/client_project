'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-ramyaa-cream border border-ramyaa-sand shadow-sm my-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] items-center">
        {/* Text Content Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 md:p-16 flex flex-col justify-center space-y-6 z-10">
          <div className="inline-flex items-center space-x-2 rounded-full bg-ramyaa-pink-50 border border-ramyaa-pink-200 px-3.5 py-1.5 text-xs font-semibold text-ramyaa-pink w-max">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="tracking-widest uppercase text-[11px]">Heritage Textile Couture</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ramyaa-charcoal leading-[1.15]">
            Where Royal <span className="text-ramyaa-pink italic">Tradition</span> Meets Trend.
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans max-w-lg">
            Discover authentic Jaipuri Bandhani tie-dyes, vibrant Leheriya waves, and shimmering Gota Patti embroideries crafted by master Rajasthani artisans.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/category/bandhani"
              className="inline-flex items-center space-x-2 rounded-full bg-ramyaa-pink px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-ramyaa-pink-600 hover:shadow-xl transition-all"
            >
              <span>Explore Bandhani</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/category/gota-patti"
              className="inline-flex items-center space-x-2 rounded-full border-2 border-ramyaa-blue bg-white px-8 py-3.5 text-sm font-bold text-ramyaa-blue hover:bg-ramyaa-blue-50 transition-all"
            >
              <span>Gota Patti Sets</span>
            </Link>
          </div>
        </div>

        {/* Photography Hero Image Column */}
        <div className="lg:col-span-6 relative h-[380px] lg:h-full w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop"
            alt="House of Ramyaa Heritage Collection"
            fill
            priority
            className="object-cover object-top hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-ramyaa-cream via-transparent to-transparent opacity-80 lg:opacity-60" />
        </div>
      </div>
    </section>
  );
};
