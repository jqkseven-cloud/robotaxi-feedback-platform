import { cn, getSentimentLabel, getSentimentColor } from '@/lib/utils';

interface SentimentBadgeProps {
  sentiment: string;
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        getSentimentColor(sentiment)
      )}
    >
      {getSentimentLabel(sentiment)}
    </span>
  );
}
