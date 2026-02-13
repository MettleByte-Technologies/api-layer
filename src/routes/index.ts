import { Router } from "express";
import integrationRoutes from "./integration.routes";
import oauthRoutes from "./oauth.routes";

const router = Router();

router.use("/integrations", integrationRoutes);
router.use("/oauth", oauthRoutes);

export default router;