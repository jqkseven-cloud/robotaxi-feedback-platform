export interface Feedback {
  id: string;
  passengerId: string;
  tripId: string;
  vehicleId: string;
  rating: number;
  feedbackText: string;
  feedbackType: string;
  city: string;
  route: string;
  tripStartTime: string;
  tripDuration: number;
  weather: string;
  sentiment: string;
  tags: string[];
  createdAt: string;
}

export interface FeedbackFilter {
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

export interface SortOptions {
  sortBy: 'createdAt' | 'tripStartTime' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackMeta {
  cities: string[];
  routes: string[];
  feedbackTypes: string[];
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
