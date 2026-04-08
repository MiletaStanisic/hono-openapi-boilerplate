import { randomUUID } from "node:crypto";
import type { CreateEventInput, Event, EventQuery, UpdateEventInput } from "../schemas/event.js";
import { applySorting, applyPagination } from "../schemas/common.js";
import { events } from "../store/index.js";

export function listEvents(query: EventQuery) {
  let items = Array.from(events.values());

  if (query.status) {
    items = items.filter((e) => e.status === query.status);
  }
  if (query.name) {
    const needle = query.name.toLowerCase();
    items = items.filter((e) => e.name.toLowerCase().includes(needle));
  }

  items = applySorting(items as unknown as Record<string, unknown>[], query.sortBy, query.sortOrder) as Event[];

  return applyPagination(items, query);
}

export function getEvent(id: string): Event | undefined {
  return events.get(id);
}

export function createEvent(input: CreateEventInput): Event {
  const now = new Date().toISOString();
  const event: Event = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    status: input.status ?? "draft",
    startDate: input.startDate,
    endDate: input.endDate,
    venue: input.venue,
    totalBudget: input.totalBudget ?? 0,
    createdAt: now,
    updatedAt: now
  };
  events.set(event.id, event);
  return event;
}

export function updateEvent(id: string, input: UpdateEventInput): Event | undefined {
  const existing = events.get(id);
  if (!existing) return undefined;

  const updated: Event = {
    ...existing,
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.startDate !== undefined && { startDate: input.startDate }),
    ...(input.endDate !== undefined && { endDate: input.endDate }),
    ...(input.venue !== undefined && { venue: input.venue }),
    ...(input.totalBudget !== undefined && { totalBudget: input.totalBudget }),
    updatedAt: new Date().toISOString()
  };
  events.set(id, updated);
  return updated;
}

export function deleteEvent(id: string): boolean {
  return events.delete(id);
}
