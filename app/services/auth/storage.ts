import { createCookieSessionStorage } from "@remix-run/node";

export const providerSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "provider",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    maxAge: 60 * 10, // 10 minutes
    ...(process.env.NODE_ENV === "production"
      ? { domain: process.env.COOKIE_DOMAIN, secure: true }
      : {}),
  },
});
