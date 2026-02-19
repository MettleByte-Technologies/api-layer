import { useState } from "react";
import {
  getAuthUrl,
  refreshAccessToken,
  revokeConnection,
  getEventTypes,
  listEvents,
  createInvitee,
  CalendlyCreateInviteePayload,
} from "@/lib/calendly-api";
import { Calendar, RefreshCw, List, Plus, LogIn, Copy, Check } from "lucide-react";

const CalendlyIntegration = () => {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem("calendly_access_token") || ""
  );
  const [refreshToken, setRefreshToken] = useState(
    () => sessionStorage.getItem("calendly_refresh_token") || ""
  );
  const [response, setResponse] = useState<object | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Create invitee form
  const [eventTypeUri, setEventTypeUri] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [inviteeTimezone, setInviteeTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  );
  const [inviteePhone, setInviteePhone] = useState("");
  const [startTime, setStartTime] = useState("");
  const [locationKind, setLocationKind] = useState("physical");
  const [locationValue, setLocationValue] = useState("");
  const [eventGuests, setEventGuests] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [timeMin, setTimeMin] = useState("");
  const [timeMax, setTimeMax] = useState("");
  const [owner, setOwner] = useState(() => sessionStorage.getItem("calendly_owner") || "");

  // Get events params
  const [eventsCalendarId, setEventsCalendarId] = useState("");

  const isConnected = !!accessToken;

  const handleConnect = async () => {
    setLoading("connect");
    setError("");
    try {
      const redirectUri = `${window.location.origin}/calendly/callback`;
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
        alert("Calendly connection revoked successfully.");
        setAccessToken("");
        setRefreshToken("");
        sessionStorage.removeItem("calendly_access_token");
        sessionStorage.removeItem("calendly_refresh_token");
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
        sessionStorage.setItem("calendly_access_token", data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
          sessionStorage.setItem("calendly_refresh_token", data.refresh_token);
        }
        if(data.owner){
          setOwner(data.owner);
          sessionStorage.setItem("calendly_owner", data.owner);
        }
        return data;
      });

    const handleGetEventTypes = () =>{
      console.log("Owner:", owner);
      runApi("eventTypes", () => getEventTypes(accessToken, owner));
    }

    const handleGetEventList = () =>{
      console.log("Owner:", owner);
      runApi("events", () => listEvents(accessToken, owner));
    }

    const handleCreateInvitee = () =>
      runApi("createInvitee", async () => {
        const payload: CalendlyCreateInviteePayload = {
          event_type: eventTypeUri,
          start_time: formatDateToISO(startTime),
          invitee: {
            name: inviteeName || undefined,
            email: inviteeEmail,
            timezone: inviteeTimezone,
            text_reminder_number: inviteePhone || undefined,
          },
        };

        const trimmedLocation = locationValue.trim();
        if (trimmedLocation) {
          payload.location = {
            kind: locationKind || "physical",
            location: trimmedLocation,
          };
        }

        if (eventGuests) {
          payload.event_guests = eventGuests
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean);
        }

        return createInvitee(accessToken, payload);
      });

    const formatDateToISO = (dateString: string): string => {
      if (!dateString) return dateString;
      return new Date(dateString).toISOString();
    };
    
    

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
            {loading === "connect" ? "Connecting..." : "Connect Calendly Account"}
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
                onClick={handleGetEventTypes}
                disabled={!!loading}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Calendar className="h-4 w-4 text-google" />
                {loading === "eventTypes" ? "Loading..." : "Get Event Types"}
              </button>
              <button
                onClick={handleGetEventList}
                disabled={!!loading}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Calendar className="h-4 w-4 text-google" />
                {loading === "events" ? "Loading..." : "Get Events"}
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
            

            {/* Create Invitee */}
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex w-full items-center gap-2 text-sm font-medium text-foreground"
              >
                <Plus className="h-4 w-4 text-google" />
                Create Invitee
              </button>
              {showCreateForm && (
                <div className="space-y-2 pt-2">
                  <input
                    value={eventTypeUri}
                    onChange={(e) => setEventTypeUri(e.target.value)}
                    placeholder="Event Type URI *"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    placeholder="Invitee Name"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <input
                      type="email"
                      value={inviteeEmail}
                      onChange={(e) => setInviteeEmail(e.target.value)}
                      placeholder="Invitee Email *"
                      className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  <input
                    value={inviteeTimezone}
                    onChange={(e) => setInviteeTimezone(e.target.value)}
                    placeholder="Timezone * (e.g. America/New_York)"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    value={inviteePhone}
                    onChange={(e) => setInviteePhone(e.target.value)}
                    placeholder="Text reminder number (optional, e.g. +1 888-888-8888)"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={locationKind}
                      onChange={(e) => setLocationKind(e.target.value)}
                      placeholder="Location kind (e.g. physical)"
                      className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <input
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                      placeholder="Location (optional)"
                      className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  <input
                    value={eventGuests}
                    onChange={(e) => setEventGuests(e.target.value)}
                    placeholder="Guest emails (comma-separated, optional)"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleCreateInvitee}
                    disabled={
                      !!loading ||
                      !eventTypeUri ||
                      !startTime ||
                      !inviteeEmail ||
                      !inviteeTimezone
                    }
                    className="w-full rounded-md bg-google px-3 py-2 text-sm font-medium text-google-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading === "createInvitee" ? "Creating..." : "Create Invitee (Only paid accounts) "}
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

  export default CalendlyIntegration;
