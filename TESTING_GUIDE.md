# IP Toolkit Pro – Complete Testing Guide

This guide centralizes all practical steps, commands, and patterns for setting up and running tests across layers (unit, component, integration, future E2E) without modifying the main architecture document.

---
## 1. Minimum Environment
| Tool | Required | Recommended |
|------|----------|-------------|
| Node.js | >= 18.x | 20.18.x LTS |
| npm | >= 9 | Bundled w/ Node 20 |
| OS | Any (Win / WSL / macOS / Linux) | WSL2 for Windows dev |

Check versions:
```bash
node -v
npm -v
```

---
## 2. One-Time Setup
### 2.1 Install Node (if outdated)
Using nvm (Linux/macOS/WSL):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
nvm install 20.18.0
nvm use 20.18.0
```
Windows (nvm-windows): Download installer: https://github.com/coreybutler/nvm-windows/releases then:
```powershell
nvm install 20.18.0
nvm use 20.18.0
node -v
```
Create `.nvmrc` (optional):
```bash
echo "20.18.0" > .nvmrc
```

### 2.2 Clean & Install Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```
If test deps missing:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

---
## 3. Project Test Commands
| Script | Purpose |
|--------|---------|
| `npm test` | Run full suite once (CI mode). |
| `npm run test:watch` | Watch mode for TDD. |
| `npm run test:coverage` | Text + HTML coverage report (`coverage/`). |

Run a focused file:
```bash
npx vitest run tests/unit/dataNormalization.test.ts
```
Watch only changed tests:
```bash
npx vitest --watch
```

---
## 4. Current Layers Covered
| Layer | Location | Status |
|-------|----------|--------|
| Utilities | `tests/unit/*.test.ts` | Active |
| Components (UI) | `tests/component/*.test.tsx` | Active |
| API (planned) | `tests/api/*.test.ts` | Pending scaffolding |
| E2E | `playwright/` (future) | Not started |

---
## 5. Adding a New Unit Test
1. Create file under `tests/unit/` (suffix: `.test.ts`).
2. Import the function from its module.
3. Use named tests with clear behavior phrasing.

Example:
```ts
import { describe, it, expect } from 'vitest';
import { resolveFirst } from '@/app/tools/wan-ip-analyzer/components/dataNormalization';

describe('resolveFirst', () => {
  it('skips empty, null, undefined, and 0 values', () => {
    const a = { foo: 0 };
    const b = { bar: '' };
    const c = { foo: 'chosen' };
    expect(resolveFirst([a, b, c], ['foo', 'bar'])).toBe('chosen');
  });
});
```

---
## 6. Component Test Patterns
Central test libs: React Testing Library + jest-dom matchers.

Guidelines:
- Query by role or accessible name (avoid brittle class selectors).
- Simulate keyboard inputs for accessibility features.
- Avoid asserting implementation details (e.g. internal state).

Example (dropdown already included):
```ts
import { render, screen, fireEvent } from '@testing-library/react';
import Page from '@/app/tools/wan-ip-analyzer/page';

it('opens dropdown with ArrowDown and closes on selection', () => {
  render(<Page />);
  const trigger = screen.getByRole('button', { name: /wan ip/i });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  const listbox = screen.getByRole('listbox');
  fireEvent.keyDown(listbox, { key: 'ArrowDown' });
  fireEvent.keyDown(listbox, { key: 'Enter' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
```

---
## 7. Mocking & Test Environment
Global mocks live in `tests/setup/vitest.setup.ts`:
- Mocks `next-auth/react` (`useSession`) to simulate authenticated state.
- Adds placeholder router stub.

Adding a new mock:
```ts
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
```

---
## 8. Coverage
Generate report:
```bash
npm run test:coverage
```
Open HTML:
```bash
# Linux / macOS
going to coverage/index.html in a browser
# WSL
gx-www-browser coverage/index.html 2>/dev/null || echo "Open manually"
```
Exclude patterns configured in `vitest.config.ts` under `coverage.exclude`.

---
## 9. API Route Testing (Planned Scaffold)
Goal: Call route handlers directly without spinning full Next server.

Pattern (example draft):
```ts
import { describe, it, expect } from 'vitest';
import analyzeHandler from '@/app/api/wan-ip/analyze/route'; // adjust when exported

// Pseudocode; Next route handlers export functions (GET/POST) not default
// import { GET } from '@/app/api/wan-ip/analyze/route';

it('rejects invalid IP', async () => {
  const req = new Request('http://localhost/api/wan-ip/analyze?ip=999.1.1.1');
  const res = await GET(req as any);
  const body = await res.json();
  expect(res.status).toBe(400);
  expect(body.error).toMatch(/invalid/i);
});
```

Steps to enable:
1. Export named `GET` / `POST` handlers (already done by default with App Router).
2. Provide minimal polyfills if needed (Request/Response globally available in Node >= 18).
3. Use a dedicated test DB if mutating.

Test DB env:
```bash
cp .env.local .env.test
# Edit DATABASE_URL in .env.test
DATABASE_URL=postgres://user:pass@localhost:5432/ip_toolkit_test
DATABASE_URL=$(grep DATABASE_URL .env.test | cut -d '=' -f2) npx prisma migrate deploy
```
Run with env:
```bash
DATABASE_URL=postgres://user:pass@localhost:5432/ip_toolkit_test npm test
```

---
## 10. Recommended Next Additions
| Priority | Task | Benefit |
|----------|------|---------|
| High | Add first API tests | Validates request validation + error shapes |
| High | Add IP calc module tests | Ensures math correctness / regression guard |
| Medium | Snapshot sanitized API JSON | Detect contract drift |
| Medium | Introduce MSW for network mocking (components) | Stable component tests without real fetch |
| Low | Playwright E2E | Full workflow assurance |

---
## 11. Troubleshooting Matrix
| Symptom | Cause | Fix |
|---------|-------|-----|
| Engine warnings (package requires Node >=18) | Old Node in shell | `nvm use 20.18.0` |
| `useSession` provider error | Missing mock | Ensure setup file mocks `next-auth/react` |
| `fetch` undefined (older Node) | Node <18 | Upgrade Node |
| Stuck open dropdown in test | Missing keyboard close logic | Ensure handler toggles state + test waits |
| Prisma client not found | `node_modules/.prisma` missing | `npx prisma generate` |

---
## 12. CI Integration (Template)
Add GitHub Action `.github/workflows/test.yml` (example skeleton):
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test
```
Extend later with DB service + Playwright.

---
## 13. Style & Naming Conventions
| Type | Convention |
|------|------------|
| Test file | `*.test.ts(x)` |
| Describe block | Behavior / module name | 
| Test name | Present tense, user-focused ("closes on selection") |
| Helper functions | Co-locate in `/tests/utils/` if reused |

---
## 14. Keeping Docs in Sync
Whenever you add a new test layer:
1. Update this file section (layers covered table).
2. Update Architecture doc Section 21 if contract or tools change.
3. Keep coverage thresholds explicit once stable (future: add `thresholds` in vitest config).

---
## 15. Fast Reference (Cheat Sheet)
```bash
# Run all
npm test
# Watch
npm run test:watch
# Coverage
npm run test:coverage
# Single file
npx vitest run tests/unit/dataNormalization.test.ts
# Filter by name
npx vitest run --testNamePattern "dropdown"
# Debug (Node inspector)
node --inspect-brk node_modules/.bin/vitest run tests/unit/dataNormalization.test.ts
```

### 15.1 Extended Command Reference (Bash & PowerShell)

#### Bash / Git Bash
```bash
npm test
npm run test:watch
npm run test:coverage
npm run test -- tests/unit/ipCalculations.test.ts
npm run test -- tests/api/analyze.get.test.ts
npm run test -- tests/component/dropdownKeyboard.test.tsx
npm run test -- tests/unit/logger.test.ts tests/unit/rateLimit.test.ts
npm run test -- -t rate-limit
npm run test -- -t "returns 429"
npm run test -- --bail=1
npm run test -- --test-timeout=15000
npm run test:coverage
open coverage/index.html 2>/dev/null || xdg-open coverage/index.html 2>/dev/null || echo "Open coverage/index.html manually"
DATABASE_URL=postgres://user:pass@localhost:5432/ip_toolkit_test npm test
npm run lint && npx tsc --noEmit && npm test
node --inspect-brk node_modules/.bin/vitest run tests/unit/logger.test.ts
```

#### PowerShell
```powershell
npm test
npm run test:watch
npm run test:coverage
npm run test -- tests\unit\ipCalculations.test.ts
npm run test -- tests\api\analyze.get.test.ts
npm run test -- tests\component\dropdownKeyboard.test.tsx
npm run test -- tests\unit\logger.test.ts tests\unit\rateLimit.test.ts
npm run test -- -t rate-limit
npm run test -- -t "returns 429"
npm run test -- --bail=1
npm run test -- --test-timeout=15000
npm run test:coverage
$env:DATABASE_URL="postgres://user:pass@localhost:5432/ip_toolkit_test"; npm test
Remove-Item Env:DATABASE_URL
npm run lint; npx tsc --noEmit; npm test
node --inspect-brk node_modules/.bin/vitest run tests/unit/logger.test.ts
```

---
## 16. Roadmap (Testing)
- [ ] Add API route handler invocation tests
- [ ] Introduce MSW for network-bound component tests
- [ ] Extract network/IP math into `lib/ip-calculations.ts` and test edge CIDRs
- [ ] Add Playwright E2E smoke (login → analyze → detail toggle)
- [ ] Add snapshot tests for stable API response shapes (timestamp stripped)
- [ ] Enforce coverage threshold (e.g. 60% → 75%)

---
## 17. License / Attribution
Internal testing guide – not for external redistribution without review.

> Iterate: small, meaningful tests prevent large, expensive regressions.
