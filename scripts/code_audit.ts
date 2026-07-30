import { execSync } from 'child_process';

export interface CodeAuditResult {
  tsCompileStatus: 'PASSED' | 'FAILED';
  viteBuildStatus: 'PASSED' | 'FAILED';
  lintStatus: 'PASSED' | 'FAILED';
  errors: string[];
}

export function auditCodeQuality(): CodeAuditResult {
  console.log('⚡ Executing Code Quality & Build Audit...\n');
  const errors: string[] = [];
  let tsCompileStatus: 'PASSED' | 'FAILED' = 'PASSED';
  let viteBuildStatus: 'PASSED' | 'FAILED' = 'PASSED';
  let lintStatus: 'PASSED' | 'FAILED' = 'PASSED';

  // 1. TypeScript Compilation Check
  try {
    console.log('  -> Checking TypeScript type compilation (tsc -b)...');
    execSync('npx tsc -b', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err: any) {
    tsCompileStatus = 'FAILED';
    const output = err.stdout || err.stderr || err.message;
    errors.push(`TypeScript Compilation Error:\n${output.slice(0, 500)}`);
  }

  // 2. ESLint Audit
  try {
    console.log('  -> Checking ESLint rules (npm run lint)...');
    execSync('npm run lint', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err: any) {
    lintStatus = 'FAILED';
    const output = err.stdout || err.stderr || err.message;
    errors.push(`ESLint Error:\n${output.slice(0, 500)}`);
  }

  // 3. Vite Build Check
  try {
    console.log('  -> Testing Vite Production Build (npm run build)...');
    execSync('npx vite build', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err: any) {
    viteBuildStatus = 'FAILED';
    const output = err.stdout || err.stderr || err.message;
    errors.push(`Vite Build Error:\n${output.slice(0, 500)}`);
  }

  return {
    tsCompileStatus,
    viteBuildStatus,
    lintStatus,
    errors
  };
}
