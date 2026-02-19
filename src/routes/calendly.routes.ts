
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
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer {access_token}
 *         description: Bearer token (Calendly access token to revoke)
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
 *       401:
 *         description: Unauthorized - Bearer token is required
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
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User URI to filter event types
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Organization URI to filter event types
 *       - in: query
 *         name: admin_managed
 *         schema:
 *           type: boolean
 *         description: Filter by admin managed event types
 *       - in: query
 *         name: user_availability_schedule
 *         schema:
 *           type: string
 *         description: User availability schedule URI
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: page_token
 *         schema:
 *           type: string
 *         description: Token for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order
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
 *       401:
 *         description: Unauthorized - Bearer token is required
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

/**
 * @swagger
 * /calendly/events:
 *   get:
 *     summary: List scheduled events
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
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User URI to filter events
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Organization URI to filter events
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Group URI to filter events
 *       - in: query
 *         name: invitee_email
 *         schema:
 *           type: string
 *         description: Filter events by invitee email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, canceled]
 *         description: Filter events by status
 *       - in: query
 *         name: min_start_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Minimum start time (ISO UTC string)
 *       - in: query
 *         name: max_start_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Maximum start time (ISO UTC string)
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: page_token
 *         schema:
 *           type: string
 *         description: Token for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [start_time:asc, start_time:desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of scheduled events
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
 *                       meeting_notes_plain:
 *                         type: string
 *                         nullable: true
 *                       meeting_notes_html:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                         enum: [active, canceled]
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                       event_type:
 *                         type: string
 *                       location:
 *                         type: object
 *                         nullable: true
 *                       invitees_counter:
 *                         type: object
 *                         properties:
 *                           total:
 *                             type: number
 *                           active:
 *                             type: number
 *                           limit:
 *                             type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       event_memberships:
 *                         type: array
 *                         items:
 *                           type: object
 *                       event_guests:
 *                         type: array
 *                         items:
 *                           type: object
 *                       calendar_event:
 *                         type: object
 *                         nullable: true
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
 *       401:
 *         description: Unauthorized - Bearer token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to list events
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
router.get("/events", CalendlyController.listEvents);

/**
 * @swagger
 * /calendly/invitees:
 *   post:
 *     summary: Create an event invitee
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_type
 *               - start_time
 *               - invitee
 *             properties:
 *               event_type:
 *                 type: string
 *                 description: Event type URI (e.g., https://api.calendly.com/event_types/AAAAAAAAAAAAAAAA)
 *                 example: https://api.calendly.com/event_types/AAAAAAAAAAAAAAAA
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: Start time in ISO UTC format
 *                 example: 2019-08-07T06:05:04.321123Z
 *               invitee:
 *                 type: object
 *                 required:
 *                   - email
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Full name of the invitee
 *                     example: John Smith
 *                   first_name:
 *                     type: string
 *                     description: First name of the invitee
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     description: Last name of the invitee
 *                     example: Smith
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email address of the invitee
 *                     example: test@example.com
 *                   timezone:
 *                     type: string
 *                     description: Timezone of the invitee
 *                     example: America/New_York
 *                   text_reminder_number:
 *                     type: string
 *                     description: Phone number for text reminders
 *                     example: "+1 888-888-8888"
 *               location:
 *                 type: object
 *                 properties:
 *                   kind:
 *                     type: string
 *                     enum: [physical, google_meet, zoom, gotomeeting, webex, microsoft_teams, custom]
 *                     description: Type of location
 *                     example: physical
 *                   location:
 *                     type: string
 *                     description: Location details
 *                     example: "123 Main St, New York, NY"
 *               questions_and_answers:
 *                 type: array
 *                 description: Custom questions and answers
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       example: "What is your preferred contact method?"
 *                     answer:
 *                       type: string
 *                       example: "Email"
 *                     position:
 *                       type: integer
 *                       example: 0
 *               tracking:
 *                 type: object
 *                 description: UTM tracking parameters
 *                 properties:
 *                   utm_campaign:
 *                     type: string
 *                     example: "summer_sale"
 *                   utm_source:
 *                     type: string
 *                     example: "google"
 *                   utm_medium:
 *                     type: string
 *                     example: "cpc"
 *                   utm_content:
 *                     type: string
 *                     example: "ad_variant_1"
 *                   utm_term:
 *                     type: string
 *                     example: "calendar_booking"
 *                   salesforce_uuid:
 *                     type: string
 *                     example: "001xx000003DGb0AAG"
 *               event_guests:
 *                 type: array
 *                 description: Additional guest email addresses
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["janedoe@calendly.com"]
 *     responses:
 *       201:
 *         description: Invitee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resource:
 *                   type: object
 *                   properties:
 *                     uri:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     text_reminder_number:
 *                       type: string
 *                       nullable: true
 *                     timezone:
 *                       type: string
 *                     event:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     canceled:
 *                       type: boolean
 *                     rescheduled:
 *                       type: boolean
 *                     questions_and_answers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     tracking:
 *                       type: object
 *                     tracking_url:
 *                       type: string
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized - Bearer token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to create invitee
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
router.post("/invitees", CalendlyController.createInvitee);

export default router;