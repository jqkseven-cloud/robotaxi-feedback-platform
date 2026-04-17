import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSentimentLabel(sentiment: string): string {
  const map: Record<string, string> = {
    positive: '好评',
    neutral: '中性',
    negative: '差评',
  };
  return map[sentiment] ?? sentiment;
}

export function getSentimentColor(sentiment: string): string {
  const map: Record<string, string> = {
    positive: 'text-emerald-600 bg-emerald-50',
    neutral: 'text-amber-600 bg-amber-50',
    negative: 'text-red-600 bg-red-50',
  };
  return map[sentiment] ?? 'text-gray-600 bg-gray-50';
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-emerald-600';
  if (rating === 3) return 'text-amber-500';
  return 'text-red-500';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return map[priority] ?? 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  };
  return map[priority] ?? priority;
}
