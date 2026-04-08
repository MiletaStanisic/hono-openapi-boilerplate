import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorSchema, IdParamSchema, paginatedSchema } from "../schemas/common.js";
import { CreateEventSchema, EventQuerySchema, EventSchema, UpdateEventSchema } from "../schemas/event.js";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from "../services/events.js";

const router = new OpenAPIHono();

// GET /events
const listEventsRoute = createRoute({
  method: "get",
  path: "/events",
  tags: ["Events"],
  summary: "List events",
  request: { query: EventQuerySchema },
  responses: {
    200: {
      description: "Paginated list of events",
      content: { "application/json": { schema: paginatedSchema(EventSchema) } }
    }
  }
});

router.openapi(listEventsRoute, (c) => {
  const query = c.req.valid("query");
  return c.json(listEvents(query), 200);
});

// POST /events
const createEventRoute = createRoute({
  method: "post",
  path: "/events",
  tags: ["Events"],
  summary: "Create event",
  request: {
    body: { required: true, content: { "application/json": { schema: CreateEventSchema } } }
  },
  responses: {
    201: {
      description: "Created event",
      content: { "application/json": { schema: EventSchema } }
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(createEventRoute, (c) => {
  const body = c.req.valid("json");
  return c.json(createEvent(body), 201 as const);
});

// GET /events/:id
const getEventRoute = createRoute({
  method: "get",
  path: "/events/{id}",
  tags: ["Events"],
  summary: "Get event by ID",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Event",
      content: { "application/json": { schema: EventSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(getEventRoute, (c) => {
  const { id } = c.req.valid("param");
  const event = getEvent(id);
  if (!event) return c.json({ code: "NOT_FOUND", message: "Event not found" }, 404);
  return c.json(event, 200);
});

// PUT /events/:id
const updateEventRoute = createRoute({
  method: "put",
  path: "/events/{id}",
  tags: ["Events"],
  summary: "Update event",
  request: {
    params: IdParamSchema,
    body: { required: true, content: { "application/json": { schema: UpdateEventSchema } } }
  },
  responses: {
    200: {
      description: "Updated event",
      content: { "application/json": { schema: EventSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(updateEventRoute, (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const event = updateEvent(id, body);
  if (!event) return c.json({ code: "NOT_FOUND", message: "Event not found" }, 404);
  return c.json(event, 200);
});

// DELETE /events/:id
const deleteEventRoute = createRoute({
  method: "delete",
  path: "/events/{id}",
  tags: ["Events"],
  summary: "Delete event",
  request: { params: IdParamSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(deleteEventRoute, (c) => {
  const { id } = c.req.valid("param");
  const deleted = deleteEvent(id);
  if (!deleted) return c.json({ code: "NOT_FOUND", message: "Event not found" }, 404);
  return c.body(null, 204);
});

export { router as eventsRouter };
