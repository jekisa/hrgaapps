const test = require('node:test')
const assert = require('node:assert/strict')
const {
  validateLeaveTypePayload,
  validateRequestPayload,
  buildStaffScope,
  parsePagination,
  buildRekapFilters,
} = require('../lib/leave-contract')
const { getLeaveMenuItems, getLeavePendingTile } = require('../lib/leave-menu')
const { getQuotaWarning, buildLeaveSubmission } = require('../lib/leave-form')

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
  assert.deepEqual(getLeaveMenuItems('STAFF').map((item) => item.href), ['/cuti/saya', '/cuti/saya/ajukan', '/cuti/saya/riwayat'])
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
