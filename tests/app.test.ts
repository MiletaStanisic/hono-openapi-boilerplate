import { describe, expect, it } from "vitest";
import { z } from "zod";
import { app } from "../src/app.js";

const healthResponseSchema = z.object({
  status: z.literal("ok")
});

const taskResponseSchema = z.object({
  title: z.string(),
  done: z.boolean()
});

describe("Hono OpenAPI boilerplate", () => {
  it("returns health payload", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);

    const data = healthResponseSchema.parse((await response.json()) as unknown);
    expect(data).toMatchObject({ status: "ok" });
  });

  it("creates task with valid payload", async () => {
    const response = await app.request("/tasks", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ title: "Prepare API demo flow" })
    });

    expect(response.status).toBe(201);
    const data = taskResponseSchema.parse((await response.json()) as unknown);
    expect(data).toMatchObject({ title: "Prepare API demo flow", done: false });
  });

  it("exposes OpenAPI document", async () => {
    const response = await app.request("/openapi.json");
    expect(response.status).toBe(200);
  });
});
