import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Loader2, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import { aiApi, feedbackApi } from '@/lib/api';
import type { SummaryResult } from '@/types';
import { cn } from '@/lib/utils';

export default function SummaryPanel() {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-04-30');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const { data: meta } = useQuery({
    queryKey: ['meta'],
    queryFn: feedbackApi.meta,
  });

  const { mutate: summarize, isPending } = useMutation({
    mutationFn: aiApi.summarize,
    onSuccess: data => setResult(data),
  });

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = () => {
    summarize({
      dateFrom,
      dateTo,
      feedbackTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm text-purple-700">
        <p className="font-medium mb-1">使用说明</p>
        <p className="text-purple-600">选择时间范围和反馈类型筛选条件，AI将提炼批量反馈的核心问题、典型用户说词和整体情感状况。</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">开始日期</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">结束日期</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">反馈类型（不选则全部）</p>
          <div className="flex flex-wrap gap-1.5">
            {(meta?.feedbackTypes ?? []).map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  selectedTypes.includes(type)
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'border-gray-200 text-gray-600 hover:border-purple-300'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {isPending ? '生成中，请稍候...' : '生成摘要'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">分析摘要</h3>
              <span className="text-xs text-gray-400">{result.period}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{result.totalCount}</p>
                <p className="text-xs text-gray-400">总反馈数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{result.sentimentBreakdown.positive}</p>
                <p className="text-xs text-gray-400">好评</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{result.sentimentBreakdown.neutral}</p>
                <p className="text-xs text-gray-400">中性</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{result.sentimentBreakdown.negative}</p>
                <p className="text-xs text-gray-400">差评</p>
              </div>
            </div>
          </div>

          {/* Overall Sentiment */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700 text-sm mb-1">整体情感判断</p>
                <p className="text-gray-600 text-sm leading-relaxed">{result.overallSentiment}</p>
              </div>
            </div>
          </div>

          {/* Top Issues */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="font-semibold text-gray-800 text-sm">核心问题</p>
            </div>
            <div className="space-y-3">
              {result.topIssues.map((issue, i) => (
                <div key={i} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-medium text-gray-700 text-sm">
                      <span className="text-purple-500 mr-1.5">#{i + 1}</span>
                      {issue.issue}
                    </p>
                    {issue.count > 0 && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                        涉及 {issue.count} 条
                      </span>
                    )}
                  </div>
                  {issue.examples.length > 0 && (
                    <div className="space-y-1">
                      {issue.examples.map((ex, j) => (
                        <p key={j} className="text-xs text-gray-500 pl-3 border-l-2 border-gray-200">
                          "{ex}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Typical Quotes */}
          {result.typicalQuotes.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <p className="font-semibold text-gray-800 text-sm">典型用户说词</p>
              </div>
              <div className="space-y-2">
                {result.typicalQuotes.map((quote, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                    <span className="text-blue-400 text-lg leading-none mt-0.5">"</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{quote}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
