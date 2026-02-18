import axios, { AxiosInstance } from "axios";
import { env } from "../../../config/env";
import { CalendlyAuthRequest, CalendlyAuthResponse, CalendlyExchangeCodeRequest, CalendlyTokenResponse } from "../../../interfaces/calendly.interface";

export class CalendlyOAuthService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private httpClient: AxiosInstance;

    constructor() {
        this.clientId = env.CALENDLY_CLIENT_ID;
        this.clientSecret = env.CALENDLY_CLIENT_SECRET;
        this.redirectUri = env.CALENDLY_REDIRECT_URI;

        this.httpClient = axios.create({
            baseURL: env.CALENDLY_AUTH_URL,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
            },
        });
    }

    // Generate the authorization URL for user consent
    getAuthorizationUrl(authRequest: CalendlyAuthRequest): CalendlyAuthResponse {
        const params = new URLSearchParams({
            response_type: "code",
            client_id: this.clientId,
            redirect_uri: authRequest.redirect_uri || this.redirectUri,
        });
        return {
            authUrl: `${env.CALENDLY_AUTH_URL}/authorize?${params.toString()}`
        };
    }

    // Exchange authorization code for access token
    async getAccessToken(exchangeCodeRequest: CalendlyExchangeCodeRequest): Promise<any> {
        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: exchangeCodeRequest.code,
            redirect_uri: exchangeCodeRequest.redirect_uri || this.redirectUri,
        });
        const response = await this.httpClient.post("/token", params);
        return response.data;
    }

    async refreshAccessToken(refreshToken: string): Promise<any> {
        const params = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        });
        const response = await this.httpClient.post("/token", params);
        return response.data;
    }

    async revokeConnection(token: string): Promise<void> {
        try {
            await this.httpClient.post("/revoke", new URLSearchParams({
                token: token,
                client_id: this.clientId,
                client_secret: this.clientSecret,
            }));
        } catch (error: any) {
            throw new Error(`Failed to revoke connection: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

export default CalendlyOAuthService;