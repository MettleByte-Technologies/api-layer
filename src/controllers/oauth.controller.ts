import { Request, Response } from "express";
import { exchangeCodeForTokens } from "../services/providers/google/google.auth";
import { saveConnectedAccount } from "../models/connected-account.model";
import { logger } from "../utils/logger";
import { IntegrationLogger } from "../utils/integration-logger";

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const userId = state as string;

    logger.info("Handling Google OAuth callback", { userId });

    const tokens = await exchangeCodeForTokens(code as string);

    await saveConnectedAccount(userId, "google", tokens);

    await IntegrationLogger.success({
      userId,
      provider: "google",
      action: "oauth_callback",
      requestPayload: { query: req.query },
      // Do NOT log raw tokens to avoid leaking secrets
      responsePayload: { connected: true },
    });

    logger.info("Google connected successfully", { userId });

    res.json({ message: "Google connected successfully" });
  } catch (error) {
    const userId = (req.query.state as string) || undefined;

    await IntegrationLogger.error({
      userId,
      provider: "google",
      action: "oauth_callback",
      requestPayload: { query: req.query },
      error,
    });

    logger.error("Google OAuth callback failed", { error });
    res.status(500).json({ message: "OAuth failed" });
  }
};