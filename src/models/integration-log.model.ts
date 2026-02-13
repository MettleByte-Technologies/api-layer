import { db } from "../config/database";

export type IntegrationLogStatus = "success" | "failed";

export interface IntegrationLogCreate {
  userId?: string | null;
  provider?: string | null;
  action: string;
  requestPayload?: any;
  responsePayload?: any;
  status: IntegrationLogStatus;
  errorMessage?: string | null;
}

export const IntegrationLogModel = {
  async create(log: IntegrationLogCreate): Promise<void> {
    const query = `
      INSERT INTO integration_logs
      (user_id, provider, action, request_payload, response_payload, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const requestJson =
      log.requestPayload !== undefined && log.requestPayload !== null
        ? JSON.stringify(log.requestPayload)
        : null;

    const responseJson =
      log.responsePayload !== undefined && log.responsePayload !== null
        ? JSON.stringify(log.responsePayload)
        : null;

    await db.execute(query, [
      log.userId ?? null,
      log.provider ?? null,
      log.action,
      requestJson,
      responseJson,
      log.status,
      log.errorMessage ?? null,
    ]);
  },
};


