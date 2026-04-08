import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorSchema, IdParamSchema, paginatedSchema } from "../schemas/common.js";
import { CreateRiskSchema, RiskParamSchema, RiskQuerySchema, RiskSchema, UpdateRiskSchema } from "../schemas/risk.js";
import { createRisk, deleteRisk, getRisk, listRisks, updateRisk } from "../services/risks.js";

const router = new OpenAPIHono();

// GET /events/:id/risks
const listRisksRoute = createRoute({
  method: "get",
  path: "/events/{id}/risks",
  tags: ["Risks"],
  summary: "List risks for an event",
  request: { params: IdParamSchema, query: RiskQuerySchema },
  responses: {
    200: {
      description: "Paginated list of risks",
      content: { "application/json": { schema: paginatedSchema(RiskSchema) } }
    }
  }
});

router.openapi(listRisksRoute, (c) => {
  const { id } = c.req.valid("param");
  const query = c.req.valid("query");
  return c.json(listRisks(id, query), 200);
});

// POST /events/:id/risks
const createRiskRoute = createRoute({
  method: "post",
  path: "/events/{id}/risks",
  tags: ["Risks"],
  summary: "Add risk to event",
  request: {
    params: IdParamSchema,
    body: { required: true, content: { "application/json": { schema: CreateRiskSchema } } }
  },
  responses: {
    201: {
      description: "Created risk",
      content: { "application/json": { schema: RiskSchema } }
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(createRiskRoute, (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  return c.json(createRisk(id, body), 201 as const);
});

// GET /events/:id/risks/:riskId
const getRiskRoute = createRoute({
  method: "get",
  path: "/events/{id}/risks/{riskId}",
  tags: ["Risks"],
  summary: "Get risk by ID",
  request: { params: RiskParamSchema },
  responses: {
    200: {
      description: "Risk",
      content: { "application/json": { schema: RiskSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(getRiskRoute, (c) => {
  const { id, riskId } = c.req.valid("param");
  const risk = getRisk(id, riskId);
  if (!risk) return c.json({ code: "NOT_FOUND", message: "Risk not found" }, 404);
  return c.json(risk, 200);
});

// PUT /events/:id/risks/:riskId
const updateRiskRoute = createRoute({
  method: "put",
  path: "/events/{id}/risks/{riskId}",
  tags: ["Risks"],
  summary: "Update risk",
  request: {
    params: RiskParamSchema,
    body: { required: true, content: { "application/json": { schema: UpdateRiskSchema } } }
  },
  responses: {
    200: {
      description: "Updated risk",
      content: { "application/json": { schema: RiskSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(updateRiskRoute, (c) => {
  const { id, riskId } = c.req.valid("param");
  const body = c.req.valid("json");
  const risk = updateRisk(id, riskId, body);
  if (!risk) return c.json({ code: "NOT_FOUND", message: "Risk not found" }, 404);
  return c.json(risk, 200);
});

// DELETE /events/:id/risks/:riskId
const deleteRiskRoute = createRoute({
  method: "delete",
  path: "/events/{id}/risks/{riskId}",
  tags: ["Risks"],
  summary: "Remove risk from event",
  request: { params: RiskParamSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(deleteRiskRoute, (c) => {
  const { id, riskId } = c.req.valid("param");
  const deleted = deleteRisk(id, riskId);
  if (!deleted) return c.json({ code: "NOT_FOUND", message: "Risk not found" }, 404);
  return c.body(null, 204);
});

export { router as risksRouter };
