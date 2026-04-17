import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lightbulb, Loader2, Copy, Check } from 'lucide-react';
import { aiApi } from '@/lib/api';
import type { SuggestionResult, Suggestion } from '@/types';
import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils';

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function SuggestPanel() {
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: getSuggestions, isPending } = useMutation({
    mutationFn: aiApi.suggestions,
    onSuccess: data => setResult(data),
  });

  const sortedSuggestions = result?.suggestions
    ? [...result.suggestions].sort(
        (a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
      )
    : [];

  const copyToClipboard = () => {
    if (!result) return;
    const text = [
      `Robotaxi 产品优化建议报告`,
      `数据范围：${result.dataRange}`,
      `生成时间：${new Date(result.generatedAt).toLocaleString('zh-CN')}`,
      '',
      result.summary,
      '',
      ...sortedSuggestions.map((s, i) => [
        `${i + 1}. 【${getPriorityLabel(s.priority)}】${s.category}`,
        `   问题：${s.problem}`,
        `   影响：${s.impact}`,
        `   建议：${s.recommendation}`,
      ].join('\n')),
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-emerald-700">
        <p className="font-medium mb-1">使用说明</p>
        <p className="text-emerald-600">
          AI将分析近期反馈数据中的高频问题，按优先级生成具体可落地的产品优化建议，包含问题识别、影响分析和改进方向。
        </p>
      </div>

      {/* Config */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">数据时间范围</label>
            <div className="flex gap-2">
              {[7, 30, 60, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    days === d
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                  )}
                >
                  近{d}天
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => getSuggestions(days)}
            disabled={isPending}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
            {isPending ? '分析中，请稍候...' : '生成优化建议'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">产品优化建议报告</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {result.dataRange} · 生成于 {new Date(result.generatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制报告'}
              </button>
            </div>

            {result.summary && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
                {result.summary}
              </p>
            )}
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            {sortedSuggestions.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const colorClass = getPriorityColor(suggestion.priority);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
            {index}
          </span>
          <h4 className="font-semibold text-gray-800">{suggestion.category}</h4>
        </div>
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border shrink-0', colorClass)}>
          {getPriorityLabel(suggestion.priority)}
        </span>
      </div>

      <div className="space-y-2.5 pl-8">
        <div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">问题描述</p>
          <p className="text-sm text-gray-700 leading-relaxed">{suggestion.problem}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-amber-500 mb-0.5">影响分析</p>
          <p className="text-sm text-gray-600 leading-relaxed">{suggestion.impact}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-600 mb-0.5">优化建议</p>
          <p className="text-sm text-gray-700 leading-relaxed">{suggestion.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
