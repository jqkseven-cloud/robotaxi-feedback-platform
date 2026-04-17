export interface Feedback {
  id: string;
  passengerId: string;
  tripId: string;
  vehicleId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackText: string;
  feedbackType: string;
  city: string;
  route: string;
  tripStartTime: string;
  tripDuration: number;
  weather: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  createdAt: string;
}

export interface FeedbackListResponse {
  data: Feedback[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'rating' | 'tripStartTime';
  sortOrder?: 'asc' | 'desc';
  ratingMin?: number;
  ratingMax?: number;
  dateFrom?: string;
  dateTo?: string;
  cities?: string[];
  routes?: string[];
  feedbackTypes?: string[];
  sentiments?: string[];
  keyword?: string;
}

export interface OverviewMetrics {
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

export interface DistributionData {
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
    totalRating: number;
    avgRating: number;
  }[];
}

export interface MetaData {
  cities: string[];
  routes: string[];
  feedbackTypes: string[];
}

export interface ClassifyResult {
  id: string;
  originalText: string;
  suggestedCategory: string;
  confidence: number;
  reason: string;
}

export interface SummaryResult {
  period: string;
  totalCount: number;
  topIssues: { issue: string; count: number; examples: string[] }[];
  typicalQuotes: string[];
  overallSentiment: string;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
}

export interface Suggestion {
  category: string;
  problem: string;
  impact: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SuggestionResult {
  generatedAt: string;
  dataRange: string;
  suggestions: Suggestion[];
  summary: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  feedbackId: string;
  title: string;
  feedbackType: string;
  city: string;
  route: string;
  rating: number;
  feedbackText: string;
  sentiment: string;
  status: TicketStatus;
  assignedTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
  stats: { open: number; in_progress: number; resolved: number };
}
