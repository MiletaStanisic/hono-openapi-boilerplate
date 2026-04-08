import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getDashboardSummary } from "../services/dashboard.js";

const UpcomingEventSchema = z.object({
  id: z.string().openapi({ example: "evt-1" }),
  name: z.string().openapi({ example: "Summer Gala 2026" }),
  startDate: z.string().openapi({ example: "2026-07-15T18:00:00Z" }),
  status: z.string().openapi({ example: "confirmed" }),
  venue: z.string().optional().openapi({ example: "Grand Ballroom" })
});

const DashboardSummarySchema = z.object({
  totalEvents: z.number().int().openapi({ example: 2 }),
  eventsByStatus: z.record(z.string(), z.number()).openapi({
    example: { draft: 1, confirmed: 1 }
  }),
  upcomingEvents: z.array(UpcomingEventSchema),
  totalBudget: z.number().openapi({ example: 80000, description: "Sum of totalBudget across all events" }),
  totalSpend: z.number().openapi({ example: 27000, description: "Sum of actualAmount across all budget items" }),
  spendPercentage: z.number().openapi({ example: 33.8, description: "totalSpend / totalBudget * 100" }),
  openRisksCount: z.number().int().openapi({ example: 2, description: "Number of risks with status=open" })
});

const router = new OpenAPIHono();

const dashboardRoute = createRoute({
  method: "get",
  path: "/dashboard/summary",
  tags: ["Dashboard"],
  summary: "Get dashboard summary",
  description: "High-level overview of all events: status breakdown, upcoming events, budget utilisation, and open risk count.",
  responses: {
    200: {
      description: "Dashboard summary",
      content: { "application/json": { schema: DashboardSummarySchema } }
    }
  }
});

router.openapi(dashboardRoute, (c) => {
  return c.json(getDashboardSummary(), 200);
});

export { router as dashboardRouter };
