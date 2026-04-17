import fs from 'fs';
import path from 'path';
import type { Ticket, TicketStatus } from '../types';

const DATA_PATH = path.join(__dirname, '../data/tickets.json');

function readAll(): Ticket[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as Ticket[];
  } catch {
    return [];
  }
}

function writeAll(tickets: Ticket[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tickets, null, 2), 'utf-8');
}

export class JsonTicketRepository {
  findAll(filter?: { status?: TicketStatus; feedbackType?: string; city?: string }): Ticket[] {
    let data = readAll();
    if (filter?.status) data = data.filter(t => t.status === filter.status);
    if (filter?.feedbackType) data = data.filter(t => t.feedbackType === filter.feedbackType);
    if (filter?.city) data = data.filter(t => t.city === filter.city);
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findById(id: string): Ticket | null {
    return readAll().find(t => t.id === id) ?? null;
  }

  findByFeedbackId(feedbackId: string): Ticket | null {
    return readAll().find(t => t.feedbackId === feedbackId) ?? null;
  }

  create(ticket: Ticket): Ticket {
    const all = readAll();
    all.push(ticket);
    writeAll(all);
    return ticket;
  }

  update(id: string, patch: Partial<Pick<Ticket, 'status' | 'assignedTo' | 'notes' | 'updatedAt'>>): Ticket | null {
    const all = readAll();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    writeAll(all);
    return all[idx];
  }

  nextId(): string {
    const all = readAll();
    const max = all.reduce((m, t) => {
      const n = parseInt(t.id.replace('TK', ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    return `TK${String(max + 1).padStart(3, '0')}`;
  }
}
