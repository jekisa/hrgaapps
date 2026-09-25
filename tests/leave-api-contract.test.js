const test = require('node:test')
const assert = require('node:assert/strict')
const {
  validateLeaveTypePayload,
  validateRequestPayload,
  buildStaffScope,
  parsePagination,
} = require('../lib/leave-contract')

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
