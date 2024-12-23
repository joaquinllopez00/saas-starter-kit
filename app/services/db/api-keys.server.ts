import { eq } from "drizzle-orm";
import { ApiKeysTable, db, UsersTable } from "~/drizzle/schema";
import { hashApiKey } from "~/lib/public-api";
import type { ApiKey, ApiKeyInsert } from "~/services/db/types";

export const insertApiKey = async (
  apiKeyInsert: Pick<ApiKeyInsert, "key" | "organizationId" | "name">,
) => {
  const hashedKey = await hashApiKey(apiKeyInsert.key);
  return db
    .insert(ApiKeysTable)
    .values({
      organizationId: apiKeyInsert.organizationId,
      key: hashedKey,
      name: apiKeyInsert.name || "Default",
      lastCharacters: apiKeyInsert.key.slice(-4),
    })
    .execute();
};

export const findApiKeyByKey = async (
  key: string,
): Promise<ApiKey | undefined> => {
  const hashedKey = await hashApiKey(key);
  const keys = await db
    .select({
      id: ApiKeysTable.id,
      name: ApiKeysTable.name,
      lastCharacters: ApiKeysTable.lastCharacters,
      createdAt: ApiKeysTable.createdAt,
      lastUsedAt: ApiKeysTable.lastUsedAt,
      organizationId: ApiKeysTable.organizationId,
    })
    .from(ApiKeysTable)
    .where(eq(ApiKeysTable.key, hashedKey))
    .limit(1)
    .execute();

  return keys[0];
};

export const findApiKeysByUserOrganizationId = async (
  userId: number,
): Promise<ApiKey[]> => {
  return db
    .select({
      id: ApiKeysTable.id,
      name: ApiKeysTable.name,
      lastCharacters: ApiKeysTable.lastCharacters,
      createdAt: ApiKeysTable.createdAt,
      lastUsedAt: ApiKeysTable.lastUsedAt,
      organizationId: ApiKeysTable.organizationId,
    })
    .from(ApiKeysTable)
    .where(eq(ApiKeysTable.organizationId, UsersTable.defaultOrganizationId))
    .innerJoin(UsersTable, eq(UsersTable.id, userId));
};

export const findApiKeyById = async (
  id: number,
): Promise<ApiKey | undefined> => {
  const apiKey = await db
    .select({
      id: ApiKeysTable.id,
      name: ApiKeysTable.name,
      lastCharacters: ApiKeysTable.lastCharacters,
      createdAt: ApiKeysTable.createdAt,
      lastUsedAt: ApiKeysTable.lastUsedAt,
      organizationId: ApiKeysTable.organizationId,
    })
    .from(ApiKeysTable)
    .where(eq(ApiKeysTable.id, id))
    .limit(1)
    .execute();

  return apiKey[0];
};

export const deleteApiKeyById = async (id: number) => {
  return db.delete(ApiKeysTable).where(eq(ApiKeysTable.id, id)).execute();
};
