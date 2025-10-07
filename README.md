<div align="center">
  <h1>IP Toolkit Pro / NetConfig Hub</h1>
  <p><strong>Secure WAN IP analysis, IP pool management, router configuration & technician enablement for Ethio Telecom.</strong></p>
  <sup>Unified, audited & production‑minded Next.js 15 + Prisma + TypeScript platform.</sup>
</div>

---

## Table of Contents
1. Overview & Audience
2. Core Feature Summary
3. Architecture & Stack
4. Quick Start
5. Environment Variables
6. Database & Seeding
7. Authentication & Privileged Access
8. WAN IP Analyzer API
9. IP Pools & Enterprise Logic
10. Router Config Generator & Tutorials
11. Logging, Rate Limiting & Observability
12. Testing (Policy & Summary)
13. Roadmap (Selected)
14. Security Notes
15. Contributing & Test Commit Policy
16. Historical Consolidation Note
17. Development Practices & Structure
18. Performance & Refactoring Targets
19. Developer Growth Path
20. Quality Gates & Coverage

---
## 1. Overview & Audience
IP Toolkit Pro is an internal/controlled distribution platform for Ethio Telecom technicians, network engineers and informed customers. It centralises WAN IP analysis, IP assignments, router configuration guidance and tutorial video discovery.

Primary user groups:
- Technicians: IP pool lifecycle & customer assignment
- Network engineers: Subnet / CIDR / WAN diagnostics
- Customers (guided mode): Self‑serve configuration & education
- Administrators: Oversight, privileged bypass & auditability

Goals: correctness, transparency (structured logs, typed env), safe experimentation (seed modes), observability, guard rails (rate limiting + privilege gating).

---
## 2. Core Feature Summary
- WAN IP Analyzer: CIDR math, region/interface detection, network & assignment status.
- IP Pool Management: Role‑based provisioning, residential vs enterprise logic.
- Router Configuration Generator: Deterministic config outputs with gateway heuristics.
- Tutorial Video Module: YouTube channel integration + in‑app player.
- Structured Logging: JSON log events with adjustable verbosity.
- Rate Limiting: In‑memory fixed window (Redis‑ready abstraction path).
- Seeding Orchestrator: Basic vs full telecom dataset.
- Privileged Usage Gating: Email allowlist extends or bypasses analyzer limits.

---
## 3. Architecture & Stack (Condensed)
Frontend: Next.js 15 (App Router), TypeScript, Tailwind + DaisyUI + Radix + shadcn/ui.
Backend: Next.js API routes, Prisma (PostgreSQL), Zod validation, NextAuth.
Integrations: YouTube Data API (tutorials), Telegram Bot (optional), future CRM hook.
Utilities: Custom IPv4 calc module (`lib/ip-calculations.ts`), IP pool manager, structured logger, rate limiter.
Testing: Vitest + React Testing Library + jsdom; selective API handler invocation.

---
## 4. Quick Start
```bash
git clone <repo>
cd IP-Toolkit-Pro
cp .env.example .env   # fill real secrets
npm install
npx prisma migrate dev
npm run db:seed:full    # or npm run db:seed for minimal
npm run dev             # web + tools (add bot script if needed)
```
Health check: `GET /api/health` → `{ status: "ok" ... }`.

Manual WAN IP analysis walkthrough:
1. Sign in / or anonymous trial.
2. Tools → WAN IP Analyzer.
3. Enter WAN IP OR account/access number.
4. Analyze → expand detail & network info.
5. (Optional) Assign IP via POST endpoint.

---
## 5. Environment Variables
Validated centrally in `lib/env.ts` (Zod). Missing/invalid in production = fail fast.

Category | Keys
---------|-----
Core DB | `DATABASE_URL`
Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
Privileges | `PRIVILEGED_EMAILS` (comma separated lower‑cased)
Logging | `LOG_LEVEL` (trace|debug|info|warn|error|silent)
Rate Limiting | `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_GUEST`, `RATE_LIMIT_MAX_AUTH`
AI (optional) | `HF_API_TOKEN`, `HF_MODEL`
YouTube (optional) | `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`
Telegram (optional) | `TELEGRAM_BOT_TOKEN`

Process:
1. Add new var → update `.env.example`.
2. Extend schema in `lib/env.ts`.
3. Reference through `env.X` (never `process.env.X` outside env module).

Privileged emails helper:
```ts
import { isPrivileged } from '@/lib/env';
if (isPrivileged(session?.user?.email)) {/* relax limits */}
```

---
## 6. Database & Seeding
Prisma migrations live under `prisma/migrations`. Seed orchestrator (`prisma/seed.ts`) modes:
- `npm run db:seed` → baseline
- `npm run db:seed:full` → full telecom dataset (regions, interfaces, sample WAN IPs, tutorials)

Recommendation: use a separate database for automated tests if adding mutation tests later.

---
## 7. Authentication & Privileged Access
NextAuth local credentials + (extensible to OAuth). Privileged flow:
- Email in `PRIVILEGED_EMAILS` → analyzer gating bypass (and rate limiter bypass for now).
- Guests: 1 free analyzer try.
- Auth non‑verified: 2 tries until YouTube subscribe proof (future).

Security baseline: bcrypt hashing (see `lib/auth.ts`), long `NEXTAUTH_SECRET` in prod, dev fallback auto‑injected if absent (warns, not for prod).

---
## 8. WAN IP Analyzer API
`GET /api/wan-ip/analyze?ip=1.2.3.4`
Returns: IP network info, matched region/interface, recommendations, assignment status, optional history id.

`POST /api/wan-ip/analyze`
Body (JSON): `{ "wanIp": "x.x.x.x", "accountNumber": "#########" }` plus optional details.
Behavior: assigns IP if not in active use; returns conflict 409 if already assigned.
Errors: 400 (validation), 404 (interface not found), 429 (rate limited), 500.

Sample GET minimal success (truncated):
```json
{
  "ipAddress":"10.10.10.5",
  "networkInfo":{"cidr":24,"subnetMask":"255.255.255.0"},
  "region":{"name":"Addis"},
  "interface":{"name":"BB-Addis-01"},
  "status":{"assigned":false,"available":true}
}
```

---
## 9. IP Pools & Enterprise Logic
`lib/ip-pool-manager.ts` manages ranges, default gateway heuristics differ per customer type:
- Residential: gateway = IP − 1
- Enterprise: gateway = IP − 2 or IP − 3 (configurable preference)
Enums (`CustomerType`, `ServiceType`) augment classification.

Enterprise example (/29): host `.12` → gateway `.9` or `.10`, mask `255.255.255.248`, usable range `.10-.14`.

---
## 10. Router Config Generator & Tutorials
Generates PPPoE or static WAN settings using analyzer + pool data.
Tutorial videos fetched via YouTube API if keys provided.

YouTube setup summary:
1. Enable YouTube Data API v3 in Google Cloud.
2. Add `YOUTUBE_API_KEY` + `YOUTUBE_CHANNEL_ID` to env.
3. Restart dev server.

---
## 11. Logging, Rate Limiting & Observability
Logging: `lib/logger.ts` JSON events; control with `LOG_LEVEL`.
Rate Limiting: `lib/rate-limit.ts` in‑memory fixed window; headers: `Retry-After`, `X-RateLimit-*`.
Planned: correlation IDs middleware, Redis limiter adapter, structured error taxonomy.

---
## 12. Testing (Policy & Summary)
Tooling: Vitest + RTL + jsdom. API handlers directly imported for fast tests.
Representative suites: IP math, WAN analyzer negative paths, rate limiting, accessibility.
Deep dive & command catalog: see `TESTING_GUIDE.md` (kept intentionally).

Policy: **All test files are committed**. They are executable specifications and required for CI quality gates. Do not strip tests before pushing. Coverage thresholds to be introduced incrementally.

Quick commands:
```bash
npm test            # full
npm run test:watch  # watch
npm run test:coverage
```

---
## 13. Roadmap (Selected)
- Correlation IDs in logger + request context
- Redis / Upstash rate limiter adapter
- Playwright E2E happy path (login → analyze → assign)
- Coverage threshold ratcheting (start ~55%)
- Optional pino transport & log shipping
- IPv6 analysis support
- Centralized error shape + error codes
- Security headers (CSP, Referrer-Policy, Frame-Options)
- Queue for background enrichment (BullMQ / Redis)

---
## 14. Security Notes
- Never commit real `.env` secrets (use `.env.example` only).
- Strong `NEXTAUTH_SECRET` ≥ 32 chars in production.
- Principle of least privilege for privileged emails—rotate periodically.
- Validate all user input (already enforced via Zod in routes & env).
- Consider adding CSP & security headers (future middleware enhancement).

### 14.1 Recent Hardening (October 2025)
Implemented defense-in-depth measures:

Sanitization & Validation:
- Introduced central sanitization helpers in `lib/sanitize.ts` (`sanitizeHTML`, `sanitizePlain`, `pickAllowed`).
- Hardened POST routes (`/api/tutorials`, `/api/calculations`, `/api/vpn-data-customers`, `/api/crm/customer-lookup`, `/api/social/telegram/verify`, technician pool & assignment, YouTube sync) with Zod schemas + field whitelisting.
- Eliminated mass-assignment risk by explicitly picking allowed keys & recomputing sensitive `result` values server-side for calculations.

Content Security Policy & Headers (via `next.config.ts`):
- Production CSP: restrictive defaults (`default-src 'self'`; no inline/eval for scripts or styles; no remote object/embed; controlled connect/image/font directives).
- Development CSP: temporarily relaxes `script-src` / `style-src` with `'unsafe-inline'` (and `'unsafe-eval'` for dev tooling) plus `ws:` / `wss:` in `connect-src` to enable Next.js HMR overlays and prevent hydration/theme flicker. This is automatically applied only when `NODE_ENV !== 'production'`.
- `X-Frame-Options: SAMEORIGIN` & frame-ancestors equivalent in CSP to mitigate clickjacking.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimizing browser feature surface.

Rate Limiting Expansion:
- Added per-route identifiers for create/update style endpoints (tutorial create, VPN/Data customer upsert, CRM network config update, Telegram verify, technician pools assignment, YouTube sync) using existing in-memory fixed window limiter.
- Pattern: `feature:action:ip` to simplify future Redis migration.

Testing Additions:
- Sanitizer tests (`tests/sanitize.test.ts`) ensure `<script>` stripped, formatting tags preserved, whitespace normalized.
- Security headers test asserts CSP presence.

Residual / Future Security Work:
- Migrate limiter to Redis/Upstash for horizontal scalability.
- Introduce correlation IDs & structured error codes (ROADMAP).
- Add HTML sanitization to any future rich text inputs before persistence.
- Consider integrating Helmet-equivalent middleware for incremental tightening (remove `'unsafe-inline'` once inline script/style eliminated).
- Add Playwright security regression smoke (e.g., reflected input not executed as HTML).

Operational Guidance:
- When adding a new route: define Zod schema, sanitize string inputs, limit array sizes, and enforce rate limiter if it mutates state.
- Treat any future markdown/HTML rendering as untrusted; pass through `sanitizeHTML` or a stricter policy.

Threat Coverage Summary:
| Threat | Mitigation |
|--------|------------|
| Stored/Reflected XSS | HTML + plain text sanitization; CSP baseline |
| Mass assignment | `pickAllowed`, schema validation |
| Input abuse (flooding) | Per-route rate limiting |
| Clickjacking | Frame protections via CSP + X-Frame-Options |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Excess browser APIs | Minimal `Permissions-Policy` |

Security Review Checklist (light):
1. New external input? Add Zod schema + sanitization.
2. New mutation route? Add rate limiter key.
3. Returning user-supplied string? Ensure previously sanitized or escape.
4. Adding inline scripts/styles? Prefer removal; else adjust CSP consciously.
5. Storing HTML? Store ONLY sanitized version.

Refer to issue tracker for remaining medium-priority items (Redis limiter, correlation IDs, unified error taxonomy).

### 14.2 Sanitization Utilities – Install & Use
Install (runtime + types):
```bash
npm install sanitize-html
npm i --save-dev @types/sanitize-html
```

Usage examples (see `lib/sanitize.ts`):
```ts
import { sanitizeHTML, sanitizePlain, pickAllowed } from '@/lib/sanitize';

// Plain text (titles, names)
const safeTitle = sanitizePlain(userInputTitle, { maxLength: 120 });

// Rich text (limited HTML formatting)
const safeContent = sanitizeHTML(richTextFromEditor);

// Whitelist object fields before validation/saving
const picked = pickAllowed(reqBody, ['title','content','videoUrl'] as const);
```

Rationale:
- Prevent stored/reflected XSS by stripping scripts/event handlers.
- Normalize whitespace & remove control chars for plain text.
- Enforce object key allow‑listing to reduce accidental over‑posting.

### 14.3 Additional Enhancements (Request IDs, CSP Tightening, Limiter Adapter)
Request Correlation:
- Added `middleware.ts` injecting `x-request-id` for every request; IDs surface in logs via child logger namespaces (e.g. `wan-ip-analyze:<uuid>`). Generation uses `crypto.randomUUID()` (Web Crypto, edge‑safe) with a lightweight JS fallback—no Node `crypto` dependency required in edge runtime.
- Use this header in any downstream services for trace continuity.

CSP Hardening:
- Production build strips `'unsafe-inline'` / `'unsafe-eval'` from `script-src` and `'unsafe-inline'` from `style-src` (see `next.config.ts`).
- Development build intentionally re-adds them to preserve DX (hot reload, inline style injection) and eliminate render flicker caused by blocked inline hydration styles; this does NOT ship to production.
- Future plan: introduce nonce or hash based CSP to also remove inline allowances in dev while retaining tooling compatibility (see subsection 14.4).
- If a future change requires deliberate inline snippets in production, prefer nonced scripts (`script-src 'self' 'nonce-<value>'`) or hashed blocks; avoid broad inline allowances.

Rate Limiter Adapter Scaffold:
- Refactored `lib/rate-limit.ts` to expose `useRateLimiter(adapter)` while keeping `checkRateLimit` API stable.
- Default adapter: in-memory fixed window.
- Future Redis adapter can implement `consume(identifier, limit, windowMs)` and register via `useRateLimiter(new RedisAdapter(...))` without touching call sites.

Operational Guidance:
- Treat request ID as required logging context in any new route: `const log = logger.child('feature:'+reqId)`.
- Before deploying Redis limiter: define environment toggles and fallback semantics (graceful degrade to memory if Redis unavailable).

### 14.4 Dev vs Prod CSP Policy & Future Nonce Plan
Rationale for Conditional Policy:
- Tight CSP (no inline) uncovered development flicker: Next.js dev overlay + theming injected transient inline `<style>` tags blocked by `style-src 'self'` leading to hydration warnings & FOUC.
- Allowing `'unsafe-inline'` *only in development* restores stable HMR and eliminates false-positive CSP console noise while preserving a locked-down production runtime.

Current Effective Directives:
- Production `script-src`: `script-src 'self'`
- Production `style-src`: `style-src 'self'`
- Development `script-src`: `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
- Development `style-src`: `style-src 'self' 'unsafe-inline'`
- Development `connect-src` adds `ws:` / `wss:` for HMR sockets.

Planned Evolution (phased):
1. Introduce nonce generator in a shared utility (e.g. `lib/csp.ts`) exported to `next.config.ts` & a custom `_document` / root layout for injecting `nonce` attributes.
2. Replace dev `'unsafe-inline'` with `'nonce-<value>'` for critical inline hydration script blocks & style tags (if any). Retain `'unsafe-eval'` only if tooling still mandates it; otherwise drop.
3. Add runtime self-test: log a warning if an inline `<script>` or `<style>` lacking a nonce is encountered in development.
4. Remove `'unsafe-eval'` entirely once no stack traces or overlay tooling depend on it.

Security Posture Impact:
- Current production CSP already prevents inline script/style injection (mitigates the majority of reflected/stored XSS vectors when paired with sanitization).
- Conditional dev relaxation is low risk (non-production) and prevents developers from disabling CSP entirely out of frustration.

Action Items (tracked in roadmap):
- [ ] Add nonce utility & wiring.
- [ ] Replace dev inline allowances with nonces.
- [ ] Introduce automated CSP regression test ensuring production policy has no `'unsafe-*'` tokens.

---
## 15. Contributing & Test Commit Policy
1. Create feature branch.
2. Add/extend tests for new behavior (red/green/refactor ideal).
3. Run lint + typecheck + coverage locally before PR.
4. Avoid unrelated formatting churn.
5. Keep documentation section updates minimal & atomic.

Test Inclusion Rationale: regression prevention, living documentation, CI enforcement. If a change is hard to test—leave a TODO comment explaining why, not silence.

---
## 16. Historical Consolidation Note
The following separate markdown documents were merged into this unified README for clarity: `COMPLETE_APP_DOCUMENTATION.md`, `DOCUMENTATION.md`, `ENVIRONMENT_SETUP.md`, `PROJECT_ENHANCEMENTS.md`, `WAN_IP_ANALYZER_API_DOC.md`, `YOUTUBE_API_SETUP.md`, `YOUTUBE_SETUP_GUIDE.md`, `README_tmp_new.md`, `ARCHITECTURE_AND_PRACTICES.md`. The standalone `TESTING_GUIDE.md` is preserved for in‑depth workflows.

All legacy source markdown files listed above have now been physically removed from the repository to eliminate drift; only `README.md` and `TESTING_GUIDE.md` are retained as canonical documentation.

---
## 17. Development Practices & Structure
Directory Highlights:
```
app/        # App Router pages (UI + API route handlers)
components/ # Reusable UI & domain-specific presentational parts
lib/        # Core logic (auth, prisma, ip calculations, logger, rate limit)
prisma/     # Schema, migrations, seed orchestrator
tests/      # Vitest suites (unit, component, api)
```
Guidelines:
- Prefer Server Components for static / cacheable data; use Client Components only for interactive state.
- Keep business logic in pure lib modules, not React components.
- Add Zod schemas for every external input (query/body/env) centrally.
- Short lived feature branches; small PRs (<300 lines diff ideal).

Styling:
- Single `tailwind.config.ts` (type-safe), dark mode via `class` strategy.
- Avoid one-off deep custom CSS; compose utilities & design tokens.
- Standardize on one icon library (lucide-react recommended).

Logging & Errors:
- Use `logger.child('namespace')` for feature modules.
- Emit structured errors: `{ error, code, traceId? }` (roadmap item to standardize codes).

API Best Practices:
- Validate inputs at route boundary.
- Narrow catch blocks; map known errors to 4xx, unknown to 500 with opaque message.
- Include `Cache-Control` headers where responses are deterministic & public-safe.

Testing Strategy:
- Unit test pure functions (ip calculations, pool logic) exhaustively for edge cases (/31, /32).
- Component tests cover keyboard a11y paths.
- API tests assert error surfaces & rate limit headers.
- E2E (future) reserved for critical golden paths only.

Seeding:
- Use basic mode for local iteration; full mode before demos or integration testing.
- Never run full seed against production without explicit approval.

Security Hygiene:
- No hard-coded privileged emails: always env-driven.
- Add new secrets only via schema update + `.env.example` placeholder.
- Principle of least privilege for future roles (RBAC roadmap).

---
## 18. Performance & Refactoring Targets
Current Focus Areas:
- WAN Analyzer component composition: keep subcomponents lean & memoize heavy tables.
- Reduce duplicate region/interface enrichment logic (consolidate in a single service module if it grows further).
- Replace repetitive fallback chains (`a || b || c || '—'`) with utility helpers for clarity.
- Introduce micro-bench (Vitest + `performance.now`) for hot ip calculation paths if IPv6 expansion lands.

Refactor Backlog:
- Migrate rate limiter to adapter pattern (in-memory now; Redis later) without changing `checkRateLimit` signature.
- Standardize error codes (e.g. `ERR_INVALID_IP`, `ERR_RATE_LIMITED`).
- Introduce correlation ID propagation through logger context.
- Consider extracting router configuration generator to its own domain module with formal input/output types.

---
## 19. Developer Growth Path
Progression Milestones:
1. Consistency: Follow existing patterns (env validation, logging usage, test-first for utils).
2. Confidence: Add missing edge-case tests before refactors.
3. Observability: Expand structured logging with correlation IDs & field redaction.
4. Hardening: Implement security headers + stricter authZ checks per route.
5. Scalability: Swap rate limiter backend; evaluate queue for asynchronous enrichment tasks.
6. Evolution: Plan IPv6 support via separate module, guarded behind feature flag.
7. Mentorship: Document architectural intent when adding new domain modules.

Learning Resources (suggested):
- Next.js App Router advanced patterns (streaming, partial rendering).
- Prisma performance tuning (indexes, relation loads, EXPLAIN plans).
- Zod advanced schemas (discriminated unions for variant payloads).
- Testing: Property-based testing for ip math (fast-check) as an optional enhancement.

---
## 20. Quality Gates & Coverage
Current baseline coverage thresholds (Vitest `vitest.config.ts`):
Lines ≥ 55%, Statements ≥ 55%, Functions ≥ 50%, Branches ≥ 45%.

Policy:
- CI fails if thresholds not met (incremental ratchet: increase after sustained improvement for 2–3 PRs).
- New logic (non-trivial branches) should include at least one negative-path test.
- Pure calculation modules target >90% lines before raising global thresholds.

Raising Thresholds:
1. Add tests to lift weakest metric above desired new floor.
2. Update `thresholds` block in `vitest.config.ts` (commit separately from feature changes).
3. Mention the raise in PR description (CHANGELOG entry optional if you adopt one).

Temporary Exceptions:
- If a refactor temporarily drops coverage, add a TODO tagged with `COVERAGE_DEBT:` and open an issue; resolve within the next sprint.

Future Enhancements:
- Add coverage badge (GitHub Action + shields.io + artifact parse).
- Per-package thresholds if repo evolves into a monorepo.

Doc Hygiene:
An automated docs guard (`npm run guard:docs`) enforces that only `README.md` and `TESTING_GUIDE.md` (plus optional `LICENSE` / `CHANGELOG.md`) exist at the repository root to prevent fragmentation returning.

---
<sub>© Ethio Telecom internal tooling initiative. Iterate safely – small, well‑tested changes.</sub>
