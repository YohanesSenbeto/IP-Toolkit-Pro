import { rateLimitConfig } from './env';
import { logger } from './logger';

// Pluggable rate limiter abstraction.
// Default: simple in-memory fixed window counter with per-identifier buckets.
// Adapter pattern added for future Redis / Upstash implementation without changing public API.

interface Bucket {
  windowStart: number;
  count: number;
}

const buckets: Map<string, Bucket> = new Map(); // in-memory storage

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number; // epoch ms when window resets
  limit: number;
}

function now() { return Date.now(); }

export interface RateLimiterAdapter {
  consume(identifier: string, limit: number, windowMs: number): RateLimitResult;
}

class MemoryRateLimiter implements RateLimiterAdapter {
  consume(identifier: string, limit: number, windowMs: number): RateLimitResult {
    const ts = now();
    const bucket = buckets.get(identifier);
    if (!bucket || (ts - bucket.windowStart) >= windowMs) {
      buckets.set(identifier, { windowStart: ts, count: 1 });
      return { limited: false, remaining: limit - 1, resetAt: ts + windowMs, limit };
    }
    if (bucket.count >= limit) {
      return { limited: true, remaining: 0, resetAt: bucket.windowStart + windowMs, limit };
    }
    bucket.count += 1;
    return { limited: false, remaining: limit - bucket.count, resetAt: bucket.windowStart + windowMs, limit };
  }
}

// Placeholder for future Redis adapter (not implemented yet)
// class RedisRateLimiter implements RateLimiterAdapter { ... }

let adapter: RateLimiterAdapter = new MemoryRateLimiter();

export function useRateLimiter(custom: RateLimiterAdapter) {
  adapter = custom;
}

export function checkRateLimit(identifier: string, isAuthenticated: boolean): RateLimitResult {
  const windowMs = rateLimitConfig.windowMs || 60_000;
  const maxGuest = rateLimitConfig.maxGuest || 30;
  const maxAuth = rateLimitConfig.maxAuth || 120;
  const limit = isAuthenticated ? maxAuth : maxGuest;
  return adapter.consume(identifier, limit, windowMs);
}

// For tests to clear state
export function _resetRateLimit() {
  buckets.clear();
}

// Periodic cleanup (best-effort) - not strictly necessary but bounds memory
let lastSweep = 0;
const SWEEP_INTERVAL = 10 * 60 * 1000; // 10 minutes
export function sweepExpired() {
  const { windowMs } = rateLimitConfig;
  const ts = now();
  if (ts - lastSweep < SWEEP_INTERVAL) return;
  for (const [k, b] of buckets.entries()) {
    if (ts - b.windowStart >= windowMs) buckets.delete(k);
  }
  lastSweep = ts;
  logger.debug('Rate limit sweep completed', { remainingKeys: buckets.size });
}
