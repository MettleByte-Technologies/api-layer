const API_BASE = "http://localhost:5000/api/v1/calendly";


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