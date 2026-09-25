const test = require('node:test')
const assert = require('node:assert/strict')
const {
  validateLeaveTypePayload,
  validateRequestPayload,
  buildStaffScope,
  parsePagination,
  buildRekapFilters,
} = require('../lib/leave-contract')
const { getLeaveMenuItems, getLeavePendingTile, getStaffLeaveRedirect } = require('../lib/leave-menu')
const { getVisibleSidebarItems } = require('../lib/dashboard-menu')
const { getQuotaWarning, buildLeaveSubmission, isLeaveAttachmentRequired } = require('../lib/leave-form')

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
  })
})

test('validates leave type payload and pagination bounds', () => {
  assert.throws(() => validateLeaveTypePayload({ code: 'Annual Leave', name: '', defaultQuotaPerYear: -1 }), /Jenis cuti/)
  assert.deepEqual(parsePagination({ page: '0', limit: '500' }), { page: 1, limit: 100 })
})

test('returns separate admin and staff leave navigation', () => {
  assert.deepEqual(getLeaveMenuItems('ADMIN').map((item) => item.href), ['/cuti/kelola', '/cuti/jenis', '/cuti/rekap'])
  assert.deepEqual(getLeaveMenuItems('STAFF').map((item) => item.href), ['/cuti/saya/ajukan'])
})

test('selects a dedicated four-item STAFF sidebar and preserves the complete ADMIN menu', () => {
  const adminItems = [{ label: 'Dashboard' }, { section: 'Manajemen SDM' }, { label: 'Manajemen Karyawan' }]
  const staffItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Reminder', href: '/reminder' },
    { label: 'Notifikasi', href: '/notifikasi' },
    { label: 'Cuti Saya', href: '/cuti/saya/ajukan' },
  ]

  assert.deepEqual(getVisibleSidebarItems('STAFF', adminItems, staffItems), staffItems)
  assert.deepEqual(getVisibleSidebarItems('ADMIN', adminItems, staffItems), adminItems)
  assert.deepEqual(getVisibleSidebarItems(null, adminItems, staffItems), [])
  assert.deepEqual(staffItems.map((item) => item.href), ['/', '/reminder', '/notifikasi', '/cuti/saya/ajukan'])
})

test('redirects STAFF away from summary and history leave routes only', () => {
  for (const pathname of ['/cuti/saya', '/cuti/saya/ringkasan', '/cuti/saya/riwayat', '/cuti/saya/riwayat/2026']) {
    assert.equal(getStaffLeaveRedirect('STAFF', pathname), '/cuti/saya/ajukan')
    assert.equal(getStaffLeaveRedirect('ADMIN', pathname), null)
  }
  assert.equal(getStaffLeaveRedirect('STAFF', '/cuti/saya/ajukan'), null)
})

test('requires attachments only for leave types marked as requiring them', () => {
  assert.equal(isLeaveAttachmentRequired({ requiresAttachment: true }), true)
  assert.equal(isLeaveAttachmentRequired({ requiresAttachment: false }), false)
  assert.equal(isLeaveAttachmentRequired(null), false)
})

test('hides the pending tile for non-admin users', () => {
  assert.equal(getLeavePendingTile('ADMIN', { leavePending: 4 }).value, 4)
  assert.equal(getLeavePendingTile('STAFF', { leavePending: 4 }), null)
})

test('warns when requested days exceed remaining quota without blocking submission', () => {
  assert.equal(getQuotaWarning(5, 6), 'Pengajuan melebihi sisa kuota cuti')
  assert.equal(getQuotaWarning(5, 5), null)
  assert.deepEqual(buildLeaveSubmission({ leaveTypeId: 'type-1', startDate: '2026-09-24', endDate: '2026-09-25', reason: 'Acara keluarga', attachmentUrl: '/uploads/cuti/a.pdf' }), {
    leaveTypeId: 'type-1', startDate: '2026-09-24', endDate: '2026-09-25', reason: 'Acara keluarga', attachmentUrl: '/uploads/cuti/a.pdf',
  })
})

test('builds admin rekap filters from employee and leave type query parameters', () => {
  assert.deepEqual(buildRekapFilters({ year: '2026', employeeId: 'employee-1', leaveTypeId: 'type-1' }), {
    year: 2026,
    employeeId: 'employee-1',
    leaveTypeId: 'type-1',
  })
})
