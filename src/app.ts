import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { budgetItemsRouter } from "./routes/budget-items.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { eventsRouter } from "./routes/events.js";
import { healthRouter } from "./routes/health.js";
import { healthScoreRouter } from "./routes/health-score.js";
import { risksRouter } from "./routes/risks.js";
import { runOfShowRouter } from "./routes/run-of-show.js";
import { vendorsRouter } from "./routes/vendors.js";

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        { code: "VALIDATION_ERROR", message: "Invalid request payload" },
        400
      );
    }
  }
});

app.route("/", healthRouter);
app.route("/", eventsRouter);
app.route("/", vendorsRouter);
app.route("/", runOfShowRouter);
app.route("/", budgetItemsRouter);
app.route("/", risksRouter);
app.route("/", healthScoreRouter);
app.route("/", dashboardRouter);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Event Production Control API",
    version: "1.0.0",
    description: "Backend API for managing events, vendors, run-of-show, budgets, and risks."
  },
  tags: [
    { name: "System", description: "Health and meta endpoints" },
    { name: "Events", description: "Event lifecycle management" },
    { name: "Vendors", description: "Vendor management per event" },
    { name: "Run of Show", description: "Ordered schedule items for an event" },
    { name: "Budget Items", description: "Budget line items per event" },
    { name: "Risks", description: "Risk register per event" },
    { name: "Dashboard", description: "Aggregate summary views" }
  ]
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export { app };
