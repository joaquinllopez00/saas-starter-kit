import * as Sentry from "@sentry/remix";
import type { PublicUser } from "~/services/db/types";

export const setObservabilityUser = (user: PublicUser) => {
  Sentry.setUser({ email: user.email, is: user.id });
};

export const captureObservabilityException = (error: Error | unknown) => {
  console.error(error);
  Sentry.captureException(error, { level: "error" });
};
