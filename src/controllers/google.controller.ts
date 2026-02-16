import { Request, Response } from "express";
import {
    generateAuthUrl,
    exchangeCodeForTokens,
    refreshAccessToken,
} from "../services/providers/google/google.auth";
import { GoogleCalendarService } from "../services/providers/google/google.calendar";

export class GoogleController {
    /**
     * Connect - Generate auth URL with redirect_uri
     * POST /api/v1/google/connect
     * Body: { redirect_uri: string }
     */
    static connect(req: Request, res: Response) {
        try {
            const { redirect_uri } = req.body;

            if (!redirect_uri) {
                return res.status(400).json({ 
                    error: "redirect_uri is required in request body",
                    example: { redirect_uri: "http://localhost:8080/callback" }
                });
            }

            // Validate redirect_uri format
            if (typeof redirect_uri !== "string" || !redirect_uri.startsWith("http")) {
                return res.status(400).json({ 
                    error: "redirect_uri must be a valid URL starting with http:// or https://",
                    received: redirect_uri,
                    example: { redirect_uri: "http://localhost:8080/callback" }
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
            const calendarId = req.query.calendarId as string || "primary";
            const timeMin = req.query.timeMin as string; // Get events starting from now
            const timeMax = req.query.timeMax as string; // Optional end time
            console.log("Get events request:", {
                calendarId,
                timeMin,
                timeMax,
            });
            const events = await GoogleCalendarService.listEvents(
                accessToken,
                calendarId,
                timeMin,
                timeMax
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
            const { title, description, start, end, attendees, calendarId } = req.body;

            if (!title || !start || !end) {
                return res.status(400).json({ 
                    error: "title, start, and end are required" 
                });
            }

            const googleEvent = {
                summary: title,
                description: description || "",
                start: { dateTime: start, timeZone: "UTC" },
                end: { dateTime: end, timeZone: "UTC" },
                attendees: attendees?.map((email: string) => ({ email })) || [],
            };

            const result = await GoogleCalendarService.createEvent(
                accessToken,
                calendarId || "primary",
                googleEvent
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