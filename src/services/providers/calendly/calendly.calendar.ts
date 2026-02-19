import axios, { AxiosInstance } from "axios";
import { env } from "../../../config/env";
import { 
    CalendlyEventTypeRequest, 
    CalendlyScheduledEventsRequest,
    CalendlyEventTypeResponse,
    CalendlyScheduledEventsResponse,
    CalendlyCreateInviteeRequest,
    CalendlyCreateInviteeResponse
} from "../../../interfaces/calendly.interface";

export class CalendlyCalendarService {
    private httpClient: AxiosInstance;

    constructor() {
        this.httpClient = axios.create({
            baseURL: env.CALENDLY_API_BASE_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    async getUserEventTypes(accessToken: string, params?: CalendlyEventTypeRequest): Promise<CalendlyEventTypeResponse> {
        try {
            const response = await this.httpClient.get<CalendlyEventTypeResponse>("/event_types", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching Calendly event types:", error.response?.data || error.message);
            throw new Error(`Failed to fetch event types: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async listEvents(accessToken: string, params: CalendlyScheduledEventsRequest): Promise<CalendlyScheduledEventsResponse> {
        try {
            const response = await this.httpClient.get<CalendlyScheduledEventsResponse>("/scheduled_events", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching Calendly events:", error.response?.data || error.message);
            throw new Error(`Failed to fetch events: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async createInvitee(accessToken: string, request: CalendlyCreateInviteeRequest): Promise<CalendlyCreateInviteeResponse> {
        try {
            const response = await this.httpClient.post<CalendlyCreateInviteeResponse>("/invitees", request, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Error creating Calendly invitee:", error.response?.data || error.message);
            throw new Error(`Failed to create invitee: ${error.response?.data?.error?.message || error.message}`);
        }
    }

}
