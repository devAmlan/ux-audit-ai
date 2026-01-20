import { auditQueue } from "./queue";

export class JobService {
  /**
   * Enqueues an audit job to be processed by the worker
   * @param auditId - The ID of the audit to process
   */
  async enqueueAuditJob(auditId: string): Promise<void> {
    await auditQueue.add("process-audit", {
      auditId,
    });
  }
}
