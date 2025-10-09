import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-auth session
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue(null)
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    ethioTelecomRegion: {
      findMany: vi.fn().mockResolvedValue([])
    },
    wanIpAnalyzerHistory: {
      create: vi.fn().mockResolvedValue({ id: 'history123' })
    }
  }
}));

// Mock IP utils
vi.mock('@/lib/cidr-utils', () => ({
  isValidIp: (ip: string) => /^\d+\.\d+\.\d+\.\d+$/.test(ip) && ip !== '999.1.1.1',
  calculateIpInfo: vi.fn().mockReturnValue({ cidr: 24 }),
  findRegionForIp: vi.fn().mockReturnValue(null),
  getRouterRecommendation: vi.fn().mockReturnValue('RouterX'),
  getTutorialUrls: vi.fn().mockReturnValue([])
}));

// Mock rate limiter directly (limit = 2 before blocking)
vi.mock('@/lib/rate-limit', () => {
  let count = 0;
  return {
    checkRateLimit: () => {
      count++;
      const limit = 2;
      const limited = count > limit;
      return {
        limited,
        remaining: limited ? 0 : (limit - count),
        resetAt: Date.now() + 60_000,
        limit
      };
    }
  };
});

function buildRequest(url: string, cookie?: string) {
  return new Request(url, { headers: cookie ? { cookie } : undefined });
}

// Import after mocks
import { GET } from '@/app/api/wan-ip/analyze/route';

describe('GET /api/wan-ip/analyze', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 when ip param missing', async () => {
    const req = buildRequest('http://localhost/api/wan-ip/analyze');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it('returns 400 for invalid ip format', async () => {
    const req = buildRequest('http://localhost/api/wan-ip/analyze?ip=999.1.1.1');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('returns 429 after exceeding rate limit', async () => {
    const ok1 = await GET(buildRequest('http://localhost/api/wan-ip/analyze?ip=1.1.1.1') as any);
    expect(ok1.status).not.toBe(429);
    const ok2 = await GET(buildRequest('http://localhost/api/wan-ip/analyze?ip=1.1.1.1') as any);
    // Third request should be limited (mock limiter allows 2)
    const blocked = await GET(buildRequest('http://localhost/api/wan-ip/analyze?ip=1.1.1.1') as any);
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body.error).toMatch(/rate limit/i);
  });
});
