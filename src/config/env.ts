import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const env = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
  PORT: process.env.PORT || "5000",
};

// Validate required environment variables on startup
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  WARNING: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not set in environment variables");
  console.warn("   Please create a .env file with:");
  console.warn("   GOOGLE_CLIENT_ID=your-client-id");
  console.warn("   GOOGLE_CLIENT_SECRET=your-client-secret");
  console.warn("   GOOGLE_REDIRECT_URI=http://localhost:8080/callback");
}
