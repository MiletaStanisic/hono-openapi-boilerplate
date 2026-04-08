import { z } from "@hono/zod-openapi";

export const IdParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "evt-1" })
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
  sortBy: z.string().optional().openapi({ example: "createdAt" }),
  sortOrder: z.enum(["asc", "desc"]).default("asc").openapi({ example: "asc" })
});

export const ErrorSchema = z.object({
  code: z.string().openapi({ example: "NOT_FOUND" }),
  message: z.string().openapi({ example: "Resource not found" })
});

export type Pagination = z.infer<typeof PaginationQuerySchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative()
  });
}

export function applyPagination<T>(
  items: T[],
  pagination: Pagination
): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / pagination.pageSize);
  const start = (pagination.page - 1) * pagination.pageSize;
  const paged = items.slice(start, start + pagination.pageSize);
  return { items: paged, total, page: pagination.page, pageSize: pagination.pageSize, totalPages };
}

export function applySorting<T extends Record<string, unknown>>(items: T[], sortBy?: string, sortOrder: "asc" | "desc" = "asc"): T[] {
  if (!sortBy) return items;
  return [...items].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortOrder === "desc" ? -cmp : cmp;
  });
}
