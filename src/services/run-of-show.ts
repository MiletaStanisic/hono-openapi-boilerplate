import { randomUUID } from "node:crypto";
import type { CreateRunOfShowItemInput, RunOfShowItem, UpdateRunOfShowItemInput } from "../schemas/run-of-show.js";
import type { Pagination } from "../schemas/common.js";
import { applySorting, applyPagination } from "../schemas/common.js";
import { runOfShowItems } from "../store/index.js";

export interface RunOfShowFilter extends Pagination {
  status?: "pending" | "in-progress" | "completed" | "skipped";
}

export function listRunOfShowItems(eventId: string, query: RunOfShowFilter) {
  let items = Array.from(runOfShowItems.values()).filter((i) => i.eventId === eventId);

  if (query.status) {
    items = items.filter((i) => i.status === query.status);
  }

  items = applySorting(items as unknown as Record<string, unknown>[], query.sortBy ?? "scheduledAt", query.sortOrder) as RunOfShowItem[];

  return applyPagination(items, query);
}

export function getRunOfShowItem(eventId: string, itemId: string): RunOfShowItem | undefined {
  const item = runOfShowItems.get(itemId);
  return item?.eventId === eventId ? item : undefined;
}

export function createRunOfShowItem(eventId: string, input: CreateRunOfShowItemInput): RunOfShowItem {
  const now = new Date().toISOString();
  const item: RunOfShowItem = {
    id: randomUUID(),
    eventId,
    title: input.title,
    description: input.description,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    status: input.status ?? "pending",
    assignedTo: input.assignedTo,
    notes: input.notes,
    createdAt: now,
    updatedAt: now
  };
  runOfShowItems.set(item.id, item);
  return item;
}

export function updateRunOfShowItem(eventId: string, itemId: string, input: UpdateRunOfShowItemInput): RunOfShowItem | undefined {
  const existing = runOfShowItems.get(itemId);
  if (!existing || existing.eventId !== eventId) return undefined;

  const updated: RunOfShowItem = {
    ...existing,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.scheduledAt !== undefined && { scheduledAt: input.scheduledAt }),
    ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
    ...(input.notes !== undefined && { notes: input.notes }),
    updatedAt: new Date().toISOString()
  };
  runOfShowItems.set(itemId, updated);
  return updated;
}

export function deleteRunOfShowItem(eventId: string, itemId: string): boolean {
  const item = runOfShowItems.get(itemId);
  if (!item || item.eventId !== eventId) return false;
  return runOfShowItems.delete(itemId);
}
