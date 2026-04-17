import mockData from '../data/mock-data.json';
import type {
  Feedback,
  FeedbackFilter,
  SortOptions,
  PaginationOptions,
  PaginatedResult,
  FeedbackMeta,
} from '../types';
import type { IFeedbackRepository } from './IFeedbackRepository';

const allData: Feedback[] = mockData as Feedback[];

function applyFilter(data: Feedback[], filter: FeedbackFilter): Feedback[] {
  let result = data;

  if (filter.ratingMin !== undefined) result = result.filter(f => f.rating >= filter.ratingMin!);
  if (filter.ratingMax !== undefined) result = result.filter(f => f.rating <= filter.ratingMax!);
  if (filter.dateFrom) result = result.filter(f => new Date(f.createdAt) >= new Date(filter.dateFrom!));
  if (filter.dateTo) result = result.filter(f => new Date(f.createdAt) <= new Date(filter.dateTo!));
  if (filter.cities?.length) result = result.filter(f => filter.cities!.includes(f.city));
  if (filter.routes?.length) result = result.filter(f => filter.routes!.includes(f.route));
  if (filter.feedbackTypes?.length) result = result.filter(f => filter.feedbackTypes!.includes(f.feedbackType));
  if (filter.sentiments?.length) result = result.filter(f => filter.sentiments!.includes(f.sentiment));

  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    result = result.filter(
      f =>
        f.feedbackText.toLowerCase().includes(kw) ||
        f.route.toLowerCase().includes(kw) ||
        f.city.toLowerCase().includes(kw)
    );
  }

  return result;
}

function applySort(data: Feedback[], sort: SortOptions): Feedback[] {
  return [...data].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    if (sort.sortBy === 'rating') {
      aVal = a.rating;
      bVal = b.rating;
    } else {
      aVal = new Date(a[sort.sortBy]).getTime();
      bVal = new Date(b[sort.sortBy]).getTime();
    }

    return sort.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });
}

export class JsonFeedbackRepository implements IFeedbackRepository {
  findMany(
    filter: FeedbackFilter,
    pagination: PaginationOptions,
    sort: SortOptions
  ): PaginatedResult<Feedback> {
    const filtered = applyFilter(allData, filter);
    const sorted = applySort(filtered, sort);

    const { page, pageSize } = pagination;
    const total = sorted.length;
    const start = (page - 1) * pageSize;

    return {
      data: sorted.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  findById(id: string): Feedback | null {
    return allData.find(f => f.id === id) ?? null;
  }

  findAll(filter?: FeedbackFilter): Feedback[] {
    return filter ? applyFilter(allData, filter) : allData;
  }

  getMeta(): FeedbackMeta {
    return {
      cities: [...new Set(allData.map(f => f.city))].sort(),
      routes: [...new Set(allData.map(f => f.route))].sort(),
      feedbackTypes: [...new Set(allData.map(f => f.feedbackType))].sort(),
    };
  }
}
