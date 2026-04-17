import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DistributionData } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

const SENTIMENT_LABELS: Record<string, string> = {
  positive: '好评',
  neutral: '中性',
  negative: '差评',
};

const TYPE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const RATING_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];

export function SentimentPieChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
  });

  const chartData = data?.bySentiment.map(d => ({
    ...d,
    label: SENTIMENT_LABELS[d.name] ?? d.name,
  })) ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-1">情感分布</h3>
      <p className="text-xs text-gray-400 mb-4">好评 / 中性 / 差评占比</p>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              nameKey="label"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] ?? '#6b7280'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend
              formatter={(value) => value}
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function TypePieChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
  });

  const chartData = data?.byType ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-1">反馈类型分布</h3>
      <p className="text-xs text-gray-400 mb-4">各类型反馈占比</p>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={75}
              dataKey="value"
              nameKey="name"
              label={false}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function RouteBarChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
  });

  const chartData = (data?.byRoute ?? []).slice(0, 8);

  const formatRoute = (route: string) => {
    const parts = route.split(' → ');
    if (parts.length === 2) {
      const start = parts[0].length > 6 ? parts[0].slice(0, 6) + '…' : parts[0];
      return start;
    }
    return route.slice(0, 8);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-1">热门路线 Top 8</h3>
      <p className="text-xs text-gray-400 mb-4">各路线反馈数量排名</p>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="route"
              tickFormatter={formatRoute}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value) => [value, '反馈数']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 3, 3, 0]} name="反馈数" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function RatingBarChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
  });

  const chartData = (data?.byRating ?? []).map(d => ({
    ...d,
    label: `${d.rating}星`,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-1">评分分布</h3>
      <p className="text-xs text-gray-400 mb-4">1-5 分评分数量分布</p>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value) => [value, '反馈数']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={RATING_COLORS[entry.rating - 1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function TypeSentimentChart({ data: distData }: { data?: DistributionData }) {
  const { data, isLoading } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
    initialData: distData,
  });

  const chartData = (data?.typeDetailed ?? []).map(d => ({
    name: d.type,
    好评: d.positive,
    中性: d.neutral,
    差评: d.negative,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-1">各类型情感对比</h3>
      <p className="text-xs text-gray-400 mb-4">各反馈类型的好评 / 中性 / 差评数量对比</p>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="好评" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="中性" stackId="a" fill="#f59e0b" />
            <Bar dataKey="差评" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function CityBarChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
  });

  const chartData = data?.byCity ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-1">城市反馈分布</h3>
      <p className="text-xs text-gray-400 mb-4">各运营城市反馈数量</p>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [v, '反馈数']} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'][i % 4]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
