import { defineConfig } from "prisma/config";
import { existsSync } from "node:fs";
import process from "node:process";

if (existsSync(".env")) {
  process.loadEnvFile?.(".env");
}

const placeholderDatabaseUrl =
  "postgresql://prisma:prisma@localhost:5432/warmi_placeholder?schema=public";
const schemaOnlyCommands = new Set(["generate", "validate", "format"]);
const isSchemaOnlyCommand = process.argv.some((arg) => schemaOnlyCommands.has(arg));
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL ?? databaseUrl;

if (!databaseUrl && !isSchemaOnlyCommand) {
  throw new Error(
    "Missing required environment variable: DATABASE_URL. Define it before running Prisma commands that connect to PostgreSQL."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  engine: "classic",
  datasource: {
    url: databaseUrl ?? placeholderDatabaseUrl,
    directUrl: directUrl ?? placeholderDatabaseUrl
  }
});
