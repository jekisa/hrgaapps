const STAFF_RESTRICTED_PREFIXES = ['/karyawan', '/aset', '/kendaraan', '/gedung', '/laporan', '/reminder']
const OWNER_FIELDS = new Set(['createdBy', 'recipientUserId'])

function requireRole(session, allowedRoles) {
  if (!session) return { error: 'Unauthorized', status: 401 }
  if (!allowedRoles.includes(session.user?.role)) return { error: 'Forbidden', status: 403 }
  return null
}

function getStaffRestrictedRedirect(role, pathname) {
  if (role !== 'STAFF') return null
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  return STAFF_RESTRICTED_PREFIXES.some((prefix) =>
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ) ? '/' : null
}

function getOwnerScope(role, userId, field) {
  if (role === 'ADMIN') return {}
  if (!OWNER_FIELDS.has(field)) throw new TypeError('Invalid owner field')
  if (!userId) throw new TypeError('A user id is required for personal data scope')
  return { [field]: userId }
}

module.exports = { requireRole, getStaffRestrictedRedirect, getOwnerScope }
