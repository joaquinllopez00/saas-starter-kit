#!/usr/bin/env node
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var child_process_1 = require("child_process");
var commander_1 = require("commander");
require("dotenv/config");
var enquirer_1 = require("enquirer");
var promises_1 = require("fs/promises");
var path_1 = require("path");
commander_1.program.version("1.0.0").description("Setup Base-kit");
// Helper functions for colored console logging
var log = {
  info: function (message) {
    return console.log(chalk_1.default.blue(message));
  },
  success: function (message) {
    return console.log(chalk_1.default.green(message));
  },
  warning: function (message) {
    return console.log(chalk_1.default.yellow(message));
  },
  error: function (message) {
    return console.log(chalk_1.default.red(message));
  },
};
var runCommand = function (command, errorMessage) {
  try {
    log.warning("Running command: ".concat(command));
    (0, child_process_1.execSync)(command, { stdio: "inherit" });
    log.success("Command completed successfully: ".concat(command));
  } catch (error) {
    log.error("".concat(errorMessage, ": ").concat(error.message));
    throw error;
  }
};
var copyFile = function (source, destination) {
  try {
    (0, child_process_1.execSync)(
      "cp ".concat(source, " ").concat(destination),
    );
  } catch (error) {
    log.error("Error moving file: ".concat(error.message));
    throw error;
  }
};
var getShortAppName = function (appName) {
  return appName.replace(/\s+/g, "-").toLowerCase();
};
var DATABASE_OPTIONS = {
  SQLITE: "SQLite",
  POSTGRES: "Postgres (requires Docker)",
};
var EMAIL_PROVIDERS = {
  RESEND: "Resend",
  POSTMARK: "Postmark",
  SENDGRID: "SendGrid",
  OTHER: "Other",
};
var CACHE_PROVIDERS = {
  REDIS: "Redis (requires Docker)",
  NONE: "None",
};
var main = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var appName, envVars, databaseProvider, emailProvider, cacheProvider;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          log.info("Welcome to the Base-kit Setup!");
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "input",
              name: "appName",
              message: "What is your app name?",
              validate: function (input) {
                return input.trim() !== "" || "App name cannot be empty";
              },
            }),
          ];
        case 1:
          appName = _a.sent().appName;
          envVars = {};
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "select",
              name: "databaseProvider",
              message: "Select your database provider:",
              choices: Object.values(DATABASE_OPTIONS),
              initial: 0,
            }),
          ];
        case 2:
          databaseProvider = _a.sent().databaseProvider;
          return [
            4 /*yield*/,
            configureDatabase(appName, databaseProvider, envVars),
          ];
        case 3:
          _a.sent();
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "select",
              name: "emailProvider",
              message: "Select your email provider:",
              choices: Object.values(EMAIL_PROVIDERS),
              initial: 0,
            }),
          ];
        case 4:
          emailProvider = _a.sent().emailProvider;
          return [4 /*yield*/, configureEmails(emailProvider, envVars)];
        case 5:
          _a.sent();
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "select",
              name: "cacheProvider",
              message: "Select your cache provider:",
              choices: Object.values(CACHE_PROVIDERS),
              initial: 0,
            }),
          ];
        case 6:
          cacheProvider = _a.sent().cacheProvider;
          return [4 /*yield*/, configureCache(appName, cacheProvider, envVars)];
        case 7:
          _a.sent();
          return [4 /*yield*/, configureStripe(envVars)];
        case 8:
          _a.sent();
          log.success("Configuring your app: ".concat(appName, "..."));
          return [4 /*yield*/, updateEnvVars(envVars)];
        case 9:
          _a.sent();
          log.success("Setup complete!");
          return [2 /*return*/];
      }
    });
  });
};
var updateEnvVars = function (envVars) {
  return __awaiter(void 0, void 0, void 0, function () {
    var envExample, newEnvContents, existingContents, updatedContents, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          envExample = path_1.default.join(process.cwd(), ".env.example");
          newEnvContents = Object.entries(envVars)
            .map(function (_a) {
              var key = _a[0],
                value = _a[1];
              return "".concat(key, "=").concat(value);
            })
            .join("\n");
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, , 5]);
          return [4 /*yield*/, promises_1.default.readFile(envExample, "utf8")];
        case 2:
          existingContents = _a.sent();
          updatedContents =
            newEnvContents + (existingContents ? "\n" + existingContents : "");
          return [
            4 /*yield*/,
            promises_1.default.writeFile(
              path_1.default.join(process.cwd(), ".env"),
              updatedContents,
            ),
          ];
        case 3:
          _a.sent();
          return [3 /*break*/, 5];
        case 4:
          error_1 = _a.sent();
          log.error("Error updating .env file: ".concat(error_1.message));
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
};
var configureStripe = function (envVars) {
  return __awaiter(void 0, void 0, void 0, function () {
    var stripeSecretKey, stripeWebhookSecret;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          log.warning("Configuring Stripe...");
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "password",
              name: "stripeSecretKey",
              message: "Enter your Stripe secret key (starts with sk_test_):",
              validate: function (input) {
                return (
                  input.trim().startsWith("sk_test_") ||
                  "Invalid Stripe secret key. It should start with 'sk_test_'"
                );
              },
            }),
          ];
        case 1:
          stripeSecretKey = _a.sent().stripeSecretKey;
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "password",
              name: "stripeWebhookSecret",
              message: "Enter your Stripe webhook secret (starts with whsec_):",
              validate: function (input) {
                return (
                  input.trim().startsWith("whsec_") ||
                  "Invalid Stripe webhook secret. It should start with 'whsec_'"
                );
              },
            }),
          ];
        case 2:
          stripeWebhookSecret = _a.sent().stripeWebhookSecret;
          envVars["STRIPE_SECRET_KEY"] = stripeSecretKey;
          envVars["STRIPE_WEBHOOK_SECRET"] = stripeWebhookSecret;
          log.success("Stripe configuration completed successfully.");
          return [2 /*return*/];
      }
    });
  });
};
var configureCache = function (appName, cacheProvider, envVars) {
  return __awaiter(void 0, void 0, void 0, function () {
    var containerName;
    return __generator(this, function (_a) {
      log.info("Cache provider: ".concat(cacheProvider));
      log.info("App name: ".concat(appName));
      if (cacheProvider === CACHE_PROVIDERS.REDIS) {
        containerName = "".concat(getShortAppName(appName), "-redis");
        runCommand(
          "docker run --name ".concat(containerName, " -d redis"),
          "Error creating Redis container",
        );
        log.success("Redis container created: ".concat(containerName));
        envVars["REDIS_URL"] = "redis://localhost:6379";
      }
      return [2 /*return*/];
    });
  });
};
var configureEmails = function (emailProvider, envVars) {
  return __awaiter(void 0, void 0, void 0, function () {
    var emailApiKey, _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!(emailProvider !== EMAIL_PROVIDERS.OTHER))
            return [3 /*break*/, 9];
          emailApiKey = void 0;
          _a = emailProvider;
          switch (_a) {
            case EMAIL_PROVIDERS.RESEND:
              return [3 /*break*/, 1];
            case EMAIL_PROVIDERS.POSTMARK:
              return [3 /*break*/, 3];
            case EMAIL_PROVIDERS.SENDGRID:
              return [3 /*break*/, 5];
          }
          return [3 /*break*/, 7];
        case 1:
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "password",
              name: "emailApiKey",
              message: "Enter your Resend API key:",
              validate: function (input) {
                return input.trim() !== "" || "API key cannot be empty";
              },
            }),
          ];
        case 2:
          emailApiKey = _b.sent().emailApiKey;
          envVars["SMTP_HOST"] = "smtp.resend.com";
          envVars["SMTP_PORT"] = "25";
          envVars["SMTP_USERNAME"] = "resend";
          envVars["SMTP_PASSWORD"] = emailApiKey;
          return [3 /*break*/, 8];
        case 3:
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "password",
              name: "emailApiKey",
              message: "Enter your Postmark Server API Token:",
              validate: function (input) {
                return input.trim() !== "" || "API token cannot be empty";
              },
            }),
          ];
        case 4:
          emailApiKey = _b.sent().emailApiKey;
          envVars["SMTP_HOST"] = "smtp.postmarkapp.com";
          envVars["SMTP_PORT"] = "587";
          envVars["SMTP_USERNAME"] = emailApiKey;
          envVars["SMTP_PASSWORD"] = emailApiKey;
          return [3 /*break*/, 8];
        case 5:
          return [
            4 /*yield*/,
            enquirer_1.default.prompt({
              type: "password",
              name: "emailApiKey",
              message: "Enter your SendGrid API key:",
              validate: function (input) {
                return input.trim() !== "" || "API key cannot be empty";
              },
            }),
          ];
        case 6:
          emailApiKey = _b.sent().emailApiKey;
          envVars["SMTP_HOST"] = "smtp.sendgrid.net";
          envVars["SMTP_PORT"] = "587"; // Using TLS port as recommended
          envVars["SMTP_USERNAME"] = "apikey";
          envVars["SMTP_PASSWORD"] = emailApiKey;
          return [3 /*break*/, 8];
        case 7:
          log.warning("Unsupported email provider selected.");
          return [2 /*return*/];
        case 8:
          return [3 /*break*/, 10];
        case 9:
          envVars["SMTP_HOST"] = "";
          envVars["SMTP_PORT"] = "";
          envVars["SMTP_USERNAME"] = "";
          envVars["SMTP_PASSWORD"] = "";
          _b.label = 10;
        case 10:
          return [2 /*return*/];
      }
    });
  });
};
var configureDatabase = function (appName, databaseProvider, envVars) {
  return __awaiter(void 0, void 0, void 0, function () {
    var migrateFilePath,
      schemaFilePath,
      drizzleConfigFilePath,
      packagesToRemove,
      containerName,
      _i,
      packagesToRemove_1,
      pkg;
    return __generator(this, function (_a) {
      packagesToRemove = [];
      if (databaseProvider === DATABASE_OPTIONS.SQLITE) {
        log.warning("Configuring SQLite database...");
        envVars["DATABASE_URL"] = "sqlite.db";
        migrateFilePath = path_1.default.join(
          process.cwd(),
          "scripts/setup-files/migrate-sqlite.ts",
        );
        schemaFilePath = path_1.default.join(
          process.cwd(),
          "scripts/setup-files/schema-sqlite.ts",
        );
        drizzleConfigFilePath = path_1.default.join(
          process.cwd(),
          "scripts/setup-files/drizzle.config-sqlite.ts",
        );
        packagesToRemove.push("postgres");
      } else if (databaseProvider === DATABASE_OPTIONS.POSTGRES) {
        envVars["DATABASE_URL"] =
          "postgresql://postgres:postgres@localhost:5432/db";
        log.warning("Configuring Postgres database...");
        containerName = "".concat(getShortAppName(appName), "-postgres");
        runCommand(
          "docker run --name ".concat(
            containerName,
            " -e POSTGRES_PASSWORD=password -d postgres",
          ),
          "Error creating Postgres container",
        );
        log.success("Postgres container created: ".concat(containerName));
        migrateFilePath = path_1.default.join(
          process.cwd(),
          "scripts/setup-files/migrate-postgres.ts",
        );
        schemaFilePath = path_1.default.join(
          process.cwd(),
          "scripts/setup-files/schema-postgres.ts",
        );
        drizzleConfigFilePath = path_1.default.join(
          process.cwd(),
          "scripts/setup-files/drizzle.config-postgres.ts",
        );
        packagesToRemove.push("better-sqlite3");
      } else {
        throw new Error("Unsupported database provider");
      }
      log.info("Copying database files...");
      copyFile(
        migrateFilePath,
        path_1.default.join(process.cwd(), "app/drizzle/migrate.ts"),
      );
      copyFile(
        schemaFilePath,
        path_1.default.join(process.cwd(), "app/drizzle/schema.ts"),
      );
      copyFile(
        drizzleConfigFilePath,
        path_1.default.join(process.cwd(), "drizzle.config.ts"),
      );
      log.info("Database files copied");
      log.info("Removing unnecessary packages...");
      for (
        _i = 0, packagesToRemove_1 = packagesToRemove;
        _i < packagesToRemove_1.length;
        _i++
      ) {
        pkg = packagesToRemove_1[_i];
        runCommand("npm uninstall ".concat(pkg), "Error removing ".concat(pkg));
      }
      log.info("Generating migrations");
      runCommand("npm run db:generate", "Error generating migrations");
      log.info("Running migrations");
      runCommand("npm run db:migrate", "Error running migrations");
      log.info("Seeding database");
      runCommand("npm run db:seed", "Error seeding database");
      return [2 /*return*/];
    });
  });
};
commander_1.program.action(main);
commander_1.program.parse(process.argv);
