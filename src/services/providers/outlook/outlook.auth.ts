import axios, { AxiosInstance } from "axios";
import { env } from "../../../config/env";
import { OutlookTokenResponse, OutlookUserProfile } from "../../../interfaces/outlook.interface";

export class OutlookOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private httpClient: AxiosInstance;
  private tenantId: string;

  constructor() {
    this.clientId = env.OUTLOOK_CLIENT_ID || "";
    this.clientSecret = env.OUTLOOK_CLIENT_SECRET || "";
    this.redirectUri = env.OUTLOOK_REDIRECT_URI || "";
    this.tenantId = env.OUTLOOK_TENANT_ID || "common";

    this.httpClient = axios.create({
      baseURL: env.OUTLOOK_AUTH_BASE_URL || "https://login.microsoftonline.com/consumers/oauth2/v2.0",
    });
  }

  /**
   * Generate the authorization URL for user consent
   * @param redirectUri - Optional redirect URI to override environment variable
   */
  getAuthorizationUrl(redirectUri?: string): string {
    const scope = [
      "Calendars.ReadWrite",
      "offline_access",
      "User.Read",
    ].join(" ");

    const finalRedirectUri = redirectUri || this.redirectUri;

    if (!finalRedirectUri) {
      throw new Error("Redirect URI not provided and not configured in environment");
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: finalRedirectUri,
      response_type: "code",
      scope: scope,
      response_mode: "query",
    });

    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string, redirectUri?: string): Promise<OutlookTokenResponse> {
    try {
      console.log("Exchanging code for token with redirect URI:", redirectUri);
      console.log("Using code:", code);
      
      // const response = await this.httpClient.post("/token", {
      //   client_id: this.clientId,
      //   client_secret: this.clientSecret,
      //   code,
      //   redirect_uri: redirectUri,
      //   grant_type: "authorization_code",
      //   scope: "Calendars.ReadWrite offline_access User.Read",
      // },
      //   {
      //     headers: {
      //       "Content-Type": "application/x-www-form-urlencoded",
      //     },
      //   });

      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          scope: "Calendars.ReadWrite offline_access User.Read",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to exchange code for token: ${error.message}`
      );
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OutlookTokenResponse> {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "Calendars.ReadWrite offline_access User.Read",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<OutlookUserProfile> {
    try {
      const response = await this.httpClient.get("/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch user profile: ${error.message}`
      );
    }
  }

  /**
   * Validate if token is expired
   */
  isTokenExpired(expiresAt: Date): boolean {
    return new Date() >= expiresAt;
  }
}

export default new OutlookOAuthService();