import { Router } from "express";
import { OutlookController } from "../controllers/outlook.controller";

const router = Router();

/**
 * @swagger
 * /outlook/connect:
 *   post:
 *     summary: Connect to Outlook - Generate auth URL
 *     tags: [Outlook]
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
router.post("/connect", OutlookController.connect);

/**
 * @swagger
 * /outlook/token:
 *   post:
 *     summary: Get access token from authorization code
 *     tags: [Outlook]
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
router.post("/token", OutlookController.getAccessToken);

/**
 * @swagger
 * /outlook/calendars:
 *   get:
 *     summary: Get all calendars
 *     tags: [Outlook]
 *     security:
 *       - BearerAuth: []
 */
router.get("/calendars", OutlookController.getCalendars);

/**
 * @swagger
 * /outlook/events:
 *   get:
 *     summary: Get all events from a calendar
 *     tags: [Outlook]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 */
router.get("/events", OutlookController.getEvents);

/**
 * @swagger
 * /outlook/events:
 *   post:
 *     summary: Create a calendar event
 *     tags: [Outlook]
 *     security:
 *       - BearerAuth: []
 */
router.post("/events", OutlookController.createEvent);

/**
 * @swagger
 * /outlook/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Outlook]
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
router.post("/refresh", OutlookController.refreshToken);

export default router;

