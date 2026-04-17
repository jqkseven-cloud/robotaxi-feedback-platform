import { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';

const groupOptions = [
  { value: 'day', label: '按日' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
];

export default function TrendChart() {
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');

  const { data, isLoading } = useQuery({
    queryKey: ['trends', groupBy],
    queryFn: () => analyticsApi.trends(groupBy, 12),
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (groupBy === 'month') {
      return `${d.getMonth() + 1}月`;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">反馈趋势</h3>
          <p className="text-xs text-gray-400 mt-0.5">近12周反馈量与平均评分走势</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {groupOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value as typeof groupBy)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                groupBy === opt.value
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="count"
              orientation="left"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="rating"
              orientation="right"
              domain={[1, 5]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend
              formatter={(value) => (value === 'count' ? '反馈数量' : '平均评分')}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar yAxisId="count" dataKey="count" fill="#bfdbfe" radius={[3, 3, 0, 0]} name="count" />
            <Line
              yAxisId="rating"
              type="monotone"
              dataKey="avgRating"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6' }}
              name="avgRating"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
