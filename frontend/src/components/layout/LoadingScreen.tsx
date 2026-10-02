'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const LoadingScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    // Start fade immediately, remove from DOM after animation
    requestAnimationFrame(() => {
      setIsFading(true);
    });
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ramyaa-cream transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative mb-6 h-28 w-56">
        <Image
          src="/images/logo/Color Logo.png"
          alt="House of Ramyaa Loading"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-ramyaa-pink" style={{ animationDelay: '0ms' }}></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-ramyaa-blue" style={{ animationDelay: '150ms' }}></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-ramyaa-gold" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};
