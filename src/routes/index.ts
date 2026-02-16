import { Router } from "express";
import googleRoutes from "./google.routes";
import outlookRoutes from "./outlook.routes";
import hubspotRoutes from "./hubspot.routes";

const router = Router();

router.use("/google", googleRoutes);
router.use("/outlook", outlookRoutes);
router.use("/hubspot", hubspotRoutes);

export default router;