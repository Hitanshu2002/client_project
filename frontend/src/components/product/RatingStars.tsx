import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, maxStars = 5, size = 'sm' }) => {
  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = rating >= starValue;
        return (
          <Star
            key={idx}
            className={`${starSizes[size]} ${
              isFilled ? 'fill-ramyaa-gold text-ramyaa-gold' : 'fill-gray-100 text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};
