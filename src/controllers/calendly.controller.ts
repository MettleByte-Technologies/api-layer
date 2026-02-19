import { Request, Response } from "express";
import CalendlyOAuthService from "../services/providers/calendly/calendly.auth";
import {
    ValidationError,
    requireBearerToken,
    requireEmail,
    requireString,
    requireUrlString
} from "../utils/validator";
import { 
    CalendlyAuthRequest, 
    CalendlyEventTypeRequest, 
    CalendlyExchangeCodeRequest, 
    CalendlyScheduledEventsRequest,
    CalendlyCreateInviteeRequest
} from "../interfaces/calendly.interface";
import { CalendlyCalendarService } from "../services/providers/calendly/calendly.calendar";

export class CalendlyController {

    //connect to Calendly and get auth URL
    static connect(req: Request, res: Response) {
        try {
            requireUrlString(req.body?.redirect_uri, "redirect_uri");
            const request = req.body as CalendlyAuthRequest;
            const calendlyOAuthService = new CalendlyOAuthService();

            const authResponse = calendlyOAuthService.getAuthorizationUrl(request);
            res.status(200).json(authResponse);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to generate authorization URL" });
        }
    }

    static async getAccessToken(req: Request, res: Response) {
        try {
            const request = req.body as CalendlyExchangeCodeRequest;
            requireString(request?.code, "code");
            if (request?.redirect_uri !== undefined) {
                requireUrlString(request.redirect_uri, "redirect_uri");
            }
            const calendlyOAuthService = new CalendlyOAuthService();
            const tokenResponse = await calendlyOAuthService.getAccessToken(request);
            res.status(200).json(tokenResponse);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to retrieve access token", message: (error as Error).message });
        }
    }

    static async refreshAccessToken(req: Request, res: Response) {
        try {
            const refresh_token = requireString(req.body?.refresh_token, "refresh_token");
            const calendlyOAuthService = new CalendlyOAuthService();
            const tokenResponse = await calendlyOAuthService.refreshAccessToken(refresh_token);
            res.status(200).json(tokenResponse);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to refresh access token", message: (error as Error).message });

        }
    }

    static async revokeConnection(req: Request, res: Response) {
        try {
            const accessToken = requireBearerToken(req.headers.authorization);
            const calendlyOAuthService = new CalendlyOAuthService();
            await calendlyOAuthService.revokeConnection(accessToken);
            res.status(200).json({ message: "Connection revoked successfully" });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to revoke connection", message: (error as Error).message });
        }
    }

    static async getEventTypes(req: Request, res: Response) {
        try {
            const token = requireBearerToken(req.headers.authorization);
            const params = req.query as CalendlyEventTypeRequest;
            const calendlyCalendarService = new CalendlyCalendarService();
            const eventTypes = await calendlyCalendarService.getUserEventTypes(token, params);
            res.status(200).json(eventTypes);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to retrieve event types", message: (error as Error).message });
        }
    }

    static async listEvents(req: Request, res: Response) {
        try {
            const token = requireBearerToken(req.headers.authorization);
            const params = req.query as CalendlyScheduledEventsRequest;
            const calendlyCalendarService = new CalendlyCalendarService();
            const events = await calendlyCalendarService.listEvents(token, params);
            res.status(200).json(events);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(401).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to list events", message: (error as Error).message });
        }
    }

    static async createInvitee(req: Request, res: Response) {
        try {
            const token = requireBearerToken(req.headers.authorization);
            const request = req.body as CalendlyCreateInviteeRequest;
            
            requireString(request?.event_type, "event_type");
            requireString(request?.start_time, "start_time");
            requireEmail(request?.invitee?.email, "invitee.email");

            const calendlyCalendarService = new CalendlyCalendarService();
            const invitee = await calendlyCalendarService.createInvitee(token, request);
            res.status(201).json(invitee);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to create invitee", message: (error as Error).message });
        }
    }
}