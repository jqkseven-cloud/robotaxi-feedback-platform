import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { feedbackApi } from '@/lib/api';
import type { FeedbackFilters } from '@/types';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filters: FeedbackFilters;
  onChange: (filters: FeedbackFilters) => void;
}

const sentimentOptions = [
  { value: 'positive', label: '好评' },
  { value: 'neutral', label: '中性' },
  { value: 'negative', label: '差评' },
];

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const { data: meta } = useQuery({
    queryKey: ['meta'],
    queryFn: feedbackApi.meta,
  });

  const hasActiveFilters =
    filters.ratingMin !== undefined ||
    filters.ratingMax !== undefined ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.cities?.length ?? 0) > 0 ||
    (filters.feedbackTypes?.length ?? 0) > 0 ||
    (filters.sentiments?.length ?? 0) > 0;

  const clearAll = () => {
    onChange({
      ...filters,
      ratingMin: undefined,
      ratingMax: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      cities: [],
      routes: [],
      feedbackTypes: [],
      sentiments: [],
    });
  };

  const toggleMulti = (
    key: 'cities' | 'feedbackTypes' | 'sentiments',
    value: string
  ) => {
    const current = filters[key] ?? [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700 text-sm">筛选条件</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-0.5"
            >
              <X className="w-3 h-3" /> 清除
            </button>
          )}
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-50">
          {/* Rating Range */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2 mt-3">评分范围</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => {
                    const min = filters.ratingMin;
                    const max = filters.ratingMax;
                    if (min === r && max === r) {
                      onChange({ ...filters, ratingMin: undefined, ratingMax: undefined });
                    } else if (!min) {
                      onChange({ ...filters, ratingMin: r, ratingMax: r });
                    } else if (r < min) {
                      onChange({ ...filters, ratingMin: r });
                    } else {
                      onChange({ ...filters, ratingMax: r });
                    }
                  }}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium border transition-colors',
                    filters.ratingMin !== undefined && filters.ratingMax !== undefined &&
                    r >= filters.ratingMin && r <= filters.ratingMax
                      ? 'bg-amber-400 text-white border-amber-400'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300'
                  )}
                >
                  {r}
                </button>
              ))}
              <span className="text-xs text-gray-400">
                {filters.ratingMin && filters.ratingMax
                  ? `${filters.ratingMin} - ${filters.ratingMax} 分`
                  : '全部'}
              </span>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">时间范围</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={e => onChange({ ...filters, dateFrom: e.target.value || undefined })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <span className="text-gray-400 text-xs">至</span>
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={e => onChange({ ...filters, dateTo: e.target.value || undefined })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Cities */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">城市</p>
            <div className="flex flex-wrap gap-1.5">
              {(meta?.cities ?? []).map(city => (
                <button
                  key={city}
                  onClick={() => toggleMulti('cities', city)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    (filters.cities ?? []).includes(city)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Types */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">反馈类型</p>
            <div className="flex flex-wrap gap-1.5">
              {(meta?.feedbackTypes ?? []).map(type => (
                <button
                  key={type}
                  onClick={() => toggleMulti('feedbackTypes', type)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    (filters.feedbackTypes ?? []).includes(type)
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">情感倾向</p>
            <div className="flex gap-1.5">
              {sentimentOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggleMulti('sentiments', opt.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    (filters.sentiments ?? []).includes(opt.value)
                      ? opt.value === 'positive'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : opt.value === 'negative'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
