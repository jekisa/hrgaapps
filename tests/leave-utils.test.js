const test = require('node:test')
const assert = require('node:assert/strict')
const { countBusinessDays, rangesOverlap, normalizeEmail, getRemainingBalance } = require('../lib/leave-utils')
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

test('calculates remaining balance without returning a negative value', () => {
  assert.equal(getRemainingBalance({ quota: 12, used: 4 }), 8)
  assert.equal(getRemainingBalance({ quota: 3, used: 5 }), 0)
})

test('requires ADMIN for admin-only operations', () => {
  assert.equal(assertRole({ user: { role: 'ADMIN' } }, 'ADMIN'), null)
  assert.equal(assertRole({ user: { role: 'STAFF' } }, 'ADMIN').status, 403)
})

test('defines leave schemas and balance uniqueness', () => {
  assert.equal(LeaveType.schema.path('code').options.unique, true)
  assert.equal(LeaveBalance.schema.path('employeeId').options.ref, 'Karyawan')
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
  assert.deepEqual(validateReviewPayload({ status: 'approved', reviewNote: '' }), { status: 'approved', reviewNote: null })
  assert.equal(canReviewRequest('pending'), true)
  assert.equal(canReviewRequest('approved'), false)
})
