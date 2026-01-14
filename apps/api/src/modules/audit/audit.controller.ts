import { Request, Response } from "express";
import { AuditService } from "./audit.service";
import { CreateAuditInput } from "./audit.types";

const auditService = new AuditService();

export class AuditController {
  async createAudit(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateAuditInput = req.body;

      const audit = await auditService.createAudit(input);

      res.status(201).json(audit);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create audit";
      res.status(400).json({ error: message });
    }
  }

  async getAudits(_req: Request, res: Response): Promise<void> {
    try {
      const audits = await auditService.getAudits();
      res.status(200).json(audits);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch audits";
      res.status(500).json({ error: message });
    }
  }

  async getAuditById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Audit ID is required" });
        return;
      }

      const audit = await auditService.getAuditById(id as string);

      if (!audit) {
        res.status(404).json({ error: "Audit not found" });
        return;
      }

      res.status(200).json(audit);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch audit";
      res.status(500).json({ error: message });
    }
  }
}
