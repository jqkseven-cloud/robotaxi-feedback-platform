import type { IFeedbackRepository } from '../repositories/IFeedbackRepository';
import type {
  Feedback,
  FeedbackFilter,
  SortOptions,
  PaginationOptions,
  PaginatedResult,
  FeedbackMeta,
} from '../types';

export class FeedbackService {
  constructor(private readonly repo: IFeedbackRepository) {}

  list(
    filter: FeedbackFilter,
    pagination: PaginationOptions,
    sort: SortOptions
  ): PaginatedResult<Feedback> {
    return this.repo.findMany(filter, pagination, sort);
  }

  getById(id: string): Feedback | null {
    return this.repo.findById(id);
  }

  getMeta(): FeedbackMeta {
    return this.repo.getMeta();
  }
}
