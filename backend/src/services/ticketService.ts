import type { Feedback, Ticket, TicketStatus } from '../types';
import { JsonTicketRepository } from '../repositories/JsonTicketRepository';

const TEAM_MAP: Record<string, string> = {
  '驾驶体验': '算法团队',
  '路线规划': '算法团队',
  '车内环境': '运营团队',
  '接驾体验': '调度团队',
  '安全感受': '安全团队',
};

function buildTitle(feedback: Feedback): string {
  const preview = feedback.feedbackText.slice(0, 15).replace(/\n/g, ' ');
  return `[${feedback.feedbackType}] ${preview}… · ${feedback.city}`;
}

export class TicketService {
  constructor(private readonly repo: JsonTicketRepository) {}

  list(filter?: { status?: TicketStatus; feedbackType?: string; city?: string }): Ticket[] {
    return this.repo.findAll(filter);
  }

  getById(id: string): Ticket | null {
    return this.repo.findById(id);
  }

  create(feedback: Feedback): { ticket: Ticket; alreadyExists: boolean } {
    const existing = this.repo.findByFeedbackId(feedback.id);
    if (existing) return { ticket: existing, alreadyExists: true };

    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: this.repo.nextId(),
      feedbackId: feedback.id,
      title: buildTitle(feedback),
      feedbackType: feedback.feedbackType,
      city: feedback.city,
      route: feedback.route,
      rating: feedback.rating,
      feedbackText: feedback.feedbackText,
      sentiment: feedback.sentiment,
      status: 'open',
      assignedTo: TEAM_MAP[feedback.feedbackType] ?? '运营团队',
      notes: '',
      createdAt: now,
      updatedAt: now,
    };

    return { ticket: this.repo.create(ticket), alreadyExists: false };
  }

  update(id: string, patch: { status?: TicketStatus; assignedTo?: string; notes?: string }): Ticket | null {
    return this.repo.update(id, { ...patch, updatedAt: new Date().toISOString() });
  }

  stats(): { open: number; in_progress: number; resolved: number } {
    const all = this.repo.findAll();
    return {
      open: all.filter(t => t.status === 'open').length,
      in_progress: all.filter(t => t.status === 'in_progress').length,
      resolved: all.filter(t => t.status === 'resolved').length,
    };
  }
}
