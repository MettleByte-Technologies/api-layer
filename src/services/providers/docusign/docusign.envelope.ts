import axios from "axios";
import { DOCUSIGN_API_BASE_URL } from "../../../config/docusign";
import { env } from "../../../config/env";

interface SignPosition {
    pageNumber?: string;
    xPosition?: string;
    yPosition?: string;
}

interface Signer {
    email: string;
    name: string;
    role: string;
    routingOrder?: number;
    signPosition?: SignPosition;
}

interface CcRecipient {
    email: string;
    name: string;
}

export interface CreateEnvelopeOptions {
    // DOCUMENT — one of these required
    documentBase64?: string;
    documentName?: string;
    documentExtension?: string;
    templateId?: string;

    // ENVELOPE
    emailSubject: string;
    emailBody?: string;
    status?: "sent" | "created";

    // SIGNERS
    signers: Signer[];
    signerMessage?: string;

    // EXTRAS
    ccRecipients?: CcRecipient[];
    expiryDays?: number;
    reminderDays?: number;
    allowDecline?: boolean;
    allowReassign?: boolean;

    // AUTH
    accessToken: string;
}

const getSigningTabs = (
    fileExtension: string,
    signPosition?: SignPosition
) => {
    if (fileExtension.toLowerCase() === "pdf") {
        return {
            signHereTabs: [
                {
                    anchorString: "/sig/",
                    anchorXOffset: "0",
                    anchorYOffset: "0",
                },
            ],
        };
    }

    // DOCX or other — use position (custom or default)
    return {
        signHereTabs: [
            {
                documentId: "1",
                pageNumber: signPosition?.pageNumber || "1",
                xPosition: signPosition?.xPosition || "100",
                yPosition: signPosition?.yPosition || "700",
            },
        ],
    };
};

export const sendEnvelope = async (options: CreateEnvelopeOptions) => {
    let {
        documentBase64,
        documentName,
        documentExtension,
        templateId,
        emailSubject,
        emailBody,
        status = "sent",
        signers,
        signerMessage,
        ccRecipients,
        expiryDays,
        reminderDays,
        allowDecline = true,
        allowReassign = false,
        accessToken,
    } = options;

    // Validate
    if (!documentBase64 && !templateId) {
        throw new Error("Either documentBase64 or templateId is required");
    }

    if (!signers || signers.length === 0) {
        throw new Error("At least one signer is required");
    }

    // Strip data URL prefix if present
    if (documentBase64 && documentBase64.includes(",")) {
        documentBase64 = documentBase64.split(",")[1];
    }

    // Build notification settings
    const notification: any = {};
    if (expiryDays) {
        notification.expirations = {
            expireEnabled: "true",
            expireAfter: String(expiryDays),
            expireWarn: String(Math.max(1, expiryDays - 2)),
        };
    }
    if (reminderDays) {
        notification.reminders = {
            reminderEnabled: "true",
            reminderDelay: String(reminderDays),
            reminderFrequency: "2",
        };
    }

    // Build CC recipients
    const carbonCopies = ccRecipients?.map((cc, index) => ({
        email: cc.email,
        name: cc.name,
        recipientId: String(signers.length + index + 1),
        routingOrder: signers.length + index + 1,
    }));

    let envelopeDefinition: any;

    if (templateId) {
        // Template based
        envelopeDefinition = {
            templateId,
            templateRoles: signers.map((signer, index) => ({
                email: signer.email,
                name: signer.name,
                roleName: signer.role,
                routingOrder: signer.routingOrder ?? index + 1,
            })),
            emailSubject,
            emailBlurb: emailBody || "",
            status,
            ...(Object.keys(notification).length > 0 && { notification }),
        };
    } else {
        // Base64 document
        envelopeDefinition = {
            emailSubject,
            emailBlurb: emailBody || "",
            status,
            documents: [
                {
                    documentBase64,
                    name: documentName || "Document",
                    fileExtension: documentExtension || "pdf",
                    documentId: "1",
                },
            ],
            recipients: {
                signers: signers.map((signer, index) => ({
                    email: signer.email,
                    name: signer.name,
                    recipientId: String(index + 1),
                    routingOrder: signer.routingOrder ?? index + 1,
                    note: signerMessage || "",
                    allowReassign: allowReassign ? "true" : "false",
                    declinedAllowed: allowDecline ? "true" : "false",
                    tabs: getSigningTabs(
                        documentExtension || "pdf",
                        signer.signPosition
                    ),
                })),
                ...(carbonCopies &&
                    carbonCopies.length > 0 && { carbonCopies }),
            },
            ...(Object.keys(notification).length > 0 && { notification }),
        };
    }

    try {
        const response = await axios.post(
            `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes`,
            envelopeDefinition,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error(
            "Error sending envelope:",
            error.response?.data || error.message
        );
        throw new Error(
            `Failed to send envelope: ${error.response?.data?.message || error.message
            }`
        );
    }
};

export const getEnvelopeStatus = async (
    envelopeId: string,
    accessToken: string
) => {
    try {
        const response = await axios.get(
            `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error(
            "Error getting envelope status:",
            error.response?.data || error.message
        );
        throw new Error(
            `Failed to get envelope status: ${error.response?.data?.message || error.message
            }`
        );
    }
};

export const listEnvelopes = async (
    accessToken: string,
    filters?: {
        status?: "sent" | "delivered" | "completed" | "declined" | "voided";
        fromDate?: string;  // ISO format: 2024-01-01
        toDate?: string;
        count?: number;
    }
) => {
    try {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.fromDate) params.append("from_date", filters.fromDate);
        if (filters?.toDate) params.append("to_date", filters.toDate);
        if (filters?.count) params.append("count", String(filters.count));

        const response = await axios.get(
            `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes?${params.toString()}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        return response.data;
    } catch (error: any) {
        throw new Error(
            `Failed to list envelopes: ${error.response?.data?.message || error.message}`
        );
    }
};

export const getEnvelopeRecipients = async (
    envelopeId: string,
    accessToken: string
) => {
    try {
        const response = await axios.get(
            `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/recipients`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        return response.data;
    } catch (error: any) {
        throw new Error(
            `Failed to get recipients: ${error.response?.data?.message || error.message}`
        );
    }
};

export const voidEnvelope = async (
    envelopeId: string,
    voidReason: string,
    accessToken: string
) => {
    try {
        const response = await axios.put(
            `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}`,
            {
                status: "voided",
                voidedReason: voidReason,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error: any) {
        throw new Error(
            `Failed to void envelope: ${error.response?.data?.message || error.message}`
        );
    }
};

export const listTemplates = async (
    accessToken: string,
    filters?: {
        searchText?: string;
        count?: number;
    }
) => {
    try {
        const params = new URLSearchParams();
        if (filters?.searchText) params.append("search_text", filters.searchText);
        if (filters?.count) params.append("count", String(filters.count));

        const response = await axios.get(
            `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/templates?${params.toString()}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        return response.data;
    } catch (error: any) {
        throw new Error(
            `Failed to list templates: ${error.response?.data?.message || error.message}`
        );
    }
};
