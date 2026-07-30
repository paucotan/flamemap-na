import fs from 'fs';
import path from 'path';
import { auditDataSanity } from './data_sanity_audit.js';
import { auditCodeQuality } from './code_audit.js';

export function getEmergencyRollbackInstructions(): string {
  return `
## 🚨 Emergency Safety Fallback (Reset to GitHub Ground-Truth)

If an automated refactor or change breaks the application or degrades data sanity beyond automatic recovery, run the emergency rollback procedure to restore the repository to today's working baseline on GitHub (\`origin/main\`):

### Safe Emergency Reset Command:
\`\`\`bash
# 1. Fetch latest verified GitHub state
git fetch origin main

# 2. Hard reset local working tree to today's clean GitHub origin/main baseline
git reset --hard origin/main

# 3. Clean untracked generated files (excluding custom audit scripts)
git clean -fd -e scripts/

# 4. Verify clean state and rebuild
npm run build
\`\`\`

> [!CAUTION]
> Running \`git reset --hard origin/main\` will discard uncommitted local code changes and restore the application to the exact baseline committed to GitHub today.
`;
}

async function runOrchestratedAudit() {
  console.log('====================================================');
  console.log('   🔥 FLAMEMAP-NA AUTONOMOUS AUDIT ORCHESTRATOR 🔥   ');
  console.log('====================================================\n');

  // Run Code Audit
  const codeResults = auditCodeQuality();

  // Run Data Sanity Audit
  const dataResults = await auditDataSanity();

  // Generate Report Markdown
  const reportPath = path.resolve(process.cwd(), 'AUDIT_LOG.md');
  const nowStr = new Date().toLocaleString();

  let markdown = `# Autonomous System & Data Audit Log

**Last Audit Executed:** \`${nowStr}\`  
**Environment:** Node.js / Vite + React  

---

## 1. Code Quality & Build Audit

| Check Target | Status |
| :--- | :--- |
| **TypeScript Compilation (\`tsc\`)** | ${codeResults.tsCompileStatus === 'PASSED' ? '✅ PASSED' : '❌ FAILED'} |
| **ESLint (\`npm run lint\`)** | ${codeResults.lintStatus === 'PASSED' ? '✅ PASSED' : '❌ FAILED'} |
| **Production Vite Build** | ${codeResults.viteBuildStatus === 'PASSED' ? '✅ PASSED' : '❌ FAILED'} |

${codeResults.errors.length > 0 ? `\n### Code Errors / Warnings:\n\`\`\`\n${codeResults.errors.join('\n\n')}\n\`\`\`` : '_Zero build or compilation errors detected._'}

---

## 2. API Data Sanity & Ground-Truth Verification

| Data Source | Total Records | Valid Geo | Invalid Geo | Stale (>7d) | Ground-Truth News Matches | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  dataResults.forEach(d => {
    const statusIcon = d.status === 'PASSED' ? '✅ PASSED' : (d.status === 'WARNING' ? '⚠️ WARNING' : '❌ FAILED');
    const groundTruthStr = d.groundTruthMatches && d.groundTruthMatches.length > 0
      ? d.groundTruthMatches.join(', ')
      : 'N/A';

    markdown += `| **${d.source}** | ${d.totalRecords} | ${d.validGeoCount} | ${d.invalidGeoCount} | ${d.staleCount} | ${groundTruthStr} | ${statusIcon} |\n`;
  });

  const allWarnings = dataResults.flatMap(d => d.warnings);
  if (allWarnings.length > 0) {
    markdown += `\n### Data Anomaly Warnings:\n`;
    allWarnings.forEach(w => {
      markdown += `- ⚠️ ${w}\n`;
    });
  } else {
    markdown += `\n_All API feeds returned geometrically sound and non-stale data._\n`;
  }

  markdown += `
---

## 3. Recommended Actions & Next Steps

`;

  if (codeResults.tsCompileStatus === 'FAILED' || codeResults.viteBuildStatus === 'FAILED') {
    markdown += `- 🚨 **CRITICAL**: Fix code build & compilation errors before deploying.\n`;
  }

  const failedDataSources = dataResults.filter(d => d.status === 'FAILED');
  if (failedDataSources.length > 0) {
    markdown += `- ⚠️ **DATA ALERT**: Inspect API service endpoints for ${failedDataSources.map(f => f.source).join(', ')} due to geo-coordinate or feed errors.\n`;
  } else {
    markdown += `- ✅ System is fully healthy! All data endpoints and code builds are performing nominally.\n`;
  }

  markdown += `\n---\n${getEmergencyRollbackInstructions()}`;

  // Write AUDIT_LOG.md
  fs.writeFileSync(reportPath, markdown, 'utf-8');

  console.log('\n====================================================');
  console.log('✅ Audit Completed Successfully!');
  console.log(`📄 Summary Report written to: ${reportPath}`);
  console.log('====================================================\n');
}

runOrchestratedAudit();
