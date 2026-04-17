import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
          )}
        />
      ))}
    </div>
  );
}
