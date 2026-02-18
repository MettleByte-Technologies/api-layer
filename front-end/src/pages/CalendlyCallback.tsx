import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { exchangeCodeForTokens } from "@/lib/google-api";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setError("No authorization code found in URL");
      return;
    }

    const redirectUri = `${window.location.origin}/google/callback`;

    exchangeCodeForTokens(code, redirectUri)
      .then((tokens) => {
        // Store tokens and redirect to main page
        sessionStorage.setItem("google_access_token", tokens.access_token);
        sessionStorage.setItem("google_refresh_token", tokens.refresh_token);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setStatus("error");
        setError(err.message);
      });
  }, [searchParams, navigate]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-foreground">Connection Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Connecting to Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
