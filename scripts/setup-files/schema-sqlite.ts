import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import {
  issueLabelEnumValues,
  issuePriorityEnumValues,
  issueStatusEnumValues,
  onboardingStatusEnumValues,
  permissionAccessEnumValues,
  permissionActionEnumValues,
  permissionEntityEnumValues,
  verificationTypeEnumValues,
} from "~/drizzle/constants";
import { PROVIDER_NAMES } from "~/services/auth/types";

export const issueStatusEnum = text("issue_status", {
  enum: issueStatusEnumValues,
});

export const issuePriorityEnum = text("issue_priority", {
  enum: issuePriorityEnumValues,
});
export const permissionAction = text("permission_action", {
  enum: permissionActionEnumValues,
});

export const permissionAccess = text("permission_access", {
  enum: permissionAccessEnumValues,
});
export const permissionEntity = text("permission_entity", {
  enum: permissionEntityEnumValues,
});
export const issueLabelEnum = text("issue_label", {
  enum: issueLabelEnumValues,
});
export const verificationTypeEnum = text("verification_type", {
  enum: verificationTypeEnumValues,
});
export const onboardingStatusEnum = text("onboarding_status", {
  enum: onboardingStatusEnumValues,
});

export const providerName = text("provider_name", {
  enum: PROVIDER_NAMES,
});

// Users
export const UsersTable = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email").unique().notNull(),
    defaultOrganizationId: integer("default_organization_id").references(
      () => OrganizationsTable.id,
    ),
    onboardingStatus: onboardingStatusEnum.notNull().default("not_started"),
    profilePictureFileKey: text("profile_picture_file_key"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => {
    return {
      emailIndex: index("users_email_index").on(table.email),
      defaultOrganizationIndex: index("users_default_organization_id_index").on(
        table.defaultOrganizationId,
      ),
    };
  },
);

// User Identities table
export const UserIdentitiesTable = sqliteTable(
  "user_identities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    providerName: providerName.notNull(),
    providerUserId: text("provider_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
  },
  (table) => ({
    userIdIndex: index("user_identities_user_id_index").on(table.userId),
    providerIndex: index("user_identities_provider_index").on(table.provider),
  }),
);

// Passwords
export const PasswordsTable = sqliteTable(
  "passwords",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    passwordHash: text("password_hash").notNull(),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIndex: index("passwords_user_id_index").on(table.userId),
  }),
);

export const SessionsTable = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull().unique(),
    data: text("data").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    sessionIndex: index("session_index").on(table.sessionId),
    userIdIndex: index("session_user_id_index").on(table.userId),
  }),
);

// Organization Invitations
export const OrganizationInvitationsTable = sqliteTable(
  "organization_invitations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    invitedAt: integer("invited_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    invitedByUserId: integer("invited_by_user_id")
      .notNull()
      .references(() => UsersTable.id),
    invitedToOrganizationId: integer("invited_to_organization_id")
      .notNull()
      .references(() => OrganizationsTable.id),
    invitedToRoleId: integer("invited_to_role_id")
      .notNull()
      .references(() => RolesTable.id),
    acceptedAt: integer("accepted_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    unq: unique().on(table.email, table.invitedToOrganizationId),
    email: index("organization_invitations_email_index").on(table.email),
    invitedByUserIndex: index(
      "organization_invitations_invited_by_user_index",
    ).on(table.invitedByUserId),
    invitedToOrganizationIndex: index(
      "organization_invitations_invited_to_organization_index",
    ).on(table.invitedToOrganizationId),
  }),
);

export const SubscriptionsTable = sqliteTable(
  "subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organizationId")
      .notNull()
      .references(() => OrganizationsTable.id)
      .unique(),
    externalId: text("external_id").notNull(),
    externalCustomerId: text("external_customer_id").notNull(),
    externalPriceId: text("external_plan_id").notNull(),
    externalProductId: text("external_product_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    canceledAt: integer("canceled_at", { mode: "timestamp" }),
    cancelAt: integer("cancel_at", { mode: "timestamp" }),
    canceled: integer("canceled", { mode: "boolean" }).default(false),
  },
  (table) => ({
    organizationIdIndex: index("subscriptions_organization_id_index").on(
      table.organizationId,
    ),
  }),
);

export const ApiKeysTable = sqliteTable(
  "api_keys",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organizationId")
      .notNull()
      .references(() => OrganizationsTable.id),
    key: text("key").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    name: text("description").notNull(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
    lastCharacters: text("last_characters").notNull(),
  },
  (table) => ({
    organizationIdIndex: index("api_keys_organization_id_index").on(
      table.organizationId,
    ),
  }),
);

// Issues
export const IssuesTable = sqliteTable(
  "issues",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    status: issueStatusEnum.notNull(),
    priority: issuePriorityEnum.notNull(),
    label: issueLabelEnum.notNull(),
    description: text("description"),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => OrganizationsTable.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    organizationIdIndex: index("issues_organization_id_index").on(
      table.organizationId,
    ),
  }),
);

// Verification Tokens
export const VerificationTokensTable = sqliteTable(
  "verification_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    secret: text("secret").notNull().unique(),
    code: text("code").notNull(),
    verified: integer("verified", { mode: "boolean" }).default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    type: verificationTypeEnum.notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    unq: unique().on(table.userId, table.type),
    userIdIndex: index("verification_tokens_user_id_index").on(table.userId),
  }),
);

// Organizations
export const OrganizationsTable = sqliteTable("organizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Roles
export const RolesTable = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").default(""),
});

// Permissions
export const PermissionsTable = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: permissionAction.notNull(),
  entity: permissionEntity.notNull(),
  access: permissionAccess.notNull(),
  description: text("description").default(""),
});

// Relationships
export const RolesToPermissionsTable = sqliteTable(
  "roles_to_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => RolesTable.id),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => PermissionsTable.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
);

export const UsersToOrganizationsTable = sqliteTable(
  "users_to_organizations",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => OrganizationsTable.id),
    roleId: integer("role_id")
      .references(() => RolesTable.id)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.organizationId] }),
    organizationIdIndex: index(
      "users_to_organizations_organization_id_index",
    ).on(table.organizationId),
  }),
);

export const client = new Database(process.env.DATABASE_URL);
export const db = drizzle(client);
