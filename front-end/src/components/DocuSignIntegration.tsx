import { useState } from "react";
import {
    getAuthUrl,
    refreshAccessToken,
    sendEnvelope,
    listEnvelopes,
    getEnvelopeStatus,
    getEnvelopeRecipients,
    voidEnvelope,
    listTemplates,
    SendEnvelopePayload,
} from "@/lib/docusign-api";
import {
    RefreshCw,
    LogIn,
    Copy,
    Check,
    Send,
    List,
    FileSearch,
    Users,
    XCircle,
    FileText,
    Plus,
    Trash2,
} from "lucide-react";

const DocuSignIntegration = () => {
    const [accessToken, setAccessToken] = useState(
        () => sessionStorage.getItem("docusign_access_token") || ""
    );
    const [refreshToken, setRefreshToken] = useState(
        () => sessionStorage.getItem("docusign_refresh_token") || ""
    );
    const [response, setResponse] = useState<object | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    // Send envelope form
    const [showSendForm, setShowSendForm] = useState(false);
    const [envSubject, setEnvSubject] = useState("");
    const [envBody, setEnvBody] = useState("");
    const [envStatus, setEnvStatus] = useState<"sent" | "created">("sent");
    const [envSigners, setEnvSigners] = useState([{ email: "", name: "", role: "" }]);
    const [envDocMode, setEnvDocMode] = useState<"file" | "template">("file");
    const [envTemplateId, setEnvTemplateId] = useState("");
    const [envDocBase64, setEnvDocBase64] = useState("");
    const [envDocName, setEnvDocName] = useState("");
    const [envDocExt, setEnvDocExt] = useState("pdf");

    // List envelopes filters
    const [listStatus, setListStatus] = useState("");
    const [listFromDate, setListFromDate] = useState("");
    const [listToDate, setListToDate] = useState("");
    const [listCount, setListCount] = useState("");

    // Envelope status / recipients / void
    const [statusEnvelopeId, setStatusEnvelopeId] = useState("");
    const [recipientsEnvelopeId, setRecipientsEnvelopeId] = useState("");
    const [voidEnvelopeId, setVoidEnvelopeId] = useState("");
    const [voidReason, setVoidReason] = useState("");

    // Templates
    const [templateSearch, setTemplateSearch] = useState("");
    const [templateCount, setTemplateCount] = useState("");

    const isConnected = !!accessToken;

    const handleConnect = async () => {
        setLoading("connect");
        setError("");
        try {
            const redirectUri = `${window.location.origin}/docusign/callback`;
            const authUri = await getAuthUrl(redirectUri);
            window.location.href = authUri;
        } catch (err: any) {
            setError(err.message);
            setLoading(null);
        }
    };

    const handleDisconnect = () => {
        setAccessToken("");
        setRefreshToken("");
        sessionStorage.removeItem("docusign_access_token");
        sessionStorage.removeItem("docusign_refresh_token");
        setResponse(null);
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
            sessionStorage.setItem("docusign_access_token", data.access_token);
            if (data.refresh_token) {
                setRefreshToken(data.refresh_token);
                sessionStorage.setItem("docusign_refresh_token", data.refresh_token);
            }
            return data;
        });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEnvDocName(file.name);
        const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
        setEnvDocExt(ext);
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            setEnvDocBase64(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSendEnvelope = () =>
        runApi("send", () => {
            const payload: SendEnvelopePayload = {
                emailSubject: envSubject,
                emailBody: envBody || undefined,
                status: envStatus,
                signers: envSigners.filter((s) => s.email && s.name && s.role),
            };
            if (envDocMode === "template") {
                payload.templateId = envTemplateId;
            } else {
                payload.documentBase64 = envDocBase64;
                payload.documentName = envDocName;
                payload.documentExtension = envDocExt;
            }
            return sendEnvelope(accessToken, payload);
        });

    const addSigner = () =>
        setEnvSigners([...envSigners, { email: "", name: "", role: "" }]);

    const removeSigner = (index: number) =>
        setEnvSigners(envSigners.filter((_, i) => i !== index));

    const updateSigner = (index: number, field: string, value: string) => {
        const updated = [...envSigners];
        (updated[index] as any)[field] = value;
        setEnvSigners(updated);
    };

    const handleListEnvelopes = () =>
        runApi("list", () =>
            listEnvelopes(accessToken, {
                status: listStatus || undefined,
                fromDate: listFromDate || undefined,
                toDate: listToDate || undefined,
                count: listCount ? Number(listCount) : undefined,
            })
        );

    const handleGetStatus = () =>
        runApi("status", () => getEnvelopeStatus(accessToken, statusEnvelopeId));

    const handleGetRecipients = () =>
        runApi("recipients", () =>
            getEnvelopeRecipients(accessToken, recipientsEnvelopeId)
        );

    const handleVoid = () =>
        runApi("void", () => voidEnvelope(accessToken, voidEnvelopeId, voidReason));

    const handleListTemplates = () =>
        runApi("templates", () =>
            listTemplates(accessToken, {
                searchText: templateSearch || undefined,
                count: templateCount ? Number(templateCount) : undefined,
            })
        );

    return (
        <div className="space-y-6">
            {/* Token Display */}
            {isConnected && (
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            Access Token
                        </label>
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
                                {copied === "access" ? (
                                    <Check className="h-4 w-4 text-success" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            Refresh Token
                        </label>
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
                                {copied === "refresh" ? (
                                    <Check className="h-4 w-4 text-success" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-docusign px-4 py-3 text-sm font-medium text-docusign-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    <LogIn className="h-4 w-4" />
                    {loading === "connect" ? "Connecting..." : "Connect DocuSign Account"}
                </button>
            ) : (
                <button
                    onClick={handleDisconnect}
                    className="w-full rounded-lg border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                    Disconnect
                </button>
            )}

            {/* API Actions */}
            {isConnected && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        API Actions
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                            onClick={handleRefresh}
                            disabled={!!loading}
                            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className="h-4 w-4 text-docusign" />
                            {loading === "refresh" ? "Refreshing..." : "Refresh Token"}
                        </button>
                        <button
                            onClick={handleListTemplates}
                            disabled={!!loading}
                            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <FileText className="h-4 w-4 text-docusign" />
                            {loading === "templates" ? "Loading..." : "List Templates"}
                        </button>
                    </div>

                    {/* List Envelopes */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <List className="h-4 w-4 text-docusign" />
                            List Envelopes
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={listStatus}
                                onChange={(e) => setListStatus(e.target.value)}
                                className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">All statuses</option>
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="declined">Declined</option>
                                <option value="voided">Voided</option>
                            </select>
                            <input
                                value={listCount}
                                onChange={(e) => setListCount(e.target.value)}
                                placeholder="Count (e.g. 20)"
                                type="number"
                                className="rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={listFromDate}
                                onChange={(e) => setListFromDate(e.target.value)}
                                className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                                placeholder="From date"
                            />
                            <input
                                type="date"
                                value={listToDate}
                                onChange={(e) => setListToDate(e.target.value)}
                                className="rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                                placeholder="To date"
                            />
                        </div>
                        <button
                            onClick={handleListEnvelopes}
                            disabled={!!loading}
                            className="w-full rounded-md bg-docusign px-3 py-2 text-sm font-medium text-docusign-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading === "list" ? "Loading..." : "Fetch Envelopes"}
                        </button>
                    </div>

                    {/* Get Envelope Status */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <FileSearch className="h-4 w-4 text-docusign" />
                            Get Envelope Status
                        </div>
                        <input
                            value={statusEnvelopeId}
                            onChange={(e) => setStatusEnvelopeId(e.target.value)}
                            placeholder="Envelope ID"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleGetStatus}
                            disabled={!!loading || !statusEnvelopeId}
                            className="w-full rounded-md bg-docusign px-3 py-2 text-sm font-medium text-docusign-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading === "status" ? "Loading..." : "Get Status"}
                        </button>
                    </div>

                    {/* Get Recipients */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Users className="h-4 w-4 text-docusign" />
                            Get Envelope Recipients
                        </div>
                        <input
                            value={recipientsEnvelopeId}
                            onChange={(e) => setRecipientsEnvelopeId(e.target.value)}
                            placeholder="Envelope ID"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleGetRecipients}
                            disabled={!!loading || !recipientsEnvelopeId}
                            className="w-full rounded-md bg-docusign px-3 py-2 text-sm font-medium text-docusign-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading === "recipients" ? "Loading..." : "Get Recipients"}
                        </button>
                    </div>

                    {/* Void Envelope */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <XCircle className="h-4 w-4 text-destructive" />
                            Void Envelope
                        </div>
                        <input
                            value={voidEnvelopeId}
                            onChange={(e) => setVoidEnvelopeId(e.target.value)}
                            placeholder="Envelope ID"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <input
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            placeholder="Void reason *"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleVoid}
                            disabled={!!loading || !voidEnvelopeId || !voidReason}
                            className="w-full rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading === "void" ? "Voiding..." : "Void Envelope"}
                        </button>
                    </div>

                    {/* List Templates */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <FileText className="h-4 w-4 text-docusign" />
                            List Templates
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                placeholder="Search text"
                                className="rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                            />
                            <input
                                value={templateCount}
                                onChange={(e) => setTemplateCount(e.target.value)}
                                placeholder="Count"
                                type="number"
                                className="rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <button
                            onClick={handleListTemplates}
                            disabled={!!loading}
                            className="w-full rounded-md bg-docusign px-3 py-2 text-sm font-medium text-docusign-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading === "templates" ? "Loading..." : "Fetch Templates"}
                        </button>
                    </div>

                    {/* Send Envelope */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <button
                            onClick={() => setShowSendForm(!showSendForm)}
                            className="flex w-full items-center gap-2 text-sm font-medium text-foreground"
                        >
                            <Send className="h-4 w-4 text-docusign" />
                            Send Envelope
                        </button>
                        {showSendForm && (
                            <div className="space-y-3 pt-2">
                                <input
                                    value={envSubject}
                                    onChange={(e) => setEnvSubject(e.target.value)}
                                    placeholder="Email Subject *"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                />
                                <input
                                    value={envBody}
                                    onChange={(e) => setEnvBody(e.target.value)}
                                    placeholder="Email Body (optional)"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                />

                                {/* Document source toggle */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEnvDocMode("file")}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${envDocMode === "file"
                                                ? "bg-docusign text-docusign-foreground"
                                                : "bg-secondary text-secondary-foreground"
                                            }`}
                                    >
                                        Upload File
                                    </button>
                                    <button
                                        onClick={() => setEnvDocMode("template")}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${envDocMode === "template"
                                                ? "bg-docusign text-docusign-foreground"
                                                : "bg-secondary text-secondary-foreground"
                                            }`}
                                    >
                                        Use Template
                                    </button>
                                </div>

                                {envDocMode === "file" ? (
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={handleFileUpload}
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-docusign file:px-3 file:py-1 file:text-sm file:font-medium file:text-docusign-foreground"
                                        />
                                        {envDocName && (
                                            <p className="text-xs text-muted-foreground">
                                                Selected: {envDocName} ({envDocExt})
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        value={envTemplateId}
                                        onChange={(e) => setEnvTemplateId(e.target.value)}
                                        placeholder="Template ID *"
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                    />
                                )}

                                {/* Status */}
                                <select
                                    value={envStatus}
                                    onChange={(e) => setEnvStatus(e.target.value as "sent" | "created")}
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground"
                                >
                                    <option value="sent">Send immediately</option>
                                    <option value="created">Save as draft</option>
                                </select>

                                {/* Signers */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">
                                            Signers
                                        </span>
                                        <button
                                            onClick={addSigner}
                                            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-accent transition-colors"
                                        >
                                            <Plus className="h-3 w-3" /> Add
                                        </button>
                                    </div>
                                    {envSigners.map((signer, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                value={signer.email}
                                                onChange={(e) => updateSigner(i, "email", e.target.value)}
                                                placeholder="Email *"
                                                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                            />
                                            <input
                                                value={signer.name}
                                                onChange={(e) => updateSigner(i, "name", e.target.value)}
                                                placeholder="Name *"
                                                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                            />
                                            <input
                                                value={signer.role}
                                                onChange={(e) => updateSigner(i, "role", e.target.value)}
                                                placeholder="Role *"
                                                className="w-28 rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                                            />
                                            {envSigners.length > 1 && (
                                                <button
                                                    onClick={() => removeSigner(i)}
                                                    className="rounded-md border px-2 text-destructive hover:bg-destructive/5 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSendEnvelope}
                                    disabled={
                                        !!loading ||
                                        !envSubject ||
                                        envSigners.every((s) => !s.email || !s.name || !s.role) ||
                                        (envDocMode === "file" ? !envDocBase64 : !envTemplateId)
                                    }
                                    className="w-full rounded-md bg-docusign px-3 py-2 text-sm font-medium text-docusign-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading === "send" ? "Sending..." : "Send Envelope"}
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
                        onClick={() =>
                            handleCopy(JSON.stringify(response, null, 2), "response")
                        }
                        className="rounded-lg border bg-card px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors"
                    >
                        {copied === "response" ? (
                            <Check className="h-4 w-4 text-success" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>
                    <pre className="max-h-80 overflow-auto rounded-lg border bg-secondary/50 p-4 text-xs font-mono text-foreground">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default DocuSignIntegration;
