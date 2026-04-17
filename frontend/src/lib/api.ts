import axios from 'axios';
import type {
  Feedback,
  FeedbackListResponse,
  FeedbackFilters,
  OverviewMetrics,
  TrendPoint,
  DistributionData,
  MetaData,
  ClassifyResult,
  SummaryResult,
  SuggestionResult,
  Ticket,
  TicketListResponse,
  TicketStatus,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
});

export const feedbackApi = {
  list: async (filters: FeedbackFilters = {}): Promise<FeedbackListResponse> => {
    const params: Record<string, string | number | undefined> = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
      sortBy: filters.sortBy ?? 'createdAt',
      sortOrder: filters.sortOrder ?? 'desc',
    };

    if (filters.ratingMin !== undefined) params.ratingMin = filters.ratingMin;
    if (filters.ratingMax !== undefined) params.ratingMax = filters.ratingMax;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.cities?.length) params.cities = filters.cities.join(',');
    if (filters.routes?.length) params.routes = filters.routes.join(',');
    if (filters.feedbackTypes?.length) params.feedbackTypes = filters.feedbackTypes.join(',');
    if (filters.sentiments?.length) params.sentiments = filters.sentiments.join(',');
    if (filters.keyword) params.keyword = filters.keyword;

    const res = await api.get<FeedbackListResponse>('/feedback', { params });
    return res.data;
  },

  get: async (id: string): Promise<Feedback> => {
    const res = await api.get<Feedback>(`/feedback/${id}`);
    return res.data;
  },

  meta: async (): Promise<MetaData> => {
    const res = await api.get<MetaData>('/feedback/meta');
    return res.data;
  },
};

export const analyticsApi = {
  overview: async (): Promise<OverviewMetrics> => {
    const res = await api.get<OverviewMetrics>('/analytics/overview');
    return res.data;
  },

  trends: async (groupBy: 'day' | 'week' | 'month' = 'day', weeks = 12): Promise<TrendPoint[]> => {
    const res = await api.get<TrendPoint[]>('/analytics/trends', {
      params: { groupBy, weeks },
    });
    return res.data;
  },

  distribution: async (): Promise<DistributionData> => {
    const res = await api.get<DistributionData>('/analytics/distribution');
    return res.data;
  },
};

export const aiApi = {
  classify: async (ids: string[]): Promise<{ results: ClassifyResult[] }> => {
    const res = await api.post<{ results: ClassifyResult[] }>('/ai/classify', { ids });
    return res.data;
  },

  summarize: async (params: {
    dateFrom?: string;
    dateTo?: string;
    feedbackTypes?: string[];
    cities?: string[];
  }): Promise<SummaryResult> => {
    const res = await api.post<SummaryResult>('/ai/summarize', params);
    return res.data;
  },

  suggestions: async (days = 30): Promise<SuggestionResult> => {
    const res = await api.post<SuggestionResult>('/ai/suggestions', { days });
    return res.data;
  },
};

export const ticketApi = {
  list: async (filter?: { status?: TicketStatus; feedbackType?: string; city?: string }): Promise<TicketListResponse> => {
    const params: Record<string, string> = {};
    if (filter?.status) params.status = filter.status;
    if (filter?.feedbackType) params.feedbackType = filter.feedbackType;
    if (filter?.city) params.city = filter.city;
    const res = await api.get<TicketListResponse>('/tickets', { params });
    return res.data;
  },

  create: async (feedbackId: string): Promise<{ ticket: Ticket; alreadyExists: boolean }> => {
    const res = await api.post<{ ticket: Ticket; alreadyExists: boolean }>('/tickets', { feedbackId });
    return res.data;
  },

  update: async (id: string, patch: { status?: TicketStatus; assignedTo?: string; notes?: string }): Promise<Ticket> => {
    const res = await api.patch<Ticket>(`/tickets/${id}`, patch);
    return res.data;
  },
};
