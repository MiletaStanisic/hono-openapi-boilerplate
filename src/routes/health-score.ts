import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, IdParamSchema } from "../schemas/common.js";
import { computeHealthScore } from "../services/health-score.js";

const HealthScoreSchema = z.object({
  eventId: z.string().openapi({ example: "evt-1" }),
  score: z.number().int().min(0).max(100).openapi({ example: 78, description: "Composite health score (0–100, higher is healthier)" }),
  budgetBurn: z.object({
    percentage: z.number().openapi({ example: 54.0, description: "Actual spend as % of total budget" }),
    planned: z.number().openapi({ example: 32500, description: "Sum of all planned amounts across budget items" }),
    actual: z.number().openapi({ example: 27000, description: "Sum of all actual amounts across budget items" }),
    remaining: z.number().openapi({ example: 23000, description: "Budget remaining (totalBudget - actual)" })
  }),
  scheduleDrift: z.object({
    percentage: z.number().openapi({ example: 0, description: "Percentage of run-of-show items skipped" }),
    total: z.number().int().openapi({ example: 4 }),
    completed: z.number().int().openapi({ example: 0 }),
    pending: z.number().int().openapi({ example: 4 }),
    skipped: z.number().int().openapi({ example: 0 })
  }),
  openRisks: z.object({
    total: z.number().int().openapi({ example: 2 }),
    high: z.number().int().openapi({ example: 1, description: "Open risks with high impact" }),
    medium: z.number().int().openapi({ example: 1, description: "Open risks with medium impact" }),
    low: z.number().int().openapi({ example: 0, description: "Open risks with low impact" })
  })
});

const router = new OpenAPIHono();

const healthScoreRoute = createRoute({
  method: "get",
  path: "/events/{id}/health-score",
  tags: ["Events"],
  summary: "Get event health score",
  description: "Returns a composite health score (0–100) derived from budget burn rate, schedule drift, and open risk count.",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Event health score",
      content: { "application/json": { schema: HealthScoreSchema } }
    },
    404: { description: "Event not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(healthScoreRoute, (c) => {
  const { id } = c.req.valid("param");
  const result = computeHealthScore(id);
  if (!result) return c.json({ code: "NOT_FOUND", message: "Event not found" }, 404);
  return c.json(result, 200);
});

export { router as healthScoreRouter };
