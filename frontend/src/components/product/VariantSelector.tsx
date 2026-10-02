'use client';

import React from 'react';
import { ProductVariant } from '@/types';
import { Check, AlertCircle } from 'lucide-react';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedVariant: ProductVariant | null;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  selectedVariant,
}) => {
  // Extract unique available sizes and colors
  const availableSizes = Array.from(new Set(variants.map((v) => v.size)));
  const availableColors = Array.from(
    new Set(variants.map((v) => JSON.stringify({ color: v.color, colorHex: v.colorHex })))
  ).map((str) => JSON.parse(str));

  return (
    <div className="space-y-6 border-y border-gray-100 py-6">
      {/* Color Selection */}
      <div>
        <label className="block text-xs font-bold text-ramyaa-charcoal uppercase tracking-wider mb-3">
          Select Color: <span className="text-ramyaa-pink font-semibold">{selectedColor}</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {availableColors.map(({ color, colorHex }) => {
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`flex items-center space-x-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-ramyaa-pink bg-ramyaa-pink-50 text-ramyaa-pink ring-2 ring-ramyaa-pink/30'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {colorHex && (
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                <span>{color}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-ramyaa-pink" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-ramyaa-charcoal uppercase tracking-wider">
            Select Size: <span className="text-ramyaa-blue font-semibold">{selectedSize}</span>
          </label>
          <span className="text-xs font-semibold text-ramyaa-pink cursor-pointer underline">
            Size Guide
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {availableSizes.map((size) => {
            const isSelected = selectedSize === size;
            // Check stock for this size with the selected color
            const variantForSize = variants.find(
              (v) => v.size === size && v.color === selectedColor
            );
            const isOutOfStock = !variantForSize || variantForSize.stock <= 0;

            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                disabled={isOutOfStock}
                className={`relative flex h-11 min-w-[48px] items-center justify-center rounded-xl border px-3.5 text-xs font-bold transition-all ${
                  isOutOfStock
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                    : isSelected
                    ? 'border-ramyaa-blue bg-ramyaa-blue text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-ramyaa-blue hover:text-ramyaa-blue'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Variant Stock Indicator */}
      <div className="pt-1">
        {selectedVariant ? (
          selectedVariant.stock > 0 ? (
            <div className="flex items-center space-x-2 text-xs text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                In Stock ({selectedVariant.stock} left in {selectedVariant.color} / {selectedVariant.size})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-rose-500 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertCircle className="h-4 w-4" />
              <span>Out of Stock for size {selectedVariant.size} in {selectedVariant.color}. Please select another variant.</span>
            </div>
          )
        ) : (
          <div className="text-xs text-gray-500">Please select a size and color combination.</div>
        )}
      </div>
    </div>
  );
};
