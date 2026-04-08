import { describe, expect, it } from "vitest";
import { getDashboardSummary } from "../src/services/dashboard.js";
import { events, risks } from "../src/store/index.js";

describe("getDashboardSummary — business logic", () => {
  it("totalEvents reflects store size", () => {
    const summary = getDashboardSummary();
    expect(summary.totalEvents).toBe(events.size);
  });

  it("eventsByStatus counts correctly", () => {
    const summary = getDashboardSummary();
    const manualCount: Record<string, number> = {};
    for (const e of events.values()) {
      manualCount[e.status] = (manualCount[e.status] ?? 0) + 1;
    }
    expect(summary.eventsByStatus).toEqual(manualCount);
  });

  it("upcomingEvents contains at most 5 events", () => {
    const summary = getDashboardSummary();
    expect(summary.upcomingEvents.length).toBeLessThanOrEqual(5);
  });

  it("upcomingEvents excludes cancelled events", () => {
    const NOW = new Date().toISOString();
    events.set("evt-cancelled", {
      id: "evt-cancelled", name: "Cancelled Event", status: "cancelled",
      startDate: "2026-08-01T10:00:00Z", endDate: "2026-08-01T18:00:00Z",
      totalBudget: 5000, createdAt: NOW, updatedAt: NOW
    });

    const summary = getDashboardSummary();
    expect(summary.upcomingEvents.every((e) => e.status !== "cancelled")).toBe(true);

    events.delete("evt-cancelled");
  });

  it("upcomingEvents are sorted by startDate ascending", () => {
    const summary = getDashboardSummary();
    for (let i = 0; i < summary.upcomingEvents.length - 1; i++) {
      const a = new Date(summary.upcomingEvents[i].startDate).getTime();
      const b = new Date(summary.upcomingEvents[i + 1].startDate).getTime();
      expect(a).toBeLessThanOrEqual(b);
    }
  });

  it("totalBudget is sum of all event totalBudgets", () => {
    const summary = getDashboardSummary();
    const expected = Array.from(events.values()).reduce((s, e) => s + e.totalBudget, 0);
    expect(summary.totalBudget).toBe(expected);
  });

  it("spendPercentage is 0 when totalBudget is 0", () => {
    // Temporarily zero out all budgets
    const saved: Array<[string, number]> = [];
    for (const [k, v] of events.entries()) {
      saved.push([k, v.totalBudget]);
      events.set(k, { ...v, totalBudget: 0 });
    }

    const summary = getDashboardSummary();
    expect(summary.spendPercentage).toBe(0);

    // Restore
    for (const [k, budget] of saved) {
      const e = events.get(k)!;
      events.set(k, { ...e, totalBudget: budget });
    }
  });

  it("openRisksCount reflects open risks only", () => {
    const summary = getDashboardSummary();
    const expected = Array.from(risks.values()).filter((r) => r.status === "open").length;
    expect(summary.openRisksCount).toBe(expected);
  });
});
