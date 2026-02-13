export type LogLevel = "info" | "error" | "warn" | "debug";

interface LogMeta {
  [key: string]: unknown;
}

const formatLog = (level: LogLevel, message: string, meta?: LogMeta) => {
  const base = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  return meta ? { ...base, meta } : base;
};

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(JSON.stringify(formatLog("info", message, meta)));
  },

  error(message: string, meta?: LogMeta) {
    console.error(JSON.stringify(formatLog("error", message, meta)));
  },

  warn(message: string, meta?: LogMeta) {
    console.warn(JSON.stringify(formatLog("warn", message, meta)));
  },

  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(JSON.stringify(formatLog("debug", message, meta)));
    }
  },
};


