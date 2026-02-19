
export class ValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const requireString = (value: unknown, fieldName: string): string => {
  if (!isNonEmptyString(value)) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value.trim();
};

export const requireUrlString = (value: unknown, fieldName: string): string => {
  const str = requireString(value, fieldName);
  if (!validateUrl(str)) {
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }
  return str;
};

export const requireEmail = (value: unknown, fieldName: string): string => {
  const str = requireString(value, fieldName);
  // pragmatic email check; keep simple to avoid rejecting valid edge cases
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  if (!ok) {
    throw new ValidationError(`${fieldName} must be a valid email`);
  }
  return str;
};

export const requireBearerToken = (authorizationHeader: unknown): string => {
  if (!isNonEmptyString(authorizationHeader)) {
    throw new ValidationError("Authorization header with Bearer token is required");
  }
  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new ValidationError("Authorization header must start with Bearer");
  }
  const token = authorizationHeader.substring(7).trim();
  if (!token) {
    throw new ValidationError("Bearer token is required");
  }
  return token;
};

export const parseOptionalInt = (
  value: unknown,
  fieldName: string,
  opts?: { min?: number; max?: number }
): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }
  if (opts?.min !== undefined && n < opts.min) {
    throw new ValidationError(`${fieldName} must be >= ${opts.min}`);
  }
  if (opts?.max !== undefined && n > opts.max) {
    throw new ValidationError(`${fieldName} must be <= ${opts.max}`);
  }
  return n;
};

export const parseOptionalBoolean = (value: unknown, fieldName: string): boolean | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ValidationError(`${fieldName} must be a boolean (true/false)`);
};