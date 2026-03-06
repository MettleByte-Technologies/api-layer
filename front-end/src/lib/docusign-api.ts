const API_BASE = "http://localhost:5000/api/v1/docusign";

export async function getAuthUrl(redirectUri: string): Promise<string> {
    const res = await fetch(`${API_BASE}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirect_uri: redirectUri }),
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
        expires_in: number;
        token_type: string;
    };
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
        expires_in: number;
        token_type: string;
    };
}

export interface SendEnvelopePayload {
    emailSubject: string;
    emailBody?: string;
    status?: "sent" | "created";
    signerMessage?: string;
    allowDecline?: boolean;
    allowReassign?: boolean;
    expiryDays?: number;
    reminderDays?: number;
    documentBase64?: string;
    documentName?: string;
    documentExtension?: string;
    templateId?: string;
    signers: {
        email: string;
        name: string;
        role: string;
        routingOrder?: number;
        signPosition?: {
            pageNumber?: string;
            xPosition?: string;
            yPosition?: string;
        };
    }[];
    ccRecipients?: { email: string; name: string }[];
}

export async function sendEnvelope(accessToken: string, payload: SendEnvelopePayload) {
    const res = await fetch(`${API_BASE}/envelopes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send envelope");
    return data;
}

export async function listEnvelopes(
    accessToken: string,
    filters?: { status?: string; fromDate?: string; toDate?: string; count?: number }
) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);
    if (filters?.count) params.append("count", String(filters.count));

    const queryString = params.toString();
    const res = await fetch(`${API_BASE}/envelopes${queryString ? `?${queryString}` : ""}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to list envelopes");
    return data;
}

export async function getEnvelopeStatus(accessToken: string, envelopeId: string) {
    const res = await fetch(`${API_BASE}/envelopes/${envelopeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get envelope status");
    return data;
}

export async function getEnvelopeRecipients(accessToken: string, envelopeId: string) {
    const res = await fetch(`${API_BASE}/envelopes/${envelopeId}/recipients`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get recipients");
    return data;
}

export async function voidEnvelope(accessToken: string, envelopeId: string, voidReason: string) {
    const res = await fetch(`${API_BASE}/envelopes/${envelopeId}/void`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ voidReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to void envelope");
    return data;
}

export async function listTemplates(
    accessToken: string,
    filters?: { searchText?: string; count?: number }
) {
    const params = new URLSearchParams();
    if (filters?.searchText) params.append("searchText", filters.searchText);
    if (filters?.count) params.append("count", String(filters.count));

    const queryString = params.toString();
    const res = await fetch(`${API_BASE}/templates${queryString ? `?${queryString}` : ""}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to list templates");
    return data;
}
