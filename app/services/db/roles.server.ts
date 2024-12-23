import { and, eq } from "drizzle-orm";
import { adminRoleName } from "~/drizzle/constants";
import { RolesTable, UsersToOrganizationsTable, db } from "~/drizzle/schema";
import type { Role } from "~/services/db/types";

export const findRoleByName = async (
  name: string,
): Promise<Role | undefined> => {
  const roles = await db
    .select({
      id: RolesTable.id,
      displayName: RolesTable.displayName,
    })
    .from(RolesTable)
    .where(eq(RolesTable.name, name))
    .limit(1);

  return roles[0];
};

export const findAllRoles = async (): Promise<Role[]> => {
  return db
    .select({
      id: RolesTable.id,
      displayName: RolesTable.displayName,
    })
    .from(RolesTable)
    .execute();
};

export const updateUserRole = async (
  userId: number,
  organizationId: number,
  roleId: number,
): Promise<void> => {
  await db.transaction(async (tx) => {
    await tx
      .update(UsersToOrganizationsTable)
      .set({
        roleId,
      })
      .where(
        and(
          eq(UsersToOrganizationsTable.userId, userId),
          eq(UsersToOrganizationsTable.organizationId, organizationId),
        ),
      )
      .execute();
    const numberOfAdmins = await tx
      .select({
        id: UsersToOrganizationsTable.userId,
      })
      .from(UsersToOrganizationsTable)
      .innerJoin(
        RolesTable,
        eq(UsersToOrganizationsTable.roleId, RolesTable.id),
      )
      .where(
        and(
          eq(UsersToOrganizationsTable.organizationId, organizationId),
          eq(UsersToOrganizationsTable.roleId, RolesTable.id),
          eq(RolesTable.name, adminRoleName),
        ),
      );
    if (!numberOfAdmins.length) {
      throw new Error("At least one admin is required");
    }
  });
};
