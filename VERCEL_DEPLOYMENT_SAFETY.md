# Vercel Deployment Pre-Flight Checklist & Safety Protocols

To ensure live production on Vercel is **never broken** by auto-refactors or commits, follow this **Pre-Flight Deployment Protocol**.

---

## 1. Automated Pre-Flight Gate (Vercel Pre-Push Audit)

Before running `git push origin main` (which triggers a live Vercel deployment), execute the full pre-flight verification:

```bash
# 1. Type check
npx tsc -b

# 2. Lint check
npm run lint

# 3. Production build test (exact command Vercel runs)
npm run build

# 4. Data sanity verification
npx vite-node scripts/run_audit.ts
```

> [!IMPORTANT]
> **Strict Policy**: `git push` must **ONLY** occur if all 4 pre-flight checks output `✅ PASSED`. If any check returns `❌ FAILED` or `⚠️ WARNING`, pushing is strictly prohibited until resolved.

---

## 2. Emergency Rollback on Production (Vercel Instant Rollback)

If a breaking change or data anomaly bypasses local checks and reaches Vercel:

### Strategy A: Instant Vercel Rollback (No Git Push Required)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Open the **Deployments** tab.
3. Locate the last known green production deployment.
4. Click **`...` -> Instant Rollback**.

### Strategy B: Repository Hard Reset Push
If you need to align GitHub with the last green production deployment:
```bash
# Fetch latest clean origin
git fetch origin main

# Reset local branch to previous green commit (e.g. 844d899)
git reset --hard 844d899

# Force push the working green state to trigger a Vercel rebuild
git push origin main --force-with-lease
```

---

## 3. Deployment Safety Guardrails for Automated Loop

When the self-improvement loop generates code edits:
1. **Isolated Branching**: Edits are developed on an isolated branch (e.g., `audit/refactor-pass-1`), never directly on `main`.
2. **Vercel Preview Deployments**: Non-main branches create temporary **Vercel Preview URLs** so you can visually test the live deployment without affecting production.
3. **Explicit Approval**: Merging to `main` (production deployment) requires all audit gates to pass and user confirmation.
