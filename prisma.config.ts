import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts", // Prisma 7 standard location for seed config
  },
  datasource: {
    // CLI commands (migrate, push) should use DIRECT_URL (port 5432) to support DDL table creation
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
