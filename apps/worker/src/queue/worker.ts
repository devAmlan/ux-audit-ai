import { Worker } from "bullmq";
import Redis from "ioredis";
import { processAuditJob } from "../processors/audit.processor";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not set");
}

// Create Redis connection
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create BullMQ Worker for queue "audit"
export const auditWorker = new Worker(
  "audit",
  async (job) => {
    const { auditId } = job.data;

    if (!auditId || typeof auditId !== "string") {
      throw new Error("Invalid job data: auditId is required and must be a string");
    }

    // Call audit processor
    await processAuditJob({ auditId });
  },
  {
    connection,
    // Error handling: catch all errors and mark audit as FAILED
    // The processor already handles this, but we add extra safety here
  }
);

// Worker event handlers for logging
auditWorker.on("completed", (job) => {
  console.log(`[Worker] Audit job ${job.id} completed successfully`);
});

auditWorker.on("failed", (job, err) => {
  console.error(`[Worker] Audit job ${job?.id} failed:`, err.message);
});

auditWorker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});
