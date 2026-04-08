import { budgetItems, events, risks } from "../store/index.js";
import type { Event } from "../schemas/event.js";

export interface DashboardSummary {
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  upcomingEvents: Array<Pick<Event, "id" | "name" | "startDate" | "status" | "venue">>;
  totalBudget: number;
  totalSpend: number;
  spendPercentage: number;
  openRisksCount: number;
}

export function getDashboardSummary(): DashboardSummary {
  const allEvents = Array.from(events.values());
  const totalEvents = allEvents.length;

  const eventsByStatus: Record<string, number> = {};
  for (const e of allEvents) {
    eventsByStatus[e.status] = (eventsByStatus[e.status] ?? 0) + 1;
  }

  const now = new Date();
  const upcomingEvents = allEvents
    .filter((e) => e.status !== "cancelled" && new Date(e.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)
    .map(({ id, name, startDate, status, venue }) => ({ id, name, startDate, status, venue }));

  const allBudgetItems = Array.from(budgetItems.values());
  const totalBudget = allEvents.reduce((s, e) => s + e.totalBudget, 0);
  const totalSpend = allBudgetItems.reduce((s, b) => s + b.actualAmount, 0);
  const spendPercentage = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 1000) / 10 : 0;

  const openRisksCount = Array.from(risks.values()).filter((r) => r.status === "open").length;

  return {
    totalEvents,
    eventsByStatus,
    upcomingEvents,
    totalBudget,
    totalSpend,
    spendPercentage,
    openRisksCount
  };
}
