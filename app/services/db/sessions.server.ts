import { eq } from "drizzle-orm";
import { db, SessionsTable } from "~/drizzle/schema";
import { uuidv4 } from "~/lib/string";
import type {
  Session,
  SessionInsert,
  SessionUpdate,
} from "~/services/db/types";

export const insertSession = async (
  sessionInsert: Pick<SessionInsert, "userId" | "expiresAt" | "data">,
): Promise<Session> => {
  const sessionId = uuidv4();
  const rows = await db
    .insert(SessionsTable)
    .values({
      userId: sessionInsert.userId,
      sessionId: sessionId,
      data: sessionInsert.data,
      expiresAt: sessionInsert.expiresAt,
      createdAt: new Date(),
    })
    .returning();
  return rows[0];
};

export const findSessionById = async (
  sessionId: string,
): Promise<Session | null> => {
  const rows = await db
    .select({
      userId: SessionsTable.userId,
      sessionId: SessionsTable.sessionId,
      data: SessionsTable.data,
    })
    .from(SessionsTable)
    .where(eq(SessionsTable.sessionId, sessionId));
  return rows[0] || null;
};

export const updateSession = async (
  sessionId: string,
  session: Partial<SessionUpdate>,
): Promise<void> => {
  await db
    .update(SessionsTable)
    .set({
      ...session,
    })
    .where(eq(SessionsTable.sessionId, sessionId));
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await db.delete(SessionsTable).where(eq(SessionsTable.sessionId, sessionId));
};
