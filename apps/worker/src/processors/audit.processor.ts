import { AuditStatus } from "@prisma/client";
import { prisma } from "@repo/db/src/client";

export interface ProcessAuditJobData {
  auditId: string;
}

/**
 * Processes an audit job
 * Responsibilities:
 * 1. Update audit → PROCESSING
 * 2. Simulate work (sleep)
 * 3. Update audit → COMPLETED
 * 4. On error: Save errorMessage and update audit → FAILED
 */
export async function processAuditJob(data: ProcessAuditJobData): Promise<void> {
  const { auditId } = data;

  try {
    // 1. Update audit → PROCESSING
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: AuditStatus.PROCESSING },
    });

    // 2. Simulate work (sleep for 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Update audit → COMPLETED
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: AuditStatus.COMPLETED },
    });
  } catch (error) {
    // 4. On error: Save errorMessage and update audit → FAILED
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    try {
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: AuditStatus.FAILED,
          // Note: errorMessage field doesn't exist in schema yet, so we'll skip it for now
          // The user said not to change DB schema
        },
      });
    } catch (updateError) {
      // Log error but don't throw - we don't want to crash the worker
      console.error(
        `Failed to update audit ${auditId} to FAILED:`,
        updateError
      );
    }

    // Re-throw to let BullMQ handle retries if needed
    throw error;
  }
}
