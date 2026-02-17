import { CreateEventRequest } from "@/interface/google.interface";

const API_BASE = "http://localhost:5000/api/v1/google";




export async function getAuthUrl(redirectUri: string): Promise<string> {
  const res = await fetch(`${API_BASE}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirectUri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get auth URL");
  return data.authUri;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to exchange code");
  return data as {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
    token_type: string;
    scope: string;
  };
}

export async function getCalendars(accessToken: string) {
  const res = await fetch(`${API_BASE}/calendars`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get calendars");
  return data;
}

export async function getEvents(accessToken: string, calendarId?: string, timeMin?: string, timeMax?: string) {
  const params = new URLSearchParams();
  if (calendarId) params.append("calendarId", calendarId);
  if (timeMin) params.append("timeMin", timeMin);
  if (timeMax) params.append("timeMax", timeMax);

  const queryString = params.toString();
  const res = await fetch(`${API_BASE}/events${queryString ? `?${queryString}` : ""}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get events");
  return data;
}

export async function createEvent(
  accessToken: string,
  event: CreateEventRequest
) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create event");
  return data;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to refresh token");
  return data as {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
}
