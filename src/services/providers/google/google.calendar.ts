import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env";
import { time } from "node:console";

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
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.calendarList.list();

    return response.data.items;
  }

  static async listEvents(
    accessToken: string,
    calendarId: string = "primary",
    timeMin?: string,
    timeMax?: string
  ) {
    const calendar = createCalendarClient(accessToken);
    const params: any = {
      calendarId,
      singleEvents: true,
      orderBy: "startTime",
    };

    if (timeMin) {
      params.timeMin = timeMin;
    }

    if (timeMax) {
      params.timeMax = timeMax;
    }
    const response = await calendar.events.list(params);
    console.log("List events response:", {
      calendarId,
      timeMin,  
      timeMax,
    });

    return response.data.items;
  }

  static async getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ) {
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
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });
    console.log("Created event:", response.data);
    return response.data;
  }

  static async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    eventData: any
  ) {
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
    const calendar = createCalendarClient(accessToken);

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  }
}