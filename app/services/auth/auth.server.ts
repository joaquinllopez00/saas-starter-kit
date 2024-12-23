import { Authenticator } from "remix-auth";
import { providers } from "~/services/auth/providers/providers";
import { providerSessionStorage } from "~/services/auth/storage";
import type { ProviderUser } from "~/services/auth/types";

export let authenticator = new Authenticator<ProviderUser>(
  providerSessionStorage,
);

for (const [providerName, provider] of Object.entries(providers)) {
  authenticator.use(provider.strategy, providerName);
}
