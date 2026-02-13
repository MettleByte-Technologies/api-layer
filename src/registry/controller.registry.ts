import { GoogleController } from "../controllers/google.controller";
import { OutlookController } from "../controllers/outlook.controller";
import { HubspotController } from "../controllers/hubspot.controller";

export const controllerRegistry: any = {
  google: GoogleController,
  outlook: OutlookController,
  hubspot: HubspotController,
};