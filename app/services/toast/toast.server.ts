import { createCookieSessionStorage, json, redirect } from "@remix-run/node";
import type { ToastInput } from "~/services/toast/types";
import { ToastSchema, toastKey } from "~/services/toast/types";

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "toast",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: process.env.SESSION_SECRET.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});

export async function redirectWithToast(
  url: string,
  toast: ToastInput,
  init?: ResponseInit,
) {
  return redirect(url, {
    ...init,
    headers: await createToastHeaders(toast),
  });
}

export async function returnJsonSuccessWithToast(
  toast: ToastInput,
  init?: ResponseInit,
) {
  return json(
    { success: true as const },
    {
      ...init,
      headers: await createToastHeaders(toast),
    },
  );
}

export async function createToastHeaders(toastInput: ToastInput) {
  const session = await toastSessionStorage.getSession();
  const toast = ToastSchema.parse(toastInput);
  session.flash(toastKey, toast);
  const cookie = await toastSessionStorage.commitSession(session);
  return new Headers({ "set-cookie": cookie });
}

export async function getToast(request: Request) {
  const session = await toastSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const result = ToastSchema.safeParse(session.get(toastKey));
  const toast = result.success ? result.data : null;
  return {
    toast,
    headers: toast
      ? new Headers({
          "set-cookie": await toastSessionStorage.destroySession(session),
        })
      : null,
  };
}
