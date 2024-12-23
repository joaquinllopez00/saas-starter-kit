import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

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

export const client = postgres(process.env.DATABASE_URL);

export const issueStatusEnum = pgEnum("issue_status", [
  ...issueStatusEnumValues,
]);

export const issuePriorityEnum = pgEnum("issue_priority", [
  ...issuePriorityEnumValues,
]);
export const permissionAction = pgEnum("permission_action", [
  ...permissionActionEnumValues,
]);

export const permissionAccess = pgEnum("permission_access", [
  ...permissionAccessEnumValues,
]);
export const permissionEntity = pgEnum("permission_entity", [
  ...permissionEntityEnumValues,
]);
export const issueLabelEnum = pgEnum("issue_label", [...issueLabelEnumValues]);
export const verificationTypeEnum = pgEnum("verification_type", [
  ...verificationTypeEnumValues,
]);
export const onboardingStatusEnum = pgEnum("onboarding_status", [
  ...onboardingStatusEnumValues,
]);

export const providerName = pgEnum("provider_name", [...PROVIDER_NAMES]);

// Users
export const UsersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email").unique().notNull(),
    defaultOrganizationId: integer("default_organization_id").references(
      () => OrganizationsTable.id,
    ),
    onboardingStatus:
      onboardingStatusEnum("onboarding_status").default("not_started"),
    profilePictureFileKey: text("profile_picture_file_key"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
export const UserIdentitiesTable = pgTable(
  "user_identities",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    email: text("email").unique(),
    providerName: providerName("provider_name").notNull(),
    providerUserId: text("provider_user_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIndex: index("user_identities_email_index").on(table.email),
    providerIndex: index("user_identities_provider_index").on(
      table.providerName,
      table.providerUserId,
    ),
    uniqueIdentityConstraint: unique().on(
      table.providerName,
      table.providerUserId,
    ),
  }),
);

// Passwords
export const UserPasswordsTable = pgTable("user_passwords", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => UsersTable.id),
  passwordHash: text("password_hash").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const SessionsTable = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull().unique(),
    data: text("data").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    sessionIndex: index("session_index").on(table.sessionId),
    userIdIndex: index("session_user_id_index").on(table.userId),
  }),
);

// Organization Invitations
export const OrganizationInvitationsTable = pgTable(
  "organization_invitations",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    invitedByUserId: integer("invited_by_user_id")
      .notNull()
      .references(() => UsersTable.id),
    invitedToOrganizationId: integer("invited_to_organization_id")
      .notNull()
      .references(() => OrganizationsTable.id),
    invitedToRoleId: integer("invited_to_role_id")
      .notNull()
      .references(() => RolesTable.id),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const SubscriptionsTable = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organizationId")
      .notNull()
      .references(() => OrganizationsTable.id)
      .unique(),
    externalId: text("external_id").notNull(),
    externalCustomerId: text("external_customer_id").notNull(),
    externalPriceId: text("external_plan_id").notNull(),
    externalProductId: text("external_product_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    cancelAt: timestamp("cancel_at"),
    canceledAt: timestamp("canceled_at"),
    canceled: boolean("canceled").default(false),
  },
  (table) => ({
    organizationIdIndex: index("subscriptions_organization_id_index").on(
      table.organizationId,
    ),
  }),
);

export const ApiKeysTable = pgTable(
  "api_keys",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organizationId")
      .notNull()
      .references(() => OrganizationsTable.id),
    key: text("key").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    name: text("description").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    lastCharacters: text("last_characters").notNull(),
  },
  (table) => ({
    organizationIdIndex: index("api_keys_organization_id_index").on(
      table.organizationId,
    ),
  }),
);

// Issues
export const IssuesTable = pgTable(
  "issues",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    status: issueStatusEnum("status"),
    priority: issuePriorityEnum("priority"),
    label: issueLabelEnum("label"),
    description: text("description"),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => OrganizationsTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    organizationIdIndex: index("issues_organization_id_index").on(
      table.organizationId,
    ),
  }),
);

// Verification Tokens
export const VerificationTokensTable = pgTable(
  "verification_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => UsersTable.id),
    secret: text("secret").notNull().unique(),
    code: text("code").notNull(),
    verified: boolean("verified").default(false),
    expiresAt: timestamp("expires_at").notNull(),
    type: verificationTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    unq: unique().on(table.userId, table.type),
    userIdIndex: index("verification_tokens_user_id_index").on(table.userId),
  }),
);

// Organizations
export const OrganizationsTable = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Roles
export const RolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").default(""),
});

// Permissions
export const PermissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  action: permissionAction("action"),
  entity: permissionEntity("entity"),
  access: permissionAccess("access"),
  description: text("description").default(""),
});

// Relationships
export const RolesToPermissionsTable = pgTable(
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

export const UsersToOrganizationsTable = pgTable(
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

export const db = drizzle(client);
