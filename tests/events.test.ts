import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { events } from "../src/store/index.js";

const json = (body: unknown) =>
  new Request("http://localhost/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

describe("Events CRUD", () => {
  it("GET /events returns paginated list with seed data", async () => {
    const res = await app.request("/events");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[]; total: number; page: number; pageSize: number };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(20);
  });

  it("GET /events?status=draft filters by status", async () => {
    const res = await app.request("/events?status=draft");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ status: string }> };
    expect(body.items.every((e) => e.status === "draft")).toBe(true);
  });

  it("GET /events?name=Gala filters by name", async () => {
    const res = await app.request("/events?name=Gala");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ name: string }> };
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].name).toMatch(/gala/i);
  });

  it("POST /events creates a new event", async () => {
    const res = await app.request(
      json({
        name: "Test Conference",
        startDate: "2026-10-01T09:00:00Z",
        endDate: "2026-10-01T18:00:00Z",
        totalBudget: 20000
      })
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; name: string; status: string };
    expect(body.id).toBeTruthy();
    expect(body.name).toBe("Test Conference");
    expect(body.status).toBe("draft");
  });

  it("POST /events rejects missing required fields", async () => {
    const res = await app.request(
      new Request("http://localhost/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: "No name provided" })
      })
    );
    expect(res.status).toBe(400);
  });

  it("GET /events/:id returns event by ID", async () => {
    const res = await app.request("/events/evt-1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("evt-1");
  });

  it("GET /events/:id returns 404 for unknown ID", async () => {
    const res = await app.request("/events/nonexistent");
    expect(res.status).toBe(404);
  });

  it("PUT /events/:id updates an event", async () => {
    const res = await app.request("/events/evt-1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venue: "Updated Ballroom" })
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { venue: string };
    expect(body.venue).toBe("Updated Ballroom");
  });

  it("DELETE /events/:id removes the event", async () => {
    // Create a disposable event first
    const created = await app.request(
      json({
        name: "Disposable Event",
        startDate: "2026-11-01T09:00:00Z",
        endDate: "2026-11-01T18:00:00Z"
      })
    );
    const { id } = (await created.json()) as { id: string };

    const del = await app.request(`/events/${id}`, { method: "DELETE" });
    expect(del.status).toBe(204);
    expect(events.has(id)).toBe(false);
  });

  it("GET /events supports sortBy and sortOrder", async () => {
    const res = await app.request("/events?sortBy=name&sortOrder=desc");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ name: string }> };
    expect(body.items.length).toBeGreaterThan(1);
    // Names should be descending
    for (let i = 0; i < body.items.length - 1; i++) {
      expect(body.items[i].name >= body.items[i + 1].name).toBe(true);
    }
  });

  it("GET /events pagination works", async () => {
    const res = await app.request("/events?page=1&pageSize=1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[]; pageSize: number; page: number };
    expect(body.items.length).toBe(1);
    expect(body.pageSize).toBe(1);
    expect(body.page).toBe(1);
  });
});

describe("Vendors CRUD", () => {
  it("GET /events/:id/vendors returns vendors for event", async () => {
    const res = await app.request("/events/evt-1/vendors");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ eventId: string }> };
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((v) => v.eventId === "evt-1")).toBe(true);
  });

  it("POST /events/:id/vendors creates vendor", async () => {
    const res = await app.request("/events/evt-1/vendors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Flowers by Design", category: "other", contractValue: 2000 })
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { eventId: string; name: string };
    expect(body.eventId).toBe("evt-1");
    expect(body.name).toBe("Flowers by Design");
  });

  it("GET /events/:id/vendors/:vendorId returns single vendor", async () => {
    const res = await app.request("/events/evt-1/vendors/vnd-1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("vnd-1");
  });

  it("GET /events/:id/vendors/:vendorId returns 404 for wrong event", async () => {
    const res = await app.request("/events/evt-2/vendors/vnd-1");
    expect(res.status).toBe(404);
  });

  it("PUT /events/:id/vendors/:vendorId updates vendor", async () => {
    const res = await app.request("/events/evt-1/vendors/vnd-1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paidAmount: 8000 })
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { paidAmount: number };
    expect(body.paidAmount).toBe(8000);
  });

  it("GET /events/:id/vendors?status=confirmed filters vendors", async () => {
    const res = await app.request("/events/evt-1/vendors?status=confirmed");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ status: string }> };
    expect(body.items.every((v) => v.status === "confirmed")).toBe(true);
  });
});

describe("Run of Show CRUD", () => {
  it("GET /events/:id/run-of-show returns items sorted by scheduledAt by default", async () => {
    const res = await app.request("/events/evt-1/run-of-show");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ scheduledAt: string }> };
    expect(body.items.length).toBeGreaterThan(0);
    // Verify ascending scheduledAt
    for (let i = 0; i < body.items.length - 1; i++) {
      expect(body.items[i].scheduledAt <= body.items[i + 1].scheduledAt).toBe(true);
    }
  });

  it("POST /events/:id/run-of-show creates item", async () => {
    const res = await app.request("/events/evt-1/run-of-show", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Awards Ceremony",
        scheduledAt: "2026-07-15T21:00:00Z",
        durationMinutes: 30
      })
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("pending");
  });

  it("PUT /events/:id/run-of-show/:itemId updates status", async () => {
    const res = await app.request("/events/evt-1/run-of-show/ros-1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("completed");
  });
});

describe("Budget Items CRUD", () => {
  it("GET /events/:id/budget-items returns items", async () => {
    const res = await app.request("/events/evt-1/budget-items");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[] };
    expect(body.items.length).toBeGreaterThan(0);
  });

  it("POST /events/:id/budget-items creates item", async () => {
    const res = await app.request("/events/evt-1/budget-items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category: "Marketing", description: "Social media ads", plannedAmount: 1500 })
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { status: string; actualAmount: number };
    expect(body.status).toBe("planned");
    expect(body.actualAmount).toBe(0);
  });

  it("GET /events/:id/budget-items?status=paid filters by status", async () => {
    const res = await app.request("/events/evt-1/budget-items?status=paid");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ status: string }> };
    expect(body.items.every((b) => b.status === "paid")).toBe(true);
  });
});

describe("Risks CRUD", () => {
  it("GET /events/:id/risks returns risks", async () => {
    const res = await app.request("/events/evt-1/risks");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[] };
    expect(body.items.length).toBeGreaterThan(0);
  });

  it("POST /events/:id/risks creates risk", async () => {
    const res = await app.request("/events/evt-1/risks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Bad weather", likelihood: "medium", impact: "medium" })
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("open");
  });

  it("GET /events/:id/risks?status=open returns only open risks", async () => {
    const res = await app.request("/events/evt-1/risks?status=open");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ status: string }> };
    expect(body.items.every((r) => r.status === "open")).toBe(true);
  });

  it("DELETE /events/:id/risks/:riskId removes risk", async () => {
    // Create then delete
    const created = await app.request("/events/evt-1/risks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Temp risk", likelihood: "low", impact: "low" })
    });
    const { id } = (await created.json()) as { id: string };
    const del = await app.request(`/events/evt-1/risks/${id}`, { method: "DELETE" });
    expect(del.status).toBe(204);
  });
});

describe("GET /events/:id/health-score", () => {
  it("returns 404 for unknown event", async () => {
    const res = await app.request("/events/nonexistent/health-score");
    expect(res.status).toBe(404);
  });

  it("returns health score for seeded event", async () => {
    const res = await app.request("/events/evt-1/health-score");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      score: number;
      budgetBurn: { percentage: number; planned: number; actual: number };
      scheduleDrift: { total: number };
      openRisks: { total: number; high: number };
    };
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
    expect(body.budgetBurn.planned).toBeGreaterThan(0);
    expect(body.scheduleDrift.total).toBeGreaterThan(0);
    expect(typeof body.openRisks.high).toBe("number");
  });
});

describe("GET /dashboard/summary", () => {
  it("returns dashboard summary with correct structure", async () => {
    const res = await app.request("/dashboard/summary");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      totalEvents: number;
      eventsByStatus: Record<string, number>;
      upcomingEvents: unknown[];
      totalBudget: number;
      totalSpend: number;
      spendPercentage: number;
      openRisksCount: number;
    };
    expect(body.totalEvents).toBeGreaterThanOrEqual(2);
    expect(typeof body.eventsByStatus).toBe("object");
    expect(Array.isArray(body.upcomingEvents)).toBe(true);
    expect(body.totalBudget).toBeGreaterThan(0);
    expect(body.spendPercentage).toBeGreaterThanOrEqual(0);
    expect(typeof body.openRisksCount).toBe("number");
  });

  it("upcoming events are sorted chronologically", async () => {
    const res = await app.request("/dashboard/summary");
    const body = (await res.json()) as { upcomingEvents: Array<{ startDate: string }> };
    for (let i = 0; i < body.upcomingEvents.length - 1; i++) {
      expect(new Date(body.upcomingEvents[i].startDate).getTime()).toBeLessThanOrEqual(
        new Date(body.upcomingEvents[i + 1].startDate).getTime()
      );
    }
  });
});

describe("beforeEach test isolation note", () => {
  it("store state persists within test file (in-memory, no reset between tests)", () => {
    // This is by design for the demo; production would use DB transactions
    expect(events.size).toBeGreaterThanOrEqual(2);
  });
});
