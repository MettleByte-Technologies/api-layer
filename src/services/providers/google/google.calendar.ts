import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env";
import { CreateEventRequest, CreateEventResponse, GetEventsRequest, GetEventsResponse } from "../../../interfaces/google.interface";

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
    getEventsRequest: GetEventsRequest
  ) : Promise<GetEventsResponse> {
    const calendar = createCalendarClient(accessToken);
    const params: any = {
      calendarId: getEventsRequest.calendarId,
      singleEvents: true,
      orderBy: "startTime",
    };

    if (getEventsRequest.timeMin) {
      params.timeMin = getEventsRequest.timeMin;
    }

    if (getEventsRequest.timeMax) {
      params.timeMax = getEventsRequest.timeMax;
    }

    if (getEventsRequest.maxResults) {
      params.maxResults = getEventsRequest.maxResults;
    }

    if (getEventsRequest.pageToken) {
      params.pageToken = getEventsRequest.pageToken;
    }

    if (getEventsRequest.showDeleted !== undefined) {
      params.showDeleted = getEventsRequest.showDeleted;
    }

    if (getEventsRequest.showHiddenInvitations !== undefined) {
      params.showHiddenInvitations = getEventsRequest.showHiddenInvitations;
    }

    if (getEventsRequest.q) {
      params.q = getEventsRequest.q;
    }
    const response = await calendar.events.list(params);
    console.log("List events response:", {
      calendarId: getEventsRequest.calendarId,
      timeMin: getEventsRequest.timeMin,  
      timeMax: getEventsRequest.timeMax,
    });

    return response.data as GetEventsResponse;
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
    eventData: CreateEventRequest["event"]
  ) : Promise<CreateEventResponse> {
    const calendar = createCalendarClient(accessToken);

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });
    console.log("Created event:", response.data);
    return response.data as CreateEventResponse;
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