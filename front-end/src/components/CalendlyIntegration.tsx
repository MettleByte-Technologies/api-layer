import { useState } from "react";
import {
  getAuthUrl,
  getCalendars,
  getEvents,
  createEvent,
  refreshAccessToken,
  revokeConnection,
} from "@/lib/google-api";
import { Calendar, RefreshCw, List, Plus, LogIn, Copy, Check } from "lucide-react";

const GoogleIntegration = () => {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem("google_access_token") || ""
  );
  const [refreshToken, setRefreshToken] = useState(
    () => sessionStorage.getItem("google_refresh_token") || ""
  );
  const [response, setResponse] = useState<object | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Create event form
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventAttendees, setEventAttendees] = useState("");
  const [eventCalendarId, setEventCalendarId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [timeMin, setTimeMin] = useState("");
  const [timeMax, setTimeMax] = useState("");

  // Get events params
  const [eventsCalendarId, setEventsCalendarId] = useState("");

  const isConnected = !!accessToken;

  const handleConnect = async () => {
    setLoading("connect");
    setError("");
    try {
      const redirectUri = `${window.location.origin}/google/callback`;
      const authUri = await getAuthUrl(redirectUri);
      window.location.href = authUri;
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await revokeConnection(accessToken);
      console.log("Revoke response:", response);
      if (response) {
        alert("Google connection revoked successfully.");
        setAccessToken("");
        setRefreshToken("");
        sessionStorage.removeItem("google_access_token");
        sessionStorage.removeItem("google_refresh_token");
        setResponse(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCopy = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    };

    const runApi = async (name: string, fn: () => Promise<any>) => {
      setLoading(name);
      setError("");
      setResponse(null);
      try {
        const data = await fn();
        setResponse(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(null);
      }
    };

    const handleRefresh = () =>
      runApi("refresh", async () => {
        const data = await refreshAccessToken(refreshToken);
        setAccessToken(data.access_token);
        sessionStorage.setItem("google_access_token", data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
          sessionStorage.setItem("google_refresh_token", data.refresh_token);
        }
        return data;
      });

    const handleGetCalendars = () =>
      runApi("calendars", () => getCalendars(accessToken));

    const handleGetEvents = () =>
      runApi("events", () => getEvents(accessToken, eventsCalendarId || undefined, formatDateToISO(timeMin) || undefined, formatDateToISO(timeMax) || undefined));

    const formatDateToISO = (dateString: string): string => {
      if (!dateString) return dateString;
      return new Date(dateString).toISOString();
    };


    const handleCreateEvent = () =>
      runApi("create", () =>
        createEvent(accessToken, {
          calendarId: eventCalendarId || undefined,
          event: {
            summary: eventTitle,
            description: eventDesc,
            start: { dateTime: new Date(eventStart).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            end: { dateTime: new Date(eventEnd).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            attendees: eventAttendees ? eventAttendees.split(",").map(email => ({ email: email.trim() })) : undefined,
          }
        })

      );

    return (
      <div className="space-y-6">
        {/* Token Display */}
        {isConnected && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Access Token</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={accessToken}
                  className="flex-1 rounded-lg border bg-secondary/50 px-3 py-2 text-sm font-mono text-foreground"
                />
                <button
                  onClick={() => handleCopy(accessToken, "access")}
                  className="rounded-lg border bg-card px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors"
                >
                  {copied === "access" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Refresh Token</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={refreshToken}
                  className="flex-1 rounded-lg border bg-secondary/50 px-3 py-2 text-sm font-mono text-foreground"
                />
                <button
                  onClick={() => handleCopy(refreshToken, "refresh")}
                  className="rounded-lg border bg-card px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors"
                >
                  {copied === "refresh" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connect / Disconnect */}
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={loading === "connect"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-google px-4 py-3 text-sm font-medium text-google-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading === "connect" ? "Connecting..." : "Connect Google Account"}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="w-full rounded-lg border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
          >
            Disconnect
          </button>
        )}

        {/* API Buttons */}
        {isConnected && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">API Actions</h3>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={handleGetCalendars}
                disabled={!!loading}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Calendar className="h-4 w-4 text-google" />
                {loading === "calendars" ? "Loading..." : "Get Calendars"}
              </button>

              <button
                onClick={handleRefresh}
                disabled={!!loading}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4 text-google" />
                {loading === "refresh" ? "Refreshing..." : "Refresh Token"}
              </button>
            </div>

            {/* Get Events with optional calendarId */}
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <List className="h-4 w-4 text-google" />
                Get Events
              </div>
              <input
                value={eventsCalendarId}
                onChange={(e) => setEventsCalendarId(e.target.value)}
                placeholder="Calendar ID (optional, defaults to primary)"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={timeMin}
                  onChange={(e) => setTimeMin(e.target.value)}
                  className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                />
                <input
                  type="datetime-local"
                  value={timeMax}
                  onChange={(e) => setTimeMax(e.target.value)}
                  className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <button
                onClick={handleGetEvents}
                disabled={!!loading}
                className="w-full rounded-md bg-google px-3 py-2 text-sm font-medium text-google-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading === "events" ? "Loading..." : "Fetch Events"}
              </button>
            </div>

            {/* Create Event */}
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex w-full items-center gap-2 text-sm font-medium text-foreground"
              >
                <Plus className="h-4 w-4 text-google" />
                Create Event
              </button>
              {showCreateForm && (
                <div className="space-y-2 pt-2">
                  <input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Title *"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Description"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="datetime-local"
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <input
                      type="datetime-local"
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  <input
                    value={eventAttendees}
                    onChange={(e) => setEventAttendees(e.target.value)}
                    placeholder="Attendees (comma-separated emails)"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    value={eventCalendarId}
                    onChange={(e) => setEventCalendarId(e.target.value)}
                    placeholder="Calendar ID (optional)"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleCreateEvent}
                    disabled={!!loading || !eventTitle || !eventStart || !eventEnd}
                    className="w-full rounded-md bg-google px-3 py-2 text-sm font-medium text-google-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading === "create" ? "Creating..." : "Create Event"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Response</h3>
            <button
              onClick={() => handleCopy(JSON.stringify(response, null, 2), "response")}
              className="rounded-lg border bg-card px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors"
            >
              {copied === "response" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-secondary/50 p-4 text-xs font-mono text-foreground">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  export default GoogleIntegration;
