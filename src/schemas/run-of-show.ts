import { z } from "@hono/zod-openapi";

export const RunOfShowStatusSchema = z.enum(["pending", "in-progress", "completed", "skipped"]);

export const RunOfShowItemSchema = z.object({
  id: z.string().openapi({ example: "ros-1" }),
  eventId: z.string().openapi({ example: "evt-1" }),
  title: z.string().openapi({ example: "Guest Arrival & Welcome Drinks" }),
  description: z.string().optional().openapi({ example: "Guests greeted at entrance" }),
  scheduledAt: z.string().openapi({ example: "2026-07-15T18:00:00Z" }),
  durationMinutes: z.number().int().positive().openapi({ example: 30 }),
  status: RunOfShowStatusSchema.openapi({ example: "pending" }),
  assignedTo: z.string().optional().openapi({ example: "Sarah Chen" }),
  notes: z.string().optional().openapi({ example: "Ensure bar is ready 15 min before" }),
  createdAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" })
});

export const CreateRunOfShowItemSchema = z.object({
  title: z.string().min(1).openapi({ example: "Guest Arrival & Welcome Drinks" }),
  description: z.string().optional().openapi({ example: "Guests greeted at entrance" }),
  scheduledAt: z.string().min(1).openapi({ example: "2026-07-15T18:00:00Z" }),
  durationMinutes: z.number().int().positive().openapi({ example: 30 }),
  status: RunOfShowStatusSchema.default("pending").openapi({ example: "pending" }),
  assignedTo: z.string().optional().openapi({ example: "Sarah Chen" }),
  notes: z.string().optional().openapi({ example: "Ensure bar is ready 15 min before" })
});

export const UpdateRunOfShowItemSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: "Guest Arrival & Welcome Drinks" }),
  description: z.string().optional().openapi({ example: "Guests greeted at entrance" }),
  scheduledAt: z.string().optional().openapi({ example: "2026-07-15T18:00:00Z" }),
  durationMinutes: z.number().int().positive().optional().openapi({ example: 30 }),
  status: RunOfShowStatusSchema.optional().openapi({ example: "in-progress" }),
  assignedTo: z.string().optional().openapi({ example: "Sarah Chen" }),
  notes: z.string().optional().openapi({ example: "Ensure bar is ready 15 min before" })
});

export const RunOfShowParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "evt-1" }),
  itemId: z.string().min(1).openapi({ example: "ros-1" })
});

export const RunOfShowQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  status: RunOfShowStatusSchema.optional()
});

export type RunOfShowItem = z.infer<typeof RunOfShowItemSchema>;
export type CreateRunOfShowItemInput = z.infer<typeof CreateRunOfShowItemSchema>;
export type UpdateRunOfShowItemInput = z.infer<typeof UpdateRunOfShowItemSchema>;
