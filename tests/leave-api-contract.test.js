const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const {
  validateLeaveTypePayload,
  validateBalanceCorrectionPayload,
  validateRequestPayload,
  buildStaffScope,
  parsePagination,
  buildRekapFilters,
} = require('../lib/leave-contract')
const { getLeaveMenuItems, getLeavePendingTile, getStaffLeaveRedirect } = require('../lib/leave-menu')
const { getVisibleSidebarItems } = require('../lib/dashboard-menu')
const { getQuotaWarning, buildLeaveSubmission, isLeaveAttachmentRequired } = require('../lib/leave-form')
const { shouldDeductLeaveQuota } = require('../lib/leave-review')

test('rejects a missing session before building an admin scope', () => {
  assert.throws(() => buildStaffScope(null), (error) => error.status === 401)
})

test('rejects a STAFF request for an ADMIN scope', () => {
  assert.throws(() => buildStaffScope({ user: { role: 'STAFF' } }, 'ADMIN'), (error) => error.status === 403)
})

test('rejects a missing employee mapping for STAFF', () => {
  assert.throws(() => buildStaffScope({ user: { role: 'STAFF' } }, 'STAFF'), (error) => error.status === 422)
})

test('sanitizes request payload and never accepts client employee identity', () => {
  const result = validateRequestPayload({
    employeeId: 'someone-else',
    leaveTypeId: 'type-1',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    reason: 'Keperluan keluarga',
    status: 'approved',
  })
  assert.deepEqual(result, {
    leaveTypeId: 'type-1',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    reason: 'Keperluan keluarga',
    attachmentUrl: null,
    doctorName: null,
    certificateNumber: null,
    additionalNotes: null,
  })
})

test('keeps doctor metadata only for sick leave requests', () => {
  const dates = { leaveTypeId: 'type-1', startDate: '2026-09-24', endDate: '2026-09-25' }
  const body = { ...dates, doctorName: 'Klinik A', certificateNumber: 'D-1', additionalNotes: 'Kontrol' }
  const sick = validateRequestPayload(body, { leaveTypeCode: 'sick' })
  const annual = validateRequestPayload(body, { leaveTypeCode: 'annual' })
  assert.deepEqual([sick.doctorName, sick.certificateNumber, sick.additionalNotes], ['Klinik A', 'D-1', 'Kontrol'])
  assert.deepEqual([annual.doctorName, annual.certificateNumber, annual.additionalNotes], [null, null, null])
})

test('sick leave type never deducts quota while other types default to deducting', () => {
  const sick = validateLeaveTypePayload({ code: 'sick', name: 'Cuti Sakit', defaultQuotaPerYear: 0, deductsQuota: true, requiresAttachment: false })
  assert.equal(sick.deductsQuota, false)
  assert.equal(sick.requiresAttachment, true)
  assert.equal(validateLeaveTypePayload({ code: 'annual', name: 'Tahunan', defaultQuotaPerYear: 12 }).deductsQuota, true)
})

test('approval skips quota mutation for sick leave and legacy non-deducting leave types', () => {
  assert.equal(shouldDeductLeaveQuota({ code: 'sick', deductsQuota: true }), false)
  assert.equal(shouldDeductLeaveQuota({ code: 'annual', deductsQuota: false }), false)
  assert.equal(shouldDeductLeaveQuota({ code: 'annual' }), true)
})

test('validates leave type payload and pagination bounds', () => {
  assert.throws(() => validateLeaveTypePayload({ code: 'Annual Leave', name: '', defaultQuotaPerYear: -1 }), /Jenis cuti/)
  assert.deepEqual(parsePagination({ page: '0', limit: '500' }), { page: 1, limit: 100 })
})

test('validates an admin balance correction target and reason', () => {
  assert.deepEqual(validateBalanceCorrectionPayload({ employeeId: 'employee-1', leaveTypeId: 'type-1', year: 2026, remaining: -2, reason: 'Koreksi HR' }), {
    employeeId: 'employee-1', leaveTypeId: 'type-1', year: 2026, remaining: -2, reason: 'Koreksi HR',
  })
  assert.throws(() => validateBalanceCorrectionPayload({ employeeId: 'employee-1', leaveTypeId: 'type-1', year: 2026, remaining: 1.5 }), (error) => error.status === 422)
})

test('returns separate admin and staff leave navigation', () => {
  assert.deepEqual(getLeaveMenuItems('ADMIN').map((item) => item.href), ['/cuti/kelola', '/cuti/jenis', '/cuti/rekap', '/cuti/surat-dokter'])
  assert.deepEqual(getLeaveMenuItems('STAFF').map((item) => item.href), ['/cuti/saya/ajukan'])
})

test('selects a dedicated three-item STAFF sidebar and preserves the complete ADMIN menu', () => {
  const adminItems = [{ label: 'Dashboard' }, { section: 'Manajemen SDM' }, { label: 'Manajemen Karyawan' }]
  const staffItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Notifikasi', href: '/notifikasi' },
    { label: 'Cuti Saya', href: '/cuti/saya/ajukan' },
  ]

  assert.deepEqual(getVisibleSidebarItems('STAFF', adminItems, staffItems), staffItems)
  assert.deepEqual(getVisibleSidebarItems('ADMIN', adminItems, staffItems), adminItems)
  assert.deepEqual(getVisibleSidebarItems(null, adminItems, staffItems), [])
  assert.deepEqual(staffItems.map((item) => item.href), ['/', '/notifikasi', '/cuti/saya/ajukan'])
})

test('redirects STAFF away from summary and history leave routes only', () => {
  for (const pathname of ['/cuti/saya', '/cuti/saya/ringkasan', '/cuti/saya/riwayat', '/cuti/saya/riwayat/2026']) {
    assert.equal(getStaffLeaveRedirect('STAFF', pathname), '/cuti/saya/ajukan')
    assert.equal(getStaffLeaveRedirect('ADMIN', pathname), null)
  }
  assert.equal(getStaffLeaveRedirect('STAFF', '/cuti/saya/ajukan'), null)
  assert.equal(getStaffLeaveRedirect('STAFF', '/cuti/surat-dokter'), '/cuti/saya/ajukan')
  assert.equal(getStaffLeaveRedirect('ADMIN', '/cuti/surat-dokter'), null)
})

test('requires attachments only for leave types marked as requiring them', () => {
  assert.equal(isLeaveAttachmentRequired({ requiresAttachment: true }), true)
  assert.equal(isLeaveAttachmentRequired({ requiresAttachment: false }), false)
  assert.equal(isLeaveAttachmentRequired(null), false)
})

test('awaits Next.js dynamic params before using the leave review request id', () => {
  const route = readFileSync(path.resolve(process.cwd(), 'app/api/cuti/pengajuan/[id]/route.js'), 'utf8')
  assert.match(route, /const\s*\{\s*id\s*\}\s*=\s*await params/)
  assert.doesNotMatch(route, /params\.id/)
})

test('hides the pending tile for non-admin users', () => {
  assert.equal(getLeavePendingTile('ADMIN', { leavePending: 4 }).value, 4)
  assert.equal(getLeavePendingTile('STAFF', { leavePending: 4 }), null)
})

test('warns when requested days exceed remaining quota without blocking submission', () => {
  assert.equal(getQuotaWarning(5, 6), 'Pengajuan melebihi sisa kuota cuti')
  assert.equal(getQuotaWarning(5, 5), null)
  assert.deepEqual(buildLeaveSubmission({ leaveTypeId: 'type-1', startDate: '2026-09-24', endDate: '2026-09-25', reason: 'Acara keluarga', attachmentUrl: '/uploads/cuti/a.pdf' }), {
    leaveTypeId: 'type-1', startDate: '2026-09-24', endDate: '2026-09-25', reason: 'Acara keluarga', attachmentUrl: '/uploads/cuti/a.pdf', doctorName: null, certificateNumber: null, additionalNotes: null,
  })
})

test('builds admin rekap filters from employee and leave type query parameters', () => {
  assert.deepEqual(buildRekapFilters({ year: '2026', employeeId: 'employee-1', leaveTypeId: 'type-1' }), {
    year: 2026,
    employeeId: 'employee-1',
    leaveTypeId: 'type-1',
  })
})
