import { describe, expect, it } from "vitest";
import { z } from "zod";
import { app } from "../src/app.js";

const healthSchema = z.object({ status: z.literal("ok"), service: z.string() });

describe("System endpoints", () => {
  it("GET /health returns ok payload", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const data = healthSchema.parse(await res.json());
    expect(data.status).toBe("ok");
    expect(data.service).toBe("event-production-control");
  });

  it("GET /openapi.json exposes OpenAPI 3.1 document", async () => {
    const res = await app.request("/openapi.json");
    expect(res.status).toBe(200);
    const doc = (await res.json()) as Record<string, unknown>;
    expect(doc.openapi).toBe("3.1.0");
    expect((doc.info as Record<string, unknown>).title).toBe("Event Production Control API");
  });

  it("GET /docs serves Swagger UI", async () => {
    const res = await app.request("/docs");
    expect(res.status).toBe(200);
  });
});

describe("OpenAPI route coverage", () => {
  const expectedPaths = [
    "/health",
    "/events",
    "/events/{id}",
    "/events/{id}/vendors",
    "/events/{id}/vendors/{vendorId}",
    "/events/{id}/run-of-show",
    "/events/{id}/run-of-show/{itemId}",
    "/events/{id}/budget-items",
    "/events/{id}/budget-items/{itemId}",
    "/events/{id}/risks",
    "/events/{id}/risks/{riskId}",
    "/events/{id}/health-score",
    "/dashboard/summary"
  ];

  it.each(expectedPaths)("path %s is present in OpenAPI spec", async (path) => {
    const res = await app.request("/openapi.json");
    const doc = (await res.json()) as { paths: Record<string, unknown> };
    expect(Object.keys(doc.paths)).toContain(path);
  });
});
