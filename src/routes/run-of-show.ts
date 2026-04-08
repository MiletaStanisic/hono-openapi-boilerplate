import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorSchema, IdParamSchema, paginatedSchema } from "../schemas/common.js";
import { CreateRunOfShowItemSchema, RunOfShowItemSchema, RunOfShowParamSchema, RunOfShowQuerySchema, UpdateRunOfShowItemSchema } from "../schemas/run-of-show.js";
import { createRunOfShowItem, deleteRunOfShowItem, getRunOfShowItem, listRunOfShowItems, updateRunOfShowItem } from "../services/run-of-show.js";

const router = new OpenAPIHono();

// GET /events/:id/run-of-show
const listRunOfShowRoute = createRoute({
  method: "get",
  path: "/events/{id}/run-of-show",
  tags: ["Run of Show"],
  summary: "List run-of-show items for an event",
  request: { params: IdParamSchema, query: RunOfShowQuerySchema },
  responses: {
    200: {
      description: "Paginated list of run-of-show items (sorted by scheduledAt by default)",
      content: { "application/json": { schema: paginatedSchema(RunOfShowItemSchema) } }
    }
  }
});

router.openapi(listRunOfShowRoute, (c) => {
  const { id } = c.req.valid("param");
  const query = c.req.valid("query");
  return c.json(listRunOfShowItems(id, query), 200);
});

// POST /events/:id/run-of-show
const createRunOfShowItemRoute = createRoute({
  method: "post",
  path: "/events/{id}/run-of-show",
  tags: ["Run of Show"],
  summary: "Add run-of-show item to event",
  request: {
    params: IdParamSchema,
    body: { required: true, content: { "application/json": { schema: CreateRunOfShowItemSchema } } }
  },
  responses: {
    201: {
      description: "Created item",
      content: { "application/json": { schema: RunOfShowItemSchema } }
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(createRunOfShowItemRoute, (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  return c.json(createRunOfShowItem(id, body), 201 as const);
});

// GET /events/:id/run-of-show/:itemId
const getRunOfShowItemRoute = createRoute({
  method: "get",
  path: "/events/{id}/run-of-show/{itemId}",
  tags: ["Run of Show"],
  summary: "Get run-of-show item by ID",
  request: { params: RunOfShowParamSchema },
  responses: {
    200: {
      description: "Run-of-show item",
      content: { "application/json": { schema: RunOfShowItemSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(getRunOfShowItemRoute, (c) => {
  const { id, itemId } = c.req.valid("param");
  const item = getRunOfShowItem(id, itemId);
  if (!item) return c.json({ code: "NOT_FOUND", message: "Run-of-show item not found" }, 404);
  return c.json(item, 200);
});

// PUT /events/:id/run-of-show/:itemId
const updateRunOfShowItemRoute = createRoute({
  method: "put",
  path: "/events/{id}/run-of-show/{itemId}",
  tags: ["Run of Show"],
  summary: "Update run-of-show item",
  request: {
    params: RunOfShowParamSchema,
    body: { required: true, content: { "application/json": { schema: UpdateRunOfShowItemSchema } } }
  },
  responses: {
    200: {
      description: "Updated item",
      content: { "application/json": { schema: RunOfShowItemSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(updateRunOfShowItemRoute, (c) => {
  const { id, itemId } = c.req.valid("param");
  const body = c.req.valid("json");
  const item = updateRunOfShowItem(id, itemId, body);
  if (!item) return c.json({ code: "NOT_FOUND", message: "Run-of-show item not found" }, 404);
  return c.json(item, 200);
});

// DELETE /events/:id/run-of-show/:itemId
const deleteRunOfShowItemRoute = createRoute({
  method: "delete",
  path: "/events/{id}/run-of-show/{itemId}",
  tags: ["Run of Show"],
  summary: "Remove run-of-show item",
  request: { params: RunOfShowParamSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(deleteRunOfShowItemRoute, (c) => {
  const { id, itemId } = c.req.valid("param");
  const deleted = deleteRunOfShowItem(id, itemId);
  if (!deleted) return c.json({ code: "NOT_FOUND", message: "Run-of-show item not found" }, 404);
  return c.body(null, 204);
});

export { router as runOfShowRouter };
