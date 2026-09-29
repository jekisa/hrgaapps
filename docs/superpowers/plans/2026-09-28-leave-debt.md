# Hutang Cuti Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement negative leave balances for eligible leave types, carry debt across Jakarta-year rollover, and keep admin actions auditable.

**Architecture:** Centralize balance math and idempotent rollover in `lib/leave-balance.js`; server routes call it for cron, lazy initialization, balance edits, and approvals. Admin corrections are stored separately from approved usage, and UI/export consume the same effective remaining-balance calculation.

**Tech Stack:** Next.js App Router, MongoDB/Mongoose transactions, Vercel Cron, Node.js test runner, React Query.

**Spec:** `docs/superpowers/specs/2026-09-28-leave-debt-design.md`

## Global Constraints

- Use `Asia/Jakarta` for the rollover year and Vercel UTC schedule `5 17 31 12 *`.
- `remaining = quota - carriedDebt - used + adminAdjustment`; never persist a derived `remaining` field.
- Only `LeaveType.allowDebt === true` can result in negative balance; only `annual` defaults to true.
- Rollover is idempotent and never overwrites target-year usage or admin adjustments.
- Balance adjustment and audit log for admin edits must be transactionally consistent.
- Preserve positive year-end balances as expired; carry only negative annual debt.

## Review Focus

- Bad/missing year or negative correction for a non-debt type must fail before writes; test payload validation and type policy.
- Repeated rollover must not reset target-year balances; test idempotency with the real rollover service and an isolated repository.
- Approval races must not double-review or permit forbidden debt; test projected balance and pending-only transition.
- Jakarta year boundary differs from UTC around 17:00; test instants immediately before and after Jan 1 local time.
- Negative values must survive API, staff progress, card sorting, and XLSX mapping; test each data boundary.

---

### Task 1: Balance schema, math, and rollover core

**Files:**
- Modify: `models/LeaveType.js`
- Modify: `models/LeaveBalance.js`
- Create: `models/LeaveBalanceAdjustment.js`
- Create: `lib/leave-balance.js`
- Modify: `Seedleavemanagement .js`
- Test: `tests/leave-utils.test.js`
- Test: `tests/leave-rollover.test.js`

**Interfaces:**
- Produces `getRemainingBalance(balance)`, `getCarriedDebt(remaining, allowDebt)`, `getJakartaYear(date)`, `getQuotaForEmployee(leaveType, employee)`, and idempotent `rolloverLeaveBalances(targetYear, { employeeId, session })`.
- `LeaveBalanceAdjustment.adminId` references `User`; store `reason` and signed prior/new remaining values.

- [ ] Write failing tests for negative balance math, eligibility, probation quota, and three debt/expiry rollover examples.
- [ ] Run `node --test tests/leave-utils.test.js tests/leave-rollover.test.js` and confirm expected failures.
- [ ] Implement schema fields/defaults, adjustment model, pure helpers, and repository-injectable rollover logic using `$setOnInsert`.
- [ ] Extend seeder dry-run and idempotent migration for `allowDebt`, `carriedDebt`, and `adminAdjustment`; do not overwrite existing balance quota/used.
- [ ] Test repeated rollover and correction propagation without duplicate/reset, plus Asia/Jakarta year boundary.
- [ ] Run targeted tests and confirm all pass.

### Task 2: Protected Vercel cron and lazy rollover

**Files:**
- Create: `app/api/cron/leave-rollover/route.js`
- Create: `vercel.json`
- Modify: `app/api/cuti/saldo/route.js`
- Modify: `app/api/dashboard/route.js`
- Modify: `app/api/cuti/pengajuan/[id]/route.js`
- Test: `tests/leave-rollover.test.js`
- Modify: `README.md`

**Interfaces:**
- Cron is `GET /api/cron/leave-rollover`, accepts only `Authorization: Bearer ${CRON_SECRET}`, returns processed counts.
- Lazy paths call `rolloverLeaveBalances(jakartaYear, { employeeId })` if current-year row is absent.

- [ ] Add a failing test for rejected/missing cron secret and Asia/Jakarta target year.
- [ ] Verify tests fail before route implementation.
- [ ] Implement protected endpoint, Vercel schedule `5 17 31 12 *`, and setup notes for `CRON_SECRET`/deploy plus Hobby timing caveat.
- [ ] Wire lazy fallback into staff dashboard, salary/balance reads, and approval when current-year data is absent.
- [ ] Emit summary to console and Audit Trail with null system actor.
- [ ] Run targeted tests and ESLint on changed routes.

### Task 3: Admin balance correction, adjustment history, and audit

**Files:**
- Modify: `app/api/cuti/rekap/route.js`
- Modify: `lib/leave-contract.js`
- Modify: `lib/server-utils.js` only if a session-aware audit helper is needed
- Modify: `models/AuditLog.js` only if required for system actor metadata
- Test: `tests/leave-api-contract.test.js`

**Interfaces:**
- PATCH payload identifies `{ employeeId, leaveTypeId, year, remaining, reason }`.
- `remaining` is validated as a finite integer; negative requires `allowDebt` and non-empty reason.
- Persist `adminAdjustment = requestedRemaining - (quota - carriedDebt - used)`, plus one adjustment and one audit log in the same transaction.
- Editing year Y updates only `carriedDebt` in existing year Y+1 row from new effective remaining, if that type allows debt.

- [ ] Write failing tests for valid annual negative correction, non-debt rejection, required negative reason, and adjustment computation.
- [ ] Run the targeted tests to observe intended failures.
- [ ] Implement ADMIN-only PATCH with ObjectId/year checks and one MongoDB transaction.
- [ ] Verify transaction writes balance, adjustment, and `AuditLog` or none on failure; test missing balance and rollback path.
- [ ] Recalculate next-year carried debt without changing next-year used/quota/adminAdjustment.
- [ ] Run targeted tests and ESLint.

### Task 4: Debt-aware approval flow

**Files:**
- Modify: `app/api/cuti/pengajuan/[id]/route.js`
- Modify: `lib/leave-review.js`
- Modify: `app/(dashboard)/cuti/kelola/page.js`
- Test: `tests/leave-utils.test.js`
- Test: `tests/leave-api-contract.test.js`

**Interfaces:**
- First approve attempt that would make eligible balance negative returns `409` with `requiresDebtConfirmation: true` and projected remaining.
- Confirmed retry includes `confirmDebt: true`; ineligible type with insufficient balance returns a clear `409` and no state change.

- [ ] Write failing tests for debt projection and pending-only behavior across eligible/ineligible leave types.
- [ ] Run tests and confirm they expose current unconditional approval behavior.
- [ ] Implement transaction-scoped balance check, confirmation challenge, and approved usage increment with effective balance math.
- [ ] Update admin review UI to show explicit confirmation with exact debt amount; retry only after confirm.
- [ ] Keep request, balance, notification, and audit consistent with transaction support.
- [ ] Run targeted tests and ESLint.

### Task 5: Staff/admin balance presentation and export

**Files:**
- Modify: `lib/leave-utils.js`
- Modify: `lib/staff-dashboard.js`
- Modify: `lib/staff-visual.js`
- Modify: `lib/leave-rekap.js`
- Modify: `app/api/dashboard/route.js`
- Modify: `app/api/cuti/rekap/route.js`
- Modify: `app/api/cuti/saldo/route.js`
- Modify: `components/cuti/LeaveBalanceCard.js`
- Modify: `app/(dashboard)/cuti/rekap/page.js`
- Modify: `app/(dashboard)/page.js`
- Test: `tests/leave-utils.test.js`
- Test: `tests/leave-rekap.test.js`
- Test: `tests/staff-visual.test.js`

- [ ] Add failing tests for negative display, progress visualization, debt-first ordering, carried-debt summary, and XLSX row mapping.
- [ ] Run the tests to verify existing zero-clamps fail those cases.
- [ ] Remove zero-clamps while keeping progress widths bounded; render debt label and carried-debt line.
- [ ] Change card editor from quota to remaining, add reason and negative confirmation; invalidate the correct year query after success.
- [ ] Include `carriedDebt` in rekap JSON and Excel column; preserve negative `Sisa` values.
- [ ] Run targeted tests, ESLint, and `git diff --check`.

### Task 6: Full verification and handoff

**Files:**
- Review all feature files and tests; no extra source file unless required by a failing test.

- [ ] Run `npm test` and `node --test tests/*.test.js`.
- [ ] Run ESLint across changed files and `git diff --check` for changed source/docs only.
- [ ] Run `npm run build` without cleaning or overwriting existing user-owned `.next*` artifacts; use the configured build output only if safe.
- [ ] Run the seed dry-run and inspect output; do not run a production DB migration unless explicitly requested again.
- [ ] Report Vercel `CRON_SECRET` Production setup and schedule caveat; link exact source, test results, and files changed.
