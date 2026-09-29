# Implementation Plan: Doctor Certificate Verification

Spec: `docs/superpowers/specs/2026-09-29-doctor-certificate-verification-design.md`

## Constraints

- Preserve existing working-tree changes; never clean/reset generated artifacts.
- Keep sick leave approval separate from certificate verification; sick leave does not mutate quota.
- Server-side role/employee/year scoping; legacy sick requests without verification status are pending.
- TDD for each behavior. Run targeted Node tests, then the full leave test suite and production build.

## Tasks

1. **Quota policy and request metadata** — tests in `tests/leave-api-contract.test.js`; update `models/LeaveType.js`, `models/LeaveRequest.js`, `lib/leave-contract.js`, `lib/leave-form.js`, and `Seedleavemanagement .js`. Cover sick/non-sick policy, optional metadata, and idempotent dry-run migration. RED first, implement, rerun tests.
2. **Approval and absence aggregation** — add tests for `lib/leave-utils.js`/new helper and approval decision in `tests/leave-utils.test.js` or focused tests. Update `app/api/cuti/pengajuan/[id]/route.js`, `lib/leave-review.js`, dashboard/re-cap APIs and helpers. Verify sickness approval skips balance reads/writes; quota leave still increments; split cross-year weekdays in Asia/Jakarta; aggregate approved absence and pending verification server-side.
3. **Staff request experience and notifications** — extend leave-form tests first; update `app/(dashboard)/cuti/saya/ajukan/page.js`, POST `app/api/cuti/pengajuan/route.js`, `models/Notifikasi.js`, and `app/(dashboard)/notifikasi/page.js`. Verify attachment required, sick metadata optional and type-scoped, and notification links only when href exists.
4. **Admin certificate verification API/security** — tests first in focused `tests/doctor-certificate.test.js`; add GET/PATCH `app/api/cuti/surat-dokter/route.js` (or nested `[id]` route), verify filtering, admin-only, pending-only transitions, required rejection note, mapped verifier, no approval mutation.
5. **Admin UI, route/menu, rekap** — tests for route policy and card aggregation first. Add `/cuti/surat-dokter` page, sidebar/admin menu and role guard (`proxy.js`, `lib/leave-menu.js`/`lib/access-control.js`), update `components/cuti/LeaveBalanceCard.js` and rekap API. Show absence days and pending badge; leave Excel export unchanged.
6. **Migration and integration verification** — run seeder dry-run, inspect exact planned changes, then run migration only if dry-run shows solely additive `deductsQuota` updates; run test suite, lint on touched files, production build, and authenticated/local API checks where practical. Review diff for scope and security; preserve unrelated changes.

## Interfaces / Review Focus

- `LeaveType.deductsQuota` is authoritative for whether approval touches a balance; code `sick` is always non-deducting.
- Sick-only metadata and `verificationStatus` live on `LeaveRequest`; verification APIs never update `status`.
- Admin dashboard/re-cap aggregates are computed server-side; staff dashboard totals are scoped to its matched employee and Jakarta calendar year.
- Check legacy null verification status, transaction behavior, cross-year ranges, role guards, notification target scoping, and ensure seed migration does not reset balances/requests.

## Completion

All focused tests and full suite pass; lint/build results recorded; migration dry-run and applied result documented; final review findings resolved or explicitly deferred.
