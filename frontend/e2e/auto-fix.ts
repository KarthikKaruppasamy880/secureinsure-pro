import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface FixRule {
  pattern: RegExp;
  fix: (error: string) => string;
  description: string;
}

class AutoFixer {
  private fixRules: FixRule[] = [
    {
      pattern: /element was detached from the DOM/i,
      fix: (error) => `
// Fix for DOM detachment
await page.waitForLoadState('networkidle');
await page.waitForSelector('selector', { state: 'attached' });
`,
      description: 'Add wait strategies for DOM stability'
    },
    {
      pattern: /timeout.*exceeded/i,
      fix: (error) => `
// Fix for timeout issues
await expect(element).toBeVisible({ timeout: 30000 });
await page.waitForTimeout(1000);
`,
      description: 'Increase timeout values'
    },
    {
      pattern: /not found/i,
      fix: (error) => `
// Fix for element not found
const element = await page.locator('selector').first();
await expect(element).toBeVisible({ timeout: 10000 });
`,
      description: 'Add robust element selection'
    },
    {
      pattern: /network.*error/i,
      fix: (error) => `
// Fix for network issues
await page.waitForResponse(response => response.url().includes('/api/'));
await page.waitForLoadState('networkidle');
`,
      description: 'Add network wait strategies'
    },
    {
      pattern: /javascript.*error/i,
      fix: (error) => `
// Fix for JavaScript errors
await page.addInitScript(() => {
  window.addEventListener('error', (e) => {
    console.error('Page error:', e.error);
  });
});
`,
      description: 'Add error handling for JavaScript issues'
    }
  ];

  async fixTest(testName: string, error: string): Promise<string> {
    console.log(`🔧 Auto-fixing test: ${testName}`);
    
    for (const rule of this.fixRules) {
      if (rule.pattern.test(error)) {
        console.log(`✅ Applying fix: ${rule.description}`);
        return rule.fix(error);
      }
    }
    
    return `// No automatic fix available for: ${error}`;
  }

  async generateFixFile(testName: string, error: string): Promise<string> {
    const fixContent = await this.fixTest(testName, error);
    
    const fixDir = './self-heal/fixes';
    if (!fs.existsSync(fixDir)) {
      fs.mkdirSync(fixDir, { recursive: true });
    }
    
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '-')}-fix-${Date.now()}.ts`;
    const filePath = path.join(fixDir, fileName);
    
    const fullContent = `// Auto-generated fix for ${testName}
// Error: ${error}
// Generated: ${new Date().toISOString()}

${fixContent}

// Additional recommendations:
// 1. Check if the application is running on the correct port
// 2. Verify all required services are started
// 3. Check for JavaScript errors in the browser console
// 4. Ensure all dependencies are installed
// 5. Verify the test selectors are correct
`;
    
    fs.writeFileSync(filePath, fullContent);
    console.log(`📝 Generated fix file: ${filePath}`);
    
    return filePath;
  }

  async runDiagnostics(): Promise<void> {
    console.log('🔍 Running diagnostics...');
    
    // Check if frontend is running
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        console.log('✅ Frontend is running on port 3000');
      } else {
        console.log('❌ Frontend is not responding on port 3000');
      }
    } catch (error) {
      console.log('❌ Frontend is not running on port 3000');
    }
    
    // Check if backend is running
    try {
      const response = await fetch('http://localhost:8081/health');
      if (response.ok) {
        console.log('✅ Backend is running on port 8081');
      } else {
        console.log('❌ Backend is not responding on port 8081');
      }
    } catch (error) {
      console.log('❌ Backend is not running on port 8081');
    }
    
    // Check for common issues
    const commonIssues = [
      'Missing dependencies',
      'Port conflicts',
      'JavaScript errors',
      'Network connectivity',
      'File permissions'
    ];
    
    console.log('🔍 Common issues to check:');
    commonIssues.forEach(issue => console.log(`  - ${issue}`));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const testName = args.find(arg => arg.startsWith('--test='))?.split('=')[1];
  const error = args.find(arg => arg.startsWith('--error='))?.split('=')[1];
  
  const fixer = new AutoFixer();
  
  if (testName && error) {
    await fixer.generateFixFile(testName, error);
  } else {
    await fixer.runDiagnostics();
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AutoFixer };
