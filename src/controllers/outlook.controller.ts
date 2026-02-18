import { Request, Response } from "express";
import outlookOAuthService from "../services/providers/outlook/outlook.auth";
import outlookCalendarService from "../services/providers/outlook/outlook.calendar";
import { OutlookEvent } from "../interfaces/outlook.interface";
export class OutlookController {
  static connect(req: Request, res: Response) {
    const { redirect_uri } = req.body;
    console.log("Received redirect_uri:", redirect_uri);
    const authUrl = outlookOAuthService.getAuthorizationUrl(redirect_uri);
    console.log("Generated Outlook auth URL:", authUrl);
    res.json({ authUrl });
  }

  static async getAccessToken(req: Request, res: Response) {
    try {
      const { code, redirect_uri } = req.body;      
      const tokenResponse = await outlookOAuthService.getAccessToken(code, redirect_uri);
      res.json(tokenResponse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCalendars(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
      const calendars = await outlookCalendarService.getCalendars(accessToken);
      res.json(calendars);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getEvents(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
      const calendarId = (req.query.calendarId as string) || undefined;
      const events = await outlookCalendarService.getEvents(accessToken, calendarId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

      const event = req.body as OutlookEvent;
      const calendarId = (req.query.calendarId as string) || "primary";
      const createdEvent = await outlookCalendarService.createEvent(accessToken, calendarId, event);
      res.json(createdEvent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      const tokenResponse = await outlookOAuthService.refreshAccessToken(refresh_token);
      res.json(tokenResponse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}