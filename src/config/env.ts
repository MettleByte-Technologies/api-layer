import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const env = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
  PORT: process.env.PORT || "5000",
  OUTLOOK_CLIENT_ID: process.env.OUTLOOK_CLIENT_ID || "",
  OUTLOOK_CLIENT_SECRET: process.env.OUTLOOK_CLIENT_SECRET || "",
  OUTLOOK_REDIRECT_URI: process.env.OUTLOOK_REDIRECT_URI || "",
  OUTLOOK_API_BASE_URL: process.env.OUTLOOK_API_BASE_URL || "https://graph.microsoft.com",
  OUTLOOK_TOKEN_URL: process.env.OUTLOOK_TOKEN_URL || "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  OUTLOOK_AUTH_URL: process.env.OUTLOOK_AUTH_URL || "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  OUTLOOK_TENANT_ID: process.env.OUTLOOK_TENANT_ID || "common",
  OUTLOOK_AUTH_BASE_URL: process.env.OUTLOOK_AUTH_BASE_URL || "https://login.microsoftonline.com/consumer/oauth2/v2.0",
  OUTLOOK_SCOPE: process.env.OUTLOOK_SCOPE || "Calendars.ReadWrite offline_access User.Read",
  CALENDLY_API_BASE_URL: process.env.CALENDLY_API_BASE_URL || "https://api.calendly.com",
  CALENDLY_AUTH_URL: process.env.CALENDLY_AUTH_URL || "https://auth.calendly.com/oauth",
  CALENDLY_CLIENT_ID: process.env.CALENDLY_CLIENT_ID || "",
  CALENDLY_CLIENT_SECRET: process.env.CALENDLY_CLIENT_SECRET || "",
  CALENDLY_WEBHOOK_SECRET: process.env.CALENDLY_WEBHOOK_SECRET || "",
  CALENDLY_REDIRECT_URI: process.env.CALENDLY_REDIRECT_URI || "",
};

// Validate required environment variables on startup
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  WARNING: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not set in environment variables");
  console.warn("   Please create a .env file with:");
  console.warn("   GOOGLE_CLIENT_ID=your-client-id");
  console.warn("   GOOGLE_CLIENT_SECRET=your-client-secret");
  console.warn("   GOOGLE_REDIRECT_URI=http://localhost:8080/callback");
}
