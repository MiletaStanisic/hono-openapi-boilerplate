import { z } from "@hono/zod-openapi";

export const BudgetItemStatusSchema = z.enum(["planned", "approved", "paid", "over-budget"]);

export const BudgetItemSchema = z.object({
  id: z.string().openapi({ example: "bi-1" }),
  eventId: z.string().openapi({ example: "evt-1" }),
  category: z.string().openapi({ example: "Catering" }),
  description: z.string().openapi({ example: "Dinner for 200 guests" }),
  plannedAmount: z.number().nonnegative().openapi({ example: 15000 }),
  actualAmount: z.number().nonnegative().openapi({ example: 14500 }),
  status: BudgetItemStatusSchema.openapi({ example: "paid" }),
  createdAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" })
});

export const CreateBudgetItemSchema = z.object({
  category: z.string().min(1).openapi({ example: "Catering" }),
  description: z.string().min(1).openapi({ example: "Dinner for 200 guests" }),
  plannedAmount: z.number().nonnegative().openapi({ example: 15000 }),
  actualAmount: z.number().nonnegative().default(0).openapi({ example: 0 }),
  status: BudgetItemStatusSchema.default("planned").openapi({ example: "planned" })
});

export const UpdateBudgetItemSchema = z.object({
  category: z.string().min(1).optional().openapi({ example: "Catering" }),
  description: z.string().min(1).optional().openapi({ example: "Dinner for 200 guests" }),
  plannedAmount: z.number().nonnegative().optional().openapi({ example: 15000 }),
  actualAmount: z.number().nonnegative().optional().openapi({ example: 14500 }),
  status: BudgetItemStatusSchema.optional().openapi({ example: "paid" })
});

export const BudgetItemParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "evt-1" }),
  itemId: z.string().min(1).openapi({ example: "bi-1" })
});

export const BudgetItemQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  status: BudgetItemStatusSchema.optional(),
  category: z.string().optional()
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type CreateBudgetItemInput = z.infer<typeof CreateBudgetItemSchema>;
export type UpdateBudgetItemInput = z.infer<typeof UpdateBudgetItemSchema>;
