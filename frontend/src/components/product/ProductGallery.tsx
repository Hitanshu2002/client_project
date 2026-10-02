'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const galleryImages =
    images && images.length > 0
      ? images
      : [{ id: '1', productId: '1', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', order: 0 }];

  const currentImage = galleryImages[selectedIndex] || galleryImages[0];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-card">
        <Image
          src={currentImage.url}
          alt={`${productName} image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-500 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom Hint */}
        <div className="absolute top-3 right-3 rounded-full bg-white/80 p-2 text-ramyaa-charcoal backdrop-blur-md shadow-sm">
          <ZoomIn className="h-4 w-4" />
        </div>

        {/* Carousel Prev/Next Buttons */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ramyaa-charcoal shadow-md backdrop-blur-md hover:bg-white hover:text-ramyaa-pink transition-all"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ramyaa-charcoal shadow-md backdrop-blur-md hover:bg-white hover:text-ramyaa-pink transition-all"
              aria-label="Next Image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-ramyaa-pink ring-2 ring-ramyaa-pink/20 scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
