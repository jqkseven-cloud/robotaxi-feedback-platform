import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { JsonFeedbackRepository } from '../repositories/JsonFeedbackRepository';
import { validateQuery } from '../middleware/validate';
import { analyticsQuerySchema } from '../schemas';

const router = Router();
const service = new AnalyticsService(new JsonFeedbackRepository());

router.get('/overview', (_req: Request, res: Response) => {
  res.json(service.getOverview());
});

router.get('/trends', validateQuery(analyticsQuerySchema), (req: Request, res: Response) => {
  const q = res.locals.validatedQuery as ReturnType<typeof analyticsQuerySchema.parse>;
  res.json(service.getTrends(q.groupBy, q.weeks));
});

router.get('/distribution', (_req: Request, res: Response) => {
  res.json(service.getDistribution());
});

export default router;
