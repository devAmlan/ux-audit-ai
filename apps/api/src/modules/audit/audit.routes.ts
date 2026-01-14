import { Router } from "express";
import { AuditController } from "./audit.controller";

const router = Router();
const auditController = new AuditController();

router.post("/", async (req, res) => {
  await auditController.createAudit(req, res);
});

router.get("/", async (req, res) => {
  await auditController.getAudits(req, res);
});

router.get("/:id", async (req, res) => {
  await auditController.getAuditById(req, res);
});

export default router;
