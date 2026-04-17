import { Router, Request, Response } from 'express';
import { JsonFeedbackRepository } from '../repositories/JsonFeedbackRepository';
import { classifyFeedbacks, summarizeFeedbacks, generateSuggestions } from '../services/qwen';
import { validateBody } from '../middleware/validate';
import { classifyBodySchema, summarizeBodySchema, suggestionsBodySchema } from '../schemas';
import { logger } from '../middleware/logger';

const router = Router();
const repo = new JsonFeedbackRepository();

router.post('/classify', validateBody(classifyBodySchema), async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };

  const feedbacks = ids
    .map(id => repo.findById(id))
    .filter((f): f is NonNullable<typeof f> => f !== null)
    .map(f => ({ id: f.id, text: f.feedbackText }));

  if (feedbacks.length === 0) {
    res.status(404).json({ error: 'No feedbacks found for given ids' });
    return;
  }

  try {
    const results = await classifyFeedbacks(feedbacks);
    res.json({ results });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    logger.error('classify_failed', { error: detail });
    res.status(500).json({ error: 'Classification failed', detail });
  }
});

router.post('/summarize', validateBody(summarizeBodySchema), async (req: Request, res: Response) => {
  const { dateFrom, dateTo, feedbackTypes, cities: citiesParam } = req.body as {
    dateFrom?: string;
    dateTo?: string;
    feedbackTypes?: string[];
    cities?: string[];
  };

  const filtered = repo.findAll({
    dateFrom,
    dateTo,
    feedbackTypes: feedbackTypes?.length ? feedbackTypes : undefined,
    cities: citiesParam?.length ? citiesParam : undefined,
  });

  if (filtered.length === 0) {
    res.status(400).json({ error: 'No feedbacks match the given filters' });
    return;
  }

  const period = dateFrom && dateTo
    ? `${dateFrom} 至 ${dateTo}`
    : `全部数据（${filtered.length}条）`;

  try {
    const feedbacksForAI = filtered.map(f => ({
      id: f.id,
      text: f.feedbackText,
      rating: f.rating,
      feedbackType: f.feedbackType,
      sentiment: f.sentiment,
    }));
    res.json(await summarizeFeedbacks(feedbacksForAI, period));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    logger.error('summarize_failed', { error: detail });
    res.status(500).json({ error: 'Summarization failed', detail });
  }
});

router.post('/suggestions', validateBody(suggestionsBodySchema), async (req: Request, res: Response) => {
  const { days } = req.body as { days: number };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = repo.findAll({ dateFrom: cutoff.toISOString() });
  const { AI_SUGGESTIONS_MIN_RECORDS } = await import('../config/constants');
  const useData = filtered.length >= AI_SUGGESTIONS_MIN_RECORDS ? filtered : repo.findAll();
  const dataRange = filtered.length >= AI_SUGGESTIONS_MIN_RECORDS
    ? `最近${days}天数据（${useData.length}条）`
    : `全部数据（${useData.length}条）`;

  try {
    const feedbacksForAI = useData.map(f => ({
      text: f.feedbackText,
      rating: f.rating,
      feedbackType: f.feedbackType,
      sentiment: f.sentiment,
      tags: f.tags,
    }));
    res.json(await generateSuggestions(feedbacksForAI, dataRange));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    logger.error('suggestions_failed', { error: detail });
    res.status(500).json({ error: 'Suggestion generation failed', detail });
  }
});

export default router;
