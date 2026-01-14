import { AuditStatus } from "@prisma/client";

export interface CreateAuditInput {
  url: string;
}

export interface AuditResponse {
  id: string;
  userId: string;
  url: string;
  status: AuditStatus;
  createdAt: Date;
  updatedAt: Date;
}
