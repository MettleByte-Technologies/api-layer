import { refreshAccessToken } from "../services/providers/google/google.auth";
import {
  getConnectedAccount,
  updateTokens,
} from "../models/connected-account.model";
import { logger } from "./logger";

export class TokenUtil {
  static async getValidGoogleToken(userId: string): Promise<string> {
    logger.info("Fetching Google token for user", { userId });

    const integration = await getConnectedAccount(userId, "google");

    if (!integration) {
      logger.error("Google integration not found for user", { userId });
      throw new Error("Google integration not found");
    }

    const now = Date.now();
    const expiry =
      integration.expiry_date instanceof Date
        ? integration.expiry_date.getTime()
        : Number(integration.expiry_date);

    // If not expired → return existing token
    if (expiry && expiry > now) {
      logger.debug("Using existing non-expired Google access token", {
        userId,
      });
      return integration.access_token as string;
    }

    logger.info("Refreshing expired Google access token", { userId });

    // Expired → refresh
    const newTokens = await refreshAccessToken(
      integration.refresh_token as string
    );

    await updateTokens(integration.id as number, {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token ?? integration.refresh_token,
      expiry_date:
        newTokens.expiry_date ?? Date.now() + 60 * 60 * 1000, // fallback +1h
    });

    logger.info("Google access token refreshed successfully", { userId });

    return (newTokens.access_token as string) || (integration.access_token as string);
  }
}