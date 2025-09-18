const fs = require('node:fs'); 
const path = require('node:path'); 
const cp = require('node:child_process');

const last = path.join(process.cwd(), 'self-heal', 'LAST_ISSUE.txt');
if (!fs.existsSync(last)) { 
  console.error('No LAST_ISSUE'); 
  process.exit(1); 
}

const f = fs.readFileSync(last,'utf8').trim(); 
const md = fs.readFileSync(f,'utf8');
const m = md.match(/\*\*Failing test:\*\s([^\n]+)/); 
if(!m){ 
  console.error('Parse title fail'); 
  process.exit(1); 
}

cp.execSync(`npx playwright test --grep "${m[1].replace(/"/g,'\\"')}"`, {stdio:'inherit'});
