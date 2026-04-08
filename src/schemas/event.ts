import { z } from "@hono/zod-openapi";

export const EventStatusSchema = z.enum(["draft", "confirmed", "in-progress", "completed", "cancelled"]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const EventSchema = z.object({
  id: z.string().openapi({ example: "evt-1" }),
  name: z.string().openapi({ example: "Summer Gala 2026" }),
  description: z.string().optional().openapi({ example: "Annual fundraising gala" }),
  status: EventStatusSchema.openapi({ example: "confirmed" }),
  startDate: z.string().openapi({ example: "2026-07-15T18:00:00Z" }),
  endDate: z.string().openapi({ example: "2026-07-15T23:00:00Z" }),
  venue: z.string().optional().openapi({ example: "Grand Ballroom" }),
  totalBudget: z.number().nonnegative().openapi({ example: 50000 }),
  createdAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" })
});

export const CreateEventSchema = z.object({
  name: z.string().min(1).openapi({ example: "Summer Gala 2026" }),
  description: z.string().optional().openapi({ example: "Annual fundraising gala" }),
  status: EventStatusSchema.default("draft").openapi({ example: "draft" }),
  startDate: z.string().min(1).openapi({ example: "2026-07-15T18:00:00Z" }),
  endDate: z.string().min(1).openapi({ example: "2026-07-15T23:00:00Z" }),
  venue: z.string().optional().openapi({ example: "Grand Ballroom" }),
  totalBudget: z.number().nonnegative().default(0).openapi({ example: 50000 })
});

export const UpdateEventSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: "Summer Gala 2026" }),
  description: z.string().optional().openapi({ example: "Annual fundraising gala" }),
  status: EventStatusSchema.optional().openapi({ example: "confirmed" }),
  startDate: z.string().optional().openapi({ example: "2026-07-15T18:00:00Z" }),
  endDate: z.string().optional().openapi({ example: "2026-07-15T23:00:00Z" }),
  venue: z.string().optional().openapi({ example: "Grand Ballroom" }),
  totalBudget: z.number().nonnegative().optional().openapi({ example: 50000 })
});

export const EventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  status: EventStatusSchema.optional().openapi({ example: "confirmed" }),
  name: z.string().optional().openapi({ example: "Gala" })
});

export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventQuery = z.infer<typeof EventQuerySchema>;
