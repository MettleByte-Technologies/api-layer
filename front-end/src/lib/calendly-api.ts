const API_BASE = "http://localhost:5000/api/v1/calendly";

export async function getAuthUrl(redirectUri: string): Promise<string> {
  const res = await fetch(`${API_BASE}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get auth URL");
  return data.authUrl;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to exchange code");
  return data;
}

export async function revokeConnection(accessToken: string) {
  const res = await fetch(`${API_BASE}/revoke`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ access_token: accessToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to revoke connection");
  console.log("Revocation response:", data);
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
  return data;
}

export async function getEventTypes(accessToken: string, user?: string) {
  const url = `${API_BASE}/event_types${user ? `?user=${encodeURIComponent(user)}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get event types");
  return data;
}

export async function listEvents(accessToken: string, user?: string) {
  const url = `${API_BASE}/events${user ? `?user=${encodeURIComponent(user)}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get events");
  return data; 
}

export interface CalendlyCreateInviteePayload {
  event_type: string;
  start_time: string;
  invitee: {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    timezone?: string;
    text_reminder_number?: string;
  };
  location?: {
    kind: string;
    location?: string;
  };
  questions_and_answers?: {
    question: string;
    answer: string;
    position: number;
  }[];
  tracking?: {
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
  event_guests?: string[];
}

export async function createInvitee(
  accessToken: string,
  payload: CalendlyCreateInviteePayload
) {
  const res = await fetch(`${API_BASE}/invitees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create invitee");
  return data;
}