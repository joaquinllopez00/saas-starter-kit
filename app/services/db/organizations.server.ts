import { eq } from "drizzle-orm";
import { adminRoleName } from "~/drizzle/constants";
import {
  db,
  OrganizationsTable,
  RolesTable,
  UsersTable,
  UsersToOrganizationsTable,
} from "~/drizzle/schema";
import type { Organization, OrganizationInsert } from "~/services/db/types";

export const findUserOrganizations = async (
  userId: number,
): Promise<Organization[]> => {
  return db
    .selectDistinct({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
      createdAt: OrganizationsTable.createdAt,
      updatedAt: OrganizationsTable.updatedAt,
    })
    .from(UsersToOrganizationsTable)
    .where(eq(UsersToOrganizationsTable.userId, userId))
    .innerJoin(
      OrganizationsTable,
      eq(UsersToOrganizationsTable.organizationId, OrganizationsTable.id),
    );
};

export const findUserDefaultOrganization = async (
  userId: number,
): Promise<Organization | undefined> => {
  const organization = await db
    .select({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
      createdAt: OrganizationsTable.createdAt,
      updatedAt: OrganizationsTable.updatedAt,
    })
    .from(OrganizationsTable)
    .innerJoin(
      UsersTable,
      eq(UsersTable.defaultOrganizationId, OrganizationsTable.id),
    )
    .where(eq(UsersTable.id, userId))
    .limit(1);

  return organization[0];
};

export const findOrganizationById = async (
  organizationId: number,
): Promise<Organization | undefined> => {
  const organizations = await db
    .select({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
    })
    .from(OrganizationsTable)
    .where(eq(OrganizationsTable.id, organizationId))
    .limit(1);

  return organizations[0];
};

export const insertOrganization = async (
  userId: number,
  organizationInsert: OrganizationInsert,
): Promise<Organization> => {
  return db.transaction(async (tx) => {
    const organizations = await tx
      .insert(OrganizationsTable)
      .values(organizationInsert)
      .returning();
    const organization = organizations[0];
    const roles = await tx
      .select({
        id: RolesTable.id,
        name: RolesTable.name,
      })
      .from(RolesTable)
      .where(eq(RolesTable.name, adminRoleName))
      .limit(1);

    if (!roles.length) {
      throw new Error(`Could not find role with name ${adminRoleName}`);
    }

    const adminRole = roles[0];
    await tx.insert(UsersToOrganizationsTable).values({
      userId,
      organizationId: organization.id,
      roleId: adminRole.id,
    });
    await tx
      .update(UsersTable)
      .set({ defaultOrganizationId: organization.id })
      .where(eq(UsersTable.id, userId));

    return organization;
  });
};

export const updateOrganizationName = async (
  organizationId: number,
  name: string,
): Promise<void> => {
  await db
    .update(OrganizationsTable)
    .set({ name, updatedAt: new Date() })
    .where(eq(OrganizationsTable.id, organizationId));
};
