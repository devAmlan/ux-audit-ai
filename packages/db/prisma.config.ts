import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Try to load .env from multiple possible locations
const rootEnv = resolve(process.cwd(), "../../.env");
const currentEnv = resolve(process.cwd(), ".env");

if (existsSync(rootEnv)) {
  config({ path: rootEnv });
} else if (existsSync(currentEnv)) {
  config({ path: currentEnv });
} else {
  // Fallback: try to load from current directory (Prisma CLI default behavior)
  config();
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});
