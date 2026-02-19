import { Request, Response } from "express";
import {
    exchangeCodeForTokens,
    generateAuthUrl,
    refreshAccessToken,
    revokeConnection
} from "../services/providers/google/google.auth";
import { GoogleCalendarService } from "../services/providers/google/google.calendar";
import { ConnectRequest, CreateEventRequest, GetEventsRequest } from "../interfaces/google.interface";
import { ValidationError, requireBearerToken, requireString, requireUrlString } from "../utils/validator";

export class GoogleController {

    //connect to Google and get auth URL
    static connect(req: Request, res: Response) {
        try {
            const connectRequest = req.body as ConnectRequest;
            const redirectUri = connectRequest?.redirect_uri ?? connectRequest?.redirectUri;
            requireUrlString(redirectUri, "redirect_uri");

            res.json(generateAuthUrl({ ...connectRequest, redirect_uri: redirectUri }));
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to generate auth URL",
                message: error.message,
            });
        }
    }

    //exchange authorization code for access token
    static async getAccessToken(req: Request, res: Response) {
        try {
            const code = requireString(req.body?.code, "code");
            const redirect_uri = requireUrlString(req.body?.redirect_uri, "redirect_uri");

            const tokens = await exchangeCodeForTokens(code, redirect_uri);

            res.json({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date,
                token_type: tokens.token_type || "Bearer",
                scope: tokens.scope,
            });
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to exchange code for tokens",
                message: error.message,
            });
        }
    }

    //refresh access token using refresh token
    static async getCalendars(req: Request, res: Response) {
        try {
            const accessToken = requireBearerToken(req.headers.authorization);
            const calendars = await GoogleCalendarService.getCalendars(accessToken);

            res.json({ calendars });
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to get calendars",
                message: error.message,
            });
        }
    }

    //get events from a calendar
    static async getEvents(req: Request, res: Response) {
        try {
            const accessToken = requireBearerToken(req.headers.authorization);

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
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to get events",
                message: error.message,
            });
        }
    }

    //create an event in a calendar
    static async createEvent(req: Request, res: Response) {
        try {
            const accessToken = requireBearerToken(req.headers.authorization);
            const eventRequest = req.body as CreateEventRequest;

            const result = await GoogleCalendarService.createEvent(
                accessToken,
                eventRequest.calendarId || "primary",
                eventRequest.event
            );

            res.json({ event: result });
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to create event",
                message: error.message,
            });
        }
    }

    //refresh access token using refresh token
    static async refreshToken(req: Request, res: Response) {
        try {
            const refresh_token = requireString(req.body?.refresh_token, "refresh_token");

            const credentials = await refreshAccessToken(refresh_token);

            res.json({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || refresh_token,
                expiry_date: credentials.expiry_date,
                token_type: credentials.token_type || "Bearer",
                scope: credentials.scope,
            });
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to refresh token",
                message: error.message,
            });
        }
    }

    static async revokeConnection(req: Request, res: Response) {
        try {
            const accessToken = requireBearerToken(req.headers.authorization);

            const result = await revokeConnection(accessToken);

            res.json({ message: "Successfully revoked connection", result });
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({
                error: "Failed to revoke connection",
                message: error.message,
            });
        }
    }
}