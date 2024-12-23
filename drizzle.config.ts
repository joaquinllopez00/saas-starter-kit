import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./app/drizzle/schema.ts",
  out: "./app/drizzle/migrations",
  dialect: "postgresql", // 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
