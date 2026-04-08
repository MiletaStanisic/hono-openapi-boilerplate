import { randomUUID } from "node:crypto";
import type { BudgetItem, CreateBudgetItemInput, UpdateBudgetItemInput } from "../schemas/budget-item.js";
import type { Pagination } from "../schemas/common.js";
import { applySorting, applyPagination } from "../schemas/common.js";
import { budgetItems } from "../store/index.js";

export interface BudgetItemFilter extends Pagination {
  status?: "planned" | "approved" | "paid" | "over-budget";
  category?: string;
}

export function listBudgetItems(eventId: string, query: BudgetItemFilter) {
  let items = Array.from(budgetItems.values()).filter((b) => b.eventId === eventId);

  if (query.status) {
    items = items.filter((b) => b.status === query.status);
  }
  if (query.category) {
    const needle = query.category.toLowerCase();
    items = items.filter((b) => b.category.toLowerCase().includes(needle));
  }

  items = applySorting(items as unknown as Record<string, unknown>[], query.sortBy, query.sortOrder) as BudgetItem[];

  return applyPagination(items, query);
}

export function getBudgetItem(eventId: string, itemId: string): BudgetItem | undefined {
  const item = budgetItems.get(itemId);
  return item?.eventId === eventId ? item : undefined;
}

export function createBudgetItem(eventId: string, input: CreateBudgetItemInput): BudgetItem {
  const now = new Date().toISOString();
  const item: BudgetItem = {
    id: randomUUID(),
    eventId,
    category: input.category,
    description: input.description,
    plannedAmount: input.plannedAmount,
    actualAmount: input.actualAmount ?? 0,
    status: input.status ?? "planned",
    createdAt: now,
    updatedAt: now
  };
  budgetItems.set(item.id, item);
  return item;
}

export function updateBudgetItem(eventId: string, itemId: string, input: UpdateBudgetItemInput): BudgetItem | undefined {
  const existing = budgetItems.get(itemId);
  if (!existing || existing.eventId !== eventId) return undefined;

  const updated: BudgetItem = {
    ...existing,
    ...(input.category !== undefined && { category: input.category }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.plannedAmount !== undefined && { plannedAmount: input.plannedAmount }),
    ...(input.actualAmount !== undefined && { actualAmount: input.actualAmount }),
    ...(input.status !== undefined && { status: input.status }),
    updatedAt: new Date().toISOString()
  };
  budgetItems.set(itemId, updated);
  return updated;
}

export function deleteBudgetItem(eventId: string, itemId: string): boolean {
  const item = budgetItems.get(itemId);
  if (!item || item.eventId !== eventId) return false;
  return budgetItems.delete(itemId);
}
