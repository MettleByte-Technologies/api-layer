import axios, { AxiosInstance } from "axios";
import { env } from "../../../config/env";
import { OutlookEvent, OutlookCalendarList } from "../../../interfaces/outlook.interface";

// export interface OutlookEvent {
//   subject: string;
//   body?: {
//     contentType: "HTML" | "Text";
//     content: string;
//   };
//   start: {
//     dateTime: string;
//     timeZone: string;
//   };
//   end: {
//     dateTime: string;
//     timeZone: string;
//   };
//   attendees?: Array<{
//     emailAddress: {
//       address: string;
//       name: string;
//     };
//     type: "required" | "optional" | "resource";
//     status: {
//       response: string;
//       time: string;
//     };
//   }>;
//   categories?: string[];
//   isReminderOn?: boolean;
//   reminderMinutesBeforeStart?: number;
//   isAllDay?: boolean;
//   recurrence?: {
//     pattern: {
//       type: string;
//       interval: number;
//       month?: number;
//       dayOfMonth?: number;
//       daysOfWeek?: string[];
//       firstDayOfWeek?: string;
//     };
//     recurrenceTimeZone: string;
//     numberOfOccurrences?: number;
//     range: {
//       type: string;
//       startDate: string;
//       endDate?: string;
//       recurrenceTimeZone: string;
//     };
//   };
// }

// export interface OutlookCalendarList {
//   value: Array<{
//     id: string;
//     name: string;
//     isDefaultCalendar: boolean;
//   }>;
// }

export class OutlookCalendarService {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: env.OUTLOOK_API_BASE_URL || "https://graph.microsoft.com/v1.0",
    });
  }

  /**
   * Get all calendars for the user
   */
  async getCalendars(accessToken: string): Promise<OutlookCalendarList> {
    try {
      const response = await this.httpClient.get("/me/calendars", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch calendars: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Get events from a specific calendar
   */
  async getEvents(
    accessToken: string,
    calendarId: string = "calendar",
    options?: {
      startDateTime?: string;
      endDateTime?: string;
      top?: number;
    }
  ): Promise<{ value: OutlookEvent[] }> {
    try {
      let url = `/me/calendars/${calendarId}/events`;
      const params: any = {};

      if (options?.top) {
        params.$top = options.top;
      }

      if (options?.startDateTime && options?.endDateTime) {
        params.$filter = `start/dateTime ge '${options.startDateTime}' and end/dateTime le '${options.endDateTime}'`;
      }

      const response = await this.httpClient.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch events: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Get a specific event
   */
  async getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<OutlookEvent> {
    try {
      const response = await this.httpClient.get(
        `/me/calendars/${calendarId}/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch event: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Create a new event
   */
  async createEvent(
    accessToken: string,
    calendarId: string,
    event: OutlookEvent
  ): Promise<OutlookEvent> {
    try {
        console.log("Creating event with data:", {
            calendarId,
            event,
        });
      const url = calendarId === "primary" ? `/me/events` : `/me/calendars/${calendarId}/events`;
      const response = await this.httpClient.post(
        url,
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to create event: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    event: Partial<OutlookEvent>
  ): Promise<OutlookEvent> {
    try {
      const response = await this.httpClient.patch(
        `/me/calendars/${calendarId}/events/${eventId}`,
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to update event: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<void> {
    try {
      await this.httpClient.delete(
        `/me/calendars/${calendarId}/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error: any) {
      throw new Error(
        `Failed to delete event: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Search for events
   */
  async searchEvents(
    accessToken: string,
    calendarId: string,
    searchQuery: string
  ): Promise<{ value: OutlookEvent[] }> {
    try {
      const response = await this.httpClient.get(
        `/me/calendars/${calendarId}/events`,
        {
          params: {
            $search: `"${searchQuery}"`,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to search events: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }
}

export default new OutlookCalendarService();