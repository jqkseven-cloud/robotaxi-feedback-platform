import { z } from 'zod';
import { AI_CLASSIFY_MAX, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants';

const csvString = (field: string) =>
  z.string().optional().transform(v => v ? v.split(',') : undefined).describe(field);

export const feedbackListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  sortBy: z.enum(['createdAt', 'tripStartTime', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  ratingMin: z.coerce.number().min(1).max(5).optional(),
  ratingMax: z.coerce.number().min(1).max(5).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  dateTo: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  cities: csvString('cities'),
  routes: csvString('routes'),
  feedbackTypes: csvString('feedbackTypes'),
  sentiments: csvString('sentiments'),
  keyword: z.string().max(100).optional(),
});

export const analyticsQuerySchema = z.object({
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  weeks: z.coerce.number().int().min(1).max(52).default(12),
});

export const classifyBodySchema = z.object({
  ids: z.array(z.string()).min(1).max(AI_CLASSIFY_MAX),
});

export const summarizeBodySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  feedbackTypes: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
});

export const suggestionsBodySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export const createTicketSchema = z.object({
  feedbackId: z.string().min(1),
});

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  assignedTo: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export const ticketListSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  feedbackType: z.string().optional(),
  city: z.string().optional(),
});
