import { google } from "googleapis";
import { GOOGLE_SCOPES } from "../../../config/google";
import { env } from "../../../config/env";
import { ConnectRequest, ConnectResponse } from "../../../interfaces/google.interface";

const createOAuth2Client = (redirectUri?: string) => {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    redirectUri || env.GOOGLE_REDIRECT_URI
  );
};

export const generateAuthUrl = (
  request: ConnectRequest
): ConnectResponse => {
  const redirectUri = request.redirect_uri ?? request.redirectUri;
  const oauth2Client = createOAuth2Client(redirectUri);

  const authUri = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
  });

  return { authUri };
};

export const exchangeCodeForTokens = async (code: string, redirectUri: string) => {
  const oauth2Client = createOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

export const revokeConnection = async (accessToken: string) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  await oauth2Client.revokeCredentials();
} 

