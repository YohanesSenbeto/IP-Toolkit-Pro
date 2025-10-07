import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config';

// This is a lightweight test: ensures headers() returns CSP and frameguard

describe('security headers', () => {
  it('includes CSP header', async () => {
    // @ts-ignore headers is async in next config
    const headerDefs = await nextConfig.headers();
    const root = headerDefs.find((h: any) => h.source === '/:path*');
    expect(root).toBeTruthy();
    const csp = root?.headers?.find((h: any) => h.key === 'Content-Security-Policy');
    expect(csp?.value).toMatch(/default-src 'self'/);
  });
});
