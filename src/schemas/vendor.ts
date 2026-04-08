import { z } from "@hono/zod-openapi";

export const VendorCategorySchema = z.enum(["catering", "av", "photography", "venue", "transport", "security", "entertainment", "other"]);
export const VendorStatusSchema = z.enum(["pending", "confirmed", "cancelled"]);

export const VendorSchema = z.object({
  id: z.string().openapi({ example: "vnd-1" }),
  eventId: z.string().openapi({ example: "evt-1" }),
  name: z.string().openapi({ example: "Elite Catering Co." }),
  category: VendorCategorySchema.openapi({ example: "catering" }),
  status: VendorStatusSchema.openapi({ example: "confirmed" }),
  contractValue: z.number().nonnegative().openapi({ example: 8000 }),
  paidAmount: z.number().nonnegative().openapi({ example: 4000 }),
  notes: z.string().optional().openapi({ example: "Deposit paid" }),
  createdAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" })
});

export const CreateVendorSchema = z.object({
  name: z.string().min(1).openapi({ example: "Elite Catering Co." }),
  category: VendorCategorySchema.openapi({ example: "catering" }),
  status: VendorStatusSchema.default("pending").openapi({ example: "pending" }),
  contractValue: z.number().nonnegative().default(0).openapi({ example: 8000 }),
  paidAmount: z.number().nonnegative().default(0).openapi({ example: 0 }),
  notes: z.string().optional().openapi({ example: "Deposit paid" })
});

export const UpdateVendorSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: "Elite Catering Co." }),
  category: VendorCategorySchema.optional().openapi({ example: "catering" }),
  status: VendorStatusSchema.optional().openapi({ example: "confirmed" }),
  contractValue: z.number().nonnegative().optional().openapi({ example: 8000 }),
  paidAmount: z.number().nonnegative().optional().openapi({ example: 4000 }),
  notes: z.string().optional().openapi({ example: "Deposit paid" })
});

export const VendorParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "evt-1" }),
  vendorId: z.string().min(1).openapi({ example: "vnd-1" })
});

export const VendorQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  status: VendorStatusSchema.optional(),
  category: VendorCategorySchema.optional()
});

export type Vendor = z.infer<typeof VendorSchema>;
export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
