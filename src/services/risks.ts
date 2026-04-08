import { randomUUID } from "node:crypto";
import type { CreateRiskInput, Risk, UpdateRiskInput } from "../schemas/risk.js";
import type { Pagination } from "../schemas/common.js";
import { applySorting, applyPagination } from "../schemas/common.js";
import { risks } from "../store/index.js";

export interface RiskFilter extends Pagination {
  status?: "open" | "mitigated" | "closed";
  likelihood?: "low" | "medium" | "high";
  impact?: "low" | "medium" | "high";
}

export function listRisks(eventId: string, query: RiskFilter) {
  let items = Array.from(risks.values()).filter((r) => r.eventId === eventId);

  if (query.status) {
    items = items.filter((r) => r.status === query.status);
  }
  if (query.likelihood) {
    items = items.filter((r) => r.likelihood === query.likelihood);
  }
  if (query.impact) {
    items = items.filter((r) => r.impact === query.impact);
  }

  items = applySorting(items as unknown as Record<string, unknown>[], query.sortBy, query.sortOrder) as Risk[];

  return applyPagination(items, query);
}

export function getRisk(eventId: string, riskId: string): Risk | undefined {
  const r = risks.get(riskId);
  return r?.eventId === eventId ? r : undefined;
}

export function createRisk(eventId: string, input: CreateRiskInput): Risk {
  const now = new Date().toISOString();
  const risk: Risk = {
    id: randomUUID(),
    eventId,
    title: input.title,
    description: input.description,
    likelihood: input.likelihood,
    impact: input.impact,
    status: input.status ?? "open",
    mitigation: input.mitigation,
    createdAt: now,
    updatedAt: now
  };
  risks.set(risk.id, risk);
  return risk;
}

export function updateRisk(eventId: string, riskId: string, input: UpdateRiskInput): Risk | undefined {
  const existing = risks.get(riskId);
  if (!existing || existing.eventId !== eventId) return undefined;

  const updated: Risk = {
    ...existing,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.likelihood !== undefined && { likelihood: input.likelihood }),
    ...(input.impact !== undefined && { impact: input.impact }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.mitigation !== undefined && { mitigation: input.mitigation }),
    updatedAt: new Date().toISOString()
  };
  risks.set(riskId, updated);
  return updated;
}

export function deleteRisk(eventId: string, riskId: string): boolean {
  const r = risks.get(riskId);
  if (!r || r.eventId !== eventId) return false;
  return risks.delete(riskId);
}
