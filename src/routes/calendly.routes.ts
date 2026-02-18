
import { Router } from "express";
import { CalendlyController } from "../controllers/calendly.controller";

const router = Router();

/**
 * @swagger
 * /calendly/connect:
 *   post:
 *     summary: Connect to Calendly - Generate auth URL
 *     tags: [Calendly]
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
 *                 description: The redirect URI for OAuth callback
 *     responses:
 *       200:
 *         description: Auth URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   description: The authorization URL to redirect the user to
 *       400:
 *         description: Bad request - Invalid or missing redirect_uri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to generate authorization URL
 */
router.post("/connect", CalendlyController.connect);

/**
 * @swagger
 * /calendly/token:
 *   post:
 *     summary: Exchange authorization code for access token
 *     tags: [Calendly]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from OAuth callback
 *               redirect_uri:
 *                 type: string
 *                 description: The redirect URI used in the connect request (optional)
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
 *                 token_type:
 *                   type: string
 *                 expires_in:
 *                   type: number
 *                 refresh_token:
 *                   type: string
 *                 scope:
 *                   type: string
 *                 owner:
 *                   type: string
 *                 created_at:
 *                   type: number
 *                 organization:
 *                   type: string
 *       500:
 *         description: Failed to retrieve access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/token", CalendlyController.getAccessToken);

/**
 * @swagger
 * /calendly/refresh:
 *   post:
 *     summary: Refresh Calendly access token
 *     tags: [Calendly]
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
 *                 token_type:
 *                   type: string
 *                 expires_in:
 *                   type: number
 *                 refresh_token:
 *                   type: string
 *                 scope:
 *                   type: string
 *                 owner:
 *                   type: string
 *                 created_at:
 *                   type: number
 *                 organization:
 *                   type: string
 *       400:
 *         description: Bad request - refresh_token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to refresh access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/refresh", CalendlyController.refreshAccessToken);

/**
 * @swagger
 * /calendly/revoke:
 *   post:
 *     summary: Revoke Calendly connection
 *     tags: [Calendly]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The access token to revoke
 *     responses:
 *       200:
 *         description: Connection revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection revoked successfully
 *       400:
 *         description: Bad request - token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to revoke connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/revoke", CalendlyController.revokeConnection);

/**
 * @swagger
 * /calendly/event_types:
 *   get:
 *     summary: Get user event types
 *     tags: [Calendly]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer {access_token}
 *         description: Bearer token (Calendly access token)
 *     responses:
 *       200:
 *         description: List of event types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collection:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uri:
 *                         type: string
 *                       name:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                       slug:
 *                         type: string
 *                       scheduling_url:
 *                         type: string
 *                       duration:
 *                         type: number
 *                       kind:
 *                         type: string
 *                       type:
 *                         type: string
 *                       color:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                       profile:
 *                         type: object
 *                       locations:
 *                         type: array
 *                       custom_questions:
 *                         type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     next_page:
 *                       type: string
 *                       nullable: true
 *                     previous_page:
 *                       type: string
 *                       nullable: true
 *                     next_page_token:
 *                       type: string
 *                       nullable: true
 *                     previous_page_token:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Bad request - token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to retrieve event types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get("/event_types", CalendlyController.getEventTypes);

export default router;