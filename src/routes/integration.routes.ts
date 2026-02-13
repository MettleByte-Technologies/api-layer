// import { Router } from "express";
// import { connectGoogle } from "../controllers/integration.controller";

// const router = Router();

// router.get("/google/connect", connectGoogle);

// export default router;

import { Router } from "express";
import { controllerRegistry } from "../registry/controller.registry";

const router = Router();

// lockup function to get controller based on provider
const resolveController = (provider: string) => controllerRegistry[provider];

router.get("/:provider/connect/:userId", (req, res) => {
  const { provider } = req.params;

  const controller = resolveController(provider);

  if (!controller || typeof controller.connect !== "function") {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  controller.connect(req, res);
});

// List calendars
router.get("/:provider/calendars/:userId", (req, res) => {
  const { provider } = req.params;
  const controller = resolveController(provider);

  if (!controller || typeof controller.getCalendars !== "function") {
    return res.status(400).json({ error: "Unsupported provider or action" });
  }

  controller.getCalendars(req, res);
});

// List events
router.get("/:provider/calendars/:userId/events", (req, res) => {
  const { provider } = req.params;
  const controller = resolveController(provider);

  if (!controller || typeof controller.listEvents !== "function") {
    return res.status(400).json({ error: "Unsupported provider or action" });
  }

  controller.listEvents(req, res);
});

// Create event
router.post("/:provider/calendars/:userId/events", (req, res) => {
  const { provider } = req.params;
  const controller = resolveController(provider);

  if (!controller || typeof controller.createEvent !== "function") {
    return res.status(400).json({ error: "Unsupported provider or action" });
  }

  controller.createEvent(req, res);
});

export default router;