import axios, { AxiosInstance } from "axios";
import { env } from "../../../config/env";

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

    async getUserEventTypes(accessToken: string): Promise<any> {
        try {
            console.log("Fetching Calendly event types with access token:" + accessToken );
            const response = await this.httpClient.get("/event_types", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to fetch event types: ${error.response?.data?.error?.message || error.message}`);
        }
    }

}
