import { config } from "dotenv";
import { resolve } from "path";
import { auditWorker } from "./queue/worker";

// Load .env from root directory
const rootEnvPath = resolve(process.cwd(), "../../.env");
config({ path: rootEnvPath });

console.log("[Worker] Starting audit worker...");

// Ensure worker process stays alive
// The worker will automatically process jobs from the queue
process.on("SIGTERM", async () => {
  console.log("[Worker] SIGTERM received, closing worker...");
  await auditWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] SIGINT received, closing worker...");
  await auditWorker.close();
  process.exit(0);
});

console.log("[Worker] Audit worker started and ready to process jobs");
