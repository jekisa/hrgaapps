# STAFF Dashboard Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Redesign the STAFF dashboard, active sidebar treatment, and leave form with a scoped accessible coral theme while preserving ADMIN visuals and all APIs.

**Architecture:** Add tested, framework-independent visual helpers and CSS tokens, then compose small STAFF-only dashboard primitives around the existing personal dashboard response. Add local reusable date-picker and file-dropzone controls and wire them into the existing React Hook Form flow without changing its payload or server endpoints.

**Tech Stack:** Next.js 16.1.6, React 19, Tailwind CSS 3, global CSS, `date-fns` 3.6, React Hook Form, Node built-in test runner, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-25-staff-dashboard-visual-redesign-design.md`

## Global Constraints

- “ADMIN dashboard, global blue design tokens, admin sidebar active styles, shared default `.btn-primary`, APIs, middleware/proxy guards, schemas, and data access must remain unchanged.”
- “Use a warm coral accent `#B54735` with white foreground contrast ratio 5.36:1 (WCAG AA for normal text).”
- “No new dependency is required.”
- “No API, middleware, route-guard, or database changes are in scope.”
- All role checks use the current code value `session.user.role === 'STAFF'`.
- Honor `prefers-reduced-motion`; retain keyboard focus visibility and true-white surfaces.
- Keep user-owned dirty leave-management files and generated `.next` artifacts unstaged and untouched.

## Review Focus

1. Admin visual regression: test that new selectors are rooted at `.staff-theme` or `[data-role="STAFF"]`, and inspect ADMIN dashboard/sidebar screenshots for unchanged styles.
2. Missing/non-numeric annual quota: test progress helper returns a safe empty state (no `NaN`, negative values, or over-100% width).
3. Calendar boundary dates (month/year rollover, leap day, keyboard month navigation): add pure date-grid tests and exercise the rendered picker by keyboard.
4. Empty and partial staff data (no leave events/activity, zero unread notifications, no active reminders): test each friendly copy/CTA branch without implying read notifications do not exist.
5. Attachment edge cases (no file for sick leave, optional file absent, unsupported type, >5 MB, dropped versus keyboard-selected file): test helper and form contract, then exercise the rendered flow.

---

### Task 1: STAFF visual tokens and pure display helpers

**Files:**
- Create: `lib/staff-visual.js`
- Create: `tests/staff-visual.test.js`
- Modify: `app/globals.css`

**Interfaces:**
- Produces `getStaffGreeting(hour) -> string`, using Indonesian morning/noon/afternoon/evening labels.
- Produces `getLeaveBalanceProgress(remaining, quota) -> { quota, remaining, used, remainingPercent, usedPercent }`; values are finite, clamped, and percentages are zero when quota is absent.
- Produces CSS custom properties `--staff-accent: #B54735`, `--staff-accent-hover`, `--staff-accent-tint: #FFF1ED`, and `--staff-accent-ring`, plus styles scoped below `.staff-theme` only.

- [ ] **Step 1: Write failing helper and CSS-scope tests**

```js
test('clamps the staff leave progress to its quota', () => {
  assert.deepEqual(getLeaveBalanceProgress(7, 12), {
    quota: 12, remaining: 7, used: 5, remainingPercent: 58, usedPercent: 42,
  })
  assert.equal(getLeaveBalanceProgress(20, 12).remaining, 12)
  assert.equal(getLeaveBalanceProgress(-2, 12).remaining, 0)
  assert.equal(getLeaveBalanceProgress(3, 0).usedPercent, 0)
  assert.equal(getLeaveBalanceProgress('not-a-number', Infinity).remainingPercent, 0)
})

test('greets staff according to the local hour', () => {
  assert.equal(getStaffGreeting(8), 'Selamat Pagi')
  assert.equal(getStaffGreeting(12), 'Selamat Siang')
  assert.equal(getStaffGreeting(16), 'Selamat Sore')
  assert.equal(getStaffGreeting(20), 'Selamat Malam')
})

test('staff theme token and overrides do not replace global admin styles', () => {
  const css = readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf8')
  assert.match(css, /--staff-accent:\s*#B54735/i)
  assert.match(css, /\.staff-theme\s+\.btn-primary/)
  assert.doesNotMatch(css, /(^|\n)\.btn-primary\s*\{[^}]*staff-accent/s)
})
```

- [ ] **Step 2: Run `node --test tests/staff-visual.test.js` and confirm the helper import fails and the new CSS-scope assertion fails before implementation.**
- [ ] **Step 3: Implement the helper module and scoped CSS**

```js
function getStaffGreeting(hour) {
  const safeHour = Number.isFinite(Number(hour)) ? Math.min(23, Math.max(0, Number(hour))) : 0
  if (safeHour < 11) return 'Selamat Pagi'
  if (safeHour < 15) return 'Selamat Siang'
  if (safeHour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function getLeaveBalanceProgress(remaining, quota) {
  const parsedQuota = Number(quota)
  const parsedRemaining = Number(remaining)
  const safeQuota = Number.isFinite(parsedQuota) ? Math.max(0, parsedQuota) : 0
  const safeRemaining = Math.min(safeQuota, Number.isFinite(parsedRemaining) ? Math.max(0, parsedRemaining) : 0)
  const used = safeQuota - safeRemaining
  const remainingPercent = safeQuota ? Math.round((safeRemaining / safeQuota) * 100) : 0
  return { quota: safeQuota, remaining: safeRemaining, used,
    remainingPercent, usedPercent: safeQuota ? 100 - remainingPercent : 0 }
}

module.exports = { getStaffGreeting, getLeaveBalanceProgress }
```

Add the color tokens in `:root` and use them only through staff-scoped rules, for example:

```css
:root {
  --staff-accent: #B54735;
  --staff-accent-hover: #9F3D2D;
  --staff-accent-tint: #FFF1ED;
  --staff-accent-ring: rgba(181, 71, 53, 0.32);
}

.staff-theme .btn-primary {
  background-color: var(--staff-accent);
}

.staff-theme .btn-primary:hover {
  background-color: var(--staff-accent-hover);
}
```

- [ ] **Step 4: Run `node --test tests/staff-visual.test.js` and verify all helper and scoping assertions pass.**
- [ ] **Step 5: Add scoped focus/form rules and `prefers-reduced-motion` handling without changing the existing global rules.**
- [ ] **Step 6: Commit only `lib/staff-visual.js`, `tests/staff-visual.test.js`, and `app/globals.css` as `feat: add scoped staff visual tokens`.**

### Task 2: Personal dashboard greeting, statistic cards, progress, and empty states

**Files:**
- Create: `components/dashboard/StaffDashboardVisuals.js`
- Create: `public/images/undraw-trip-coral.svg` (export recolored SVG from the unDraw Trip illustration page; use coral `#B54735`)
- Create: `tests/staff-dashboard-visual-contract.test.js`
- Modify: `app/(dashboard)/page.js`
- Modify: `tests/staff-dashboard-contract.test.js`

**Interfaces:**
- `StaffGreeting({ name })` displays the local-time greeting, session name, and illustration; initialize the hour after mount so server/client hydration cannot disagree.
- `StaffStatCard({ title, value, subtitle, icon, tone, href, children })` is used only inside the STAFF branch.
- `StaffEmptyState({ icon, title, description, href, actionLabel })` provides consistent empty states.
- `StaffLeaveProgress({ remaining, quota })` consumes `getLeaveBalanceProgress` from Task 1.
- STAFF may query the existing `/api/cuti/jenis` endpoint to find the active `code === 'annual'` type and read `defaultQuotaPerYear`; do not modify any API.

- [ ] **Step 1: Add failing contract tests for staff-only greeting/card/empty-state markup, the annual type query, and absence of ADMIN widget names inside `StaffDashboard`.**

```js
test('staff view uses the warm personal components and annual leave quota source', () => {
  const page = readFileSync(path.resolve('app/(dashboard)/page.js'), 'utf8')
  const start = page.indexOf('function StaffDashboard')
  const staffView = page.slice(start)
  for (const label of ['Sisa Cuti Tahun Ini', 'Reminder Saya', 'Notifikasi', 'Status Pengajuan Cuti Terakhir']) {
    assert.ok(staffView.includes(label), `expected personal card ${label}`)
  }
  assert.match(staffView, /StaffGreeting/)
  assert.match(staffView, /code\s*===\s*['"]annual['"]|code:\s*['"]annual['"]/)
  assert.doesNotMatch(staffView, /EmployeeTrend|ContractStatus|AssetDistribution|InsightPanel/)
})
```
- [ ] **Step 2: Run `node --test tests/staff-dashboard-visual-contract.test.js tests/staff-dashboard-contract.test.js` and verify the new contract fails before implementation.**
- [ ] **Step 3: Export and recolor the unDraw Trip SVG from `https://undraw.co/illustration/trip_rh66` into `public/images/undraw-trip-coral.svg`; verify the file is valid SVG and contains the selected coral accent.**
- [ ] **Step 4: Implement the visual primitives in `components/dashboard/StaffDashboardVisuals.js`**

```jsx
export function StaffGreeting({ name, greeting }) {
  return <section className="staff-greeting"><div><h1>{greeting}, {name}!</h1><p>Ringkasan aktivitas dan informasi pribadi Anda.</p></div><img src="/images/undraw-trip-coral.svg" alt="" /></section>
}

export function StaffStatCard({ title, value, subtitle, icon: Icon, href, children }) {
  const content = <><span className="staff-stat-icon"><Icon aria-hidden="true" /></span><span><span>{title}</span><strong>{value}</strong><small>{subtitle}</small>{children}</span></>
  return href ? <Link className="staff-stat-card" href={href}>{content}</Link> : <section className="staff-stat-card">{content}</section>
}

export function StaffLeaveProgress({ remaining, quota }) {
  const progress = getLeaveBalanceProgress(remaining, quota)
  return <div><div role="progressbar" aria-label="Cuti terpakai" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.usedPercent} aria-valuetext={`${progress.used} hari terpakai dari ${progress.quota} hari`}><span style={{ width: `${progress.usedPercent}%` }} /></div><p>{progress.used} hari terpakai · {progress.remaining} hari tersisa dari {progress.quota} hari</p></div>
}

export function StaffEmptyState({ icon: Icon, title, description, href, actionLabel }) {
  return <section className="staff-empty-state"><Icon aria-hidden="true" /><h3>{title}</h3><p>{description}</p><Link href={href}>{actionLabel}</Link></section>
}
```

- [ ] **Step 5: Use React Query to read existing active leave types; locate `code === 'annual'`, derive quota from `defaultQuotaPerYear`, and leave all API files untouched.**
- [ ] **Step 6: Replace only `StaffDashboard` composition, showing exact user-approved card headings and empty-state CTAs. Initialize the local-hour greeting after mount to avoid hydration mismatch.**

```jsx
const [greeting, setGreeting] = useState('Selamat datang')
useEffect(() => setGreeting(getStaffGreeting(new Date().getHours())), [])

if (!isAdmin) return <StaffDashboard data={data} session={session} />
// Keep the existing ADMIN branch below unchanged.
```

- [ ] **Step 7: Run both dashboard test files and targeted ESLint; confirm all personal labels, zero states, quota bounds, and ADMIN isolation.**
- [ ] **Step 8: Commit only the dashboard component, asset, page, and tests as `feat: warm up staff dashboard presentation`.**

### Task 3: Accessible date picker for the leave form

**Files:**
- Create: `components/ui/StaffDatePicker.js`
- Create: `lib/staff-date-picker.js`
- Create: `tests/staff-date-picker.test.js`
- Modify: `app/(dashboard)/cuti/saya/ajukan/page.js`

**Interfaces:**
- `getCalendarDays(year, month) -> Array<{ date: Date, inCurrentMonth: boolean }>` returns a Monday-first, complete six-week calendar grid.
- `StaffDatePicker({ id, label, value, onChange, error })` uses `YYYY-MM-DD` strings and Indonesian date formatting.
- Integrate fields with React Hook Form `Controller`; keep business-day calculation and submit values unchanged.

- [ ] **Step 1: Write failing date-grid tests**

```js
test('returns a Monday-first six-week grid containing leap day', () => {
  const days = getCalendarDays(2024, 1)
  assert.equal(days.length, 42)
  assert.equal(days[0].date.getDay(), 1)
  assert.ok(days.some(({ date, inCurrentMonth }) => inCurrentMonth &&
    date.getFullYear() === 2024 && date.getMonth() === 1 && date.getDate() === 29))
})

test('grid crosses year boundaries without changing local calendar day', () => {
  const days = getCalendarDays(2025, 11)
  assert.ok(days.some(({ date }) => date.getFullYear() === 2026 && date.getMonth() === 0))
})
```

- [ ] **Step 2: Run `node --test tests/staff-date-picker.test.js` and confirm it fails because the helper is missing.**
- [ ] **Step 3: Implement local-date grid helpers with `date-fns`**

```js
function getCalendarDays(year, month) {
  const monthStart = new Date(year, month, 1)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    return { date, inCurrentMonth: date.getMonth() === month }
  })
}
```

- [ ] **Step 4: Rerun the date-grid tests and verify month/leap boundaries pass.**
- [ ] **Step 5: Implement a semantic picker trigger and dialog with previous/next month, `aria-selected` day buttons, Escape-to-close, and arrow-key day navigation. Format visible values with `date-fns/locale/id`; emit only `yyyy-MM-dd`.**
- [ ] **Step 6: Replace only date inputs using `Controller`**

```jsx
<Controller name="startDate" control={control} rules={{ required: 'Tanggal mulai wajib diisi' }}
  render={({ field }) => <StaffDatePicker id="startDate" label="Tanggal Mulai" value={field.value} onChange={field.onChange} />} />
```

- [ ] **Step 7: Add contract tests that both date fields use `StaffDatePicker`, required errors remain, and payload keys stay `startDate`/`endDate`; run date-picker and leave suites.**
- [ ] **Step 8: Run targeted ESLint and commit picker/helper/tests/form changes as `feat: add accessible staff leave date picker`.**

### Task 4: Custom attachment dropzone and staff submit styling

**Files:**
- Create: `components/ui/StaffFileDropzone.js`
- Create: `lib/staff-file.js`
- Create: `tests/staff-file.test.js`
- Modify: `app/(dashboard)/cuti/saya/ajukan/page.js`
- Modify: `app/globals.css`

**Interfaces:**
- `validateStaffAttachment(file) -> { valid, error }` accepts PDF/JPG/JPEG/PNG up to 5 MB and rejects unsupported/oversized provided files.
- `formatStaffFileSize(bytes) -> string` returns a readable size.
- `StaffFileDropzone({ value, onChange, required, error })` accepts and clears a `FileList`, supports drag/drop and keyboard picker activation, and previews name/size.

- [ ] **Step 1: Write failing file helper tests**

```js
test('accepts the current supported attachment types up to 5 MB', () => {
  assert.deepEqual(validateStaffAttachment({ type: 'application/pdf', size: 5 * 1024 * 1024 }), { valid: true, error: null })
  assert.equal(validateStaffAttachment({ type: 'image/gif', size: 100 }).valid, false)
  assert.equal(validateStaffAttachment({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }).valid, false)
  assert.equal(validateStaffAttachment(null).valid, true)
})

test('formats file size in readable units', () => {
  assert.equal(formatStaffFileSize(0), '0 B')
  assert.equal(formatStaffFileSize(1024), '1 KB')
})
```
- [ ] **Step 2: Run `node --test tests/staff-file.test.js` and confirm it fails because the helper is missing.**
- [ ] **Step 3: Implement file helpers**

```js
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const ALLOWED_ATTACHMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])

function validateStaffAttachment(file) {
  if (!file) return { valid: true, error: null }
  if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) return { valid: false, error: 'Format file harus PDF, JPG, atau PNG' }
  if (file.size > MAX_ATTACHMENT_BYTES) return { valid: false, error: 'Ukuran file maksimal 5 MB' }
  return { valid: true, error: null }
}
```

- [ ] **Step 4: Rerun `node --test tests/staff-file.test.js`; cover the exact 5 MB pass and 5 MB + 1 byte fail.**
- [ ] **Step 5: Implement the dropzone**

```jsx
<input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
  aria-describedby={descriptionId} onChange={(event) => onChange(event.target.files)} />
<button type="button" onClick={() => inputRef.current?.click()} onKeyDown={handleDropzoneKeyDown}>
  Seret file ke sini atau pilih file
</button>
```

- [ ] **Step 6: Integrate through `Controller`; retain `/api/cuti/upload`, `/api/cuti/pengajuan`, `isLeaveAttachmentRequired(selectedType)`, success toast, and no redirect. Use `Plane` from lucide-react in the submit button.**
- [ ] **Step 7: Apply role-conditional `.staff-theme` to the form and style the business-day pill with `aria-live="polite"` and reduced-motion-safe transitions.**
- [ ] **Step 8: Run file, leave-form, and dashboard tests plus targeted ESLint; commit as `feat: polish staff leave application form`.**

### Task 5: Staff-only calendar and sidebar accent

**Files:**
- Create: `tests/staff-sidebar-visual-contract.test.js`
- Modify: `components/layout/Sidebar.js`
- Modify: `app/(dashboard)/page.js`
- Modify: `app/globals.css`

**Interfaces:**
- Sidebar root exposes `data-role="STAFF"` only for STAFF.
- `MiniCalendar` and `UpcomingEvents` accept optional `staffAccent`; default `false` retains the current ADMIN classes.

- [ ] **Step 1: Write failing assertions for STAFF marker and role-scoped active selector**

```js
test('sidebar scopes coral active style to STAFF', () => {
  const sidebar = readFileSync(path.resolve('components/layout/Sidebar.js'), 'utf8')
  const css = readFileSync(path.resolve('app/globals.css'), 'utf8')
  assert.match(sidebar, /data-role=\{isStaff \? 'STAFF' : undefined\}/)
  assert.match(css, /\[data-role="STAFF"\] \.sidebar-link-active/)
})
```

- [ ] **Step 2: Run `node --test tests/staff-sidebar-visual-contract.test.js` and confirm it fails before implementation.**
- [ ] **Step 3: Add the `data-role` marker to the `<aside>` and coral active rule**

```jsx
<aside data-role={isStaff ? 'STAFF' : undefined} className={...}>
```

```css
[data-role="STAFF"] .sidebar-link-active {
  background: var(--staff-accent);
  box-shadow: 0 2px 10px rgba(181, 71, 53, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16);
}
```

- [ ] **Step 4: Add optional `staffAccent` class branches to `MiniCalendar` and `UpcomingEvents`; pass `staffAccent` only from `StaffDashboard` and retain the existing classes when false.**
- [ ] **Step 5: Run sidebar/dashboard contract tests and targeted ESLint; inspect ADMIN JSX/CSS diff for unchanged classes.**
- [ ] **Step 6: Commit only scoped calendar/sidebar changes and tests as `feat: apply coral accent to staff navigation and calendar`.**

### Task 6: Full verification and visual QA

**Files:**
- No planned production API/schema/middleware changes.
- Update existing UI contract tests if implementation refines accessible labels or responsive markup.

- [ ] **Step 1: Run the complete unit suite with `node --test tests/*.test.js`; fix any regressions without weakening assertions.**
- [ ] **Step 2: Run ESLint on all feature source/test files changed since the spec base; do not run repository-wide lint over generated `.next-dev` bundles.**
- [ ] **Step 3: Run `npm run build` with an isolated `NEXT_DIST_DIR` so the existing tracked `.next` artifacts remain untouched; restore any temporary `next.config.js` edit immediately.**
- [ ] **Step 4: Check whether the Browser plugin is available; if absent, check for an already installed Playwright/browser runtime before asking to install anything. Do not add an E2E/browser dependency to `package.json` without approval.**
- [ ] **Step 5: Compare against dashboard concept `C:\Users\DELL\.codex\generated_images\01a0d29b-a71f-77a1-86a6-7d3285694fd9\exec-c444608d-336f-464e-9581-785d3e9995db.png` and form concept `C:\Users\DELL\.codex\generated_images\01a0d29b-a71f-77a1-86a6-7d3285694fd9\exec-5c5e0964-29b6-4bc0-9c80-beb492ed198f.png` at their native 1487×1059 viewport and at desktop/mobile widths; if no browser runtime is available, report the exact blocker and do not claim screenshot-level fidelity.**
- [ ] **Step 6: Verify STAFF greeting, zero-count states, progress math, calendar month/day selection, keyboard operation, dropzone drag and file-picker paths, attachment required/optional behavior, and successful submit toast without history navigation.**
- [ ] **Step 7: Verify ADMIN dashboard, sidebar active link, calendar colors, and generic submit button remain unchanged. Record at least five concept/render comparison points and a concise fidelity ledger.**
- [ ] **Step 8: Use `view_image` on the accepted dashboard concept, form concept, and latest browser screenshots; report any remaining browser/data blocker, including the known unmatched local STAFF profile if still unresolved.**
- [ ] **Step 9: Commit any final test-only changes as `test: verify staff dashboard visual redesign`.**

---

## Self-review

- **Coverage:** Scoped color token, personal greeting and vacation illustration, all four redesigned statistics and truthful progress, reminder/notification/event/activity empty states, calendar emphasis, STAFF sidebar active state, custom date picker, attachment dropzone, coral submit button, responsive/accessibility behavior, unchanged admin/UI protections, and verification are assigned to Tasks 1–6.
- **Placeholder scan:** No implementation placeholders or TODO steps; every production change has a named file, interface, test, and command.
- **Interface consistency:** Progress and greeting helpers are defined in Task 1 and consumed in Task 2; picker date strings remain `YYYY-MM-DD` from Task 4 through existing form submission; file dropzone preserves `FileList` input expected by current submit handler in Task 5.
- **Review Focus tests:** Admin scoping -> Tasks 1/5; invalid quota -> Tasks 1/2; calendar edge dates/keyboard -> Task 3; empty personal states -> Task 2; file boundaries and required/optional flow -> Task 4.
- **Known QA blocker:** The active local STAFF account previously failed email-to-Karyawan mapping and receives HTTP 422 from `/api/dashboard`; do not edit records as part of this UI work.
