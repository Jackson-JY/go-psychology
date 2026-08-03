import type { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
  methods?: Set<string>;
  keyGenerator?: (req: Request) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function defaultKeyGenerator(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim());
    return parts[parts.length - 1] || req.ip || "unknown";
  }
  return req.ip || "unknown";
}

export function createRateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    message = "请求过于频繁，请稍后再试",
    methods = new Set(["POST", "PUT", "PATCH", "DELETE"]),
    keyGenerator = defaultKeyGenerator,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!methods.has(req.method)) {
      next();
      return;
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > maxRequests) {
      res.status(429).json({ error: message });
      return;
    }

    next();
  };
}

export function cleanupRateLimitBuckets(maxIdleMs = 10 * 60_000): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt + maxIdleMs < now) {
      buckets.delete(key);
    }
  }
}
