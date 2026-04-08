import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorSchema, IdParamSchema, paginatedSchema } from "../schemas/common.js";
import { BudgetItemParamSchema, BudgetItemQuerySchema, BudgetItemSchema, CreateBudgetItemSchema, UpdateBudgetItemSchema } from "../schemas/budget-item.js";
import { createBudgetItem, deleteBudgetItem, getBudgetItem, listBudgetItems, updateBudgetItem } from "../services/budget-items.js";

const router = new OpenAPIHono();

// GET /events/:id/budget-items
const listBudgetItemsRoute = createRoute({
  method: "get",
  path: "/events/{id}/budget-items",
  tags: ["Budget Items"],
  summary: "List budget items for an event",
  request: { params: IdParamSchema, query: BudgetItemQuerySchema },
  responses: {
    200: {
      description: "Paginated list of budget items",
      content: { "application/json": { schema: paginatedSchema(BudgetItemSchema) } }
    }
  }
});

router.openapi(listBudgetItemsRoute, (c) => {
  const { id } = c.req.valid("param");
  const query = c.req.valid("query");
  return c.json(listBudgetItems(id, query), 200);
});

// POST /events/:id/budget-items
const createBudgetItemRoute = createRoute({
  method: "post",
  path: "/events/{id}/budget-items",
  tags: ["Budget Items"],
  summary: "Add budget item to event",
  request: {
    params: IdParamSchema,
    body: { required: true, content: { "application/json": { schema: CreateBudgetItemSchema } } }
  },
  responses: {
    201: {
      description: "Created budget item",
      content: { "application/json": { schema: BudgetItemSchema } }
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(createBudgetItemRoute, (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  return c.json(createBudgetItem(id, body), 201 as const);
});

// GET /events/:id/budget-items/:itemId
const getBudgetItemRoute = createRoute({
  method: "get",
  path: "/events/{id}/budget-items/{itemId}",
  tags: ["Budget Items"],
  summary: "Get budget item by ID",
  request: { params: BudgetItemParamSchema },
  responses: {
    200: {
      description: "Budget item",
      content: { "application/json": { schema: BudgetItemSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(getBudgetItemRoute, (c) => {
  const { id, itemId } = c.req.valid("param");
  const item = getBudgetItem(id, itemId);
  if (!item) return c.json({ code: "NOT_FOUND", message: "Budget item not found" }, 404);
  return c.json(item, 200);
});

// PUT /events/:id/budget-items/:itemId
const updateBudgetItemRoute = createRoute({
  method: "put",
  path: "/events/{id}/budget-items/{itemId}",
  tags: ["Budget Items"],
  summary: "Update budget item",
  request: {
    params: BudgetItemParamSchema,
    body: { required: true, content: { "application/json": { schema: UpdateBudgetItemSchema } } }
  },
  responses: {
    200: {
      description: "Updated budget item",
      content: { "application/json": { schema: BudgetItemSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(updateBudgetItemRoute, (c) => {
  const { id, itemId } = c.req.valid("param");
  const body = c.req.valid("json");
  const item = updateBudgetItem(id, itemId, body);
  if (!item) return c.json({ code: "NOT_FOUND", message: "Budget item not found" }, 404);
  return c.json(item, 200);
});

// DELETE /events/:id/budget-items/:itemId
const deleteBudgetItemRoute = createRoute({
  method: "delete",
  path: "/events/{id}/budget-items/{itemId}",
  tags: ["Budget Items"],
  summary: "Remove budget item",
  request: { params: BudgetItemParamSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(deleteBudgetItemRoute, (c) => {
  const { id, itemId } = c.req.valid("param");
  const deleted = deleteBudgetItem(id, itemId);
  if (!deleted) return c.json({ code: "NOT_FOUND", message: "Budget item not found" }, 404);
  return c.body(null, 204);
});

export { router as budgetItemsRouter };
