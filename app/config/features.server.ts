import { z } from "zod";

const featureConfigSchema = z.object({
  cache: z.object({
    enabled: z.boolean(),
    provider: z.enum(["redis"]),
  }),
  email: z.object({
    enabled: z.boolean(),
  }),
  storage: z.object({
    enabled: z.boolean(),
    provider: z.enum(["s3", "cloudflare"]),
  }),
});

type FeatureConfig = z.infer<typeof featureConfigSchema>;

export const featureConfig: FeatureConfig = {
  cache: {
    enabled: !!process.env.REDIS_URL,
    provider: "redis",
  },
  email: {
    enabled: !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USERNAME &&
      process.env.SMTP_PASSWORD &&
      process.env.EMAIL_FROM
    ),
  },
  storage: {
    enabled: !!(
      process.env.USER_UPLOADS_BUCKET_NAME &&
      ((process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
        (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
          process.env.CLOUDFLARE_R2_ACCESS_SECRET_KEY))
    ),
    provider: process.env.CLOUDFLARE_R2_ENDPOINT ? "cloudflare" : "s3",
  },
};
featureConfigSchema.parse(featureConfig);
