const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { requireRole, getStaffRestrictedRedirect, getOwnerScope } = require('../lib/access-control')

const protectedRouteFiles = [
  'app/api/karyawan/route.js',
  'app/api/karyawan/[id]/route.js',
  'app/api/karyawan/riwayat/route.js',
  'app/api/karyawan/[id]/dokumen/route.js',
  'app/api/karyawan/[id]/dokumen/[docId]/route.js',
  'app/api/aset/route.js',
  'app/api/aset/[id]/route.js',
  'app/api/aset/peminjaman/route.js',
  'app/api/kendaraan/route.js',
  'app/api/kendaraan/[id]/route.js',
  'app/api/kendaraan/jadwal/route.js',
  'app/api/kendaraan/log-perjalanan/route.js',
  'app/api/kendaraan/pajak/route.js',
  'app/api/kendaraan/perawatan/route.js',
  'app/api/gedung/maintenance/route.js',
  'app/api/gedung/maintenance/[id]/route.js',
  'app/api/gedung/utilitas/route.js',
  'app/api/laporan/aset/route.js',
  'app/api/laporan/karyawan/route.js',
  'app/api/laporan/kendaraan/route.js',
  'app/api/laporan/maintenance/route.js',
]
const ownershipRouteFiles = [
  'app/api/reminder/route.js',
  'app/api/notifikasi/route.js',
  'app/api/notifikasi/[id]/route.js',
]

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

test('every exported method in company module APIs checks the ADMIN role', () => {
  for (const source of protectedRouteFiles) {
    const text = readFileSync(path.resolve(process.cwd(), source), 'utf8')
    const handlers = [...text.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)\b/g)]
    assert.ok(handlers.length, `${source} exports a protected method`)
    handlers.forEach((handler, index) => {
      const end = handlers[index + 1]?.index ?? text.length
      assert.match(text.slice(handler.index, end), /requireRole\(session,\s*\['ADMIN'\]\)/, `${source} ${handler[1]} must be ADMIN-only`)
    })
  }
})

test('every Reminder and Notifikasi handler scopes staff access to the session owner', () => {
  for (const source of ownershipRouteFiles) {
    const text = readFileSync(path.resolve(process.cwd(), source), 'utf8')
    const handlers = [...text.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)\b/g)]
    handlers.forEach((handler, index) => {
      const end = handlers[index + 1]?.index ?? text.length
      assert.match(text.slice(handler.index, end), /getOwnerScope\(session\.user\.role/, `${source} ${handler[1]} must scope ownership`)
    })
  }
})

test('Reminder and Notifikasi schemas support ownership and cuti reviews target the applicant user', () => {
  const reminderSchema = readFileSync(path.resolve(process.cwd(), 'models/Reminder.js'), 'utf8')
  const notificationSchema = readFileSync(path.resolve(process.cwd(), 'models/Notifikasi.js'), 'utf8')
  const leaveReviewRoute = readFileSync(path.resolve(process.cwd(), 'app/api/cuti/pengajuan/[id]/route.js'), 'utf8')

  assert.match(reminderSchema, /createdBy\s*:/)
  assert.match(notificationSchema, /recipientUserId\s*:/)
  assert.match(leaveReviewRoute, /recipientUserId/)
})
