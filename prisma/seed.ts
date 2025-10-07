/**
 * Unified Seed Orchestrator
 * Usage:
 *  npx tsx prisma/seed.ts --mode=basic
 *  npx tsx prisma/seed.ts --mode=full
 *  (default: basic)
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

interface SeedOptions { mode: 'basic' | 'full'; }

function parseArgs(): SeedOptions {
  const modeIndex = process.argv.indexOf('--mode');
  let mode: SeedOptions['mode'] = 'basic';
  if (modeIndex !== -1 && process.argv[modeIndex + 1]) {
    const val = process.argv[modeIndex + 1] as SeedOptions['mode'];
    if (val === 'basic' || val === 'full') mode = val; else console.warn(`[seed] Unknown mode '${val}', falling back to 'basic'.`);
  }
  return { mode };
}

async function runNodeScript(scriptRel: string) {
  const scriptPath = path.resolve(process.cwd(), 'prisma', scriptRel);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], { stdio: 'inherit' });
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${scriptRel} exited with code ${code}`)));
  });
}

async function main() {
  const { mode } = parseArgs();
  console.log(`\n[seed] Starting unified seeding (mode='${mode}')...`);

  // Always run baseline seed first
  try {
    await runNodeScript('seed.js');
  } catch (e) {
    console.error('[seed] Baseline seed failed:', e);
    process.exit(1);
  }

  if (mode === 'full') {
    try {
      await runNodeScript('seed-ethio-telecom.js');
    } catch (e) {
      console.error('[seed] Full (ethio-telecom) seed failed:', e);
      process.exit(1);
    }
  }

  console.log(`[seed] Completed successfully (mode='${mode}').`);
}

main().catch(e => {
  console.error('[seed] Orchestrator error:', e);
  process.exit(1);
});
