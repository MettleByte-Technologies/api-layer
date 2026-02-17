export interface OutlookTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface OutlookUserProfile {
  id: string;
  displayName: string;
  mail: string;
}

export interface OutlookEvent {
  subject: string;
  body?: {
    contentType: "HTML" | "Text";
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
    type: "required" | "optional" | "resource";
    status: {
      response: string;
      time: string;
    };
  }>;
  categories?: string[];
  isReminderOn?: boolean;
  reminderMinutesBeforeStart?: number;
  isAllDay?: boolean;
  recurrence?: {
    pattern: {
      type: string;
      interval: number;
      month?: number;
      dayOfMonth?: number;
      daysOfWeek?: string[];
      firstDayOfWeek?: string;
    };
    recurrenceTimeZone: string;
    numberOfOccurrences?: number;
    range: {
      type: string;
      startDate: string;
      endDate?: string;
      recurrenceTimeZone: string;
    };
  };
}

export interface OutlookCalendarList {
  value: Array<{
    id: string;
    name: string;
    isDefaultCalendar: boolean;
  }>;
}