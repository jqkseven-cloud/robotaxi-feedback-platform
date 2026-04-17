import type {
  Feedback,
  FeedbackFilter,
  SortOptions,
  PaginationOptions,
  PaginatedResult,
  FeedbackMeta,
} from '../types';

export interface IFeedbackRepository {
  findMany(
    filter: FeedbackFilter,
    pagination: PaginationOptions,
    sort: SortOptions
  ): PaginatedResult<Feedback>;

  findById(id: string): Feedback | null;

  findAll(filter?: FeedbackFilter): Feedback[];

  getMeta(): FeedbackMeta;
}
