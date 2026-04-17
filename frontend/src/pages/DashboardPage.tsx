import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import KPICard from '@/components/dashboard/KPICard';
import TrendChart from '@/components/dashboard/TrendChart';
import {
  SentimentPieChart,
  RouteBarChart,
  RatingBarChart,
  TypeSentimentChart,
  CityBarChart,
} from '@/components/dashboard/DistributionCharts';

export default function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: analyticsApi.overview,
  });

  const { data: distribution } = useQuery({
    queryKey: ['distribution'],
    queryFn: analyticsApi.distribution,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">数据仪表盘</h1>
          <p className="text-sm text-gray-500 mt-0.5">Robotaxi 乘客反馈整体概览</p>
        </div>
        <div className="text-xs text-gray-400 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
          数据更新时间：{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="总反馈数"
          value={isLoading ? '—' : (overview?.total ?? 0)}
          subtitle={`近30天 ${overview?.recent30Count ?? 0} 条`}
          icon={<MessageSquare className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="综合平均分"
          value={isLoading ? '—' : `${overview?.avgRating ?? 0} 分`}
          subtitle={`近30天 ${overview?.recent30AvgRating ?? 0} 分`}
          trend={overview?.ratingTrend}
          trendLabel=" vs 上月"
          icon={<Star className="w-5 h-5" />}
          color="amber"
        />
        <KPICard
          title="好评率"
          value={isLoading ? '—' : `${overview?.positiveRate ?? 0}%`}
          subtitle={`共 ${overview?.positiveCount ?? 0} 条好评`}
          icon={<ThumbsUp className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="差评率"
          value={isLoading ? '—' : `${overview?.negativeRate ?? 0}%`}
          subtitle={`共 ${overview?.negativeCount ?? 0} 条差评`}
          icon={<ThumbsDown className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Trend Chart */}
      <TrendChart />

      {/* Row 1: Route + City */}
      <div className="grid grid-cols-2 gap-4">
        <RouteBarChart />
        <CityBarChart />
      </div>

      {/* Row 2: Rating + Sentiment */}
      <div className="grid grid-cols-2 gap-4">
        <RatingBarChart />
        <SentimentPieChart />
      </div>

      {/* Type Sentiment Stacked Bar - full width */}
      <TypeSentimentChart />

      {/* Type Detailed Table */}
      {distribution && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-1">反馈类型详情</h3>
          <p className="text-xs text-gray-400 mb-4">各类型反馈的评分与情感明细</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">反馈类型</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">总数</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">平均分</th>
                  <th className="text-right py-2 px-3 text-emerald-600 font-medium">好评</th>
                  <th className="text-right py-2 px-3 text-amber-600 font-medium">中性</th>
                  <th className="text-right py-2 px-3 text-red-600 font-medium">差评</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">情感比例</th>
                </tr>
              </thead>
              <tbody>
                {distribution.typeDetailed.map(row => {
                  const positiveW = Math.round((row.positive / row.total) * 100);
                  const neutralW = Math.round((row.neutral / row.total) * 100);
                  const negativeW = 100 - positiveW - neutralW;
                  return (
                    <tr key={row.type} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-700">{row.type}</td>
                      <td className="py-3 px-3 text-right text-gray-600">{row.total}</td>
                      <td className="py-3 px-3 text-right font-semibold text-amber-600">{row.avgRating}</td>
                      <td className="py-3 px-3 text-right text-emerald-600 font-medium">{row.positive}</td>
                      <td className="py-3 px-3 text-right text-amber-500 font-medium">{row.neutral}</td>
                      <td className="py-3 px-3 text-right text-red-500 font-medium">{row.negative}</td>
                      <td className="py-3 px-3">
                        <div className="flex h-2 rounded-full overflow-hidden w-32">
                          <div className="bg-emerald-400" style={{ width: `${positiveW}%` }} />
                          <div className="bg-amber-300" style={{ width: `${neutralW}%` }} />
                          <div className="bg-red-400" style={{ width: `${negativeW}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
