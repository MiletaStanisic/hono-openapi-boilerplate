import { randomUUID } from "node:crypto";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

const tasks: Array<{ id: string; title: string; done: boolean }> = [
  {
    id: "seed-1",
    title: "Draft API acceptance criteria",
    done: false
  }
];

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      description: "Service health",
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("ok"),
            service: z.string()
          })
        }
      }
    }
  }
});

const createTaskRoute = createRoute({
  method: "post",
  path: "/tasks",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(3)
          })
        }
      }
    }
  },
  responses: {
    201: {
      description: "Created task",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            title: z.string(),
            done: z.boolean()
          })
        }
      }
    },
    400: {
      description: "Validation error"
    }
  }
});

app.openapi(healthRoute, (c) => {
  return c.json({
    status: "ok",
    service: "backend-hono-openapi-boilerplate"
  });
});

app.get("/tasks", (c) => {
  return c.json({ items: tasks });
});

app.openapi(createTaskRoute, (c) => {
  const body = c.req.valid("json");
  const task = {
    id: randomUUID(),
    title: body.title,
    done: false
  };
  tasks.unshift(task);
  return c.json(task, 201);
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "backend-hono-openapi-boilerplate",
    version: "0.1.0"
  }
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export { app };
