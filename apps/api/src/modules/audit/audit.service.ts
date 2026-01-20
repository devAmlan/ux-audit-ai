import { AuditStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateAuditInput, AuditResponse } from "./audit.types";
import { JobService } from "../job";

const ANONYMOUS_USER_ID = "anonymous";

const jobService = new JobService();

export class AuditService {
  async createAudit(input: CreateAuditInput): Promise<AuditResponse> {
    // Basic URL validation
    if (
      !input.url ||
      typeof input.url !== "string" ||
      input.url.trim().length === 0
    ) {
      throw new Error("URL is required and must be a non-empty string");
    }

    // Basic URL format validation
    try {
      new URL(input.url);
    } catch {
      throw new Error("Invalid URL format");
    }

    const audit = await prisma.audit.create({
      data: {
        userId: ANONYMOUS_USER_ID,
        url: input.url.trim(),
        status: AuditStatus.PENDING,
      },
    });

    // Enqueue job for background processing
    await jobService.enqueueAuditJob(audit.id);

    return audit;
  }

  async getAudits(): Promise<AuditResponse[]> {
    const audits = await prisma.audit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return audits;
  }

  async getAuditById(id: string): Promise<AuditResponse | null> {
    const audit = await prisma.audit.findUnique({
      where: {
        id,
      },
    });

    return audit;
  }
}
