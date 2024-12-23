import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

export const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secrets: [],
    ...(process.env.NODE_ENV === "production"
      ? { domain: process.env.COOKIE_DOMAIN, secure: true }
      : {}),
  },
});
export const themeSessionResolver = createThemeSessionResolver(themeStorage);
