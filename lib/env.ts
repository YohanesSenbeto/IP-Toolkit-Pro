import { z } from 'zod';
import crypto from 'crypto';

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Provide a safe development fallback for NEXTAUTH_SECRET if missing/too short (to avoid 500s during local dev)
if (!isProd) {
  const current = process.env.NEXTAUTH_SECRET || '';
  if (current.length < 16) {
    // Generate a deterministic-but-constant per process fallback so session cookies remain valid during a dev run
    process.env.NEXTAUTH_SECRET = 'dev-insecure-' + crypto.randomBytes(8).toString('hex');
    // eslint-disable-next-line no-console
    console.warn('[env] Injected development NEXTAUTH_SECRET fallback. Set a proper NEXTAUTH_SECRET in your .env file.');
  }
}

// Define required and optional environment variables (after any dev fallback injection)
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url().optional(),
  // Enforce >=32 chars in production for session crypto strength. Allow >=16 in non-prod.
  // Use a single conditional .min() to avoid ZodEffects chaining issues seen previously.
  NEXTAUTH_SECRET: z.string().min(
    isProd ? 32 : 16,
    isProd
      ? 'NEXTAUTH_SECRET must be >=32 characters in production. Generate with: node -e "crypto.randomBytes(48).toString(\'hex\')"'
      : 'NEXTAUTH_SECRET should be reasonably long'
  ),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  HF_API_TOKEN: z.string().optional(),
  HF_MODEL: z.string().default('gpt2'),
  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_CHANNEL_ID: z.string().optional(),
  PRIVILEGED_EMAILS: z.string().optional(),
  LOG_LEVEL: z.enum(['trace','debug','info','warn','error','silent']).optional().default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_GUEST: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().int().positive().default(120)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  if (!isTest) {
    console.error('Environment variable validation failed:', parsed.error.flatten().fieldErrors);
    if (isProd) {
      // In production we fail fast
      throw new Error('Invalid environment configuration. See logs for details.');
    }
    // In development we continue with partial env to avoid hard blocking, but mark missing vars.
  }
}

export const env = (parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>));

type Env = typeof env;

export function getPrivilegedEmails(): string[] {
  return (env.PRIVILEGED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isPrivileged(email: string | undefined | null): boolean {
  if (!email) return false;
  return getPrivilegedEmails().includes(email.toLowerCase());
}

type StringEnvKeys = { [K in keyof Env]: Env[K] extends string ? K : never }[keyof Env];

export function requireEnv<K extends StringEnvKeys>(name: K): string {
  const value = env[name as keyof Env];
  if (!value) throw new Error(`Missing required env var: ${String(name)}`);
  return value as string;
}

export function getNextAuthSecret(): string {
  return env.NEXTAUTH_SECRET;
}

export const rateLimitConfig = {
  windowMs: (env as any).RATE_LIMIT_WINDOW_MS ?? 60_000,
  maxGuest: (env as any).RATE_LIMIT_MAX_GUEST ?? 30,
  maxAuth: (env as any).RATE_LIMIT_MAX_AUTH ?? 120,
};
