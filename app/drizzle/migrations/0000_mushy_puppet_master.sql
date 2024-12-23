DO $$ BEGIN
 CREATE TYPE "public"."issue_label" AS ENUM('bug', 'feature', 'enhancement');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."issue_priority" AS ENUM('high', 'medium', 'low');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."issue_status" AS ENUM('in progress', 'backlog', 'todo', 'canceled', 'done');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."onboarding_status" AS ENUM('not_started', 'in_progress', 'complete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."permission_access" AS ENUM('any', 'own');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."permission_action" AS ENUM('read', 'write');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."permission_entity" AS ENUM('issues', 'members', 'settings');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."provider_name" AS ENUM('google', 'github');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."verification_type" AS ENUM('email', 'password-reset');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizationId" integer NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"last_used_at" timestamp,
	"last_characters" text NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"status" "issue_status",
	"priority" "issue_priority",
	"label" "issue_label",
	"description" text,
	"organization_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"invited_by_user_id" integer NOT NULL,
	"invited_to_organization_id" integer NOT NULL,
	"invited_to_role_id" integer NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitations_email_invited_to_organization_id_unique" UNIQUE("email","invited_to_organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" "permission_action",
	"entity" "permission_entity",
	"access" "permission_access",
	"description" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles_to_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "roles_to_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"data" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizationId" integer NOT NULL,
	"external_id" text NOT NULL,
	"external_customer_id" text NOT NULL,
	"external_plan_id" text NOT NULL,
	"external_product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"cancel_at" timestamp,
	"canceled_at" timestamp,
	"canceled" boolean DEFAULT false,
	CONSTRAINT "subscriptions_organizationId_unique" UNIQUE("organizationId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_identities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email" text,
	"provider_name" "provider_name" NOT NULL,
	"provider_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_identities_email_unique" UNIQUE("email"),
	CONSTRAINT "user_identities_provider_name_provider_user_id_unique" UNIQUE("provider_name","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_passwords" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"default_organization_id" integer,
	"onboarding_status" "onboarding_status" DEFAULT 'not_started',
	"profile_picture_file_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_to_organizations" (
	"user_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "users_to_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"secret" text NOT NULL,
	"code" text NOT NULL,
	"verified" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"type" "verification_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_tokens_secret_unique" UNIQUE("secret"),
	CONSTRAINT "verification_tokens_user_id_type_unique" UNIQUE("user_id","type")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_to_organization_id_organizations_id_fk" FOREIGN KEY ("invited_to_organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_to_role_id_roles_id_fk" FOREIGN KEY ("invited_to_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles_to_permissions" ADD CONSTRAINT "roles_to_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles_to_permissions" ADD CONSTRAINT "roles_to_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_passwords" ADD CONSTRAINT "user_passwords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_default_organization_id_organizations_id_fk" FOREIGN KEY ("default_organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_organizations" ADD CONSTRAINT "users_to_organizations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_keys_organization_id_index" ON "api_keys" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issues_organization_id_index" ON "issues" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_invitations_email_index" ON "organization_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_invitations_invited_by_user_index" ON "organization_invitations" USING btree ("invited_by_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_invitations_invited_to_organization_index" ON "organization_invitations" USING btree ("invited_to_organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_index" ON "sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_organization_id_index" ON "subscriptions" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_identities_email_index" ON "user_identities" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_identities_provider_index" ON "user_identities" USING btree ("provider_name","provider_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_default_organization_id_index" ON "users" USING btree ("default_organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_to_organizations_organization_id_index" ON "users_to_organizations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_tokens_user_id_index" ON "verification_tokens" USING btree ("user_id");