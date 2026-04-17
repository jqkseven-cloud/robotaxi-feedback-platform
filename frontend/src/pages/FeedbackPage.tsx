import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { feedbackApi } from '@/lib/api';
import type { FeedbackFilters, Feedback } from '@/types';
import FilterPanel from '@/components/feedback/FilterPanel';
import FeedbackDetail from '@/components/feedback/FeedbackDetail';
import StarRating from '@/components/feedback/StarRating';
import SentimentBadge from '@/components/feedback/SentimentBadge';
import { formatDateTime } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function FeedbackPage() {
  const [filters, setFilters] = useState<FeedbackFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [keyword, setKeyword] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['feedbacks', filters],
    queryFn: () => feedbackApi.list(filters),
  });

  const handleSort = (field: 'createdAt' | 'rating') => {
    if (filters.sortBy === field) {
      setFilters(f => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 }));
    } else {
      setFilters(f => ({ ...f, sortBy: field, sortOrder: 'desc', page: 1 }));
    }
  };

  const handleFiltersChange = useCallback((newFilters: FeedbackFilters) => {
    setFilters(f => ({ ...f, ...newFilters, page: 1 }));
  }, []);

  const handleSearch = () => {
    setFilters(f => ({ ...f, keyword: keyword || undefined, page: 1 }));
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortBy !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
    return filters.sortOrder === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">反馈列表</h1>
          <p className="text-sm text-gray-500 mt-0.5">查看和管理乘客反馈数据</p>
        </div>
        {data && (
          <span className="text-sm text-gray-400">
            共 <span className="font-semibold text-gray-700">{data.total}</span> 条反馈
          </span>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="搜索反馈内容、路线、城市..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </div>

      <FilterPanel filters={filters} onChange={handleFiltersChange} />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">ID</th>
                <th
                  className="text-left px-4 py-3 text-xs text-gray-500 font-medium cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center gap-1">
                    评分 <SortIcon field="rating" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">情感</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">反馈类型</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">城市</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium min-w-40">路线</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">天气</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium min-w-36">标签</th>
                <th
                  className="text-left px-4 py-3 text-xs text-gray-500 font-medium cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    反馈时间 <SortIcon field="createdAt" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    加载中...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    没有找到符合条件的反馈
                  </td>
                </tr>
              ) : (
                data?.data.map(feedback => (
                  <tr
                    key={feedback.id}
                    className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{feedback.id}</td>
                    <td className="px-4 py-3">
                      <StarRating rating={feedback.rating} />
                    </td>
                    <td className="px-4 py-3">
                      <SentimentBadge sentiment={feedback.sentiment} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                        {feedback.feedbackType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{feedback.city}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px] truncate" title={feedback.route}>
                      {feedback.route}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{feedback.weather}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {feedback.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {feedback.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{feedback.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDateTime(feedback.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              第 {(filters.page ?? 1)} / {data.totalPages} 页，共 {data.total} 条
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setFilters(f => ({ ...f, page }))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      (filters.page ?? 1) === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                disabled={(filters.page ?? 1) >= data.totalPages}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedFeedback && (
        <FeedbackDetail
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}
