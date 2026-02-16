import { Router } from "express";
import { HubspotController } from "../controllers/hubspot.controller";

const router = Router();

/**
 * @swagger
 * /hubspot/connect:
 *   post:
 *     summary: Connect to Hubspot - Generate auth URL
 *     tags: [Hubspot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - redirect_uri
 *             properties:
 *               redirect_uri:
 *                 type: string
 */
router.post("/connect", HubspotController.connect);

/**
 * @swagger
 * /hubspot/token:
 *   post:
 *     summary: Get access token from authorization code
 *     tags: [Hubspot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - redirect_uri
 *             properties:
 *               code:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 */
router.post("/token", HubspotController.getAccessToken);

/**
 * @swagger
 * /hubspot/calendars:
 *   get:
 *     summary: Get all calendars
 *     tags: [Hubspot]
 *     security:
 *       - BearerAuth: []
 */
router.get("/calendars", HubspotController.getCalendars);

/**
 * @swagger
 * /hubspot/events:
 *   get:
 *     summary: Get all events from a calendar
 *     tags: [Hubspot]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 */
router.get("/events", HubspotController.getEvents);

/**
 * @swagger
 * /hubspot/events:
 *   post:
 *     summary: Create a calendar event
 *     tags: [Hubspot]
 *     security:
 *       - BearerAuth: []
 */
router.post("/events", HubspotController.createEvent);

/**
 * @swagger
 * /hubspot/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Hubspot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 */
router.post("/refresh", HubspotController.refreshToken);

export default router;

