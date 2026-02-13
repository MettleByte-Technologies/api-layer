import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  logger.info("Incoming request", {
    method: req.method,
    path: req.originalUrl,
    provider: (req.params as any).provider,
    userId: (req.params as any).userId,
  });

  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    });
    return originalJson(body);
  };

  next();
};


