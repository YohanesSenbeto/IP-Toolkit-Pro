import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _resetRateLimit } from '@/lib/rate-limit';
import { rateLimitConfig } from '@/lib/env';

// We rely on defaults from env (window 60s, guest 30, auth 120) unless overridden.

describe('rate-limit', () => {
  beforeEach(() => {
    _resetRateLimit();
  });

  it('allows first guest request and decrements remaining', () => {
    const r = checkRateLimit('ip:1.1.1.1', false);
    expect(r.limited).toBe(false);
    expect(r.remaining).toBe(rateLimitConfig.maxGuest - 1);
  });

  it('limits only after exceeding guest quota (maxGuest + 1 attempt)', () => {
    const key = 'ip:2.2.2.2';
    for (let i = 0; i < rateLimitConfig.maxGuest; i++) {
      const r = checkRateLimit(key, false);
      expect(r.limited).toBe(false);
    }
    const blocked = checkRateLimit(key, false);
    expect(blocked.limited).toBe(true);
    expect(blocked.remaining).toBe(0);
  });

  it('uses higher limit for authenticated identifier', () => {
    const r = checkRateLimit('auth:user@example.com', true);
    expect(r.limit).toBe(rateLimitConfig.maxAuth);
  });
});
