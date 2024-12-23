import { z } from "zod";
import { githubAuthStrategy } from "~/services/auth/providers/github.server";
import { googleAuthProvider } from "~/services/auth/providers/google.server";
import type { AuthProvider, ProviderName } from "~/services/auth/types";
import {
  GITHUB_AUTH_PROVIDER,
  GOOGLE_AUTH_PROVIDER,
} from "~/services/auth/types";

export const ProviderNameSchema = z.enum([
  GOOGLE_AUTH_PROVIDER,
  GITHUB_AUTH_PROVIDER,
]);

export const providers: Record<ProviderName, AuthProvider> = {
  [GOOGLE_AUTH_PROVIDER]: googleAuthProvider,
  [GITHUB_AUTH_PROVIDER]: githubAuthStrategy,
};
