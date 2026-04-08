import type { BudgetItem } from "../schemas/budget-item.js";
import type { Event } from "../schemas/event.js";
import type { Risk } from "../schemas/risk.js";
import type { RunOfShowItem } from "../schemas/run-of-show.js";
import type { Vendor } from "../schemas/vendor.js";

export const events = new Map<string, Event>();
export const vendors = new Map<string, Vendor>();
export const runOfShowItems = new Map<string, RunOfShowItem>();
export const budgetItems = new Map<string, BudgetItem>();
export const risks = new Map<string, Risk>();

// ── Seed data ─────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();
const FUTURE_START = "2026-07-15T18:00:00Z";
const FUTURE_END = "2026-07-15T23:00:00Z";

events.set("evt-1", {
  id: "evt-1",
  name: "Summer Gala 2026",
  description: "Annual fundraising gala for 200 guests",
  status: "confirmed",
  startDate: FUTURE_START,
  endDate: FUTURE_END,
  venue: "Grand Ballroom",
  totalBudget: 50000,
  createdAt: NOW,
  updatedAt: NOW
});

events.set("evt-2", {
  id: "evt-2",
  name: "Product Launch Q3",
  description: "Public launch for the new product line",
  status: "draft",
  startDate: "2026-09-10T09:00:00Z",
  endDate: "2026-09-10T17:00:00Z",
  venue: "Tech Hub Auditorium",
  totalBudget: 30000,
  createdAt: NOW,
  updatedAt: NOW
});

// Vendors for evt-1
vendors.set("vnd-1", {
  id: "vnd-1",
  eventId: "evt-1",
  name: "Elite Catering Co.",
  category: "catering",
  status: "confirmed",
  contractValue: 12000,
  paidAmount: 6000,
  notes: "50% deposit paid",
  createdAt: NOW,
  updatedAt: NOW
});

vendors.set("vnd-2", {
  id: "vnd-2",
  eventId: "evt-1",
  name: "ProSound AV",
  category: "av",
  status: "confirmed",
  contractValue: 5000,
  paidAmount: 5000,
  notes: "Fully paid",
  createdAt: NOW,
  updatedAt: NOW
});

vendors.set("vnd-3", {
  id: "vnd-3",
  eventId: "evt-1",
  name: "LensCraft Photography",
  category: "photography",
  status: "pending",
  contractValue: 3500,
  paidAmount: 0,
  createdAt: NOW,
  updatedAt: NOW
});

// Run of show for evt-1
runOfShowItems.set("ros-1", {
  id: "ros-1",
  eventId: "evt-1",
  title: "Venue Setup & Staff Briefing",
  scheduledAt: "2026-07-15T15:00:00Z",
  durationMinutes: 120,
  status: "pending",
  assignedTo: "Operations Team",
  createdAt: NOW,
  updatedAt: NOW
});

runOfShowItems.set("ros-2", {
  id: "ros-2",
  eventId: "evt-1",
  title: "Guest Arrival & Welcome Drinks",
  scheduledAt: "2026-07-15T18:00:00Z",
  durationMinutes: 45,
  status: "pending",
  assignedTo: "Sarah Chen",
  notes: "Bar must be ready 15 min before",
  createdAt: NOW,
  updatedAt: NOW
});

runOfShowItems.set("ros-3", {
  id: "ros-3",
  eventId: "evt-1",
  title: "Opening Remarks",
  scheduledAt: "2026-07-15T18:45:00Z",
  durationMinutes: 15,
  status: "pending",
  assignedTo: "MC",
  createdAt: NOW,
  updatedAt: NOW
});

runOfShowItems.set("ros-4", {
  id: "ros-4",
  eventId: "evt-1",
  title: "Dinner Service",
  scheduledAt: "2026-07-15T19:00:00Z",
  durationMinutes: 90,
  status: "pending",
  assignedTo: "Elite Catering Co.",
  createdAt: NOW,
  updatedAt: NOW
});

// Budget items for evt-1
budgetItems.set("bi-1", {
  id: "bi-1",
  eventId: "evt-1",
  category: "Catering",
  description: "Dinner and welcome drinks for 200 guests",
  plannedAmount: 15000,
  actualAmount: 12000,
  status: "approved",
  createdAt: NOW,
  updatedAt: NOW
});

budgetItems.set("bi-2", {
  id: "bi-2",
  eventId: "evt-1",
  category: "AV & Production",
  description: "Sound, lighting, and stage setup",
  plannedAmount: 6000,
  actualAmount: 5000,
  status: "paid",
  createdAt: NOW,
  updatedAt: NOW
});

budgetItems.set("bi-3", {
  id: "bi-3",
  eventId: "evt-1",
  category: "Photography",
  description: "Event photography and photo booth",
  plannedAmount: 3500,
  actualAmount: 0,
  status: "planned",
  createdAt: NOW,
  updatedAt: NOW
});

budgetItems.set("bi-4", {
  id: "bi-4",
  eventId: "evt-1",
  category: "Venue",
  description: "Grand Ballroom hire",
  plannedAmount: 8000,
  actualAmount: 8000,
  status: "paid",
  createdAt: NOW,
  updatedAt: NOW
});

// Risks for evt-1
risks.set("rsk-1", {
  id: "rsk-1",
  eventId: "evt-1",
  title: "Catering vendor no-show",
  description: "Main caterer could cancel last minute",
  likelihood: "low",
  impact: "high",
  status: "open",
  mitigation: "Identify backup caterer as contingency",
  createdAt: NOW,
  updatedAt: NOW
});

risks.set("rsk-2", {
  id: "rsk-2",
  eventId: "evt-1",
  title: "AV equipment failure",
  likelihood: "medium",
  impact: "medium",
  status: "mitigated",
  mitigation: "ProSound AV confirmed backup equipment on-site",
  createdAt: NOW,
  updatedAt: NOW
});

risks.set("rsk-3", {
  id: "rsk-3",
  eventId: "evt-1",
  title: "Budget overrun on catering",
  likelihood: "medium",
  impact: "low",
  status: "open",
  createdAt: NOW,
  updatedAt: NOW
});
