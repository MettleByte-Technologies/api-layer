import { Router } from "express";
import googleRoutes from "./google.routes";
import outlookRoutes from "./outlook.routes";
import hubspotRoutes from "./hubspot.routes";
import calendlyRoutes from "./calendly.routes";

const router = Router();

router.use("/google", googleRoutes);
router.use("/outlook", outlookRoutes);
router.use("/hubspot", hubspotRoutes);
router.use("/calendly", calendlyRoutes);

export default router;