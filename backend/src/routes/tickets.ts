import { Router, Request, Response } from 'express';
import { TicketService } from '../services/ticketService';
import { JsonTicketRepository } from '../repositories/JsonTicketRepository';
import { JsonFeedbackRepository } from '../repositories/JsonFeedbackRepository';
import { validateBody, validateQuery } from '../middleware/validate';
import { createTicketSchema, updateTicketSchema, ticketListSchema } from '../schemas';
import type { TicketStatus } from '../types';

const router = Router();
const service = new TicketService(new JsonTicketRepository());
const feedbackRepo = new JsonFeedbackRepository();

router.get('/', validateQuery(ticketListSchema), (req: Request, res: Response) => {
  const q = res.locals.validatedQuery as { status?: TicketStatus; feedbackType?: string; city?: string };
  const tickets = service.list(q);
  const stats = service.stats();
  res.json({ tickets, stats });
});

router.post('/', validateBody(createTicketSchema), (req: Request, res: Response) => {
  const { feedbackId } = req.body as { feedbackId: string };

  const feedback = feedbackRepo.findById(feedbackId);
  if (!feedback) {
    res.status(404).json({ error: 'Feedback not found' });
    return;
  }

  const { ticket, alreadyExists } = service.create(feedback);
  res.status(alreadyExists ? 200 : 201).json({ ticket, alreadyExists });
});

router.patch('/:id', validateBody(updateTicketSchema), (req: Request, res: Response) => {
  const ticket = service.update(req.params['id'] as string, req.body as {
    status?: TicketStatus;
    assignedTo?: string;
    notes?: string;
  });
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json(ticket);
});

export default router;
