export interface CalendlyAuthRequest {
    redirect_uri: string;
}

export interface CalendlyAuthResponse {
    authUrl: string;
}

export interface CalendlyExchangeCodeRequest {
    code: string;
    redirect_uri?: string;
}

export interface CalendlyRefreshRequest {
    refresh_token: string;
}

export interface CalendlyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    owner: string;
    created_at: number;
    organization: string;
}

export interface CalendlyEventTypeRequest {
    user?: string;
    organization?: string;
    admin_managed?: boolean;
    user_availability_schedule?: string;
    active?: boolean;
    count?: number;
    page_token?: string;
    sort?: string;
}
export interface CalendlyProfile {
    type: string;
    name: string;
    owner: string;
}

export interface CalendlyLocation {
    kind: string;
    phone_number?: string;
    additional_info?: string;
}

export interface CalendlyCustomQuestion {
    name: string;
    type: "string" | "text" | "single_select" | "multi_select" | "phone_number" | string;
    position: number;
    enabled: boolean;
    required: boolean;
    answer_choices: string[];
    include_other: boolean;
}

export interface CalendlyEventType {
    uri: string;
    name: string;
    active: boolean;
    booking_method: "instant" | "manual";
    slug: string;
    scheduling_url: string;
    duration: number;
    duration_options: number[];
    kind: "solo" | "group" | string;
    pooling_type: "round_robin" | string;
    type: string;
    color: string;
    created_at: string;
    updated_at: string;
    internal_note: string | null;
    is_paid: boolean;
    description_plain: string;
    description_html: string;
    profile: CalendlyProfile;
    secret: boolean;
    deleted_at: string | null;
    admin_managed: boolean;
    locations: CalendlyLocation[];
    position: number;
    custom_questions: CalendlyCustomQuestion[];
    locale: string;
}
export interface CalendlyPagination {
    count: number;
    next_page: string | null;
    previous_page: string | null;
    next_page_token: string | null;
    previous_page_token: string | null;
}

export interface CalendlyEventTypeResponse {
    collection: CalendlyEventType[];
    pagination: CalendlyPagination;
}

export interface CalendlyScheduledEventsRequest {
  user?: string; // user URI
  organization?: string; // organization URI
  group?: string; // group URI
  invitee_email?: string;

  status?: "active" | "canceled";

  min_start_time?: string; // ISO UTC string
  max_start_time?: string; // ISO UTC string;

  count?: number; // 1 - 100 (default 20)
  page_token?: string;

  sort?: "start_time:asc" | "start_time:desc" | string;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  meeting_notes_plain: string | null;
  meeting_notes_html: string | null;
  status: "active" | "canceled" | string;

  start_time: string;
  end_time: string;

  event_type: string;

  location: CalendlyEventLocation | null;
  invitees_counter: CalendlyInviteeCounter;

  created_at: string;
  updated_at: string;

  event_memberships: CalendlyEventMembership[];
  event_guests: CalendlyEventGuest[];

  calendar_event: CalendlyExternalCalendarEvent | null;
}

export interface CalendlyEventLocation {
  type: string;
  location?: string;
  additional_info?: string;
}

export interface CalendlyInviteeCounter {
  total: number;
  active: number;
  limit: number;
}

export interface CalendlyEventMembership {
  user: string;
  user_email: string;
  user_name: string;
  buffered_start_time: string;
  buffered_end_time: string;
}

export interface CalendlyEventGuest {
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CalendlyExternalCalendarEvent {
  kind: "google" | "outlook" | string;
  external_id: string;
}

export interface CalendlyScheduledEventsResponse {
  collection: CalendlyScheduledEvent[];
  pagination: CalendlyPagination;
}

// Create Event Invitee Interfaces
export interface CalendlyInviteeInfo {
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  timezone?: string;
  text_reminder_number?: string;
}

export interface CalendlyInviteeLocation {
  kind: "physical" | "google_meet" | "zoom" | "gotomeeting" | "webex" | "microsoft_teams" | "custom" | string;
  location?: string;
}

export interface CalendlyQuestionAndAnswer {
  question: string;
  answer: string;
  position: number;
}

export interface CalendlyTracking {
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  salesforce_uuid?: string;
}

export interface CalendlyCreateInviteeRequest {
  event_type: string; // Event type URI
  start_time: string; // ISO UTC string
  invitee: CalendlyInviteeInfo;
  location?: CalendlyInviteeLocation;
  questions_and_answers?: CalendlyQuestionAndAnswer[];
  tracking?: CalendlyTracking;
  event_guests?: string[]; // Array of email addresses
}

export interface CalendlyInvitee {
  uri: string;
  name: string;
  email: string;
  text_reminder_number?: string;
  timezone: string;
  event: string; // Event URI
  created_at: string;
  updated_at: string;
  canceled: boolean;
  cancellation?: {
    canceled_by: string;
    reason?: string;
    canceler_type: string;
    created_at: string;
  };
  rescheduled: boolean;
  old_invitee?: string;
  new_invitee?: string;
  payment?: {
    external_id: string;
    provider: string;
    amount: number;
    currency: string;
    terms: string;
    successful: boolean;
  };
  questions_and_answers?: CalendlyQuestionAndAnswer[];
  tracking?: CalendlyTracking;
  tracking_url?: string;
}

export interface CalendlyCreateInviteeResponse {
  resource: CalendlyInvitee;
}

