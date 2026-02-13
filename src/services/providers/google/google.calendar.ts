import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env";
import { logger } from "../../../utils/logger";

const createCalendarClient = (accessToken: string) => {
  const auth = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({ access_token: accessToken });

  return google.calendar({ version: "v3", auth });
};

export class GoogleCalendarService {
  static async getCalendars(accessToken: string) {
    logger.info("GoogleCalendarService.getCalendars called");
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.calendarList.list();

    logger.debug("GoogleCalendarService.getCalendars response", {
      itemCount: response.data.items?.length,
    });

    return response.data.items;
  }

  static async listEvents(
    accessToken: string,
    calendarId: string = "primary"
  ) {
    logger.info("GoogleCalendarService.listEvents called", { calendarId });
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.events.list({
      calendarId,
      singleEvents: true,
      orderBy: "startTime",
    });

    logger.debug("GoogleCalendarService.listEvents response", {
      itemCount: response.data.items?.length,
    });

    return response.data.items;
  }

  static async getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ) {
    logger.info("GoogleCalendarService.getEvent called", {
      calendarId,
      eventId,
    });
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    return response.data;
  }

  static async createEvent(
    accessToken: string,
    calendarId: string,
    eventData: any
  ) {
    logger.info("GoogleCalendarService.createEvent called", { calendarId });
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });

    logger.debug("GoogleCalendarService.createEvent response", {
      eventId: response.data.id,
    });

    return response.data;
  }

  static async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    eventData: any
  ) {
    logger.info("GoogleCalendarService.updateEvent called", {
      calendarId,
      eventId,
    });
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventData,
    });

    return response.data;
  }

  static async deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ) {
    logger.info("GoogleCalendarService.deleteEvent called", {
      calendarId,
      eventId,
    });
    const calendar = createCalendarClient(accessToken);

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  }
}