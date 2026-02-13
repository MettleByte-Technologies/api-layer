import { Request, Response } from "express";
import { generateAuthUrl } from "../services/providers/google/google.auth";
import { GoogleCalendarService } from "../services/providers/google/google.calendar";
import { TokenUtil } from "../utils/token.util";
import { IntegrationLogger } from "../utils/integration-logger";

export class GoogleController {
  static async connect(req: Request, res: Response) {
    const { userId } = req.params;

    const url = generateAuthUrl(userId as string);

    await IntegrationLogger.success({
      userId: userId as string,
      provider: "google",
      action: "connect_start",
      requestPayload: { params: req.params },
      responsePayload: { authUrl: url },
    });

    res.json({ authUrl: url });
  }

  // Get user's Google Calendars
  static async getCalendars(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const accessToken = await TokenUtil.getValidGoogleToken(userId as string);

      const calendars = await GoogleCalendarService.getCalendars(accessToken);

      await IntegrationLogger.success({
        userId: userId as string,
        provider: "google",
        action: "list_calendars",
        requestPayload: { params: req.params },
        responsePayload: { count: calendars?.length },
      });

      res.json(calendars);
    } catch (error) {
      await IntegrationLogger.error({
        userId: userId as string,
        provider: "google",
        action: "list_calendars",
        requestPayload: { params: req.params },
        error,
      });

      res.status(500).json({ message: "Failed to get Google calendars" });
    }
  }

  // List calendar events
  static async listEvents(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const accessToken = await TokenUtil.getValidGoogleToken(userId as string);

      const events = await GoogleCalendarService.listEvents(
        accessToken,
        "primary"
      );

      await IntegrationLogger.success({
        userId: userId as string,
        provider: "google",
        action: "list_events",
        requestPayload: { params: req.params },
        responsePayload: { count: events?.length },
      });

      res.json(events);
    } catch (error) {
      await IntegrationLogger.error({
        userId: userId as string,
        provider: "google",
        action: "list_events",
        requestPayload: { params: req.params },
        error,
      });

      res.status(500).json({ message: "Failed to list Google events" });
    }
  }

  // Create a calendar event
  static async createEvent(req: Request, res: Response) {
    const { userId } = req.params;
    const { title, description, start, end, attendees } = req.body;

    try {
      const accessToken = await TokenUtil.getValidGoogleToken(userId as string);

      const googleEvent = {
        summary: title,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
        attendees: attendees?.map((email: string) => ({ email })),
      };

      const result = await GoogleCalendarService.createEvent(
        accessToken,
        "primary",
        googleEvent
      );

      await IntegrationLogger.success({
        userId: userId as string,
        provider: "google",
        action: "create_event",
        requestPayload: { params: req.params, body: { title, start, end } },
        responsePayload: { eventId: (result as any).id },
      });

      res.json(result);
    } catch (error) {
      await IntegrationLogger.error({
        userId: userId as string,
        provider: "google",
        action: "create_event",
        requestPayload: { params: req.params, body: { title, start, end } },
        error,
      });

      res.status(500).json({ message: "Failed to create Google event" });
    }
  }
}