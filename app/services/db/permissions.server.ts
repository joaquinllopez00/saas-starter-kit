import { and, eq, inArray } from "drizzle-orm";
import {
  PermissionsTable,
  RolesTable,
  RolesToPermissionsTable,
  UsersTable,
  UsersToOrganizationsTable,
  db,
} from "~/drizzle/schema";
import type {
  PermissionAccess,
  PermissionAction,
  PermissionEntity,
} from "~/services/db/types";

export const validateUserRoleHasPermission = async (
  userId: number,
  actions: PermissionAction[],
  entity: PermissionEntity,
  access: PermissionAccess = "any",
): Promise<boolean> => {
  const permissions = await db
    .select({
      id: PermissionsTable.id,
    })
    .from(PermissionsTable)
    .where(
      and(
        inArray(PermissionsTable.action, actions),
        eq(PermissionsTable.entity, entity),
        eq(RolesTable.id, UsersToOrganizationsTable.roleId),
        eq(PermissionsTable.access, access),
        eq(
          UsersTable.defaultOrganizationId,
          UsersToOrganizationsTable.organizationId,
        ),
      ),
    )
    .innerJoin(
      UsersToOrganizationsTable,
      eq(UsersToOrganizationsTable.userId, userId),
    )
    .innerJoin(
      UsersTable,
      eq(
        UsersTable.defaultOrganizationId,
        UsersToOrganizationsTable.organizationId,
      ),
    )
    .innerJoin(
      RolesToPermissionsTable,
      eq(PermissionsTable.id, RolesToPermissionsTable.permissionId),
    )
    .innerJoin(RolesTable, eq(RolesToPermissionsTable.roleId, RolesTable.id))
    .execute();
  return permissions.length > 0;
};
