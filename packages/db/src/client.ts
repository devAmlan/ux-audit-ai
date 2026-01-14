import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client singleton
 * - Used by API and Worker
 * - Prevents multiple DB connections
 */

// Load .env from root directory (when running from apps/api, go up 2 levels)
// dotenv/config doesn't search parent dirs, so we need to be explicit
const rootEnvPath = resolve(process.cwd(), "../../.env");
config({ path: rootEnvPath });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
