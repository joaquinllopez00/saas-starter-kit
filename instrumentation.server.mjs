import * as Sentry from "@sentry/remix";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
    dsn: process.env.PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV !== "development",
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    autoInstrumentRemix: true,
    integrations: [
        nodeProfilingIntegration(),
    ],
})