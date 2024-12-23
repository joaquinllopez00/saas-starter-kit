import { and, eq, isNull } from "drizzle-orm";
import {
  OrganizationInvitationsTable,
  OrganizationsTable,
  UsersTable,
  UsersToOrganizationsTable,
  db,
} from "~/drizzle/schema";
import type {
  OrganizationInvitation,
  OrganizationInvitationWithOrganization,
  OrganizationInvitationsInsert,
} from "~/services/db/types";

export const findOrganizationInvitationsByEmail = async (
  email: string,
  includeAccepted = false,
): Promise<OrganizationInvitationWithOrganization[]> => {
  const invitations = await db
    .selectDistinct({
      id: OrganizationInvitationsTable.id,
      organization: {
        id: OrganizationsTable.id,
        name: OrganizationsTable.name,
      },
      acceptedAt: OrganizationInvitationsTable.acceptedAt,
      invitedBy: {
        id: UsersTable.id,
        email: UsersTable.email,
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
      },
    })
    .from(OrganizationInvitationsTable)
    .where(
      and(
        eq(OrganizationInvitationsTable.email, email.toLowerCase()),
        !includeAccepted
          ? isNull(OrganizationInvitationsTable.acceptedAt)
          : undefined,
      ),
    )
    .innerJoin(
      OrganizationsTable,
      eq(
        OrganizationInvitationsTable.invitedToOrganizationId,
        OrganizationsTable.id,
      ),
    )
    .innerJoin(
      UsersTable,
      eq(OrganizationInvitationsTable.invitedByUserId, UsersTable.id),
    );

  return invitations.map((invitation) => ({
    ...invitation,
    isAccepted: invitation.acceptedAt !== null,
  }));
};

export const findOrganizationInvitationById = async (
  id: number,
  organizationId: number,
): Promise<OrganizationInvitation | undefined> => {
  const organizationInvitations = await db
    .select({
      id: OrganizationInvitationsTable.id,
      email: OrganizationInvitationsTable.email,
      invitedToRoleId: OrganizationInvitationsTable.invitedToRoleId,
      invitedToOrganizationId:
        OrganizationInvitationsTable.invitedToOrganizationId,
    })
    .from(OrganizationInvitationsTable)
    .where(
      and(
        eq(OrganizationInvitationsTable.id, id),
        eq(
          OrganizationInvitationsTable.invitedToOrganizationId,
          organizationId,
        ),
      ),
    )
    .limit(1);

  return organizationInvitations[0];
};

export const acceptOrganizationInvitation = async (
  invitationId: number,
  invitedToRoleId: number,
  email: string,
  userId: number,
  organizationId: number,
): Promise<void> => {
  await db.transaction(async (tx) => {
    await tx
      .update(OrganizationInvitationsTable)
      .set({ acceptedAt: new Date() })
      .where(
        and(
          eq(OrganizationInvitationsTable.email, email.toLowerCase()),
          eq(
            OrganizationInvitationsTable.invitedToOrganizationId,
            organizationId,
          ),
          eq(OrganizationInvitationsTable.id, invitationId),
        ),
      );
    await tx.insert(UsersToOrganizationsTable).values({
      organizationId,
      userId,
      roleId: invitedToRoleId,
    });
    await tx
      .update(UsersTable)
      .set({ defaultOrganizationId: organizationId })
      .where(eq(UsersTable.id, userId));
  });
};

export const findOrganizationInvitationsByInvitedUserId = async (
  userId: number,
): Promise<OrganizationInvitation[]> => {
  return db
    .select({
      id: OrganizationInvitationsTable.id,
      email: OrganizationInvitationsTable.email,
      invitedToRoleId: OrganizationInvitationsTable.invitedToRoleId,
      invitedToOrganizationId:
        OrganizationInvitationsTable.invitedToOrganizationId,
    })
    .from(OrganizationInvitationsTable)
    .innerJoin(
      UsersTable,
      eq(OrganizationInvitationsTable.invitedByUserId, UsersTable.id),
    )
    .where(
      and(
        eq(
          OrganizationInvitationsTable.invitedToOrganizationId,
          UsersTable.defaultOrganizationId,
        ),
        eq(OrganizationInvitationsTable.invitedByUserId, userId),
        isNull(OrganizationInvitationsTable.acceptedAt),
      ),
    );
};

export const findOrganizationInvitationsByOrganizationId = async (
  organizationId: number,
): Promise<OrganizationInvitation[]> => {
  return db
    .select({
      id: OrganizationInvitationsTable.id,
      email: OrganizationInvitationsTable.email,
      invitedToRoleId: OrganizationInvitationsTable.invitedToRoleId,
      invitedToOrganizationId:
        OrganizationInvitationsTable.invitedToOrganizationId,
    })
    .from(OrganizationInvitationsTable)
    .where(
      and(
        eq(
          OrganizationInvitationsTable.invitedToOrganizationId,
          organizationId,
        ),
        isNull(OrganizationInvitationsTable.acceptedAt),
      ),
    );
};

export const deleteOrganizationInvitation = async (
  id: number,
  organizationId: number,
): Promise<void> => {
  await db
    .delete(OrganizationInvitationsTable)
    .where(
      and(
        eq(OrganizationInvitationsTable.id, id),
        eq(
          OrganizationInvitationsTable.invitedToOrganizationId,
          organizationId,
        ),
      ),
    );
};

export const insertOrganizationInvitation = async (
  invitationInsert: OrganizationInvitationsInsert,
): Promise<OrganizationInvitation> => {
  const invitation = await db
    .insert(OrganizationInvitationsTable)
    .values({
      ...invitationInsert,
      email: invitationInsert.email.toLowerCase(),
    })
    .returning();
  return invitation[0];
};
