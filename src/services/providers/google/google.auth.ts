import { google } from "googleapis";
import { oauth2Client, GOOGLE_SCOPES } from "../../../config/google";
import { logger } from "../../../utils/logger";

export const generateAuthUrl = (userId: string) => {
  logger.info("Generating Google OAuth URL", { userId });
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state: userId, // VERY IMPORTANT
  });
};

export const exchangeCodeForTokens = async (code: string) => {
  logger.info("Exchanging Google OAuth code for tokens");
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const refreshAccessToken = async (refreshToken: string) => {
  logger.info("Refreshing Google access token");
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

