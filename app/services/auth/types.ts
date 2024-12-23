import type { Strategy } from "remix-auth";

export type ProviderUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profilePictureUrl?: string;
};
export type AuthProvider = {
  strategy: Strategy<ProviderUser, any>;
};

export const GOOGLE_AUTH_PROVIDER = "google";
export const GITHUB_AUTH_PROVIDER = "github";

export type ProviderName =
  | typeof GOOGLE_AUTH_PROVIDER
  | typeof GITHUB_AUTH_PROVIDER;

export const PROVIDER_NAMES = [
  GOOGLE_AUTH_PROVIDER,
  GITHUB_AUTH_PROVIDER,
] as const;
