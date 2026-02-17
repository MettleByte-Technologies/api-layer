import { Request, Response } from "express";
import {
    exchangeCodeForTokens,
    generateAuthUrl,
    refreshAccessToken,
    revokeConnection
} from "../services/providers/google/google.auth";
import { GoogleCalendarService } from "../services/providers/google/google.calendar";
import { ConnectRequest, CreateEventRequest, GetEventsRequest } from "../interfaces/google.interface";

export class GoogleController {

    //connect to Google and get auth URL
    static connect(req: Request, res: Response) {
        try {
            const connectRequest = req.body as ConnectRequest;
            const redirectUri = connectRequest?.redirect_uri ?? connectRequest?.redirectUri;

            if (!redirectUri) {
                return res.status(400).json({
                    error: "redirect_uri is required in request body",
                    example: { redirect_uri: "http://localhost:8080/google/callback" },
                });
            }

            if (typeof redirectUri !== "string" || !redirectUri.startsWith("http")) {
                return res.status(400).json({
                    error: "redirect_uri must be a valid URL starting with http:// or https://",
                    received: redirectUri,
                    example: { redirect_uri: "http://localhost:8080/google/callback" },
                });
            }

            res.json(generateAuthUrl({ ...connectRequest, redirect_uri: redirectUri }));
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to generate auth URL",
                message: error.message,
            });
        }
    }

    //exchange authorization code for access token
    static async getAccessToken(req: Request, res: Response) {
        try {
            const { code, redirect_uri } = req.body;

            if (!code || !redirect_uri) {
                return res.status(400).json({
                    error: "code and redirect_uri are required",
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
                message: error.message,
            });
        }
    }

    //refresh access token using refresh token
    static async getCalendars(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required",
                });
            }

            const accessToken = authHeader.substring(7);
            const calendars = await GoogleCalendarService.getCalendars(accessToken);

            res.json({ calendars });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to get calendars",
                message: error.message,
            });
        }
    }

    //get events from a calendar
    static async getEvents(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required",
                });
            }

            const accessToken = authHeader.substring(7);

            const params: GetEventsRequest = {
                calendarId: (req.query.calendarId as string) || "primary",
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

            const events = await GoogleCalendarService.listEvents(accessToken, params);

            res.json({ events });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to get events",
                message: error.message,
            });
        }
    }

    //create an event in a calendar
    static async createEvent(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required",
                });
            }

            const accessToken = authHeader.substring(7);
            const eventRequest = req.body as CreateEventRequest;

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
                message: error.message,
            });
        }
    }

    //refresh access token using refresh token
    static async refreshToken(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return res.status(400).json({
                    error: "refresh_token is required",
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
                message: error.message,
            });
        }
    }

    static async revokeConnection(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    error: "Authorization header with Bearer token is required",
                });
            }

            const accessToken = authHeader.substring(7);

            const result = await revokeConnection(accessToken);

            res.json({ message: "Successfully revoked connection", result });
        } catch (error: any) {
            res.status(500).json({
                error: "Failed to revoke connection",
                message: error.message,
            });
        }
    }
}