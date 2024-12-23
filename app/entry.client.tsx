import * as Sentry from "@sentry/remix";
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import { StrictMode, startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { configureGlobalCache } from "remix-client-cache";

configureGlobalCache(() => localStorage); // uses localStorage as the cache adapter

Sentry.init({
  enabled: window.ENV.NODE_ENV !== "production",
  dsn: window.ENV.PUBLIC_SENTRY_DSN,
  environment: window.ENV.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  profilesSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
    Sentry.replayIntegration(),
    Sentry.browserProfilingIntegration(),
  ],
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
