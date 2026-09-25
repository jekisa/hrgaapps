const test = require('node:test')
const assert = require('node:assert/strict')
const { requireRole, getStaffRestrictedRedirect, getOwnerScope } = require('../lib/access-control')

test('role allow-list returns 401 without a session, 403 for denied roles, and null for allowed roles', () => {
  assert.deepEqual(requireRole(null, ['ADMIN']), { error: 'Unauthorized', status: 401 })
  assert.deepEqual(requireRole({ user: { role: 'STAFF' } }, ['ADMIN']), { error: 'Forbidden', status: 403 })
  assert.equal(requireRole({ user: { role: 'ADMIN' } }, ['ADMIN', 'STAFF']), null)
})

test('STAFF restricted module routes redirect, while ADMIN and lookalike prefixes do not', () => {
  for (const prefix of ['/karyawan', '/aset', '/kendaraan', '/gedung', '/laporan']) {
    assert.equal(getStaffRestrictedRedirect('STAFF', `${prefix}/detail`), '/')
    assert.equal(getStaffRestrictedRedirect('STAFF', prefix), '/')
    assert.equal(getStaffRestrictedRedirect('ADMIN', `${prefix}/detail`), null)
  }
  assert.equal(getStaffRestrictedRedirect('STAFF', '/karyawan-bantuan'), null)
  assert.equal(getStaffRestrictedRedirect('STAFF', '/dashboard'), null)
})

test('owner filter is derived from role and session user id', () => {
  assert.deepEqual(getOwnerScope('ADMIN', 'admin-id', 'createdBy'), {})
  assert.deepEqual(getOwnerScope('STAFF', 'staff-id', 'createdBy'), { createdBy: 'staff-id' })
  assert.deepEqual(getOwnerScope('STAFF', 'staff-id', 'recipientUserId'), { recipientUserId: 'staff-id' })
})
