import { budgetItems, events, risks, runOfShowItems } from "../store/index.js";

export interface HealthScore {
  eventId: string;
  score: number;
  budgetBurn: {
    percentage: number;
    planned: number;
    actual: number;
    remaining: number;
  };
  scheduleDrift: {
    percentage: number;
    total: number;
    completed: number;
    pending: number;
    skipped: number;
  };
  openRisks: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

const SCORE_MAX = 100;
const BUDGET_WEIGHT = 40;
const SCHEDULE_WEIGHT = 35;
const RISK_WEIGHT = 25;

function budgetScore(totalBudget: number, planned: number, actual: number): { score: number; percentage: number } {
  if (totalBudget === 0) {
    return { score: BUDGET_WEIGHT, percentage: 0 };
  }
  const burnRate = actual / totalBudget;
  const overrunRate = planned > 0 ? actual / planned : 0;

  let score: number;
  if (burnRate <= 0.8) {
    score = BUDGET_WEIGHT;
  } else if (burnRate <= 1.0) {
    // Linear decay from 100% → 50% as burn goes from 80% → 100%
    score = BUDGET_WEIGHT * (1 - ((burnRate - 0.8) / 0.2) * 0.5);
  } else {
    // Over budget: further penalty per 10% overrun, floored at 0
    const overrun = burnRate - 1.0;
    score = Math.max(0, BUDGET_WEIGHT * 0.5 * (1 - overrun * 2));
  }

  // If actual spending over-runs planned budget items significantly
  if (overrunRate > 1.1) {
    score = Math.max(0, score - BUDGET_WEIGHT * 0.1);
  }

  return { score, percentage: Math.round(burnRate * 100 * 10) / 10 };
}

function scheduleScore(total: number, completed: number, skipped: number): { score: number; percentage: number } {
  if (total === 0) {
    return { score: SCHEDULE_WEIGHT, percentage: 0 };
  }
  const driftRate = skipped / total;
  const completionRate = completed / total;

  // Penalise for skipped items; reward completion
  const rawScore = SCHEDULE_WEIGHT * (1 - driftRate * 0.8) * (0.5 + completionRate * 0.5);
  return {
    score: Math.max(0, Math.min(SCHEDULE_WEIGHT, rawScore)),
    percentage: Math.round(driftRate * 100 * 10) / 10
  };
}

function riskScore(openHighCount: number, openMediumCount: number, openLowCount: number): number {
  const penalty = openHighCount * 8 + openMediumCount * 4 + openLowCount * 1;
  return Math.max(0, RISK_WEIGHT - penalty);
}

export function computeHealthScore(eventId: string): HealthScore | undefined {
  const event = events.get(eventId);
  if (!event) return undefined;

  // Budget burn
  const eventBudgetItems = Array.from(budgetItems.values()).filter((b) => b.eventId === eventId);
  const totalPlanned = eventBudgetItems.reduce((s, b) => s + b.plannedAmount, 0);
  const totalActual = eventBudgetItems.reduce((s, b) => s + b.actualAmount, 0);
  const { score: bScore, percentage: burnPct } = budgetScore(event.totalBudget, totalPlanned, totalActual);

  // Schedule drift
  const rosItems = Array.from(runOfShowItems.values()).filter((i) => i.eventId === eventId);
  const rosTotal = rosItems.length;
  const rosCompleted = rosItems.filter((i) => i.status === "completed").length;
  const rosPending = rosItems.filter((i) => i.status === "pending" || i.status === "in-progress").length;
  const rosSkipped = rosItems.filter((i) => i.status === "skipped").length;
  const { score: sScore, percentage: driftPct } = scheduleScore(rosTotal, rosCompleted, rosSkipped);

  // Open risks
  const eventRisks = Array.from(risks.values()).filter((r) => r.eventId === eventId && r.status === "open");
  const openHigh = eventRisks.filter((r) => r.impact === "high").length;
  const openMedium = eventRisks.filter((r) => r.impact === "medium").length;
  const openLow = eventRisks.filter((r) => r.impact === "low").length;
  const rScore = riskScore(openHigh, openMedium, openLow);

  const rawScore = bScore + sScore + rScore;
  const score = Math.round(Math.max(0, Math.min(SCORE_MAX, rawScore)));

  return {
    eventId,
    score,
    budgetBurn: {
      percentage: burnPct,
      planned: totalPlanned,
      actual: totalActual,
      remaining: Math.max(0, event.totalBudget - totalActual)
    },
    scheduleDrift: {
      percentage: driftPct,
      total: rosTotal,
      completed: rosCompleted,
      pending: rosPending,
      skipped: rosSkipped
    },
    openRisks: {
      total: eventRisks.length,
      high: openHigh,
      medium: openMedium,
      low: openLow
    }
  };
}
