import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Wand2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { feedbackApi, aiApi } from '@/lib/api';
import type { ClassifyResult } from '@/types';
import StarRating from '@/components/feedback/StarRating';
import SentimentBadge from '@/components/feedback/SentimentBadge';
import { cn } from '@/lib/utils';

export default function ClassifyPanel() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<ClassifyResult[]>([]);

  const { data, isLoading: listLoading } = useQuery({
    queryKey: ['feedbacks-classify'],
    queryFn: () => feedbackApi.list({ page: 1, pageSize: 30, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { mutate: classify, isPending } = useMutation({
    mutationFn: aiApi.classify,
    onSuccess: res => setResults(res.results),
  });

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 20 ? [...prev, id] : prev
    );
  };

  const handleClassify = () => {
    if (selectedIds.length === 0) return;
    classify(selectedIds);
  };

  const getResultForId = (id: string) => results.find(r => r.id === id);

  const matchCount = results.filter(r => {
    const feedback = data?.data.find(f => f.id === r.id);
    return feedback && r.suggestedCategory === feedback.feedbackType;
  }).length;
  const mismatchCount = results.length - matchCount;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">使用说明</p>
        <p className="text-blue-600">勾选最多20条反馈，点击「开始分类」，AI将自动识别反馈所属的问题类型，并与现有分类对比。</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          已选 <span className="font-semibold text-gray-700">{selectedIds.length}</span> / 20 条
        </p>
        <button
          onClick={handleClassify}
          disabled={selectedIds.length === 0 || isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {isPending ? '分类中...' : '开始分类'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
          <span className="text-gray-600">共分类 <span className="font-semibold text-gray-800">{results.length}</span> 条</span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" />
            一致 <span className="font-semibold">{matchCount}</span> 条
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" />
            不同 <span className="font-semibold">{mismatchCount}</span> 条
          </span>
        </div>
      )}

      {listLoading ? (
        <div className="py-10 text-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
          {data?.data.map(feedback => {
            const result = getResultForId(feedback.id);
            const isSelected = selectedIds.includes(feedback.id);
            const isSameCategory = result?.suggestedCategory === feedback.feedbackType;
            const pct = result ? Math.round(result.confidence * 100) : 0;
            const barColor = pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';

            return (
              <div
                key={feedback.id}
                onClick={() => toggle(feedback.id)}
                className={cn(
                  'p-4 rounded-lg border cursor-pointer transition-all',
                  isSelected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  )}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-gray-400 font-mono">{feedback.id}</span>
                      <StarRating rating={feedback.rating} />
                      <SentimentBadge sentiment={feedback.sentiment} />
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                        {feedback.feedbackType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{feedback.feedbackText}</p>

                    {result && (
                      <div className="mt-2 flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                        {isSameCategory ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-gray-400">AI分类：</span>
                            {!isSameCategory && (
                              <>
                                <span className="line-through text-gray-400">{feedback.feedbackType}</span>
                                <span className="text-gray-300">→</span>
                              </>
                            )}
                            <span className={cn(
                              'font-medium px-1.5 py-0.5 rounded',
                              isSameCategory
                                ? 'text-emerald-600'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            )}>
                              {result.suggestedCategory}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-gray-400">置信度</span>
                              <span className={cn(
                                'font-medium',
                                pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'
                              )}>{pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100">
                              <div
                                className={cn('h-1.5 rounded-full transition-all', barColor)}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-gray-500">{result.reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
