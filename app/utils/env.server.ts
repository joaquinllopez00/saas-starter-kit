import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  // Essential env vars
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
  APP_URL: z.string().url(),
  APP_NAME: z.string(),
  COOKIE_DOMAIN: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // Optional but highly recommended
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((v) => parseInt(v, 10)),
  SMTP_USERNAME: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Auth
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GITHUB_OAUTH_CLIENT_ID: z.string().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().optional(),
  // Storage
  USER_UPLOADS_BUCKET_NAME: z.string().optional(),
  // If using AWS make these required
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  // If using Cloudflare make these required
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_SECRET_KEY: z.string().optional(),
  CLOUDFLARE_R2_ENDPOINT: z.string().optional(),

  // Caching
  REDIS_URL: z.string().optional(),
  // Sentry
  PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}

export function parseEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error("parsed.error", parsed.error);

    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

// Everything return here will be available publicly on the client side
// Do not put any secrets here
export function getPublicClientSideEnvVars() {
  return {
    PUBLIC_SENTRY_DSN: process.env.PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.APP_NAME,
  };
}

type ENV = ReturnType<typeof getPublicClientSideEnvVars>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
