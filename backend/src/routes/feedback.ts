import { Router, Request, Response } from 'express';
import { FeedbackService } from '../services/feedbackService';
import { JsonFeedbackRepository } from '../repositories/JsonFeedbackRepository';
import { validateQuery } from '../middleware/validate';
import { feedbackListSchema } from '../schemas';

const router = Router();
const service = new FeedbackService(new JsonFeedbackRepository());

router.get('/', validateQuery(feedbackListSchema), (req: Request, res: Response) => {
  const q = res.locals.validatedQuery as ReturnType<typeof feedbackListSchema.parse>;

  res.json(service.list(
    {
      ratingMin: q.ratingMin,
      ratingMax: q.ratingMax,
      dateFrom: q.dateFrom,
      dateTo: q.dateTo,
      cities: q.cities,
      routes: q.routes,
      feedbackTypes: q.feedbackTypes,
      sentiments: q.sentiments,
      keyword: q.keyword,
    },
    { page: q.page, pageSize: q.pageSize },
    { sortBy: q.sortBy, sortOrder: q.sortOrder }
  ));
});

router.get('/meta', (_req: Request, res: Response) => {
  res.json(service.getMeta());
});

router.get('/:id', (req: Request, res: Response) => {
  const feedback = service.getById(req.params['id'] as string);
  if (!feedback) {
    res.status(404).json({ error: 'Feedback not found' });
    return;
  }
  res.json(feedback);
});

export default router;
