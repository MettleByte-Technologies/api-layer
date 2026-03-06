import axios from "axios";
import { env } from "../../../config/env";
import { DOCUSIGN_AUTH_BASE_URL, DOCUSIGN_SCOPES } from "../../../config/docusign";

export const generateAuthUrl = (redirectUri: string): string => {
    const params = new URLSearchParams({
        response_type: "code",
        scope: DOCUSIGN_SCOPES.join(" "),
        client_id: env.DOCUSIGN_INTEGRATION_KEY,
        redirect_uri: redirectUri,
    });

    return `${DOCUSIGN_AUTH_BASE_URL}/oauth/auth?${params.toString()}`;
};

export const exchangeCodeForTokens = async (code: string, redirectUri: string) => {
    const credentials = Buffer.from(
        `${env.DOCUSIGN_INTEGRATION_KEY}:${env.DOCUSIGN_SECRET_KEY}`
    ).toString("base64");

    const response = await axios.post(
        `${DOCUSIGN_AUTH_BASE_URL}/oauth/token`,
        new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
        }),
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    return response.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
    const credentials = Buffer.from(
        `${env.DOCUSIGN_INTEGRATION_KEY}:${env.DOCUSIGN_SECRET_KEY}`
    ).toString("base64");

    const response = await axios.post(
        `${DOCUSIGN_AUTH_BASE_URL}/oauth/token`,
        new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    return response.data;
};
