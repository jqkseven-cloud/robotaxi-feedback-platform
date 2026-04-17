import type { IFeedbackRepository } from '../repositories/IFeedbackRepository';

export interface OverviewResult {
  total: number;
  avgRating: number;
  positiveRate: number;
  negativeRate: number;
  neutralRate: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  recent30Count: number;
  recent30AvgRating: number;
  ratingTrend: number;
}

export interface TrendPoint {
  date: string;
  count: number;
  avgRating: number;
}

export interface DistributionResult {
  byType: { name: string; value: number }[];
  byCity: { name: string; value: number }[];
  bySentiment: { name: string; value: number }[];
  byRating: { rating: number; count: number }[];
  byRoute: { route: string; count: number }[];
  topTags: { tag: string; count: number }[];
  typeDetailed: {
    type: string;
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    avgRating: number;
  }[];
}

export class AnalyticsService {
  constructor(private readonly repo: IFeedbackRepository) {}

  getOverview(): OverviewResult {
    const data = this.repo.findAll();
    const total = data.length;
    const avgRating = data.reduce((sum, f) => sum + f.rating, 0) / total;

    const positiveCount = data.filter(f => f.sentiment === 'positive').length;
    const negativeCount = data.filter(f => f.sentiment === 'negative').length;
    const neutralCount = data.filter(f => f.sentiment === 'neutral').length;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recent30 = data.filter(f => new Date(f.createdAt) >= thirtyDaysAgo);
    const prev30 = data.filter(f => {
      const d = new Date(f.createdAt);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const recent30Avg = recent30.length > 0
      ? recent30.reduce((sum, f) => sum + f.rating, 0) / recent30.length
      : avgRating;
    const prev30Avg = prev30.length > 0
      ? prev30.reduce((sum, f) => sum + f.rating, 0) / prev30.length
      : avgRating;

    return {
      total,
      avgRating: round2(avgRating),
      positiveRate: round1(positiveCount / total * 100),
      negativeRate: round1(negativeCount / total * 100),
      neutralRate: round1(neutralCount / total * 100),
      positiveCount,
      negativeCount,
      neutralCount,
      recent30Count: recent30.length,
      recent30AvgRating: round2(recent30Avg),
      ratingTrend: round2(recent30Avg - prev30Avg),
    };
  }

  getTrends(groupBy: 'day' | 'week' | 'month', weeks: number): TrendPoint[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeks * 7);

    const data = this.repo.findAll({ dateFrom: cutoff.toISOString() });
    const groups: Record<string, { count: number; totalRating: number }> = {};

    for (const f of data) {
      const key = getGroupKey(new Date(f.createdAt), groupBy);
      if (!groups[key]) groups[key] = { count: 0, totalRating: 0 };
      groups[key].count++;
      groups[key].totalRating += f.rating;
    }

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { count, totalRating }]) => ({
        date,
        count,
        avgRating: round2(totalRating / count),
      }));
  }

  getDistribution(): DistributionResult {
    const data = this.repo.findAll();

    const byType = countBy(data, f => f.feedbackType);
    const byCity = countBy(data, f => f.city);
    const bySentiment = countBy(data, f => f.sentiment);
    const byRatingMap = countBy(data, f => String(f.rating));

    const routeCounts = countBy(data, f => f.route);
    const byRoute = Object.entries(routeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => ({ route, count }));

    const tagCounts = data.flatMap(f => f.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const detailedMap = data.reduce((acc, f) => {
      if (!acc[f.feedbackType]) {
        acc[f.feedbackType] = { total: 0, positive: 0, neutral: 0, negative: 0, totalRating: 0 };
      }
      acc[f.feedbackType].total++;
      acc[f.feedbackType][f.sentiment as 'positive' | 'neutral' | 'negative']++;
      acc[f.feedbackType].totalRating += f.rating;
      return acc;
    }, {} as Record<string, { total: number; positive: number; neutral: number; negative: number; totalRating: number }>);

    const typeDetailed = Object.entries(detailedMap).map(([type, s]) => ({
      type,
      total: s.total,
      positive: s.positive,
      neutral: s.neutral,
      negative: s.negative,
      avgRating: round2(s.totalRating / s.total),
    }));

    return {
      byType: toNameValue(byType),
      byCity: toNameValue(byCity),
      bySentiment: toNameValue(bySentiment),
      byRating: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: byRatingMap[r] || 0 })),
      byRoute,
      topTags,
      typeDetailed,
    };
  }
}

function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function toNameValue(map: Record<string, number>): { name: string; value: number }[] {
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function getGroupKey(d: Date, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'month') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (groupBy === 'week') {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().split('T')[0];
  }
  return d.toISOString().split('T')[0];
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;
