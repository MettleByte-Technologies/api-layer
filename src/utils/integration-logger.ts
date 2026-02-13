import { IntegrationLogModel, IntegrationLogStatus } from "../models/integration-log.model";
import { logger } from "./logger";

interface BaseLogParams {
  userId?: string;
  provider?: string;
  action: string;
  requestPayload?: any;
}

interface SuccessLogParams extends BaseLogParams {
  responsePayload?: any;
}

interface ErrorLogParams extends BaseLogParams {
  error: unknown;
}

const safeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const writeLog = async (
  status: IntegrationLogStatus,
  params: {
    userId?: string;
    provider?: string;
    action: string;
    requestPayload?: any;
    responsePayload?: any;
    errorMessage?: string | null;
  }
) => {
  try {
    await IntegrationLogModel.create({
      userId: params.userId ?? null,
      provider: params.provider ?? null,
      action: params.action,
      requestPayload: params.requestPayload,
      responsePayload: params.responsePayload,
      status,
      errorMessage: params.errorMessage ?? null,
    });
  } catch (e) {
    // Do not break main flow if logging fails
    logger.error("Failed to write integration log", { error: e });
  }
};

export const IntegrationLogger = {
  async success(params: SuccessLogParams) {
    logger.info("Integration success", {
      userId: params.userId,
      provider: params.provider,
      action: params.action,
    });

    await writeLog("success", {
      userId: params.userId,
      provider: params.provider,
      action: params.action,
      requestPayload: params.requestPayload,
      responsePayload: params.responsePayload,
    });
  },

  async error(params: ErrorLogParams) {
    const message = safeErrorMessage(params.error);

    logger.error("Integration error", {
      userId: params.userId,
      provider: params.provider,
      action: params.action,
      error: message,
    });

    await writeLog("failed", {
      userId: params.userId,
      provider: params.provider,
      action: params.action,
      requestPayload: params.requestPayload,
      errorMessage: message,
    });
  },
};


