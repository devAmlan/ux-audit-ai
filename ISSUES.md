# Issues Resolved During Audit Service Implementation

This document summarizes all the errors encountered and resolved while setting up the Audit Service with Prisma 7.2.0 in a monorepo structure.

---

## Issue #1: PrismaClient Constructor Validation Error

### Error Message

```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

### Root Cause

Prisma 7.2.0 introduced a breaking change requiring explicit database adapter configuration. The PrismaClient constructor must receive either:

- A database adapter (e.g., `@prisma/adapter-pg` for PostgreSQL)
- An Accelerate URL

### Solution

1. **Updated `packages/db/src/client.ts`** to use PostgreSQL adapter:

   ```typescript
   import { Pool } from "pg";
   import { PrismaPg } from "@prisma/adapter-pg";

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   export const prisma = new PrismaClient({ adapter });
   ```

2. **Added dependencies** to `packages/db/package.json`:

   - `@prisma/adapter-pg`: "^7.2.0"
   - `pg`: "^8.16.3"
   - `@types/pg`: "^8.16.0" (dev dependency)

3. **Updated API** to import from shared database package:
   - Changed `apps/api/src/lib/prisma.ts` to re-export from `@repo/db/src/client`
   - Added `@repo/db` as workspace dependency in `apps/api/package.json`

### Files Changed

- `packages/db/src/client.ts`
- `packages/db/package.json`
- `apps/api/src/lib/prisma.ts`
- `apps/api/package.json`

---

## Issue #2: Prisma Schema Validation - URL Property Deprecated

### Error Message

```
Error: The datasource property `url` is no longer supported in schema files.
Move connection URLs for Migrate to `prisma.config.ts` and pass either `adapter`
for a direct database connection or `accelerateUrl` for Accelerate to the PrismaClient constructor.
```

### Root Cause

Prisma 7.2.0 moved datasource URL configuration from `schema.prisma` to `prisma.config.ts`. The `url` property is no longer allowed in the schema file.

### Solution

1. **Removed `url` property** from `packages/db/prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     // url removed - now in prisma.config.ts
   }
   ```

2. **Configured URL in `packages/db/prisma.config.ts`**:
   ```typescript
   export default defineConfig({
     datasource: {
       url: process.env.DATABASE_URL || "",
     },
   });
   ```

### Files Changed

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma.config.ts`

---

## Issue #3: Prisma Migrate - DATABASE_URL Not Loading in Config

### Error Message

```
Error: Connection url is empty. See https://pris.ly/d/config-url
```

### Root Cause

The `prisma.config.ts` file was trying to access `process.env.DATABASE_URL` but environment variables weren't being loaded when Prisma CLI executed the config file.

### Solution

1. **Added dotenv loading** in `packages/db/prisma.config.ts`:

   ```typescript
   import { config } from "dotenv";
   import { resolve } from "path";
   import { existsSync } from "fs";

   // Try multiple .env locations
   const rootEnv = resolve(process.cwd(), "../../.env");
   const currentEnv = resolve(process.cwd(), ".env");

   if (existsSync(rootEnv)) {
     config({ path: rootEnv });
   } else if (existsSync(currentEnv)) {
     config({ path: currentEnv });
   } else {
     config(); // Fallback to default behavior
   }
   ```

2. **Added dotenv dependency** to `packages/db/package.json`:
   - `dotenv`: "^17.2.3"

### Files Changed

- `packages/db/prisma.config.ts`
- `packages/db/package.json`

---

## Issue #4: API Not Starting - DATABASE_URL Unavailable at Runtime

### Error Message

```
Error: DATABASE_URL environment variable is not set
    at packages/db/src/client.ts:14
```

### Root Cause

The Prisma client in `packages/db/src/client.ts` was being imported and executed before environment variables were loaded. The module-level code runs immediately when imported, but `dotenv/config` in the API's `index.ts` hadn't executed yet due to import order.

### Solution

1. **Added dotenv loading** at the top of `packages/db/src/client.ts`:

   ```typescript
   import { config } from "dotenv";
   import { resolve } from "path";

   // Load .env from root directory (2 levels up from apps/api)
   const rootEnvPath = resolve(process.cwd(), "../../.env");
   config({ path: rootEnvPath });
   ```

2. **Also added dotenv** in `apps/api/src/index.ts` as a safety measure:
   ```typescript
   import "dotenv/config";
   ```

### Files Changed

- `packages/db/src/client.ts`
- `apps/api/src/index.ts`

---

## Key Takeaways

### Prisma 7.2.0 Breaking Changes

1. **Adapter Required**: Must use database adapter or Accelerate URL
2. **URL in Config**: Datasource URL moved from schema to `prisma.config.ts`
3. **Explicit Environment Loading**: Need to explicitly load `.env` files in config and client files

### Monorepo Considerations

1. **Shared Database Package**: Prisma client should be in a shared package (`@repo/db`)
2. **Environment Variable Loading**: Each package that needs env vars must load them explicitly
3. **Path Resolution**: Use `process.cwd()` relative paths to find `.env` files in monorepo structure

### Best Practices Applied

1. **Centralized Prisma Client**: Single source of truth in `packages/db/src/client.ts`
2. **Explicit Dependencies**: All required packages added to appropriate `package.json` files
3. **Error Handling**: Proper validation and error messages for missing configuration

---

## Environment Setup Requirements

Ensure you have a `.env` file in the **root directory** (`ux-audit-ai/.env`) with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

The Prisma client and config files are configured to automatically load this file.

---

## Verification Steps

After resolving all issues, verify the setup:

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Generate Prisma client**:

   ```bash
   pnpm db:generate
   ```

3. **Run migrations**:

   ```bash
   pnpm db:migrate
   ```

4. **Start the API**:
   ```bash
   pnpm dev
   ```

All services should start without errors.
