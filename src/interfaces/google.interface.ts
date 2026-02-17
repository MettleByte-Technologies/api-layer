// ============================================================================
// 1. ACCESS TOKEN REQUEST & RESPONSE
// ============================================================================

export interface ConnectRequest {
  /**
   * Preferred (project-wide) request key.
   * Kept alongside `redirectUri` for backward compatibility.
   */
  redirect_uri?: string;
  /** @deprecated Use `redirect_uri` instead. */
  redirectUri?: string;
}

export interface ConnectResponse {
  authUri: string;
}

export interface AccessTokenRequest {
  code: string;
  redirect_uri: string;
}


export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

// ============================================================================
// 2. REFRESH ACCESS TOKEN REQUEST & RESPONSE
// ============================================================================

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

// ============================================================================
// 3. GET CALENDARS REQUEST & RESPONSE
// ============================================================================

export interface GetCalendarsRequest {
  maxResults?: number;
  pageToken?: string;
  showDeleted?: boolean;
  showHidden?: boolean;
  syncToken?: string;
  minAccessRole?: "freeBusyReader" | "reader" | "writer" | "owner";
}

export interface CalendarItem {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone: string;

  summaryOverride?: string;
  dataOwner?: string;

  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;

  hidden?: boolean;
  selected?: boolean;

  accessRole: "freeBusyReader" | "reader" | "writer" | "owner";

  primary?: boolean;
  deleted?: boolean;
  autoAcceptInvitations?: boolean;

  conferenceProperties?: {
    allowedConferenceSolutionTypes: string[];
  };

  defaultReminders?: Array<{
    method: string;
    minutes: number;
  }>;

  notificationSettings?: {
    notifications: Array<{
      type: string;
      method: string;
    }>;
  };
}

export interface GetCalendarsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: CalendarItem[];
}

// ============================================================================
// 4. GET EVENTS REQUEST & RESPONSE
// ============================================================================

export interface GetEventsRequest {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  pageToken?: string;
  singleEvents?: boolean;
  orderBy?: "startTime" | "updated";
  showDeleted?: boolean;
  showHiddenInvitations?: boolean;
  q?: string;
}

export interface EventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface EventCreator {
  id?: string;
  email?: string;
  displayName?: string;
  self?: boolean;
}

export interface EventAttendee {
  id?: string;
  email?: string;
  displayName?: string;
  organizer?: boolean;
  self?: boolean;
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  comment?: string;
  additionalGuests?: number;
}

export interface EventReminder {
  method: "email" | "popup";
  minutes: number;
}

export interface EventConferenceData {
  entryPoints?: Array<{
    entryPointType: string;
    uri: string;
    label?: string;
    pin?: string;
    accessCode?: string;
    meetingCode?: string;
    passcode?: string;
  }>;

  conferenceSolution?: {
    key?: {
      type?: string;
    };
    name?: string;
    iconUri?: string;
  };

  conferenceId?: string;
  signature?: string;
  notes?: string;
}

export interface EventItem {
  kind: string;
  etag: string;
  id: string;
  status: "confirmed" | "tentative" | "cancelled";
  htmlLink: string;
  created: string;
  updated: string;

  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;

  creator: EventCreator;
  organizer: EventCreator;

  start: EventDateTime;
  end: EventDateTime;

  endTimeUnspecified?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: EventDateTime;

  transparency?: "opaque" | "transparent";
  visibility?: "public" | "private" | "confidential";

  iCalUID: string;
  sequence: number;

  attendees?: EventAttendee[];
  attendeesOmitted?: boolean;

  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };

  hangoutLink?: string;
  conferenceData?: EventConferenceData;

  anyoneCanAddSelf?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;

  privateCopy?: boolean;
  locked?: boolean;

  reminders?: {
    useDefault: boolean;
    overrides?: EventReminder[];
  };

  source?: {
    title?: string;
    url?: string;
  };

  eventType?: string;
}

export interface GetEventsResponse {
  kind: string;
  etag: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders?: EventReminder[];
  nextPageToken?: string;
  nextSyncToken?: string;
  items: EventItem[];
}

// ============================================================================
// 5. CREATE EVENT REQUEST & RESPONSE
// ============================================================================

export interface CreateEventRequest {
  calendarId?: string;
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: EventDateTime;
    end: EventDateTime;
    recurrence?: string[];

    attendees?: Array<{
      email: string;
      displayName?: string;
      optional?: boolean;
      comment?: string;
      additionalGuests?: number;
    }>;

    reminders?: {
      useDefault?: boolean;
      overrides?: EventReminder[];
    };

    conferenceData?: {
      createRequest?: {
        requestId: string;
        conferenceSolutionKey?: {
          type: "hangoutsMeet";
        };
      };
    };

    transparency?: "opaque" | "transparent";
    visibility?: "public" | "private" | "confidential";
    colorId?: string;
    guestsCanInviteOthers?: boolean;
    guestsCanModify?: boolean;
    guestsCanSeeOtherGuests?: boolean;
    anyoneCanAddSelf?: boolean;

    extendedProperties?: {
      private?: Record<string, string>;
      shared?: Record<string, string>;
    };
  };

  supportsAttachments?: boolean;
  maxAttendees?: number;
  sendUpdates?: "all" | "externalOnly" | "none";
  conferenceDataVersion?: number;
}

export interface CreateEventResponse extends EventItem {}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
}

export interface GoogleCalendarError {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
  };
}
