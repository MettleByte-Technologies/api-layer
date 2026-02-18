import { Request, Response } from "express";
import CalendlyOAuthService from "../services/providers/calendly/calendly.auth";
import { validateUrl } from "../utils/validator";
import { CalendlyAuthRequest, CalendlyExchangeCodeRequest } from "../interfaces/calendly.interface";
import { CalendlyCalendarService } from "../services/providers/calendly/calendly.calendar";

export class CalendlyController {

    //connect to Calendly and get auth URL
    static connect(req: Request, res: Response) {
        try {
            const validUrl = validateUrl(req.body.redirect_uri);
            if (!validUrl || !req.body.redirect_uri) {
                return res.status(400).json({
                    error: "Invalid redirect_uri. Must be a valid URL.",
                });
            }
            const request = req.body as CalendlyAuthRequest;
            const calendlyOAuthService = new CalendlyOAuthService();

            const authResponse = calendlyOAuthService.getAuthorizationUrl(request);
            res.status(200).json(authResponse);
        } catch (error) {
            res.status(500).json({ error: "Failed to generate authorization URL" });
        }
    }

    static async getAccessToken(req: Request, res: Response) {
        try {
            const request = req.body as CalendlyExchangeCodeRequest;
            const calendlyOAuthService = new CalendlyOAuthService();
            const tokenResponse = await calendlyOAuthService.getAccessToken(request);
            res.status(200).json(tokenResponse);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve access token", message: (error as Error).message });
        }
    }

    static async refreshAccessToken(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;
            if (!refresh_token) {
                return res.status(400).json({ error: "refresh_token is required" });
            }
            const calendlyOAuthService = new CalendlyOAuthService();
            const tokenResponse = await calendlyOAuthService.refreshAccessToken(refresh_token);
            res.status(200).json(tokenResponse);
        } catch (error) {
            res.status(500).json({ error: "Failed to refresh access token", message: (error as Error).message });

        }
    }

    static async revokeConnection(req: Request, res: Response) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: "token is required" });
            }
            const calendlyOAuthService = new CalendlyOAuthService();
            await calendlyOAuthService.revokeConnection(token);
            res.status(200).json({ message: "Connection revoked successfully" });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to revoke connection", message: (error as Error).message });
        }
    }

    static async getEventTypes(req: Request, res: Response) {
        try {
            const { token } = req.headers.authorization ?   { token: req.headers.authorization.replace("Bearer ", "") } : {};
            if (!token) {
                return res.status(400).json({ error: "token is required" });
            }
            const calendlyCalendarService = new CalendlyCalendarService();
            const eventTypes = await calendlyCalendarService.getUserEventTypes(token);
            res.status(200).json(eventTypes);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve event types", message: (error as Error).message });
        }
    }
}