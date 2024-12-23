import { and, eq, isNotNull, sql } from "drizzle-orm";
import {
  RolesTable,
  UserIdentitiesTable,
  UserPasswordsTable,
  UsersTable,
  UsersToOrganizationsTable,
  db,
} from "~/drizzle/schema";
import type {
  OnboardingStatus,
  OrganizationUser,
  PublicUser,
  PublicUserWithIdentities,
  PublicUserWithOrganization,
  UserIdentity,
  UserInsert,
  UserWithPassword,
} from "~/services/db/types";

export const findUserByEmailWithIdentities = async (
  email: string,
): Promise<PublicUserWithIdentities | undefined> => {
  const users = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      onboardingStatus: UsersTable.onboardingStatus,
      defaultOrganizationId: UsersTable.defaultOrganizationId,
      profilePictureFileKey: UsersTable.profilePictureFileKey,
      identities: sql<UserIdentity[]>`COALESCE(
          json_agg(
            json_build_object(
                'providerUserId', ${UserIdentitiesTable.providerUserId},
                'providerName', ${UserIdentitiesTable.providerName},
                'createdAt', ${UserIdentitiesTable.createdAt}
              )
          ) FILTER (WHERE ${UserIdentitiesTable.userId} IS NOT NULL),
          '[]'
      )::json`,
      hasPasswordLogin: sql<boolean>`EXISTS (SELECT 1 FROM ${UserPasswordsTable} WHERE ${UserPasswordsTable.userId} = ${UsersTable.id})`,
    })
    .from(UsersTable)
    .where(eq(UsersTable.email, email.toLowerCase()))
    .leftJoin(
      UserIdentitiesTable,
      eq(UsersTable.id, UserIdentitiesTable.userId),
    )
    .leftJoin(UserPasswordsTable, eq(UsersTable.id, UserPasswordsTable.userId))
    .groupBy(UsersTable.id)
    .limit(1);

  return users[0];
};
export const findUserByIdWithIdentities = async (
  id: number,
): Promise<PublicUserWithIdentities> => {
  const users = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      onboardingStatus: UsersTable.onboardingStatus,
      defaultOrganizationId: UsersTable.defaultOrganizationId,
      profilePictureFileKey: UsersTable.profilePictureFileKey,
      identities: sql<UserIdentity[]>`COALESCE(
        json_agg(
          json_build_object(
            'providerUserId', ${UserIdentitiesTable.providerUserId},
            'providerName', ${UserIdentitiesTable.providerName},
            'createdAt', ${UserIdentitiesTable.createdAt}
          )
        ) FILTER (WHERE ${UserIdentitiesTable.userId} IS NOT NULL),
        '[]'
      )::json`,
      hasPasswordLogin: sql<boolean>`EXISTS (SELECT 1 FROM ${UserPasswordsTable} WHERE ${UserPasswordsTable.userId} = ${UsersTable.id})`,
    })
    .from(UsersTable)
    .leftJoin(
      UserIdentitiesTable,
      eq(UsersTable.id, UserIdentitiesTable.userId),
    )
    .where(eq(UsersTable.id, id))
    .groupBy(UsersTable.id)
    .limit(1);

  return users[0];
};

export const findUserWithPasswordByEmail = async (
  email: string,
): Promise<UserWithPassword | undefined> => {
  const users = await db
    .select({
      id: UsersTable.id,
      passwordHash: UserPasswordsTable.passwordHash,
    })
    .from(UsersTable)
    .innerJoin(UserPasswordsTable, eq(UsersTable.id, UserPasswordsTable.userId))
    .where(eq(UsersTable.email, email.toLowerCase()))
    .limit(1);

  return users[0];
};

export const findUserById = async (id: number): Promise<PublicUser> => {
  const users = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      onboardingStatus: UsersTable.onboardingStatus,
      defaultOrganizationId: UsersTable.defaultOrganizationId,
      profilePictureFileKey: UsersTable.profilePictureFileKey,
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, id))
    .limit(1);

  return users[0];
};

export const findUserWithOrganizationById = async (
  id: number,
): Promise<PublicUserWithOrganization> => {
  const users = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      onboardingStatus: UsersTable.onboardingStatus,
      defaultOrganizationId: UsersTable.defaultOrganizationId,
      profilePictureFileKey: UsersTable.profilePictureFileKey,
    })
    .from(UsersTable)
    .where(
      and(eq(UsersTable.id, id), isNotNull(UsersTable.defaultOrganizationId)),
    )
    .limit(1);

  if (users.length === 0) {
    throw new Error(`User with id ${id} not found`);
  }
  return users[0] as PublicUserWithOrganization;
};

export const findUserWithPasswordById = async (
  id: number,
): Promise<UserWithPassword | undefined> => {
  const users = await db
    .select({
      id: UsersTable.id,
      passwordHash: UserPasswordsTable.passwordHash,
    })
    .from(UsersTable)
    .innerJoin(UserPasswordsTable, eq(UsersTable.id, UserPasswordsTable.userId))
    .where(eq(UsersTable.id, id))
    .limit(1);

  return users[0];
};

export const insertEmailPasswordUser = async (
  user: UserInsert,
  passwordInsert: { passwordHash: string },
  isVerified?: boolean,
): Promise<PublicUser> => {
  return await db.transaction(async (tx) => {
    const newUser = await tx
      .insert(UsersTable)
      .values({
        ...user,
        email: user.email.toLowerCase(),
      })
      .returning();
    const now = new Date();
    await tx.insert(UserPasswordsTable).values({
      userId: newUser[0].id!,
      passwordHash: passwordInsert.passwordHash,
      createdAt: now,
      updatedAt: now,
      verifiedAt: isVerified ? now : null,
    });
    return newUser[0];
  });
};

export const updateUserOnboardingStatus = async (
  id: number,
  status: OnboardingStatus,
) => {
  await db
    .update(UsersTable)
    .set({
      onboardingStatus: status,
    })
    .where(eq(UsersTable.id, id));
};

export const updateUserDefaultOrganizationId = async (
  id: number,
  defaultOrganizationId: number,
) => {
  await db
    .update(UsersTable)
    .set({
      defaultOrganizationId,
    })
    .where(eq(UsersTable.id, id));
};

export const updateUser = async (id: number, user: Partial<PublicUser>) => {
  await db.update(UsersTable).set(user).where(eq(UsersTable.id, id));
};

export const findUsersForOrganization = async (
  organizationId: number,
): Promise<OrganizationUser[]> => {
  return db
    .selectDistinct({
      id: UsersTable.id,
      email: UsersTable.email,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      onboardingStatus: UsersTable.onboardingStatus,
      defaultOrganizationId: UsersTable.defaultOrganizationId,
      profilePictureFileKey: UsersTable.profilePictureFileKey,
      role: {
        id: RolesTable.id,
        name: RolesTable.name,
        displayName: RolesTable.displayName,
      },
    })
    .from(UsersToOrganizationsTable)
    .where(eq(UsersToOrganizationsTable.organizationId, organizationId))
    .innerJoin(UsersTable, eq(UsersToOrganizationsTable.userId, UsersTable.id))
    .innerJoin(RolesTable, eq(UsersToOrganizationsTable.roleId, RolesTable.id));
};
