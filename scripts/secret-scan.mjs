import fs from 'node:fs';
import path from 'node:path';
const skip = new Set([
  'node_modules',
  '.git',
  'dist',
  '.vercel',
  'test-results',
  'playwright-report',
  '.wrangler',
]);
const bad = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      skip.has(e.name) ||
      (e.name.startsWith('.env') && e.name !== '.env.example')
    )
      continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (
      /\.(ts|tsx|js|mjs|json|md|sql|html|yml|yaml)$/.test(p) &&
      !p.endsWith('package-lock.json') &&
      !p.endsWith('secret-scan.mjs')
    ) {
      const s = fs.readFileSync(p, 'utf8');
      if (
        /(?:sb_secret_[A-Za-z0-9_-]{12,}|sk-[A-Za-z0-9]{24,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})/.test(
          s,
        )
      )
        bad.push(p);
    }
  }
}
walk('.');
if (bad.length) {
  console.error('Potential secrets:', bad);
  process.exit(1);
}
console.log(
  'Secret pattern scan passed (source files; ignored local environment).',
);
