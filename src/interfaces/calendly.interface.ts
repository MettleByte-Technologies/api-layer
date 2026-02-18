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