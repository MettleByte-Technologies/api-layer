import { Router } from "express";
import { DocuSignController } from "../controllers/docusign.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: DocuSign
 *   description: DocuSign OAuth2 and envelope management
 */

/**
 * @swagger
 * /docusign/connect:
 *   post:
 *     summary: Generate DocuSign OAuth2 auth URL
 *     tags: [DocuSign]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [redirect_uri]
 *             properties:
 *               redirect_uri:
 *                 type: string
 *                 example: http://localhost:8080/api/v1/docusign/callback
 *     responses:
 *       200:
 *         description: Auth URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUri:
 *                   type: string
 */
router.post("/connect", DocuSignController.connect);

/**
 * @swagger
 * /docusign/token:
 *   post:
 *     summary: Exchange authorization code for tokens
 *     tags: [DocuSign]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, redirect_uri]
 *             properties:
 *               code:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *                 example: http://localhost:8080/api/v1/docusign/callback
 *     responses:
 *       200:
 *         description: Tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expires_in:
 *                   type: number
 *                 token_type:
 *                   type: string
 */
router.post("/token", DocuSignController.getAccessToken);

/**
 * @swagger
 * /docusign/refresh:
 *   post:
 *     summary: Refresh DocuSign access token
 *     tags: [DocuSign]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expires_in:
 *                   type: number
 *                 token_type:
 *                   type: string
 */
router.post("/refresh", DocuSignController.refreshToken);

/**
 * @swagger
 * /docusign/envelopes:
 *   post:
 *     summary: Send an envelope for signing
 *     tags: [DocuSign]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailSubject, signers]
 *             properties:
 *               emailSubject:
 *                 type: string
 *                 example: Please sign this agreement
 *               emailBody:
 *                 type: string
 *                 example: Hi, please review and sign the attached document.
 *               status:
 *                 type: string
 *                 enum: [sent, created]
 *                 default: sent
 *                 description: "sent = send immediately, created = save as draft"
 *               signerMessage:
 *                 type: string
 *                 example: Please sign at your earliest convenience.
 *               allowDecline:
 *                 type: boolean
 *                 default: true
 *                 description: Whether signer can decline to sign
 *               allowReassign:
 *                 type: boolean
 *                 default: false
 *                 description: Whether signer can reassign to someone else
 *               expiryDays:
 *                 type: number
 *                 example: 7
 *                 description: Number of days before envelope expires
 *               reminderDays:
 *                 type: number
 *                 example: 3
 *                 description: Number of days before sending reminder
 *               documentBase64:
 *                 type: string
 *                 description: Base64 encoded document (use this or templateId)
 *               documentName:
 *                 type: string
 *                 example: Agreement.pdf
 *               documentExtension:
 *                 type: string
 *                 enum: [pdf, docx]
 *                 example: pdf
 *               templateId:
 *                 type: string
 *                 description: DocuSign template ID (use this or documentBase64)
 *               signers:
 *                 type: array
 *                 description: At least one signer required
 *                 items:
 *                   type: object
 *                   required: [email, name, role]
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: signer@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     role:
 *                       type: string
 *                       example: Customer
 *                     routingOrder:
 *                       type: number
 *                       example: 1
 *                       description: Signing order (same number = parallel signing)
 *                     signPosition:
 *                       type: object
 *                       description: Only needed for DOCX files
 *                       properties:
 *                         pageNumber:
 *                           type: string
 *                           example: "1"
 *                         xPosition:
 *                           type: string
 *                           example: "100"
 *                         yPosition:
 *                           type: string
 *                           example: "700"
 *               ccRecipients:
 *                 type: array
 *                 description: People who receive a copy but do not sign
 *                 items:
 *                   type: object
 *                   required: [email, name]
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: manager@example.com
 *                     name:
 *                       type: string
 *                       example: Manager
 *     responses:
 *       200:
 *         description: Envelope created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 envelopeId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [sent, created]
 *                 statusDateTime:
 *                   type: string
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Failed to send envelope
 */
router.post("/envelopes", DocuSignController.sendEnvelope);

/**
 * @swagger
 * /docusign/envelopes/{envelopeId}:
 *   get:
 *     summary: Get envelope status
 *     tags: [DocuSign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: envelopeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Envelope status returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 envelopeId:
 *                   type: string
 *                 status:
 *                   type: string
 *                 emailSubject:
 *                   type: string
 *                 sentDateTime:
 *                   type: string
 *                 completedDateTime:
 *                   type: string
 *                 declinedDateTime:
 *                   type: string
 */
router.get("/envelopes/:envelopeId", DocuSignController.getEnvelopeStatus);

/**
 * @swagger
 * /docusign/envelopes:
 *   get:
 *     summary: List all envelopes
 *     tags: [DocuSign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, delivered, completed, declined, voided]
 *         description: Filter by envelope status
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *         example: "2024-01-01"
 *         description: Filter envelopes from this date (ISO format)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *         example: "2024-12-31"
 *         description: Filter envelopes to this date (ISO format)
 *       - in: query
 *         name: count
 *         schema:
 *           type: number
 *         example: 20
 *         description: Number of envelopes to return
 *     responses:
 *       200:
 *         description: List of envelopes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 envelopes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       envelopeId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       emailSubject:
 *                         type: string
 *                       sentDateTime:
 *                         type: string
 *                       completedDateTime:
 *                         type: string
 *                 totalSetSize:
 *                   type: number
 *                 resultSetSize:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to list envelopes
 */
router.get("/envelopes", DocuSignController.listEnvelopes);

/**
 * @swagger
 * /docusign/envelopes/{envelopeId}/recipients:
 *   get:
 *     summary: Get envelope recipients and their signing status
 *     tags: [DocuSign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: envelopeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipients returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       signedDateTime:
 *                         type: string
 *                       deliveredDateTime:
 *                         type: string
 *                 carbonCopies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get recipients
 */
router.get("/envelopes/:envelopeId/recipients", DocuSignController.getEnvelopeRecipients);

/**
 * @swagger
 * /docusign/envelopes/{envelopeId}/void:
 *   put:
 *     summary: Void (cancel) an envelope
 *     tags: [DocuSign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: envelopeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [voidReason]
 *             properties:
 *               voidReason:
 *                 type: string
 *                 example: Document sent in error
 *     responses:
 *       200:
 *         description: Envelope voided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 envelopeId:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to void envelope
 */
router.put("/envelopes/:envelopeId/void", DocuSignController.voidEnvelope);

/**
 * @swagger
 * /docusign/templates:
 *   get:
 *     summary: List available DocuSign templates
 *     tags: [DocuSign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *         description: Search templates by name
 *       - in: query
 *         name: count
 *         schema:
 *           type: number
 *         example: 20
 *         description: Number of templates to return
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       templateId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       lastModified:
 *                         type: string
 *                 totalSetSize:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to list templates
 */
router.get("/templates", DocuSignController.listTemplates);

/**
 * @swagger
 * /docusign/webhook:
 *   post:
 *     summary: DocuSign webhook receiver
 *     tags: [DocuSign]
 *     description: Receives DocuSign Connect events, verifies HMAC signature and forwards to client backend
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: DocuSign Connect event payload
 *     responses:
 *       200:
 *         description: Webhook received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *       401:
 *         description: Invalid or missing signature
 */
router.post("/webhook", DocuSignController.handleWebhook);

export default router;
