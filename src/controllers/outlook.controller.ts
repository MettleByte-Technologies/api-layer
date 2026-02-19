import { Request, Response } from "express";
import outlookOAuthService from "../services/providers/outlook/outlook.auth";
import outlookCalendarService from "../services/providers/outlook/outlook.calendar";
import { OutlookEvent } from "../interfaces/outlook.interface";
import { ValidationError, requireBearerToken, requireString, requireUrlString } from "../utils/validator";
export class OutlookController {
  static connect(req: Request, res: Response) {
    try {
      const redirect_uri = requireUrlString(req.body?.redirect_uri, "redirect_uri");
      const authUrl = outlookOAuthService.getAuthorizationUrl(redirect_uri);
      res.json({ authUrl });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getAccessToken(req: Request, res: Response) {
    try {
      const code = requireString(req.body?.code, "code");
      const redirect_uri = requireUrlString(req.body?.redirect_uri, "redirect_uri");
      const tokenResponse = await outlookOAuthService.getAccessToken(code, redirect_uri);
      res.json(tokenResponse);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getCalendars(req: Request, res: Response) {
    try {
      const accessToken = requireBearerToken(req.headers.authorization);
      const calendars = await outlookCalendarService.getCalendars(accessToken);
      res.json(calendars);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getEvents(req: Request, res: Response) {
    try {
      const accessToken = requireBearerToken(req.headers.authorization);
      const calendarId = (req.query.calendarId as string) || undefined;
      const events = await outlookCalendarService.getEvents(accessToken, calendarId);
      res.json(events);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      const accessToken = requireBearerToken(req.headers.authorization);

      const event = req.body as OutlookEvent;
      const calendarId = (req.query.calendarId as string) || "primary";
      const createdEvent = await outlookCalendarService.createEvent(accessToken, calendarId, event);
      res.json(createdEvent);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const refresh_token = requireString(req.body?.refresh_token, "refresh_token");
      const tokenResponse = await outlookOAuthService.refreshAccessToken(refresh_token);
      res.json(tokenResponse);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}