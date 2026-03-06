import { Request, Response } from "express";
import {
    generateAuthUrl,
    exchangeCodeForTokens,
    refreshAccessToken,
} from "../services/providers/docusign/docusign.auth";
import {
    sendEnvelope,
    getEnvelopeStatus,
    listEnvelopes,
    getEnvelopeRecipients,
    voidEnvelope,
    listTemplates,
} from "../services/providers/docusign/docusign.envelope";
import crypto from "crypto";
import axios from "axios";
import { env } from "../config/env";

export class DocuSignController {
    /**
     * Connect - Generate auth URL
     * POST /api/v1/docusign/connect
     * Body: { redirect_uri: string }
     */
    static connect(req: Request, res: Response) {
        try {
            const { redirect_uri } = req.body;

            if (!redirect_uri) {
                return res.status(400).json({
                    error: "redirect_uri is required in request body",
                    example: { redirect_uri: "http://localhost:8080/api/v1/docusign/callback" }
                });
            }

            if (typeof redirect_uri !== "string" || !redirect_uri.startsWith("http")) {
                return res.status(400).json({
                    error: "redirect_uri must be a valid URL starting with http:// or https://",
                    received: redirect_uri,
                });
            }

            const authUrl = generateAuthUrl(redirect_uri);
            res.json({ authUri: authUrl });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to generate auth URL",
                message: error.message
            });
        }
    }

    /**
     * Exchange code for tokens
     * POST /api/v1/docusign/token
     * Body: { code: string, redirect_uri: string }
     */
    static async getAccessToken(req: Request, res: Response) {
        try {
            const { code, redirect_uri } = req.body;

            if (!code || !redirect_uri) {
                return res.status(400).json({
                    error: "code and redirect_uri are required"
                });
            }

            const tokens = await exchangeCodeForTokens(code, redirect_uri);

            res.json({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_in: tokens.expires_in,
                token_type: tokens.token_type || "Bearer",
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to exchange code for tokens",
                message: error.message
            });
        }
    }

    /**
     * Refresh access token
     * POST /api/v1/docusign/refresh
     * Body: { refresh_token: string }
     */
    static async refreshToken(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return res.status(400).json({
                    error: "refresh_token is required"
                });
            }

            const tokens = await refreshAccessToken(refresh_token);

            res.json({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || refresh_token,
                expires_in: tokens.expires_in,
                token_type: tokens.token_type || "Bearer",
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to refresh token",
                message: error.message
            });
        }
    }

    /**
     * Send envelope
     * POST /api/v1/docusign/envelopes
     * Headers: { Authorization: "Bearer <access_token>" }
     * Body: { emailSubject, signers, documentBase64?, documentName?, documentExtension?, templateId? }
     */
    static async sendEnvelope(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required"
                });
            }

            const accessToken = authHeader.substring(7);
            const {
                emailSubject,
                emailBody,
                status,
                signers,
                signerMessage,
                documentBase64,
                documentName,
                documentExtension,
                templateId,
                ccRecipients,
                expiryDays,
                reminderDays,
                allowDecline,
                allowReassign,
            } = req.body;

            if (!emailSubject) {
                return res.status(400).json({ error: "emailSubject is required" });
            }

            if (!signers || !Array.isArray(signers) || signers.length === 0) {
                return res.status(400).json({ error: "signers array is required and must not be empty" });
            }

            if (!documentBase64 && !templateId) {
                return res.status(400).json({ error: "Either documentBase64 or templateId is required" });
            }

            const result = await sendEnvelope({
                emailSubject,
                emailBody,
                status,
                signers,
                signerMessage,
                documentBase64,
                documentName,
                documentExtension,
                templateId,
                ccRecipients,
                expiryDays,
                reminderDays,
                allowDecline,
                allowReassign,
                accessToken,
            });

            res.json({
                envelopeId: result.envelopeId,
                status: result.status,
                statusDateTime: result.statusDateTime,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to send envelope",
                message: error.message
            });
        }
    }

    /**
     * Get envelope status
     * GET /api/v1/docusign/envelopes/:envelopeId
     * Headers: { Authorization: "Bearer <access_token>" }
     */
    static async getEnvelopeStatus(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required"
                });
            }

            const accessToken = authHeader.substring(7);
            const { envelopeId } = req.params as { envelopeId: string };

            if (!envelopeId) {
                return res.status(400).json({ error: "envelopeId is required" });
            }

            const result = await getEnvelopeStatus(envelopeId, accessToken);

            res.json({
                envelopeId: result.envelopeId,
                status: result.status,
                emailSubject: result.emailSubject,
                sentDateTime: result.sentDateTime,
                completedDateTime: result.completedDateTime,
                declinedDateTime: result.declinedDateTime,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to get envelope status",
                message: error.message
            });
        }
    }

    /**
     * List envelopes
     * GET /api/v1/docusign/envelopes
     * Headers: { Authorization: "Bearer <access_token>" }
     * Query: { status?, fromDate?, toDate?, count? }
     */
    static async listEnvelopes(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Authorization header with Bearer token is required" });
            }

            const accessToken = authHeader.substring(7);
            const { status, fromDate, toDate, count } = req.query;

            const result = await listEnvelopes(accessToken, {
                status: status as any,
                fromDate: fromDate as string,
                toDate: toDate as string,
                count: count ? Number(count) : undefined,
            });

            res.json({
                envelopes: result.envelopes || [],
                totalSetSize: result.totalSetSize,
                resultSetSize: result.resultSetSize,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to list envelopes",
                message: error.message
            });
        }
    }

    /**
     * Get envelope recipients
     * GET /api/v1/docusign/envelopes/:envelopeId/recipients
     * Headers: { Authorization: "Bearer <access_token>" }
     */
    static async getEnvelopeRecipients(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Authorization header with Bearer token is required" });
            }

            const accessToken = authHeader.substring(7);
            const { envelopeId } = req.params as { envelopeId: string };

            if (!envelopeId) {
                return res.status(400).json({ error: "envelopeId is required" });
            }

            const result = await getEnvelopeRecipients(envelopeId, accessToken);

            res.json({
                signers: result.signers || [],
                carbonCopies: result.carbonCopies || [],
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to get envelope recipients",
                message: error.message
            });
        }
    }

    /**
     * Void envelope
     * PUT /api/v1/docusign/envelopes/:envelopeId/void
     * Headers: { Authorization: "Bearer <access_token>" }
     * Body: { voidReason: string }
     */
    static async voidEnvelope(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Authorization header with Bearer token is required" });
            }

            const accessToken = authHeader.substring(7);
            const { envelopeId } = req.params as { envelopeId: string };
            const { voidReason } = req.body;

            if (!envelopeId) {
                return res.status(400).json({ error: "envelopeId is required" });
            }

            if (!voidReason) {
                return res.status(400).json({ error: "voidReason is required" });
            }

            const result = await voidEnvelope(envelopeId, voidReason, accessToken);

            res.json({
                envelopeId: result.envelopeId,
                status: result.status,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to void envelope",
                message: error.message
            });
        }
    }

    /**
     * List templates
     * GET /api/v1/docusign/templates
     * Headers: { Authorization: "Bearer <access_token>" }
     * Query: { searchText?, count? }
     */
    static async listTemplates(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Authorization header with Bearer token is required" });
            }

            const accessToken = authHeader.substring(7);
            const { searchText, count } = req.query;

            const result = await listTemplates(accessToken, {
                searchText: searchText as string,
                count: count ? Number(count) : undefined,
            });

            res.json({
                templates: result.envelopeTemplates || [],
                totalSetSize: result.totalSetSize,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to list templates",
                message: error.message
            });
        }
    }

    /**
     * Webhook handler
     * POST /api/v1/docusign/webhook
     */
    static async handleWebhook(req: Request, res: Response) {
        try {
            // Step 1 — Verify HMAC signature
            const hmacSecret = env.DOCUSIGN_WEBHOOK_SECRET;

            if (hmacSecret) {
                const signature = req.headers["x-docusign-signature-1"] as string;

                if (!signature) {
                    return res.status(401).json({ error: "Missing DocuSign signature header" });
                }

                const payload = JSON.stringify(req.body);
                const computedSignature = crypto
                    .createHmac("sha256", hmacSecret)
                    .update(payload)
                    .digest("base64");

                if (computedSignature !== signature) {
                    return res.status(401).json({ error: "Invalid webhook signature" });
                }
            }

            // Step 2 — Extract event details
            const event = req.body;
            const envelopeId = event?.data?.envelopeId || event?.envelopeId;
            const eventType = event?.event || event?.status;

            console.log(`DocuSign webhook received: ${eventType} for envelope ${envelopeId}`);

            // Step 3 — Forward to their backend
            const forwardUrl = env.DOCUSIGN_FORWARD_URL;

            if (forwardUrl) {
                await axios.post(forwardUrl, {
                    envelopeId,
                    eventType,
                    raw: event,
                }, {
                    headers: { "Content-Type": "application/json" },
                    timeout: 5000,
                });
            }

            // Step 4 — Always return 200 to DocuSign quickly
            res.status(200).json({ received: true });
        } catch (error: any) {
            console.error("Webhook error:", error.message);
            // Still return 200 so DocuSign doesn't retry
            res.status(200).json({ received: true });
        }
    }
}
