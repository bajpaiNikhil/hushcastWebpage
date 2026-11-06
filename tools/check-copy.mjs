// Enforces the copy rules in CLAUDE.md / PRD section 6 on the built pages and CSS.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(dist);
const problems = [], todos = [];

const FORBIDDEN = [
  [/\bsecure(ly|d)?\b/i, 'secure'], [/\bsecurity\b/i, 'security'], [/military-grade|unhackable/i, 'military-grade/unhackable'],
  [/\bzero[- ]latency\b/i, 'zero latency'], [/\b4K video\b/i, '4K video'],
  [/(?<!almost )\breal-?time\b/i, 'real-time'], [/\bany (modern )?browser\b/i, 'any browser'],
  [/\bwebrtc\b/i, 'WebRTC'], [/\bHLS\b/, 'HLS'], [/\bseamless(ly)?\b/i, 'seamless'],
  [/\brevolutionary\b/i, 'revolutionary'], [/\bblazing\b/i, 'blazing'],
  [/\b(netflix|prime video|disney\+?)\b/i, 'named DRM app'],
];
const ALLOWED_CAPS = new Set(['QR', 'IP', 'URL', 'KB', 'MB', 'DRM', 'PRD']);

for (const f of files.filter((f) => f.endsWith('.html'))) {
  const rel = path.relative(dist, f);
  const raw = fs.readFileSync(f, 'utf8');
  const text = raw
    .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<(title|desc)[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
  // "encrypted" is only allowed in the negative ("not encrypted") or in the FAQ question "Is it encrypted?"
  for (const m of text.matchAll(/\bencrypt\w*/gi)) if (!/(\bnot|\bis it) $/i.test(text.slice(Math.max(0, m.index - 7), m.index))) problems.push(`${rel}: "${m[0]}" (encrypted is only allowed as "not encrypted" or the FAQ question)`);
  // PRD Appendix B FAQ: the Netflix question explains the limit, it does not promise support.
  const t2 = text.replace('Why is the picture black for Netflix and similar apps?', ' ');
  for (const [re, name] of FORBIDDEN) if (re.test(t2)) problems.push(`${rel}: forbidden word "${name}"`);
  for (const m of text.replace(/TODO\([^)]*\)/g, ' ').matchAll(/\b[A-Z]{3,}\b/g)) if (!ALLOWED_CAPS.has(m[0])) problems.push(`${rel}: ALL CAPS "${m[0]}"`);
  if (/\bcoming soon\b/i.test(text) && !/Coming soon to Google Play/.test(text)) problems.push(`${rel}: "coming soon" must read "Coming soon to Google Play"`);
  const tt = (text.match(/TODO\([^)]*\)/g) || []); tt.forEach((t) => todos.push(`${rel}: ${t}`));
  const title = fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = fs.readFileSync(f, 'utf8').match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  if (title.length > 60) problems.push(`${rel}: title ${title.length} chars (max 60)`);
  if (desc.length > 155) problems.push(`${rel}: description ${desc.length} chars (max 155)`);
}
for (const f of files.filter((f) => f.endsWith('.css'))) {
  if (/text-transform\s*:\s*uppercase/.test(fs.readFileSync(f, 'utf8'))) problems.push(`${path.relative(dist, f)}: text-transform: uppercase`);
}
// Live has one viewer: flag "viewers" near Live copy
for (const f of files.filter((f) => f.endsWith('index.html'))) {
  if (/\b[2-9] viewers\b/i.test(fs.readFileSync(f, 'utf8'))) problems.push('several viewers mentioned');
}

if (todos.length) console.log(`check-copy: ${todos.length} TODO marker(s) still open:\n  ` + [...new Set(todos)].join('\n  '));
if (problems.length) { console.error('check-copy FAILED:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('check-copy OK');
