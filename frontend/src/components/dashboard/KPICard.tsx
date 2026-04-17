import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'amber';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', value: 'text-blue-700' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-700' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700' },
};

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  color = 'blue',
}: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div className={cn('rounded-xl p-5 border border-gray-100 bg-white shadow-sm')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', colors.value)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.icon)}>
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3 h-3 text-red-500" />
          ) : (
            <Minus className="w-3 h-3 text-gray-400" />
          )}
          <span
            className={cn(
              'font-medium',
              trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'
            )}
          >
            {trend > 0 ? '+' : ''}{trend}
          </span>
          {trendLabel && <span className="text-gray-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
