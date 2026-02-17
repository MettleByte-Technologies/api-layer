import { Router } from "express";
import { OutlookController } from "../controllers/outlook.controller";

const router = Router();

/**
 * @swagger
 * /outlook/connect:
 *   post:
 *     summary: Connect to Outlook - Generate authorization URL
 *     description: Generates an OAuth2 authorization URL for user login to Outlook
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
 *                 description: The redirect URI where user will be sent after authorization
 *                 example: "https://yourdomain.com/callback"
 *     responses:
 *       200:
 *         description: Successfully generated authorization URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       description: OAuth2 authorization URL for Outlook login
 *                       example: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=..."
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Missing required field: redirect_uri"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 *                     details:
 *                       type: string
 */
router.post("/connect", OutlookController.connect);

/**
 * @swagger
 * /outlook/token:
 *   post:
 *     summary: Exchange authorization code for access token
 *     description: Exchanges the authorization code received from Outlook OAuth for an access token and refresh token
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
 *                 description: Authorization code from Outlook OAuth callback
 *                 example: "M.R3_BAY.-..."
 *               redirect_uri:
 *                 type: string
 *                 description: Must match the redirect_uri used in /connect endpoint
 *                 example: "https://yourdomain.com/callback"
 *     responses:
 *       200:
 *         description: Successfully obtained access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: JWT access token for API calls
 *                       example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
 *                     refresh_token:
 *                       type: string
 *                       description: Token used to refresh access token when expired
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: integer
 *                       description: Access token expiration time in seconds
 *                       example: 3600
 *                     scope:
 *                       type: string
 *                       description: Granted OAuth scopes
 *                       example: "Calendars.ReadWrite offline_access"
 *       400:
 *         description: Invalid or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Missing required fields: code, redirect_uri"
 *       401:
 *         description: Invalid authorization code or expired code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: "Invalid or expired authorization code"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 *                     details:
 *                       type: string
 */
router.post("/token", OutlookController.getAccessToken);

/**
 * @swagger
 * /outlook/calendars:
 *   get:
 *     summary: Get all calendars
 *     description: Retrieves all calendars accessible to the authenticated user
 *     tags: [Outlook]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved calendars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Unique calendar identifier
 *                             example: "AQMkADAwATMwMDAwAC05ZDQzLTAwCi0wMAotMDAwMAEA..."
 *                           name:
 *                             type: string
 *                             description: Calendar display name
 *                             example: "Calendar"
 *                           changeKey:
 *                             type: string
 *                             description: Change tracking key
 *                           isDefaultCalendar:
 *                             type: boolean
 *                             example: true
 *                           hexColor:
 *                             type: string
 *                             description: Hex color code for calendar display
 *                             example: "#0078D4"
 *                           isShared:
 *                             type: boolean
 *                             example: false
 *                           isSharedWithMe:
 *                             type: boolean
 *                             example: false
 *                           canEdit:
 *                             type: boolean
 *                             example: true
 *                           canShare:
 *                             type: boolean
 *                             example: true
 *                           canDelete:
 *                             type: boolean
 *                             example: false
 *                           owner:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               address:
 *                                 type: string
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: "Missing or invalid access token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 *                     details:
 *                       type: string
 */
router.get("/calendars", OutlookController.getCalendars);

/**
 * @swagger
 * /outlook/events:
 *   get:
 *     summary: Get all events from a calendar
 *     description: Retrieves all events from a specified calendar with optional filters
 *     tags: [Outlook]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 *         description: Calendar ID (default - primary calendar)
 *         example: "AQMkADAwATMwMDAwAC05ZDQzLTAwCi0wMAotMDAwMAEA..."
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: OData filter query
 *         example: "start/dateTime ge '2024-01-01' and end/dateTime le '2024-12-31'"
 *       - in: query
 *         name: top
 *         schema:
 *           type: integer
 *         description: Maximum number of events to return
 *         example: 10
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of events to skip for pagination
 *         example: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Event unique identifier
 *                             example: "AAMkADAwATMwMDAwAC05ZDQzLTAwCi0wMAotMDAwMABGRUMwADAwAA=="
 *                           subject:
 *                             type: string
 *                             description: Event title
 *                             example: "Team Meeting"
 *                           bodyPreview:
 *                             type: string
 *                             description: Preview of event description
 *                             example: "Discuss project updates"
 *                           start:
 *                             type: object
 *                             properties:
 *                               dateTime:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-02-20T10:00:00.0000000"
 *                               timeZone:
 *                                 type: string
 *                                 example: "UTC"
 *                           end:
 *                             type: object
 *                             properties:
 *                               dateTime:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-02-20T11:00:00.0000000"
 *                               timeZone:
 *                                 type: string
 *                                 example: "UTC"
 *                           location:
 *                             type: object
 *                             properties:
 *                               displayName:
 *                                 type: string
 *                                 example: "Conference Room A"
 *                               address:
 *                                 type: object
 *                           isCancelled:
 *                             type: boolean
 *                             example: false
 *                           isReminderOn:
 *                             type: boolean
 *                             example: true
 *                           reminderMinutesBeforeStart:
 *                             type: integer
 *                             example: 15
 *                           categories:
 *                             type: array
 *                             items:
 *                               type: string
 *                           attendees:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 emailAddress:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                     address:
 *                                       type: string
 *                                 type:
 *                                   type: string
 *                                   enum: [required, optional, resource]
 *                                 status:
 *                                   type: string
 *                                   enum: [none, organizer, tentativelyAccepted, accepted, declined, notResponded]
 *                           organizer:
 *                             type: object
 *                             properties:
 *                               emailAddress:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   address:
 *                                     type: string
 *                           webLink:
 *                             type: string
 *                             description: Link to event in Outlook web
 *                             example: "https://outlook.office365.com/owa/?itemid=..."
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: "Missing or invalid access token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 *                     details:
 *                       type: string
 */
router.get("/events", OutlookController.getEvents);

/**
 * @swagger
 * /outlook/events:
 *   post:
 *     summary: Create a calendar event
 *     description: Creates a new event in the specified calendar
 *     tags: [Outlook]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 *         description: Calendar ID where event will be created (default - primary)
 *         example: "AQMkADAwATMwMDAwAC05ZDQzLTAwCi0wMAotMDAwMAEA..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - start
 *               - end
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Event title
 *                 example: "Project Review Meeting"
 *               body:
 *                 type: object
 *                 description: Event description
 *                 properties:
 *                   contentType:
 *                     type: string
 *                     description: Content type of body
 *                     enum: [text, HTML]
 *                     example: "HTML"
 *                   content:
 *                     type: string
 *                     description: Event description content
 *                     example: "Discuss Q1 project progress"
 *               location:
 *                 type: object
 *                 description: Event location
 *                 properties:
 *                   displayName:
 *                     type: string
 *                     example: "Conference Room A"
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       countryOrRegion:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *               start:
 *                 type: object
 *                 required:
 *                   - dateTime
 *                   - timeZone
 *                 description: Event start time
 *                 properties:
 *                   dateTime:
 *                     type: string
 *                     format: date-time
 *                     description: ISO 8601 format datetime
 *                     example: "2024-02-20T10:00:00"
 *                   timeZone:
 *                     type: string
 *                     description: IANA timezone identifier
 *                     example: "America/New_York"
 *               end:
 *                 type: object
 *                 required:
 *                   - dateTime
 *                   - timeZone
 *                 description: Event end time
 *                 properties:
 *                   dateTime:
 *                     type: string
 *                     format: date-time
 *                     description: ISO 8601 format datetime
 *                     example: "2024-02-20T11:00:00"
 *                   timeZone:
 *                     type: string
 *                     description: IANA timezone identifier
 *                     example: "America/New_York"
 *               attendees:
 *                 type: array
 *                 description: List of event attendees
 *                 items:
 *                   type: object
 *                   properties:
 *                     emailAddress:
 *                       type: object
 *                       required:
 *                         - address
 *                       properties:
 *                         address:
 *                           type: string
 *                           description: Attendee email address
 *                           example: "john@example.com"
 *                         name:
 *                           type: string
 *                           description: Attendee display name
 *                           example: "John Doe"
 *                     type:
 *                       type: string
 *                       description: Attendee type
 *                       enum: [required, optional, resource]
 *                       example: "required"
 *               categories:
 *                 type: array
 *                 description: Event categories
 *                 items:
 *                   type: string
 *                 example: ["Work", "Important"]
 *               isReminderOn:
 *                 type: boolean
 *                 description: Whether reminder is enabled
 *                 example: true
 *               reminderMinutesBeforeStart:
 *                 type: integer
 *                 description: Minutes before event start for reminder
 *                 example: 15
 *               isOnlineMeeting:
 *                 type: boolean
 *                 description: Whether this is an online meeting
 *                 example: false
 *               onlineMeetingProvider:
 *                 type: string
 *                 description: Online meeting provider type
 *                 enum: [unknown, teamsForBusiness, skypeForBusiness, skypeForConsumer]
 *               allowNewTimeProposals:
 *                 type: boolean
 *                 description: Allow attendees to propose new times
 *                 example: true
 *     responses:
 *       201:
 *         description: Event successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Created event ID
 *                       example: "AAMkADAwATMwMDAwAC05ZDQzLTAwCi0wMAotMDAwMABGRUMwADAwAA=="
 *                     subject:
 *                       type: string
 *                       example: "Project Review Meeting"
 *                     start:
 *                       type: object
 *                       properties:
 *                         dateTime:
 *                           type: string
 *                           format: date-time
 *                         timeZone:
 *                           type: string
 *                     end:
 *                       type: object
 *                       properties:
 *                         dateTime:
 *                           type: string
 *                           format: date-time
 *                         timeZone:
 *                           type: string
 *                     webLink:
 *                       type: string
 *                       description: Link to event in Outlook web
 *                       example: "https://outlook.office365.com/owa/?itemid=..."
 *       400:
 *         description: Invalid request body or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Missing required fields: subject, start, end"
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: "Missing or invalid access token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 *                     details:
 *                       type: string
 */
router.post("/events", OutlookController.createEvent);

/**
 * @swagger
 * /outlook/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses refresh token to obtain a new access token without requiring user login
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
 *                 description: Refresh token obtained from initial authentication
 *                 example: "M.R3_BAY.-CJ..."
 *     responses:
 *       200:
 *         description: Successfully refreshed access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: New JWT access token
 *                       example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIifQ..."
 *                     refresh_token:
 *                       type: string
 *                       description: New refresh token (if provided by Outlook)
 *                       example: "M.R3_BAY.-CJ2..."
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: integer
 *                       description: Token expiration time in seconds
 *                       example: 3600
 *                     scope:
 *                       type: string
 *                       description: OAuth scopes
 *                       example: "Calendars.ReadWrite offline_access"
 *       400:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Missing required field: refresh_token"
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: "Invalid or expired refresh token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: "Internal server error"
 *                     details:
 *                       type: string
 */
router.post("/refresh", OutlookController.refreshToken);

export default router;