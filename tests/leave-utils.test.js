const test = require('node:test')
const assert = require('node:assert/strict')
const { countBusinessDays, rangesOverlap, normalizeEmail, getRemainingBalance } = require('../lib/leave-utils')
const { buildApprovalBalanceDecision, buildBalanceCorrection } = require('../lib/leave-balance')
const { assertRole } = require('../lib/leave-auth')
const { validateUploadMetadata } = require('../lib/leave-storage')
const { validateReviewPayload, canReviewRequest } = require('../lib/leave-review')
const LeaveType = require('../models/LeaveType')
const LeaveBalance = require('../models/LeaveBalance')
const LeaveRequest = require('../models/LeaveRequest')

test('counts inclusive weekdays and excludes Saturday and Sunday', () => {
  assert.equal(countBusinessDays('2026-09-24', '2026-09-28'), 3)
  assert.equal(countBusinessDays('2026-09-26', '2026-09-27'), 0)
})

test('rejects an inverted date range', () => {
  assert.throws(() => countBusinessDays('2026-09-29', '2026-09-28'), /Tanggal selesai/)
})

test('detects inclusive range overlap', () => {
  assert.equal(rangesOverlap('2026-09-24', '2026-09-26', '2026-09-26', '2026-09-28'), true)
  assert.equal(rangesOverlap('2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'), false)
})

test('normalizes mapping emails', () => {
  assert.equal(normalizeEmail('  Staff@Example.COM '), 'staff@example.com')
})

test('calculates effective remaining balance including debt and admin correction', () => {
  assert.equal(getRemainingBalance({ quota: 12, used: 4 }), 8)
  assert.equal(getRemainingBalance({ quota: 3, used: 5 }), -2)
  assert.equal(getRemainingBalance({ quota: 12, carriedDebt: 15, used: 0 }), -3)
  assert.equal(getRemainingBalance({ quota: 12, carriedDebt: 0, used: 5, adminAdjustment: -10 }), -3)
})

test('admin corrections allow annual debt with a reason and preserve used leave', () => {
  assert.deepEqual(buildBalanceCorrection({ quota: 12, carriedDebt: 3, used: 4, adminAdjustment: 0 }, -2, true, 'Koreksi HR'), {
    previousRemaining: 5,
    newRemaining: -2,
    adminAdjustment: -7,
    reason: 'Koreksi HR',
  })
})

test('admin corrections reject debt for ineligible leave types and require a reason for negative balances', () => {
  assert.throws(() => buildBalanceCorrection({ quota: 3, used: 1 }, -1, false, 'Koreksi'), (error) => error.status === 422)
  assert.throws(() => buildBalanceCorrection({ quota: 12, used: 13 }, -1, true, ''), (error) => error.status === 422)
})

test('approval requires explicit confirmation for eligible debt and blocks debt for other leave types', () => {
  assert.deepEqual(buildApprovalBalanceDecision({ quota: 12, used: 10 }, 5, true), {
    projectedRemaining: -3, canApprove: true, requiresDebtConfirmation: true,
  })
  assert.deepEqual(buildApprovalBalanceDecision({ quota: 3, used: 1 }, 3, false), {
    projectedRemaining: -1, canApprove: false, requiresDebtConfirmation: false,
  })
  assert.deepEqual(buildApprovalBalanceDecision({ quota: 12, used: 4 }, 8, false), {
    projectedRemaining: 0, canApprove: true, requiresDebtConfirmation: false,
  })
})

test('requires ADMIN for admin-only operations', () => {
  assert.equal(assertRole({ user: { role: 'ADMIN' } }, 'ADMIN'), null)
  assert.equal(assertRole({ user: { role: 'STAFF' } }, 'ADMIN').status, 403)
})

test('defines leave schemas and balance uniqueness', () => {
  assert.equal(LeaveType.schema.path('code').options.unique, true)
  assert.equal(LeaveType.schema.path('allowDebt').defaultValue, false)
  assert.equal(LeaveBalance.schema.path('employeeId').options.ref, 'Karyawan')
  assert.equal(LeaveBalance.schema.path('carriedDebt').defaultValue, 0)
  assert.equal(LeaveBalance.schema.path('adminAdjustment').defaultValue, 0)
  assert.equal(LeaveBalance.schema.path('adminAdjustment').options.min, undefined)
  assert.deepEqual(LeaveRequest.schema.path('status').options.enum, ['pending', 'approved', 'rejected'])
  assert.ok(LeaveBalance.schema.indexes().some(([fields, options]) => options.unique && fields.year === 1))
})

test('accepts supported attachment metadata up to 5 MB', () => {
  assert.equal(validateUploadMetadata({ name: 'surat.pdf', type: 'application/pdf', size: 5 * 1024 * 1024 }).extension, '.pdf')
})

test('rejects unsupported, oversized, and MIME-mismatched attachments', () => {
  assert.throws(() => validateUploadMetadata({ name: 'surat.exe', type: 'application/octet-stream', size: 10 }), /Format file/)
  assert.throws(() => validateUploadMetadata({ name: 'surat.pdf', type: 'application/pdf', size: 5 * 1024 * 1024 + 1 }), /5 MB/)
  assert.throws(() => validateUploadMetadata({ name: 'surat.pdf', type: 'image/png', size: 10 }), /MIME/)
})

test('requires review note for rejection and only pending requests can transition', () => {
  assert.throws(() => validateReviewPayload({ status: 'rejected', reviewNote: '' }), /catatan/i)
  assert.deepEqual(validateReviewPayload({ status: 'approved', reviewNote: '', confirmDebt: true }), { status: 'approved', reviewNote: null, confirmDebt: true })
  assert.deepEqual(validateReviewPayload({ status: 'approved', reviewNote: '' }), { status: 'approved', reviewNote: null, confirmDebt: false })
  assert.equal(canReviewRequest('pending'), true)
  assert.equal(canReviewRequest('approved'), false)
})
