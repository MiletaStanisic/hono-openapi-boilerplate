import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4200),
  DATABASE_URL: z.string().url().default("postgresql://app:app@localhost:5436/app?schema=public"),
  REDIS_URL: z.string().url().default("redis://localhost:6382")
});

export const env = envSchema.parse(process.env);
