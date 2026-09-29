const ADMIN_LEAVE_MENU = [
  { label: 'Daftar Pengajuan', href: '/cuti/kelola' },
  { label: 'Kelola Jenis Cuti', href: '/cuti/jenis' },
  { label: 'Rekap Cuti Karyawan', href: '/cuti/rekap' },
  { label: 'Surat Dokter', href: '/cuti/surat-dokter' },
]

const STAFF_LEAVE_MENU = [
  { label: 'Cuti Saya', href: '/cuti/saya/ajukan' },
]

const STAFF_RESTRICTED_LEAVE_ROUTES = new Set([
  '/cuti/saya',
  '/cuti/saya/ringkasan',
  '/cuti/saya/riwayat',
  '/cuti/surat-dokter',
])

function getLeaveMenuItems(role) {
  return role === 'ADMIN' ? ADMIN_LEAVE_MENU : STAFF_LEAVE_MENU
}

function getLeavePendingTile(role, stats = {}) {
  if (role !== 'ADMIN') return null
  return { label: 'Pengajuan Cuti Pending', href: '/cuti/kelola', value: stats.leavePending || 0 }
}

function getStaffLeaveRedirect(role, pathname) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const isRestrictedRoute = normalizedPathname === '/cuti/saya' ||
    [...STAFF_RESTRICTED_LEAVE_ROUTES]
      .filter((route) => route !== '/cuti/saya')
      .some((route) => normalizedPathname === route || normalizedPathname.startsWith(`${route}/`))

  return role === 'STAFF' && isRestrictedRoute
    ? '/cuti/saya/ajukan'
    : null
}

module.exports = { ADMIN_LEAVE_MENU, STAFF_LEAVE_MENU, getLeaveMenuItems, getLeavePendingTile, getStaffLeaveRedirect }
