import { Router } from "express";
import auditRoutes from "./modules/audit/audit.routes";

const router = Router();

router.use("/audits", auditRoutes);

export default router;
