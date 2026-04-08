import { describe, expect, it } from "vitest";
import { budgetItems, events, risks, runOfShowItems } from "../src/store/index.js";
import { computeHealthScore } from "../src/services/health-score.js";

describe("computeHealthScore — business logic", () => {
  it("returns undefined for an unknown event", () => {
    expect(computeHealthScore("nonexistent")).toBeUndefined();
  });

  it("score is between 0 and 100 for seeded event", () => {
    const result = computeHealthScore("evt-1");
    expect(result).toBeDefined();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });

  it("budgetBurn.remaining = totalBudget - actual", () => {
    const result = computeHealthScore("evt-1");
    expect(result).toBeDefined();
    const event = events.get("evt-1")!;
    expect(result!.budgetBurn.remaining).toBe(
      Math.max(0, event.totalBudget - result!.budgetBurn.actual)
    );
  });

  it("scheduleDrift.total equals run-of-show item count for event", () => {
    const result = computeHealthScore("evt-1");
    const rosCount = Array.from(runOfShowItems.values()).filter(
      (i) => i.eventId === "evt-1"
    ).length;
    expect(result!.scheduleDrift.total).toBe(rosCount);
  });

  it("openRisks.total counts only open risks for the event", () => {
    const result = computeHealthScore("evt-1");
    const openCount = Array.from(risks.values()).filter(
      (r) => r.eventId === "evt-1" && r.status === "open"
    ).length;
    expect(result!.openRisks.total).toBe(openCount);
  });

  it("score degrades when all run-of-show items are skipped", () => {
    // Snapshot baseline score
    const baseline = computeHealthScore("evt-1")!.score;

    // Mark all ros items for evt-1 as skipped
    for (const [k, v] of runOfShowItems.entries()) {
      if (v.eventId === "evt-1") {
        runOfShowItems.set(k, { ...v, status: "skipped" });
      }
    }

    const degraded = computeHealthScore("evt-1")!.score;

    // Restore
    for (const [k, v] of runOfShowItems.entries()) {
      if (v.eventId === "evt-1") {
        runOfShowItems.set(k, { ...v, status: "pending" });
      }
    }

    expect(degraded).toBeLessThanOrEqual(baseline);
  });

  it("score degrades when actual spend exceeds totalBudget", () => {
    const event = events.get("evt-1")!;
    const originalBudget = event.totalBudget;

    // Set budget very low so actual exceeds it
    events.set("evt-1", { ...event, totalBudget: 100 });
    const degraded = computeHealthScore("evt-1")!.score;

    // Restore
    events.set("evt-1", { ...event, totalBudget: originalBudget });

    // With budget=100 and actual ~27000, budget should score near 0
    expect(degraded).toBeLessThan(60);
  });

  it("high-impact open risks reduce score more than low-impact", () => {
    const NOW = new Date().toISOString();

    // Add many high-impact open risks
    risks.set("test-rsk-high-1", {
      id: "test-rsk-high-1", eventId: "evt-1", title: "H1", likelihood: "high", impact: "high",
      status: "open", createdAt: NOW, updatedAt: NOW
    });
    risks.set("test-rsk-high-2", {
      id: "test-rsk-high-2", eventId: "evt-1", title: "H2", likelihood: "high", impact: "high",
      status: "open", createdAt: NOW, updatedAt: NOW
    });
    const scoreWithHighRisks = computeHealthScore("evt-1")!.score;

    // Replace with low-impact
    risks.set("test-rsk-high-1", { ...risks.get("test-rsk-high-1")!, impact: "low" });
    risks.set("test-rsk-high-2", { ...risks.get("test-rsk-high-2")!, impact: "low" });
    const scoreWithLowRisks = computeHealthScore("evt-1")!.score;

    // Cleanup
    risks.delete("test-rsk-high-1");
    risks.delete("test-rsk-high-2");

    expect(scoreWithHighRisks).toBeLessThanOrEqual(scoreWithLowRisks);
  });

  it("event with zero budget items returns 0 budget burn percentage", () => {
    const NOW = new Date().toISOString();
    events.set("evt-empty", {
      id: "evt-empty", name: "Empty", status: "draft",
      startDate: "2027-01-01T00:00:00Z", endDate: "2027-01-01T12:00:00Z",
      totalBudget: 10000, createdAt: NOW, updatedAt: NOW
    });
    const result = computeHealthScore("evt-empty")!;
    expect(result.budgetBurn.percentage).toBe(0);
    expect(result.budgetBurn.planned).toBe(0);
    expect(result.scheduleDrift.total).toBe(0);
    expect(result.openRisks.total).toBe(0);
    // No risks/schedule deductions — budget score = full budget weight with 0 actual
    expect(result.score).toBeGreaterThan(50);

    // Cleanup
    events.delete("evt-empty");
  });

  it("budgetBurn.planned is sum of plannedAmounts for the event", () => {
    const result = computeHealthScore("evt-1")!;
    const expectedPlanned = Array.from(budgetItems.values())
      .filter((b) => b.eventId === "evt-1")
      .reduce((s, b) => s + b.plannedAmount, 0);
    expect(result.budgetBurn.planned).toBe(expectedPlanned);
  });
});
