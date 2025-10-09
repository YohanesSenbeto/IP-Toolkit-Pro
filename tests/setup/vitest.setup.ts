import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Basic mock placeholder (extend if a component relies on router)
vi.stubGlobal('nextRouter', {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
});

// Mock next-auth's useSession to avoid needing a real <SessionProvider /> in pure component tests.
vi.mock('next-auth/react', async () => {
  return {
    __esModule: true,
    useSession: () => ({ data: { user: { email: 'test@example.com' } }, status: 'authenticated' }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: any) => children,
  };
});
