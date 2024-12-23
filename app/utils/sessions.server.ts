import { createSessionStorage, redirect } from "@remix-run/node";
import type { SessionIdStorageStrategy } from "@remix-run/server-runtime/dist/sessions";
import {
  deleteSession,
  findSessionById,
  insertSession,
  updateSession,
} from "~/services/db/sessions.server";

import type { ProviderName } from "~/services/auth/types";
import { findUserPasswordById } from "~/services/db/user-passwords.server";

export type AuthMethod = "email" | "oauth";

const createDatabaseSessionStorage = ({
  cookie,
}: {
  cookie: SessionIdStorageStrategy["cookie"];
}) => {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const session = await insertSession({
        userId: data.userId,
        expiresAt: expires || new Date(Date.now() + 24 * 60 * 60 * 1000),
        data: JSON.stringify({
          authMethod: data.authMethod,
          identityVerified: data.identityVerified,
          providerName: data.providerName,
        }),
      });
      return session.sessionId;
    },
    async readData(id) {
      return (await findSessionById(id)) || null;
    },
    async updateData(id, data, expires) {
      await updateSession(id, {
        expiresAt: expires,
      });
    },
    async deleteData(id) {
      await deleteSession(id);
    },
  });
};

export const databaseSessionStorage = createDatabaseSessionStorage({
  cookie: {
    name: "session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    maxAge: 60 * 60 * 24 * 30, // 30 days
    ...(process.env.NODE_ENV === "production"
      ? { domain: process.env.COOKIE_DOMAIN, secure: true }
      : {}),
  },
});

const { getSession, commitSession, destroySession } = databaseSessionStorage;

export async function createUserSession(
  userId: number,
  authMethod: AuthMethod,
  redirectTo: string,
  providerName?: string,
) {
  const session = await getSession();
  session.set("userId", userId);
  session.set("authMethod", authMethod);
  session.set("providerName", providerName);
  if (authMethod === "oauth") {
    session.set("identityVerified", true);
  }
  const userPassword = await findUserPasswordById(userId);
  if (userPassword) {
    session.set("identityVerified", userPassword.verifiedAt !== null);
  }
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export const getUserSession = async (request: Request) => {
  return getSession(request.headers.get("Cookie"));
};

export const userHasSession = async (request: Request) => {
  const session = await getUserSession(request);
  return Boolean(session.get("userId"));
};

export async function getUserIdFromSession(request: Request): Promise<number> {
  const url = new URL(request.url);
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) {
    throw redirect(`/login?redirectTo=${url.pathname}`);
  }
  return Number(userId);
}

export async function getUserIdFromSessionWithIdentity(
  request: Request,
): Promise<{
  userId: number;
  identityVerified: boolean;
  authMethod: AuthMethod;
  providerName?: ProviderName;
}> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) {
    throw redirect(`/login?redirectTo=${new URL(request.url).pathname}`);
  }
  const { identityVerified, authMethod, providerName } = JSON.parse(
    session.get("data"),
  );
  return {
    userId: Number(userId),
    identityVerified,
    authMethod,
    providerName,
  };
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
