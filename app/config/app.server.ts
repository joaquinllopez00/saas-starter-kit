import { z } from "zod";
import { PROVIDER_NAMES } from "~/services/auth/types";

const appConfigSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  auth: z.object({
    cookieDomain: z.string(),
    providers: z.array(z.enum(PROVIDER_NAMES)),
  }),
});

type AppConfig = z.infer<typeof appConfigSchema>;

export const appConfig: AppConfig = {
  name: process.env.APP_NAME || "Default App Name",
  url: process.env.APP_URL || "http://localhost:3000",
  auth: {
    cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
    providers: [
      ...(process.env.GOOGLE_OAUTH_CLIENT_ID ? ["google"] : []),
      ...(process.env.GITHUB_OAUTH_CLIENT_ID ? ["github"] : []),
    ] as ("google" | "github")[],
  },
};

appConfigSchema.parse(appConfig);
