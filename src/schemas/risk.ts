import { z } from "@hono/zod-openapi";

export const RiskLikelihoodSchema = z.enum(["low", "medium", "high"]);
export const RiskImpactSchema = z.enum(["low", "medium", "high"]);
export const RiskStatusSchema = z.enum(["open", "mitigated", "closed"]);

export const RiskSchema = z.object({
  id: z.string().openapi({ example: "rsk-1" }),
  eventId: z.string().openapi({ example: "evt-1" }),
  title: z.string().openapi({ example: "Catering vendor no-show" }),
  description: z.string().optional().openapi({ example: "Main caterer could cancel last minute" }),
  likelihood: RiskLikelihoodSchema.openapi({ example: "medium" }),
  impact: RiskImpactSchema.openapi({ example: "high" }),
  status: RiskStatusSchema.openapi({ example: "open" }),
  mitigation: z.string().optional().openapi({ example: "Identify backup caterer" }),
  createdAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" }),
  updatedAt: z.string().openapi({ example: "2026-04-08T12:00:00Z" })
});

export const CreateRiskSchema = z.object({
  title: z.string().min(1).openapi({ example: "Catering vendor no-show" }),
  description: z.string().optional().openapi({ example: "Main caterer could cancel last minute" }),
  likelihood: RiskLikelihoodSchema.openapi({ example: "medium" }),
  impact: RiskImpactSchema.openapi({ example: "high" }),
  status: RiskStatusSchema.default("open").openapi({ example: "open" }),
  mitigation: z.string().optional().openapi({ example: "Identify backup caterer" })
});

export const UpdateRiskSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: "Catering vendor no-show" }),
  description: z.string().optional().openapi({ example: "Main caterer could cancel last minute" }),
  likelihood: RiskLikelihoodSchema.optional().openapi({ example: "low" }),
  impact: RiskImpactSchema.optional().openapi({ example: "high" }),
  status: RiskStatusSchema.optional().openapi({ example: "mitigated" }),
  mitigation: z.string().optional().openapi({ example: "Backup caterer confirmed" })
});

export const RiskParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "evt-1" }),
  riskId: z.string().min(1).openapi({ example: "rsk-1" })
});

export const RiskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  status: RiskStatusSchema.optional(),
  likelihood: RiskLikelihoodSchema.optional(),
  impact: RiskImpactSchema.optional()
});

export type Risk = z.infer<typeof RiskSchema>;
export type CreateRiskInput = z.infer<typeof CreateRiskSchema>;
export type UpdateRiskInput = z.infer<typeof UpdateRiskSchema>;
