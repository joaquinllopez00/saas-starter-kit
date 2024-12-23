#!/usr/bin/env node
import { execSync } from "child_process";
import { program } from "commander";
import crypto from "crypto";
import "dotenv/config";
import enquirer from "enquirer";
import path from "path";
import type { EnvVars } from "./types";
import { log, updateEnvVars } from "./utils";

program.version("1.0.0").description("Setup Base-kit");

const runCommand = (command: string, errorMessage: string): void => {
  try {
    execSync("pwd");
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    log.error(`${errorMessage}: ${(error as Error).message}`);
    throw error;
  }
};

const copyFile = (source: string, destination: string): void => {
  try {
    execSync(`cp ${source} ${destination}`);
  } catch (error) {
    log.error(`Error moving file: ${(error as Error).message}`);
    throw error;
  }
};

const getShortAppName = (appName: string): string => {
  return appName.replace(/\s+/g, "-").toLowerCase();
};

const DATABASE_OPTIONS = {
  SQLITE: "SQLite",
  POSTGRES: "Postgres (requires Docker)",
} as const;

const EMAIL_PROVIDERS = {
  RESEND: "Resend",
  POSTMARK: "Postmark",
  SENDGRID: "SendGrid",
  OTHER: "Other",
} as const;

const CACHE_PROVIDERS = {
  REDIS: "Redis (requires Docker)",
  NONE: "None",
} as const;

type DatabaseOption = (typeof DATABASE_OPTIONS)[keyof typeof DATABASE_OPTIONS];
type EmailProvider = (typeof EMAIL_PROVIDERS)[keyof typeof EMAIL_PROVIDERS];
type CacheProvider = (typeof CACHE_PROVIDERS)[keyof typeof CACHE_PROVIDERS];

const main = async (): Promise<void> => {
  log.info("Welcome to the Base-kit Setup!");

  const { appName } = await enquirer.prompt<{ appName: string }>({
    type: "input",
    name: "appName",
    message: "What is your app name?",
    validate: (input: string) =>
      input.trim() !== "" || "App name cannot be empty",
  });

  await updateEnvVars(
    {
      APP_URL: `http://localhost:3000`,
      COOKIE_DOMAIN: "localhost",
      APP_NAME: appName,
      SESSION_SECRET: crypto.randomBytes(64).toString("hex"),
    },
    "App",
  );

  const { databaseProvider } = await enquirer.prompt<{
    databaseProvider: DatabaseOption;
  }>({
    type: "select",
    name: "databaseProvider",
    message: "Select your database provider:",
    choices: Object.values(DATABASE_OPTIONS),
    initial: 0,
  });

  await configureDatabase(appName, databaseProvider);

  const { emailProvider } = await enquirer.prompt<{
    emailProvider: EmailProvider;
  }>({
    type: "select",
    name: "emailProvider",
    message: "Select your email provider:",
    choices: Object.values(EMAIL_PROVIDERS),
    initial: 0,
  });

  await configureEmails(emailProvider);

  const { cacheProvider } = await enquirer.prompt<{
    cacheProvider: CacheProvider;
  }>({
    type: "select",
    name: "cacheProvider",
    message: "Select your cache provider:",
    choices: Object.values(CACHE_PROVIDERS),
    initial: 0,
  });

  await configureCache(appName, cacheProvider);

  await configureStripe();

  log.success(`Configuring your app: ${appName}...`);

  log.success("Setup complete!");
};

const configureStripe = async (): Promise<void> => {
  log.warning("Configuring Stripe...");

  const { stripeSecretKey } = await enquirer.prompt<{
    stripeSecretKey: string;
  }>({
    type: "password",
    name: "stripeSecretKey",
    message: "Enter your Stripe secret key (starts with sk_test_):",
    validate: (input: string) =>
      input.trim().startsWith("sk_test_") ||
      "Invalid Stripe secret key. It should start with 'sk_test_'",
  });

  await updateEnvVars(
    {
      STRIPE_SECRET_KEY: stripeSecretKey,
    },
    "Stripe",
  );

  log.success("Stripe configuration completed successfully.");
};

const configureCache = async (
  appName: string,
  cacheProvider: CacheProvider,
): Promise<void> => {
  log.info(`Cache provider: ${cacheProvider}`);
  log.info(`App name: ${appName}`);
  if (cacheProvider === CACHE_PROVIDERS.REDIS) {
    const containerName = `${getShortAppName(appName)}-redis`;
    runCommand(
      `docker run --name ${containerName} -d redis`,
      "Error creating Redis container",
    );
    log.success(`Redis container created: ${containerName}`);
    await updateEnvVars(
      {
        REDIS_URL: "redis://localhost:6379",
      },
      "Cache",
    );
  }
};

const configureEmails = async (emailProvider: EmailProvider): Promise<void> => {
  let envVars: EnvVars = {};
  if (emailProvider !== EMAIL_PROVIDERS.OTHER) {
    let emailApiKey: string;
    switch (emailProvider) {
      case EMAIL_PROVIDERS.RESEND:
        ({ emailApiKey } = await enquirer.prompt<{ emailApiKey: string }>({
          type: "password",
          name: "emailApiKey",
          message: "Enter your Resend API key:",
          validate: (input: string) =>
            input.trim() !== "" || "API key cannot be empty",
        }));

        envVars["SMTP_HOST"] = "smtp.resend.com";
        envVars["SMTP_PORT"] = "25";
        envVars["SMTP_USERNAME"] = "resend";
        envVars["SMTP_PASSWORD"] = emailApiKey;
        break;

      case EMAIL_PROVIDERS.POSTMARK:
        ({ emailApiKey } = await enquirer.prompt<{ emailApiKey: string }>({
          type: "password",
          name: "emailApiKey",
          message: "Enter your Postmark Server API Token:",
          validate: (input: string) =>
            input.trim() !== "" || "API token cannot be empty",
        }));

        envVars["SMTP_HOST"] = "smtp.postmarkapp.com";
        envVars["SMTP_PORT"] = "587";
        envVars["SMTP_USERNAME"] = emailApiKey;
        envVars["SMTP_PASSWORD"] = emailApiKey;
        break;
      case EMAIL_PROVIDERS.SENDGRID:
        ({ emailApiKey } = await enquirer.prompt<{ emailApiKey: string }>({
          type: "password",
          name: "emailApiKey",
          message: "Enter your SendGrid API key:",
          validate: (input: string) =>
            input.trim() !== "" || "API key cannot be empty",
        }));

        envVars["SMTP_HOST"] = "smtp.sendgrid.net";
        envVars["SMTP_PORT"] = "587"; // Using TLS port as recommended
        envVars["SMTP_USERNAME"] = "apikey";
        envVars["SMTP_PASSWORD"] = emailApiKey;
        break;
      default:
        log.warning("Unsupported email provider selected.");
        return;
    }
  } else {
    envVars["SMTP_HOST"] = "";
    envVars["SMTP_PORT"] = "";
    envVars["SMTP_USERNAME"] = "";
    envVars["SMTP_PASSWORD"] = "";
  }
  await updateEnvVars(envVars, "Email");
};

const configureDatabase = async (
  appName: string,
  databaseProvider: DatabaseOption,
): Promise<void> => {
  let schemaFilePath: string;
  let drizzleConfigFilePath: string;
  let databaseUrl: string;
  const packagesToRemove: string[] = [];
  if (databaseProvider === DATABASE_OPTIONS.SQLITE) {
    log.warning("Configuring SQLite database...");
    databaseUrl = "sqlite.db";
    schemaFilePath = path.join(
      process.cwd(),
      "scripts/setup-files/schema-sqlite.ts",
    );
    drizzleConfigFilePath = path.join(
      process.cwd(),
      "scripts/setup-files/drizzle.config-sqlite.ts",
    );
    packagesToRemove.push("postgres");
  } else if (databaseProvider === DATABASE_OPTIONS.POSTGRES) {
    databaseUrl = "postgresql://postgres:password@localhost:5432/postgres";
    log.warning("Configuring Postgres database...");
    const containerName = `${getShortAppName(appName)}-postgres`;
    runCommand(
      `docker run --name ${containerName} -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`,
      "Error creating Postgres container",
    );
    log.success(`Postgres container created: ${containerName}`);
    schemaFilePath = path.join(
      process.cwd(),
      "scripts/setup-files/schema-postgres.ts",
    );
    drizzleConfigFilePath = path.join(
      process.cwd(),
      "scripts/setup-files/drizzle.config-postgres.ts",
    );
    packagesToRemove.push("better-sqlite3");
  } else {
    throw new Error("Unsupported database provider");
  }
  log.info("Copying database files...");
  copyFile(schemaFilePath, path.join(process.cwd(), "app/drizzle/schema.ts"));
  copyFile(
    drizzleConfigFilePath,
    path.join(process.cwd(), "drizzle.config.ts"),
  );
  log.info("Database files copied");
  log.info("Removing unnecessary packages...");
  for (const pkg of packagesToRemove) {
    runCommand(`npm uninstall ${pkg}`, `Error removing ${pkg}`);
  }
  log.info("Updating env vars...");
  await updateEnvVars(
    {
      DATABASE_URL: databaseUrl,
    },
    "Database",
  );
  log.info("Generating migrations");
  runCommand("npm run db:generate", "Error generating migrations");
  log.info("Running migrations");
  runCommand("npm run db:migrate", "Error running migrations");
  log.info("Seeding database");
  runCommand("npm run db:seed", "Error seeding database");
};

program.action(main);

program.parse(process.argv);
