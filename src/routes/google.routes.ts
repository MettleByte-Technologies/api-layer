import { Router } from "express";
import { GoogleController } from "../controllers/google.controller";

const router = Router();

/**
 * @swagger
 * /google/connect:
 *   post:
 *     summary: Connect to Google - Generate auth URL
 *     tags: [Google]
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
 *                 description: The redirect URI to use for OAuth callback (preferred key; `redirectUri` is also accepted)
 *     responses:
 *       200:
 *         description: Auth URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUri:
 *                   type: string
 *       400:
 *         description: Bad request - redirect_uri is required
 */
router.post("/connect", GoogleController.connect);

/**
 * @swagger
 * /google/token:
 *   post:
 *     summary: Get access token from authorization code
 *     tags: [Google]
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
 *                 description: Authorization code from OAuth callback
 *               redirect_uri:
 *                 type: string
 *                 description: The redirect URI used in the connect request
 *     responses:
 *       200:
 *         description: Tokens retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expiry_date:
 *                   type: number
 *                 token_type:
 *                   type: string
 *                 scope:
 *                   type: string
 */
router.post("/token", GoogleController.getAccessToken);


/**
 * @swagger
 * /google/revoke:
 *   post:
 *     summary: Revoke Google access token
 *     tags: [Google]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *                 description: The access token to revoke *               
 *     responses:
 *       200:
 *         description: Connection revoked successfully
 *       400:
 *         description: Bad request - access_token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 
 */
router.post("/revoke", GoogleController.revokeConnection);
/**
 * @swagger
 * /google/calendars:
 *   get:
 *     summary: Get all calendars
 *     tags: [Google]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of calendars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 calendars:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 */
router.get("/calendars", GoogleController.getCalendars);

/**
 * @swagger
 * /google/events:
 *   get:
 *     summary: Get all events from a calendar
 *     tags: [Google]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 *         description: Calendar ID (default: primary)
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/events", GoogleController.getEvents);

/**
 * @swagger
 * /google/events:
 *   post:
 *     summary: Create a calendar event
 *     tags: [Google]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *             properties:
 *               calendarId:
 *                 type: string
 *                 description: Calendar ID (default: primary)
 *               event:
 *                 type: object
 *                 required:
 *                   - summary
 *                   - start
 *                   - end
 *                 properties:
 *                   summary:
 *                     type: string
 *                   description:
 *                     type: string
 *                   start:
 *                     type: object
 *                     properties:
 *                       dateTime:
 *                         type: string
 *                         format: date-time
 *                       timeZone:
 *                         type: string
 *                   end:
 *                     type: object
 *                     properties:
 *                       dateTime:
 *                         type: string
 *                         format: date-time
 *                       timeZone:
 *                         type: string
 *                   attendees:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *     responses:
 *       200:
 *         description: Event created successfully
 */
router.post("/events", GoogleController.createEvent);

/**
 * @swagger
 * /google/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Google]
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
 *                 description: The refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expiry_date:
 *                   type: number
 *                 token_type:
 *                   type: string
 *                 scope:
 *                   type: string
 */
router.post("/refresh", GoogleController.refreshToken);

export default router;

