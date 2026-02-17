import { Request, Response } from "express";
import {
    generateAuthUrl,
    exchangeCodeForTokens,
    refreshAccessToken,
} from "../services/providers/google/google.auth";
import { GoogleCalendarService } from "../services/providers/google/google.calendar";
import {ConnectRequest, ConnectResponse, AccessTokenRequest, AccessTokenResponse, CreateEventRequest, GetEventsRequest } from "../interfaces/google.interface";

export class GoogleController {
    /**
     * Connect - Generate auth URL with redirect_uri
     * POST /api/v1/google/connect
     * Body: { redirect_uri: string }
     */
    static connect(req: Request, res: Response) {
        try {
            const { redirect_uri } = req.body;
            const connectRequest = req.body as ConnectRequest;
            if (!connectRequest) {
                return res.status(400).json({
                    error: "redirect_uri is required in request body",
                    example: { redirect_uri: "http://localhost:8080/callback" }
                });
            }

            // Validate redirect_uri format
            if (typeof connectRequest.redirectUri !== "string" || !connectRequest.redirectUri.startsWith("http")) {
                return res.status(400).json({
                    error: "redirect_uri must be a valid URL starting with http:// or https://",
                    received: connectRequest.redirectUri,
                    example: { redirect_uri: "http://localhost:8080/callback" }
                });
            }

            const authUrl = generateAuthUrl(connectRequest);
            res.json(authUrl);
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to generate auth URL",
                message: error.message
            });
        }
    }

    /**
     * Get access token from code
     * POST /api/v1/google/token
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
                expiry_date: tokens.expiry_date,
                token_type: tokens.token_type || "Bearer",
                scope: tokens.scope,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to exchange code for tokens",
                message: error.message
            });
        }
    }

    /**
     * Get all calendars
     * GET /api/v1/google/calendars
     * Headers: { Authorization: "Bearer <access_token>" }
     */
    static async getCalendars(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required"
                });
            }

            const accessToken = authHeader.substring(7);
            const calendars = await GoogleCalendarService.getCalendars(accessToken);

            res.json({ calendars });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to get calendars",
                message: error.message
            });
        }
    }

    /**
     * Get all events from a calendar
     * GET /api/v1/google/events?calendarId=primary
     * Headers: { Authorization: "Bearer <access_token>" }
     */
    static async getEvents(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required"
                });
            }



            const accessToken = authHeader.substring(7);

            const params: GetEventsRequest = {
                calendarId: req.query.calendarId as string || "primary",
                timeMin: req.query.timeMin as string,
                timeMax: req.query.timeMax as string,
                maxResults: req.query.maxResults ? Number(req.query.maxResults) : undefined,
                pageToken: req.query.pageToken as string,
                singleEvents: req.query.singleEvents === "true",
                orderBy: req.query.orderBy as "startTime" | "updated",
                showDeleted: req.query.showDeleted === "true",
                showHiddenInvitations: req.query.showHiddenInvitations === "true",
                q: req.query.q as string,
            };

            const events = await GoogleCalendarService.listEvents(
                accessToken,
                params
            );

            res.json({ events });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to get events",
                message: error.message
            });
        }
    }

    /**
     * Create an event
     * POST /api/v1/google/events
     * Headers: { Authorization: "Bearer <access_token>" }
     * Body: { title, description, start, end, attendees, calendarId }
     */
    static async createEvent(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required"
                });
            }

            const accessToken = authHeader.substring(7);
            // const { title, description, start, end, attendees, calendarId } = req.body;
            const eventRequest = req.body as CreateEventRequest;
            
            // if (!title || !start || !end) {
            //     return res.status(400).json({
            //         error: "title, start, and end are required"
            //     });
            // }

            // const googleEvent = {
            //     summary: title,
            //     description: description || "",
            //     start: { dateTime: start },
            //     end: { dateTime: end },
            //     attendees: attendees?.map((email: string) => ({ email })) || [],
            // };

            const result = await GoogleCalendarService.createEvent(
                accessToken,
                eventRequest.calendarId || "primary",
                eventRequest.event
            );

            res.json({ event: result });
        } catch (error: any) {
            console.error("Error creating event:", error);
            res.status(500).json({
                error: "Failed to create event",
                message: error.message
            });
        }
    }

    /**
     * Refresh access token
     * POST /api/v1/google/refresh
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

            const credentials = await refreshAccessToken(refresh_token);

            res.json({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || refresh_token,
                expiry_date: credentials.expiry_date,
                token_type: credentials.token_type || "Bearer",
                scope: credentials.scope,
            });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to refresh token",
                message: error.message
            });
        }
    }
}