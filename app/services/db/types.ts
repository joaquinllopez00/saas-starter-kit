import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
  onboardingStatusEnumValues,
  permissionAccessEnumValues,
  permissionActionEnumValues,
  permissionEntityEnumValues,
  verificationTypeEnumValues,
} from "~/drizzle/constants";
import type {
  ApiKeysTable,
  IssuesTable,
  OrganizationInvitationsTable,
  OrganizationsTable,
  PermissionsTable,
  RolesTable,
  SessionsTable,
  SubscriptionsTable,
  UserIdentitiesTable,
  UserPasswordsTable,
  UsersTable,
  VerificationTokensTable,
} from "~/drizzle/schema";

// Issues
export type Issue = Pick<
  InferSelectModel<typeof IssuesTable>,
  "id" | "status" | "description" | "title" | "label" | "priority"
>;
export type IssueInsert = InferInsertModel<typeof IssuesTable>;
export type IssueUpdate = Omit<IssueInsert, "id">;

// Users
export type UserWithPassword = Pick<InferSelectModel<typeof UsersTable>, "id"> &
  Pick<InferSelectModel<typeof UserPasswordsTable>, "passwordHash">;

export type UserIdentity = Pick<
  InferSelectModel<typeof UserIdentitiesTable>,
  "providerName" | "providerUserId" | "createdAt"
>;
export type UserIdentityInsert = Pick<
  InferInsertModel<typeof UserIdentitiesTable>,
  "providerName" | "providerUserId"
>;
export type PublicUser = Pick<
  InferSelectModel<typeof UsersTable>,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "defaultOrganizationId"
  | "onboardingStatus"
> & {
  profilePictureFileKey?: string | null;
  profilePictureUrl?: string;
};

export type PublicUserWithIdentities = PublicUser & {
  identities: UserIdentity[];
  hasPasswordLogin: boolean;
};

export type PublicUserWithOrganization = Omit<
  PublicUser,
  "defaultOrganizationId"
> & {
  profilePictureFileKey?: string | null;
  profilePictureUrl?: string;
  defaultOrganizationId: number;
};
export type OrganizationUser = PublicUser & {
  profilePictureFileKey?: string | null;
  profilePictureUrl?: string;
  role: {
    id: number;
    name: string;
    displayName: string;
  };
};
export type UserInsert = InferInsertModel<typeof UsersTable>;
export type OrganizationInvitation = Pick<
  InferInsertModel<typeof OrganizationInvitationsTable>,
  "email" | "id" | "invitedToOrganizationId" | "invitedToRoleId"
>;
export type OrganizationInvitationWithOrganization = Pick<
  OrganizationInvitation,
  "id"
> & {
  organization: {
    id: number;
    name: string;
  };
  isAccepted: boolean;
  invitedBy: Pick<PublicUser, "id" | "email" | "firstName" | "lastName">;
};
export type Session = Pick<
  InferSelectModel<typeof SessionsTable>,
  "userId" | "sessionId"
>;
export type SessionInsert = InferInsertModel<typeof SessionsTable>;
export type SessionUpdate = Omit<SessionInsert, "id" | "createdAt">;
export type OrganizationInvitationsInsert = InferInsertModel<
  typeof OrganizationInvitationsTable
>;
export type VerificationToken = Pick<
  InferSelectModel<typeof VerificationTokensTable>,
  "id" | "secret" | "updatedAt"
>;
export type VerificationTokenInsert = Pick<
  InferInsertModel<typeof VerificationTokensTable>,
  "userId" | "type" | "secret" | "code"
>;
export type VerificationTokenUpdate = Pick<
  VerificationTokenInsert,
  "secret" | "code"
>;
export type VerificationType = (typeof verificationTypeEnumValues)[number];
export type OnboardingStatus = (typeof onboardingStatusEnumValues)[number];
export type Organization = Pick<
  InferSelectModel<typeof OrganizationsTable>,
  "name" | "id"
>;
export type OrganizationInsert = InferInsertModel<typeof OrganizationsTable>;
export type Role = Pick<
  InferSelectModel<typeof RolesTable>,
  "displayName" | "id"
>;
export type Permission = Pick<
  InferSelectModel<typeof PermissionsTable>,
  "id" | "entity" | "action" | "access" | "description"
>;
export type PermissionAction = (typeof permissionActionEnumValues)[number];
export type PermissionEntity = (typeof permissionEntityEnumValues)[number];
export type PermissionAccess = (typeof permissionAccessEnumValues)[number];

export type ApiKey = Pick<
  InferSelectModel<typeof ApiKeysTable>,
  | "id"
  | "name"
  | "createdAt"
  | "lastUsedAt"
  | "lastCharacters"
  | "organizationId"
>;

export type ApiKeyInsert = InferInsertModel<typeof ApiKeysTable>;
export type Subscription = Pick<
  InferSelectModel<typeof SubscriptionsTable>,
  | "id"
  | "externalProductId"
  | "externalCustomerId"
  | "externalId"
  | "externalPriceId"
>;
export type SubscriptionInsert = InferInsertModel<typeof SubscriptionsTable>;
