import type { Reporter, TestCase, TestResult } from '@playwright/test';
import fs from 'node:fs'; 
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'self-heal');

function md(s:string){ return '```\n'+(s||'')+'\n```'; }

export default class SelfHeal implements Reporter {
  onBegin(){ if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR,{recursive:true}); }
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed') return;
    const title = test.titlePath().join(' > ');
    const id = `${Date.now()}-${test.title.replace(/\W+/g,'-')}`;
    const file = path.relative(process.cwd(), test.location.file);
    const line = test.location.line;
    const trace = result.attachments.find(a=>a.name==='trace' && a.path)?.path || '';
    const body =
`# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:** ${title}
**Spec:** \`${file}:${line}\`
**Retry:** ${result.retry}
**Trace:** \`${path.relative(process.cwd(), trace)}\`

## Error
${md(result.error?.stack || result.error?.message || 'no error message')}

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
\`npx playwright test --grep "${test.title.replace(/"/g,'\\"')}"\`
`;
    const out = path.join(OUT_DIR, `issue-${id}.md`);
    fs.writeFileSync(out, body, 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'LAST_ISSUE.txt'), out, 'utf8');
    console.log(`\n[Self-Heal] ${out}\n`);
  }
}
