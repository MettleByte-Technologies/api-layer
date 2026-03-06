import { Router } from "express";
import googleRoutes from "./google.routes";
import outlookRoutes from "./outlook.routes";
import hubspotRoutes from "./hubspot.routes";
import calendlyRoutes from "./calendly.routes";
import docusignRoutes from "./docusign.routes";

const router = Router();

router.use("/google", googleRoutes);
router.use("/outlook", outlookRoutes);
router.use("/hubspot", hubspotRoutes);
router.use("/calendly", calendlyRoutes);
router.use("/docusign", docusignRoutes);

export default router;