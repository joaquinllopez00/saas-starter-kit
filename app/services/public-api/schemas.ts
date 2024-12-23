import { z } from "zod";

export const PublicApiIssueIdSchema = z.preprocess(
  (val) => (typeof val === "string" ? parseInt(val, 10) : val),
  z.number().int().positive(),
);

export const PublicApiIssueSchema = z.object({
  id: PublicApiIssueIdSchema,
  title: z.string(),
  description: z.string(),
});

export const PublicApiQueryParams = z.object({
  limit: z.preprocess(
    (val) => (val === null ? undefined : Number(val)),
    z.number().int().gte(1).lte(20).optional(),
  ),
  offset: z.preprocess(
    (val) => (val === null ? undefined : Number(val)),
    z.number().int().gte(0).optional(),
  ),
});
