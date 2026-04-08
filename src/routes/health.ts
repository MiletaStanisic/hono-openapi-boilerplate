import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const router = new OpenAPIHono();

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Health check",
  responses: {
    200: {
      description: "Service is healthy",
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("ok"),
            service: z.string().openapi({ example: "event-production-control" }),
            version: z.string().openapi({ example: "1.0.0" })
          })
        }
      }
    }
  }
});

router.openapi(healthRoute, (c) => {
  return c.json({ status: "ok", service: "event-production-control", version: "1.0.0" });
});

export { router as healthRouter };
